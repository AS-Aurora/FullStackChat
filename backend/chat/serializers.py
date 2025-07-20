from rest_framework import serializers
from .models import Room, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    parent_id = serializers.UUIDField(source='parent.id', allow_null=True, read_only=False)
    parent_content = serializers.CharField(source='parent.content', allow_null=True, read_only=True)
    parent_sender_username = serializers.CharField(source='parent.sender.username', allow_null=True, read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'sender_username', 'parent_id', 'parent_content', 'parent_sender_username']