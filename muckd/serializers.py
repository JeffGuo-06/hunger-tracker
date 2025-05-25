from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Friendship, Post, Message, Notification

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ('id', 'user', 'bio', 'last_ate', 'is_hungry', 'created_at', 'updated_at')

class FriendshipSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    
    class Meta:
        model = Friendship
        fields = ('id', 'sender', 'receiver', 'status', 'created_at', 'updated_at')

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Post
        fields = ('id', 'user', 'image', 'caption', 'created_at', 'updated_at')

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ('id', 'sender', 'receiver', 'content', 'is_read', 'created_at')

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'user', 'notification_type', 'content', 'is_read', 'created_at') 