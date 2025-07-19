from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Room, Message
from .serializers import RoomSerializer, MessageSerializer
from uuid import uuid4

class RoomListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        rooms = Room.objects.all().order_by('-created_at')
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        name = request.data.get('name', f'Room-{str(uuid4())[:8]}')
        room = Room.objects.create(name=name)
        serializer = RoomSerializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class RoomDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, room_uuid):
        try:
            room = Room.objects.get(id=room_uuid)
            messages = Message.objects.filter(room=room).order_by('timestamp')[:50]  # Last 50 messages
            
            room_data = RoomSerializer(room).data
            message_data = MessageSerializer(messages, many=True).data
            
            return Response({
                'room': room_data,
                'messages': message_data
            })
        except Room.DoesNotExist:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)