from django.urls import path
from . import views

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.start_game, name='start_game'),
    path('create_account/', views.create_account, name='create_account'),
    path('auth_account/', views.auth_account, name='auth_account'),
    path('create_save/', views.create_save, name='create_save'),
    path('game/', views.game, name='game'),
    path('next_tier/', views.next_tier, name='next_tier'),
    path('bank/', views.bank, name='bank'),
    path('casino/', views.casino, name='casino'),
    path('process_order/', views.process_order, name='process_order'),
    path('update-prices/', views.update_prices, name='update_prices'),
    path('gameplay/', views.gameplay, name='gameplay'),
    path('end_day/', views.end_day, name='end_day'),
    path('casino_reload_page/', views.casino_reload_page, name='casino_reload_page'),
    path('logout/', views.sign_out, name="logout"),
    path('get_credit/', views.get_credit, name="get_credit"),
    path('repay_credit/', views.repay_credit, name="repay_credit"),
    path('delete_save/', views.delete_save, name='delete_save'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)