from django.urls import path
from users.views import LoginView, LogoutView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path("logout/", LogoutView.as_view(), name="custom_logout"),

]