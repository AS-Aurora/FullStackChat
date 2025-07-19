# backend/chat/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from chat.models import Room, Message
from django.contrib.auth.models import AnonymousUser
import json
import logging

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_uuid = self.scope['url_route']['kwargs']['room_uuid'] # Get room UUID from URL
        self.user = self.scope['user']
        
        logger.info(f"WebSocket connection attempt for room {self.room_uuid}")
        logger.info(f"User: {self.user}, Authenticated: {not isinstance(self.user, AnonymousUser)}")
        
        if isinstance(self.user, AnonymousUser): # Check if user is authenticated
            logger.warning("Unauthenticated user attempted WebSocket connection")
            await self.close()
            return
        
        try:
            self.room = await self.get_or_create_room(self.room_uuid) # Get or create room by UUID
            self.room_group_name = f'chat_{str(self.room.id)}'
            
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            ) # Join room group
            
            await self.accept()
            logger.info(f"User {self.user.username} connected to room {self.room.name}")
            
        except Exception as e:
            logger.error(f"Error connecting to room: {e}")
            await self.close()
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        logger.info(f"User {getattr(self.user, 'username', 'Unknown')} disconnected from room")
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message', '').strip()
            
            if not message:
                return
            
            user = self.scope['user']
            if isinstance(user, AnonymousUser):
                return
            
            msg_obj = await database_sync_to_async(Message.objects.create)(
                room=self.room,
                content=message,
                sender=user
            )
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': user.username,
                    'timestamp': str(msg_obj.timestamp),
                    'uuid': str(msg_obj.id)
                }
            ) # Send message to room group
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error handling message: {e}")
    
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
            'timestamp': event['timestamp'],
            'uuid': event['uuid']
        })) # Send message to WebSocket
    
    @database_sync_to_async
    def get_or_create_room(self, room_uuid):
        try:
            room = Room.objects.get(id=room_uuid)
        except Room.DoesNotExist:
            room = Room.objects.create(name=f"Room-{room_uuid}") # If room doesn't exist by UUID, create it with UUID as name

        return room