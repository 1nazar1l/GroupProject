from django.urls import path
from . import views

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.start_game, name='start_game'),
    path('create_account/', views.create_account, name='create_account'),
    path('create_save/', views.create_save, name='create_save'),
    path('game/', views.game, name='game'),
    path('next_tier/', views.next_tier, name='next_tier'),
    path('bank/', views.bank, name='bank'),
    path('casino/', views.casino, name='casino'),
    path('process_order/', views.process_order, name='process_order'),
    path('update-prices/', views.update_prices, name='update_prices'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)