# backend/chat/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from chat.models import Room, Message
from django.contrib.auth.models import AnonymousUser
import json
import logging
from django.core.cache import cache

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

            await self.add_online_user() # Add user to online users
            
            await self.accept()
            logger.info(f"User {self.user.username} connected to room {self.room.name}")

            await self.broadcast_online_users() # Broadcast online users in the room
            
        except Exception as e:
            logger.error(f"Error connecting to room: {e}")
            await self.close()
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.remove_online_user() # Remove user from online users

            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            await self.broadcast_online_users() # Broadcast updated online users

        logger.info(f"User {getattr(self.user, 'username', 'Unknown')} disconnected from room")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message', '').strip()
            parent_id = data.get('parent_id')

            parent_message = None
            if parent_id:
                parent_message = await database_sync_to_async(Message.objects.get)(id=parent_id)
            
            if not message:
                return
            
            user = self.scope['user']
            if isinstance(user, AnonymousUser):
                return
            
            msg_obj = await database_sync_to_async(Message.objects.create)(
                room=self.room,
                content=message,
                sender=user,
                parent=parent_message
            )

            parent_data = None
            if parent_message:
                parent_data = {
                    'id': str(parent_message.id),
                    'content': parent_message.content,
                    'sender': parent_message.sender.username
                }
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': user.username,
                    'timestamp': str(msg_obj.timestamp),
                    'uuid': str(msg_obj.id),
                    'parent': parent_data
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
            'uuid': event['uuid'],
            'parent': event.get('parent')
        })) # Send message to WebSocket

    async def online_users(self, event):
        await self.send(text_data=json.dumps({
            'type': 'online_users',
            'count': event['count'],
            'users': event['users']
        }))
    
    async def add_online_user(self):
        room_key = f"online_users_{self.room.id}"
        online_users = cache.get(room_key, set())
        if not isinstance(online_users, set):
            online_users = set()

        online_users.add(self.user.username)
        cache.set(room_key, online_users, timeout=None) # Store online users in cache

    async def remove_online_user(self):
        room_key = f"online_users_{self.room.id}"
        online_users = cache.get(room_key, set())
        if not isinstance(online_users, set):
            online_users = set()

        online_users.discard(self.user.username)
        cache.set(room_key, online_users, timeout=None) # Update online users in cache

    async def broadcast_online_users(self):
        room_key = f"online_users_{self.room.id}"
        online_users = cache.get(room_key, set())
        if not isinstance(online_users, set):
            online_users = set()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'online_users',
                'count': len(online_users),
                'users': list(online_users)
            }
        )
    
    @database_sync_to_async
    def get_or_create_room(self, room_uuid):
        try:
            room = Room.objects.get(id=room_uuid)
        except Room.DoesNotExist:
            room = Room.objects.create(name=f"Room-{room_uuid}") # If room doesn't exist by UUID, create it with UUID as name

        return room