from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from users.views import ping

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
]
