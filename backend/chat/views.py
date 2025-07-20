from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Room, Message
from .serializers import RoomSerializer, MessageSerializer
from uuid import uuid4
from django.core.cache import cache

class RoomListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        rooms = Room.objects.all().order_by('-created_at')
        serializer = RoomSerializer(rooms, many=True)

        rooms_data = []
        for room_data in serializer.data:
            room_key = f'online_users_{room_data["id"]}'
            online_users = cache.get(room_key, set())
            if not isinstance(online_users, set):
                online_users = set()
            
            room_data['online_users'] = len(online_users)
            rooms_data.append(room_data)

        return Response(serializer.data)
    
    def post(self, request):
        name = request.data.get('name', f'Room-{str(uuid4())[:8]}')
        room = Room.objects.create(name=name)
        serializer = RoomSerializer(room)

        room_data = serializer.data
        room_data['online_users'] = 0

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class RoomDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, room_uuid):
        try:
            room = Room.objects.get(id=room_uuid)
            messages = Message.objects.filter(room=room).order_by('timestamp')[:50]  # Last 50 messages
            
            room_data = RoomSerializer(room).data
            message_data = MessageSerializer(messages, many=True).data

            room_key = f"online_users_{room.id}"
            online_users = cache.get(room_key, set())
            if not isinstance(online_users, set):
                online_users = set()

            return Response({
                'room': room_data,
                'messages': message_data,
                'online_users': {
                    'count': len(online_users),
                    'users': list(online_users)
                }
            })

        except Room.DoesNotExist:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        
class OnlineUsersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, room_uuid):
        try:
            room = Room.objects.get(id=room_uuid)
            room_key = f"online_users_{room.id}"
            online_users = cache.get(room_key, set())
            if not isinstance(online_users, set):
                online_users = set()
        
            return Response({
                'count': len(online_users),
                'users': list(online_users)
            })
        except Room.DoesNotExist:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)