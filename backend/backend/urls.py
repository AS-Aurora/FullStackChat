from django.contrib import admin
from django.urls import path
from users.views import ping

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/ping/', ping, name='ping'),
]
