from django.contrib import admin
from .models import Profile, Friendship, Post, Message, Notification
from django.contrib.auth import get_user_model

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_hungry', 'last_ate', 'created_at')
    search_fields = ('user__username', 'user__email')
    list_filter = ('is_hungry',)

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'status', 'created_at')
    search_fields = ('sender__username', 'receiver__username')
    list_filter = ('status',)

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('user', 'caption', 'created_at')
    search_fields = ('user__username', 'caption')
    list_filter = ('created_at',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'is_read', 'created_at')
    search_fields = ('sender__username', 'receiver__username', 'content')
    list_filter = ('is_read', 'created_at')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'is_read', 'created_at')
    search_fields = ('user__username', 'content')
    list_filter = ('notification_type', 'is_read', 'created_at')

User = get_user_model()
admin.site.register(User) 