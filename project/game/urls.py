from django.urls import path
from . import views

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.start_game, name='start_game'),
    path('create_account/', views.create_account, name='create_account'),
    path('create_save/', views.create_save, name='create_save'),
    path('api/get_save_data/', views.get_save_data, name='get_save_data'),
    path('api/save_temp_json/', views.save_temp_json, name='save_temp_json'),
    path('api/load_temp_json/', views.load_temp_json, name='load_temp_json'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)