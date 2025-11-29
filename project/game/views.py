from django.shortcuts import render
from django.shortcuts import redirect
from django.db.models import Q

from django.contrib.auth import get_user_model, authenticate, login, logout

from django.conf import settings
import json

def start_game(request):
    saves = {}
    if request.user.is_authenticated:
        user = request.user
        saves = user.saves
    
    print(saves)
    saves_count = 0
    for item in saves:
        if not item == {}:
            saves_count += 1

    return render(request, "index.html", context={
        "media_url": settings.MEDIA_ROOT,
        "saves": saves,
        "saves_count": saves_count
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
        if user.saves["save1"] == {}:
            user.saves["save1"] = {
                "username": username,
                "shop": "tier0",
                "day": 0,
                "capital": 100
            }
        elif user.saves["save2"] == {}:
            user.saves["save2"] = {
                "username": username,
                "shop": "tier0",
                "day": 0,
                "capital": 100
            }
        elif user.saves["save3"] == {}:
            user.saves["save3"] = {
                "username": username,
                "shop": "tier0",
                "day": 0,
                "capital": 100
            }
        user.save()
    return redirect("start_game")

def game(request):
    if request.POST:
        key = request.POST.get("save")
        user = request.user
        save_data = user.saves.get(key, {}) 

        return render(request, "game.html", {
            "save": save_data
        })
    
    return redirect("start_game")