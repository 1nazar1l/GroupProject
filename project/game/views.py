from django.shortcuts import render
from django.shortcuts import redirect
from django.db.models import Q

def start_game(request):
    return render(request, "index.html")