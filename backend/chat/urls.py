from django.urls import path
from .views import RoomListCreateView, RoomDetailView

urlpatterns = [
    path('rooms/', RoomListCreateView.as_view(), name='room-list-create'),
    path('rooms/<uuid:room_uuid>/', RoomDetailView.as_view(), name='room-detail'),
]