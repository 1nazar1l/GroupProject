from django.shortcuts import render
from django.shortcuts import redirect
from django.db.models import Q

from django.conf import settings
def start_game(request):
    return render(request, "index.html", context={
        "media_url": settings.MEDIA_ROOT,
    })