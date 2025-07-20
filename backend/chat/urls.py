from django.urls import path
from .views import RoomListCreateView, RoomDetailView, OnlineUsersView

urlpatterns = [
    path('rooms/', RoomListCreateView.as_view(), name='room-list-create'),
    path('rooms/<uuid:room_uuid>/', RoomDetailView.as_view(), name='room-detail'),
    path('rooms/<uuid:room_uuid>/online-users/', OnlineUsersView.as_view(), name='online-users'),
]