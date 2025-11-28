from django.shortcuts import render
from django.shortcuts import redirect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils.text import slugify
import json
import os

from django.contrib.auth import get_user_model, authenticate, login, logout

from django.conf import settings


def get_user_json_path(user):
    """Вернуть путь к файлу username.json для конкретного пользователя."""
    jsons_dir = os.path.join(settings.MEDIA_ROOT, "jsons")
    os.makedirs(jsons_dir, exist_ok=True)
    safe_username = slugify(user.username) or f"user_{user.id}"
    filename = f"{safe_username}.json"
    return os.path.join(jsons_dir, filename)
def start_game(request):
    saves = {}
    if request.user.is_authenticated:
        user = request.user
        saves = user.saves

    return render(request, "index.html", context={
        "media_url": settings.MEDIA_ROOT,
        "saves": saves,
    })

def create_account(request):
    if request.POST:
        username = request.POST.get("username")
        password = request.POST.get("password")

        User = get_user_model()
        user = User.objects.create_user(
            username=username,
            password=password,
            saves={
                "save1": {},
                "save2": {},
                "save3": {},
            }
        )

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
        
    return redirect("start_game")

def create_save(request):
    User = get_user_model()
    user = User.objects.get(id=request.user.id)
    if request.POST:
        username = request.POST.get("username")
        save_data = {
            "username": username,
            "shop": "tier0",
            "day": 0,
            "capital": 100
        }
        
        if user.saves["save1"] == {}:
            user.saves["save1"] = save_data
            save_key = "save1"
        elif user.saves["save2"] == {}:
            user.saves["save2"] = save_data
            save_key = "save2"
        elif user.saves["save3"] == {}:
            user.saves["save3"] = save_data
            save_key = "save3"
        else:
            save_key = None
        
        if save_key:
            user.save()
            
            # Создаем/обновляем JSON файл пользователя
            user_json_path = get_user_json_path(user)
            with open(user_json_path, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, ensure_ascii=False, indent=2)
    
    return redirect("start_game")

@require_http_methods(["GET"])
def get_save_data(request):
    """Получить данные сохранения по ключу (save1, save2, save3)"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    save_key = request.GET.get("save_key")
    if not save_key or save_key not in ["save1", "save2", "save3"]:
        return JsonResponse({"error": "Invalid save_key"}, status=400)
    
    user = request.user
    save_data = user.saves.get(save_key, {})
    
    if not save_data:
        return JsonResponse({"error": "Save not found"}, status=404)
    
    return JsonResponse({"success": True, "save_data": save_data})

@require_http_methods(["POST"])
def save_temp_json(request):
    """Сохранить временный JSON файл для текущего пользователя"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        data = json.loads(request.body)
        user_json_path = get_user_json_path(request.user)

        # Сохраняем JSON файл пользователя
        with open(user_json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return JsonResponse({"success": True, "message": "Temp JSON saved"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@require_http_methods(["POST"])
def update_save(request):
    """Обновить сохранение пользователя (например, тир магазина)"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        data = json.loads(request.body)
        shop = data.get("shop")
        
        if not shop:
            return JsonResponse({"error": "shop parameter required"}, status=400)
        
        User = get_user_model()
        user = User.objects.get(id=request.user.id)
        
        # Находим активное сохранение (первое непустое)
        save_key = None
        for key in ["save1", "save2", "save3"]:
            if user.saves.get(key, {}):
                save_key = key
                break
        
        if not save_key:
            return JsonResponse({"error": "No active save found"}, status=404)
        
        # Обновляем поле shop в сохранении
        if user.saves[save_key]:
            user.saves[save_key]["shop"] = shop
            user.save()
            
            # Обновляем временный JSON файл
            user_json_path = get_user_json_path(user)
            if os.path.exists(user_json_path):
                with open(user_json_path, 'r', encoding='utf-8') as f:
                    temp_data = json.load(f)
                temp_data["shop"] = shop
                with open(user_json_path, 'w', encoding='utf-8') as f:
                    json.dump(temp_data, f, ensure_ascii=False, indent=2)
        
        return JsonResponse({"success": True, "message": "Save updated", "shop": shop})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@require_http_methods(["GET"])
def load_temp_json(request):
    """Загрузить временный JSON файл для текущего пользователя"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    user_json_path = get_user_json_path(request.user)
    
    if not os.path.exists(user_json_path):
        return JsonResponse({"error": "Temp JSON not found"}, status=404)
    
    try:
        with open(user_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return JsonResponse({"success": True, "data": data})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)