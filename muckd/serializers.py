from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Friendship, Post, Message, Notification, Comment
from django.conf import settings
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'is_phone_verified', 
                 'bio', 'location', 'display_location', 'last_location_update', 'first_name', 'last_name',
                 'location_sharing_mode', 'selected_friends']
        read_only_fields = ['id', 'is_phone_verified', 'email', 'phone_number']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    bio = serializers.CharField(source='user.bio', read_only=True)
    location = serializers.CharField(source='user.display_location', read_only=True)
    
    class Meta:
        model = Profile
        fields = ('id', 'user', 'bio', 'location', 'profile_image', 'last_ate', 'is_hungry', 'created_at', 'updated_at')

class FriendshipSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    
    class Meta:
        model = Friendship
        fields = ('id', 'sender', 'receiver', 'status', 'created_at', 'updated_at')

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ('id', 'user', 'image', 'caption', 'created_at', 'updated_at', 'comments_count', 'comments')

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_comments(self, obj):
        comments = obj.comments.all()[:5]  # Get last 5 comments
        return CommentSerializer(comments, many=True).data

    def to_representation(self, instance):
        try:
            data = super().to_representation(instance)
            # Ensure image URL is properly formatted
            if data.get('image'):
                if not data['image'].startswith('http'):
                    data['image'] = f"{settings.AWS_S3_CUSTOM_DOMAIN}/{data['image']}"
            return data
        except Exception as e:
            logger.error(f"Error in to_representation: {str(e)}")
            return {}

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ('id', 'user', 'content', 'created_at')

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