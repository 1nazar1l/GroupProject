from django.shortcuts import render
from django.shortcuts import redirect
from django.db.models import Q

from django.contrib.auth import get_user_model, authenticate, login, logout

from django.conf import settings
def start_game(request):
    saves = {}
    if request.user.is_authenticated:
        user = request.user

    print(user.saves)
    return render(request, "index.html", context={
        "media_url": settings.MEDIA_ROOT,
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