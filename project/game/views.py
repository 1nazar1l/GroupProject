from django.shortcuts import render
from django.shortcuts import redirect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils.text import slugify
import json
import ast
import os

from django.contrib.auth import get_user_model, authenticate, login, logout

from django.conf import settings
import json

from .models import ProductToOrder

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
            "day": 1,
            "capital": 500,
            "inventory": {},
            "messages": {}
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
        if next_tier == "tier1":
            user.saves[key]["inventory"] = {
                "cookie": {
                    "name": "Печенье",
                    "count": 0,
                    "price": 0,
                    "markup_percentage": 0
                },
                "candy": {
                    "name": "Конфеты",
                    "count": 0,
                    "price": 0,
                    "markup_percentage": 0
                },
                "chocolate": {
                    "name": "Шоколад",
                    "count": 0,
                    "price": 0,
                    "markup_percentage": 0
                },
                "soda": {
                    "name": "Газировка",
                    "count": 0,
                    "price": 0,
                    "markup_percentage": 0
                },
                "energy_drink": {
                    "name": "Энергетик",
                    "count": 0,
                    "price": 0,
                    "markup_percentage": 0
                },
                "chewing_gum": {
                    "name": "Жвачка",
                    "count": 0,
                    "price": 0,
                    "markup_percentage": 0
                }
            }
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
            return redirect("game")

    key = request.session.get('current_save_key')
    if key:
        number_items_purchased = 0
        sum_prices_purchased = 0
        products_to_order = ProductToOrder.objects.all()

        user = request.user
        
        save_data = user.saves.get(key, {})
        
        if "inventory" in save_data:
            number_items_purchased = sum([item["count"] for item in save_data["inventory"].values()])
            sum_prices_purchased = sum([item["price"] * item["count"] for item in save_data["inventory"].values()])
            
            if save_data.get("shop") == "tier1" and number_items_purchased != 0:
                save_data["shop"] = "tier2"
                
                user.saves[key] = save_data
                user.save()
        
        messages = {}
        if "messages" in save_data:
            messages = save_data["messages"]
            messages = {k: v for k, v in reversed(messages.items())}
        
        target = 0
        tier = save_data.get("shop")
        capital = int(save_data.get("capital"))
        match tier:
            case "tier2":
                target = 800
            case "tier2_5":
                target = 2000
        
        progress_bar_width = int(capital * 100 / target)
        if progress_bar_width > 100:
            progress_bar_width = 100

        return render(request, "game.html", {
            "save": save_data,
            "save_key": key,
            "products_to_order": products_to_order,
            "number_items_purchased": number_items_purchased,
            "sum_prices_purchased": sum_prices_purchased,
            "messages": messages,
            "progress_bar_width": progress_bar_width,
            "target": target
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

def process_order(request):
    if request.method == 'POST':
        total_price = request.POST.get('total_price')

        products_to_order = ProductToOrder.objects.all()
        
        # Получаем массивы товаров
        product_ids = request.POST.getlist('product_id[]')
        product_counts = request.POST.getlist('product_count[]')
        save_key = request.POST.get('save_key')

        user = request.user
        
        for mas_num, product_id in enumerate(product_ids):
            product = products_to_order.get(id=product_id)
            print(f"mas_num: {mas_num}, product_id: {product_id}, product: {product}, product_count: {product_counts[mas_num]}")

            product_count = int(user.saves[save_key]["inventory"][product.icon_name]["count"])
            product_count += int(product_counts[mas_num])

            user.saves[save_key]["inventory"][product.icon_name]["count"] = product_count
        
        user_capital = int(user.saves[save_key]["capital"])
        user_capital -= int(float(total_price))
        user.saves[save_key]["capital"] = user_capital
        user.save()

        return redirect('game')
    
    return redirect('start_game')

def update_prices(request):
    if request.method == 'POST':
        save_key = request.POST.get('save_key')
        products_to_order = ProductToOrder.objects.all()
        
        user = request.user
        if save_key in user.saves:
            save_data = user.saves[save_key]
            inventory = save_data.get('inventory', {})
            
            for key, value in request.POST.items():
                if key.startswith('price_'):
                    product_key = key.replace('price_', '')
                    if product_key in inventory:
                        inventory[product_key]['price'] = int(value) if value else 0

                        base_product = products_to_order.get(icon_name=product_key)
                        base_price = float(base_product.price)
                        user_price = float(value)
        
                        # Рассчитываем наценку в процентах
                        if user_price > 0 and base_price > 0:
                            markup_percentage = ((user_price - base_price) / base_price) * 100
                            inventory[product_key]['markup_percentage'] = int(markup_percentage)
            
            save_data['inventory'] = inventory
            user.saves[save_key] = save_data
            user.save()

        return redirect('game')
    
    return redirect('game')

def gameplay(request):
    if request.method == 'POST':
        key = request.POST.get("key")
        if key:
            request.session['current_save_key'] = key
            return redirect("gameplay")

    key = request.session.get('current_save_key')
    if key:
        user = request.user
        save_data = user.saves.get(key, {})
        products_to_order = ProductToOrder.objects.all()
        
        inventory = save_data.get("inventory", {})
        filtered_products = {}
        
        for item_key, product in inventory.items():
            try:
                # Получаем базовую цену товара из справочника
                base_product = products_to_order.get(icon_name=item_key)
                base_price = float(base_product.price)
                user_price = float(product.get("price", 0))
                
                # Рассчитываем наценку в процентах
                if user_price > 0 and base_price > 0:
                    markup_percentage = ((user_price - base_price) / base_price) * 100
                    
                    # Если наценка меньше 68%, добавляем товар
                    if markup_percentage < 68:
                        # Добавляем рассчитанную наценку в данные товара
                        product_with_markup = product.copy()
                        product_with_markup["markup_percentage"] = round(markup_percentage, 2)
                        product_with_markup["base_price"] = base_price
                        filtered_products[item_key] = product_with_markup
                        
            except (ProductToOrder.DoesNotExist, ValueError, TypeError):
                # Пропускаем товары с ошибками
                continue
        
        return render(request, "gameplay.html", {
            "save": save_data,
            "save_key": key,
            "filtered_products": filtered_products  # Только товары с наценкой < 40%
        })
    
    return redirect("start_game")

def end_day(request):
    if request.method == "POST":
        save_key = request.POST.get("save_key")
        money_earned = request.POST.get("moneyVal")
        money_earned = int(float(money_earned))
        people_served = request.POST.get("peopleVal")
        raw_filtered = request.POST.get("filtered_products", "")
        product_keys = []

        if raw_filtered:
            parsed = None
            # Пытаемся разобрать JSON; если не вышло — пробуем literal_eval
            try:
                parsed = json.loads(raw_filtered)
            except Exception:
                try:
                    parsed = json.loads(raw_filtered.replace("'", '"'))
                except Exception:
                    try:
                        parsed = ast.literal_eval(raw_filtered)
                    except Exception:
                        parsed = None

            if isinstance(parsed, dict):
                product_keys = list(parsed.keys())

        user = request.user
        # Получаем текущие сохранения пользователя
        # Предполагаю, что user.saves это JSONField или подобное
        saves = user.saves  # Если это dict
        save_data = saves.get(save_key, {})
        capital = int(save_data["capital"])
        capital += money_earned
        save_data["capital"] = capital

        day = int(save_data["day"])
        day += 1
        save_data["day"] = day
        inventory = save_data.get("inventory", {})
        # Обновляем количество товаров
        products_sold = 0
        for item_key, product in inventory.items():
            if item_key in product_keys:
                try:
                    # Получаем новое количество из POST
                    new_product_count = int(request.POST.get(item_key, product.get("count", 0)))
                    products_sold += product["count"] - new_product_count

                    product["count"] = new_product_count
                except (ValueError, TypeError):
                    # Если что-то пошло не так, оставляем текущее значение
                    pass
        

        messages = save_data.get("messages", {})
        if messages == {}:
            new_message_key = "1"
        else:
            messages_keys = list(messages.keys())
            new_message_key = str(int(messages_keys[-1]) + 1)

        messages[new_message_key] = {
            "type": "end-day",
            "info": [
                f"Закончен день: {day-1}",
                f"Заработано денег: {money_earned}",
                f"Продано товаров: {products_sold}",
                f"Обслужено покупателей {people_served}",
                f"Денег на тот момент: {capital}"
            ]
        }
        # Сохраняем обновленный инвентарь
        save_data["messages"] = messages
        save_data["inventory"] = inventory
        
        # Обновляем данные сохранения
        saves[save_key] = save_data
        
        # Сохраняем обновленные сохранения пользователя
        user.saves = saves
        
        # Не забываем сохранить объект пользователя
        user.save()
                
    return redirect("game")