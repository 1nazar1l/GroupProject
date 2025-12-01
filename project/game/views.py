from django.shortcuts import render
from django.shortcuts import redirect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils.text import slugify
import json
import os

from django.contrib.auth import get_user_model, authenticate, login, logout

from django.conf import settings
import json

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
            "capital": 500
        }
        
        if user.saves["save1"] == {}:
            user.saves["save1"] = save_data
        elif user.saves["save2"] == {}:
            user.saves["save2"] = save_data
        elif user.saves["save3"] == {}:
            user.saves["save3"] = save_data

        user.save()
    return redirect("start_game")

def next_tier(request):
    if request.POST:
        key = request.POST.get("key")
        next_tier = request.POST.get("next_tier")
        money = request.POST.get("money")

        user = request.user
        
        # Обновляем данные
        user.saves[key]["shop"] = next_tier
        user.saves[key]["capital"] = money
        user.save()
        
        # Сохраняем ключ в сессии для game view
        request.session['current_save_key'] = key
        
        return redirect('game')  # Редирект на game view
    
    return redirect("start_game")

def game(request):
    if request.method == 'POST':
        key = request.POST.get("key")
        if key:
            request.session['current_save_key'] = key
            return redirect("game")  # редирект после POST

    # GET-запрос — безопасный рендер
    key = request.session.get('current_save_key')
    if key:
        user = request.user
        save_data = user.saves.get(key, {})
        return render(request, "game.html", {
            "save": save_data,
            "save_key": key
        })
    
    return redirect("start_game")

def bank(request):
    if request.method == 'POST':
        key = request.POST.get("key")
        if key:
            request.session['current_save_key'] = key
            return redirect("bank")

    key = request.session.get('current_save_key')
    if key:
        user = request.user
        save_data = user.saves.get(key, {})
        return render(request, "bank.html", {
            "save": save_data,
            "save_key": key
        })
    
    return redirect("start_game")

def casino(request):
    if request.method == 'POST':
        key = request.POST.get("key")
        if key:
            request.session['current_save_key'] = key
            return redirect("casino")

    key = request.session.get('current_save_key')
    if key:
        user = request.user
        save_data = user.saves.get(key, {})
        return render(request, "casino.html", {
            "save": save_data,
            "save_key": key
        })
    
    return redirect("start_game")