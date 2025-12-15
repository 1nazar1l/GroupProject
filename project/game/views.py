from django.shortcuts import render
from django.shortcuts import redirect
import json
import ast

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

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login
from django.shortcuts import redirect

def create_account(request):
    if request.POST:
        username = request.POST.get("username")
        password = request.POST.get("password")
        
        User = get_user_model()
        
        if User.objects.filter(username=username).exists():
            return redirect("start_game")  
        
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

def auth_account(request):
    if request.POST:
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
        
    return redirect("start_game")

def sign_out(request):
    logout(request)
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
            "max_markup_percentage": 68,
            "max_product": 10,
            "max_credit": 300,
            "credit": {
                "has_credit": False,
                "amount": 0,
                "days": 0,
                "multiplier": 0,
                "total_to_pay": 0
            },
            "inventory": {},
            "messages": {},
            "bet_values": []
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
        save_data = user.saves.get(key, {})

        products_to_order = ProductToOrder.objects.all()

        save_data["shop"] = next_tier
        save_data["capital"] = money
        max_markup_percentage = 68
        max_product = 10
        max_credit = 300

        current_tier = 0

        bet_values = [5, 10, 15, 20, 25, 30]

        match next_tier:
            case "tier1":
                current_tier = 1
                max_markup_percentage = 68
                max_product = 10
                max_credit = 300
            case "tier2_5":
                current_tier = 3
                max_markup_percentage = 75
                max_product = 12
                bet_values = [20, 50, 60, 85, 100, 110]
                max_credit = 800
            case "tier3":
                current_tier = 3
                max_markup_percentage = 75
                max_product = 12
                bet_values = [20, 50, 60, 85, 100, 110]
                max_credit = 800
            case "tier4":
                current_tier = 4
                max_markup_percentage = 89
                max_product = 13
                bet_values = [70, 110, 130, 160, 180, 210]
                max_credit = 2000
            case "tier6":
                current_tier = 6
                max_markup_percentage = 100
                max_product = 15
                bet_values = [100, 150, 200, 250, 300, 400]
                max_credit = 5000
        
        save_data["max_markup_percentage"] = max_markup_percentage
        save_data["max_product"] = max_product
        save_data["bet_values"] = bet_values
        save_data["max_credit"] = max_credit

        new_products_count = 0
        if current_tier != 0:
            products = products_to_order.filter(tier=current_tier)
            new_products_count = products.count()
            for product in products:
                if product.icon_name not in save_data["inventory"].keys():
                    save_data["inventory"][product.icon_name] = {
                        "name": product.name,
                        "count": 0,
                        "price": 0,
                        "markup_percentage": 0
                    }


        messages = save_data.get("messages", {})
        if messages == {}:
            new_message_key = "1"
        else:
            messages_keys = list(messages.keys())
            new_message_key = str(int(messages_keys[-1]) + 1)

        if current_tier != 0:
            info_block = [
                f"Поздравляю с переходом на новый уровень!!!",
                f"Максимальная ставка в казино увеличена!",
                f"Доступно новых товаров {new_products_count}",
                f"Максимальная наценка для товаров {max_markup_percentage}%",
                f"Максимальное количество товаров одного вида {max_product}",
                f"Денег на тот момент: {save_data["capital"]}",
                f"День: {save_data["day"]}",
            ]
            if current_tier != 1:
                info_block.append(f"Больше покупателей в день!!!")
                info_block.append(f"Покупатели могут брать больше покупок!!!")
            messages[new_message_key] = {
                "type": "next-tier",
                "info": info_block
            }

        save_data["messages"] = messages
        user.save()
        
        request.session['current_save_key'] = key
        
        return redirect('game')  
    
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
        
        target = 1
        current_tier = 1
        tier = save_data.get("shop")
        capital = int(save_data.get("capital"))

        match tier:
            case "tier2":
                target = 800
                current_tier = 2
            case "tier2_5":
                target = 2000
                current_tier = 3
            case "tier3":
                target = 2000
                current_tier = 3
            case "tier4":
                target = 10000
                current_tier = 4
            case "tier5":
                target = 10000
                current_tier = 5
            case "tier6":
                target = 25000
                current_tier = 6
            case _:
                target = 800
        
        progress_bar_width = int(capital * 100 / target)
        if progress_bar_width > 100:
            progress_bar_width = 100

        max_markup_percentage = save_data.get("max_markup_percentage")
        max_product = save_data.get("max_product")

        inventory = save_data.get("inventory")

        products_to_order = {}

        if inventory != {}:
            products_to_order = ProductToOrder.objects.filter(tier__lte=current_tier).order_by('tier')

            for order_product in products_to_order:
                product = inventory.get(order_product.icon_name)
                order_product.is_full = product["count"] >= max_product 

                order_product.products_count_to_purchase = max_product - product["count"]
        
        return render(request, "game.html", {
            "save": save_data,
            "save_key": key,
            "products_to_order": products_to_order,
            "number_items_purchased": number_items_purchased,
            "sum_prices_purchased": sum_prices_purchased,
            "messages": messages,
            "progress_bar_width": progress_bar_width,
            "target": target,
            "max_markup_percentage": max_markup_percentage,
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
        max_credit = save_data["max_credit"]
        credit = save_data["credit"]

        return render(request, "bank.html", {
            "save": save_data,
            "save_key": key,
            "max_credit": max_credit,
            "credit": credit
        })
    
    return redirect("start_game")

def casino(request):
    key = request.POST.get("key")
    user = request.user
    save_data = user.saves.get(key, {})

    
    return render(request, "casino.html", {
        "save": save_data,
        "save_key": key,
        "current_balance": save_data["capital"]
    })


def process_order(request):
    if request.method == 'POST':
        total_price = request.POST.get('total_price')

        products_to_order = ProductToOrder.objects.all()
        
        product_ids = request.POST.getlist('product_id[]')
        product_counts = request.POST.getlist('product_count[]')
        save_key = request.POST.get('save_key')

        user = request.user
        
        for mas_num, product_id in enumerate(product_ids):
            product = products_to_order.get(id=product_id)
            if product.tier == 3 and user.saves[save_key]["shop"] == "tier2_5":
                user.saves[save_key]["shop"] = "tier3"

            if product.tier == 4 and user.saves[save_key]["shop"] == "tier4":
                user.saves[save_key]["shop"] = "tier5"

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
        max_markup_percentage = save_data.get("max_markup_percentage")
        filtered_products = {}
        
        for item_key, product in inventory.items():
            try:
                base_product = products_to_order.get(icon_name=item_key)
                base_price = float(base_product.price)
                user_price = float(product.get("price", 0))
                
                if user_price >= 0 and base_price >= 0:
                    markup_percentage = ((user_price - base_price) / base_price) * 100
                    
                    if markup_percentage <= max_markup_percentage:
                        product_with_markup = product.copy()
                        product_with_markup["markup_percentage"] = round(markup_percentage, 2)
                        product_with_markup["base_price"] = base_price
                        filtered_products[item_key] = product_with_markup
                        
            except (ProductToOrder.DoesNotExist, ValueError, TypeError):
                continue
        
        tier = save_data.get("shop")

        maximum_lower_limit_people_by_day = 8
        maximum_upper_limit_people_by_day = 10
        products_by_people = 4
        item_by_product = 3

        match tier:
            case "tier2":
                maximum_lower_limit_people_by_day = 8
                maximum_upper_limit_people_by_day = 10
                products_by_people = 4
                item_by_product = 3
            case "tier2_5":
                maximum_lower_limit_people_by_day = 10
                maximum_upper_limit_people_by_day = 12
                products_by_people = 4
                item_by_product = 4
            case "tier3":
                maximum_lower_limit_people_by_day = 10
                maximum_upper_limit_people_by_day = 12
                products_by_people = 4
                item_by_product = 4
            case "tier4":
                maximum_lower_limit_people_by_day = 14
                maximum_upper_limit_people_by_day = 16
                products_by_people = 6
                item_by_product = 5
            case "tier5":
                maximum_lower_limit_people_by_day = 14
                maximum_upper_limit_people_by_day = 16
                products_by_people = 6
                item_by_product = 5
            case "tier6":
                maximum_lower_limit_people_by_day = 15
                maximum_upper_limit_people_by_day = 17
                products_by_people = 6
                item_by_product = 6
            case _:
                maximum_lower_limit_people_by_day = 8
                maximum_upper_limit_people_by_day = 10
                products_by_people = 4
                item_by_product = 3
        
        return render(request, "gameplay.html", {
            "save": save_data,
            "save_key": key,
            "filtered_products": filtered_products,
            "maximum_lower_limit_people_by_day": maximum_lower_limit_people_by_day,
            "maximum_upper_limit_people_by_day": maximum_upper_limit_people_by_day,
            "products_by_people": products_by_people,
            "item_by_product": item_by_product
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
        saves = user.saves  
        save_data = saves.get(save_key, {})
        capital = int(save_data["capital"])
        capital += money_earned
        save_data["capital"] = capital

        day = int(save_data["day"])
        day += 1
        save_data["day"] = day
        inventory = save_data.get("inventory", {})
        products_sold = 0
        for item_key, product in inventory.items():
            if item_key in product_keys:
                try:
                    new_product_count = int(request.POST.get(item_key, product.get("count", 0)))
                    products_sold += product["count"] - new_product_count

                    product["count"] = new_product_count
                except (ValueError, TypeError):
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

        credit = save_data.get("credit", {})
        if credit.get("has_credit"):
            payment_day = int(credit.get("payment_day", 0))
            if day == payment_day:
                debt = int(credit.get("total_to_pay", 0))
                capital -= debt  
                save_data["capital"] = capital
                save_data["credit"] = {
                    "has_credit": False,
                    "amount": 0,
                    "days": 0,
                    "multiplier": 0,
                    "total_to_pay": 0
                }
                messages_keys = list(messages.keys())
                credit_msg_key = "1" if messages_keys == [] else str(int(messages_keys[-1]) + 1)
                messages[credit_msg_key] = {
                    "type": "pay_credit",
                    "info": [
                        f"Срок кредита наступил, списано: {debt}",
                        f"Баланс после списания: {capital}",
                        f"День: {day}",
                    ]
                }

        save_data["messages"] = messages
        save_data["inventory"] = inventory
        
        saves[save_key] = save_data
        
        user.saves = saves
        
        user.save()
                
    return redirect("game")

def casino_reload_page(request):
    new_capital = request.POST.get('balance')
    save_key = request.POST.get('key')
    user = request.user
    saves = user.saves

    save_data = saves.get(save_key, {})
    save_data["capital"] = new_capital

    saves[save_key] = save_data
    user.saves = saves
    user.save()

    return render(request, "casino.html", {
        "save": save_data,
        "save_key": save_key,
        "current_balance": new_capital
    })

def get_credit(request):
    if request.method == 'POST':
        save_key = request.POST.get("save_key")
        credit_amount = request.POST.get("credit_amount")
        credit_days = request.POST.get("credit_days")

        try:
            credit_amount = int(float(credit_amount or 0))
        except (ValueError, TypeError):
            credit_amount = 0

        try:
            credit_days = int(credit_days or 1)
        except (ValueError, TypeError):
            credit_days = 1

        multiplier = 1.3 + (credit_days - 1) * (0.7 / 9)

        user = request.user
        saves = user.saves
        save_data = saves.get(save_key, {})

        capital = int(save_data.get("capital", 0))
        capital += credit_amount
        save_data["capital"] = capital

        save_data["credit"] = {
            "has_credit": True,
            "amount": credit_amount,
            "days": credit_days,
            "payment_day": save_data["day"] + credit_days,
            "multiplier": multiplier,
            "total_to_pay": int(round(credit_amount * multiplier))
        }

        saves[save_key] = save_data
        user.saves = saves
        user.save()

    return redirect('bank')

def repay_credit(request):
    if request.method == 'POST':
        save_key = request.POST.get("save_key") or request.session.get('current_save_key')
        if not save_key:
            return redirect('bank')

        user = request.user
        saves = user.saves
        save_data = saves.get(save_key, {})

        credit = save_data.get("credit", {})
        if not credit.get("has_credit"):
            return redirect('bank')

        capital = int(save_data.get("capital", 0))
        total_to_pay = int(credit.get("total_to_pay", 0))

        if total_to_pay <= 0:
            credit = {
                "has_credit": False,
                "amount": 0,
                "days": 0,
                "multiplier": 0,
                "total_to_pay": 0
            }

            messages = save_data.get("messages", {})
            if messages == {}:
                new_message_key = "1"
            else:
                messages_keys = list(messages.keys())
                new_message_key = str(int(messages_keys[-1]) + 1)

            messages[new_message_key] = {
                "type": "pay_credit",
                "info": [
                    f"Поздравляю с погашением кредита!!!",
                    f"Оплачено {total_to_pay}",
                    f"День: {save_data["day"]}",
                ]
            }
            save_data["messages"] = messages
        else:
            pay_amount = max(0, capital - 1)

            if pay_amount >= total_to_pay:
                capital -= total_to_pay
                credit = {
                    "has_credit": False,
                    "amount": 0,
                    "days": 0,
                    "multiplier": 0,
                    "total_to_pay": 0
                }
                messages = save_data.get("messages", {})
                if messages == {}:
                    new_message_key = "1"
                else:
                    messages_keys = list(messages.keys())
                    new_message_key = str(int(messages_keys[-1]) + 1)

                messages[new_message_key] = {
                    "type": "pay_credit",
                    "info": [
                        f"Поздравляю с погашением кредита!!!",
                        f"Оплачено {total_to_pay}",
                        f"День: {save_data["day"]}",
                    ]
                }
                save_data["messages"] = messages
            else:
                total_to_pay -= pay_amount
                capital = max(1, capital - pay_amount)
                credit["total_to_pay"] = total_to_pay

            save_data["capital"] = capital
            save_data["credit"] = credit
            saves[save_key] = save_data
            user.saves = saves
            user.save()

    return redirect('bank')

def delete_save(request):
    if request.method == "POST":
        key = request.POST.get("key")
        if key:
            user = request.user
            saves = user.saves
            if key in saves:
                saves[key] = {}
                user.saves = saves
                user.save()
    return redirect("start_game")