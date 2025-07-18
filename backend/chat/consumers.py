from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from backend.chat.models import Room, Message
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room = await database_sync_to_async(Room.objects.get)(name=self.room_name)
        self.room_group_name = f'chat_{str(self.room.id)}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        user = self.scope['user']

        if not user.is_authenticated:
            return
        
        msg_obj = await database_sync_to_async(Message.objects.create)(
            room = self.room,
            content = message,
            sender = user
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
        )
    
    async def chat_message(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'message': message
        }))