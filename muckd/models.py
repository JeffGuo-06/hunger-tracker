from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage

class MediaStorage(S3Boto3Storage):
    location = 'media'
    file_overwrite = False
    default_acl = None  # This disables ACLs

class Profile(models.Model):
    user = models.OneToOneField('muckd.User', on_delete=models.CASCADE)
    profile_image = models.ImageField(
        upload_to='profile_images/',
        storage=MediaStorage(),
        null=True,
        blank=True
    )
    last_ate = models.DateTimeField(null=True, blank=True)
    is_hungry = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

class Friendship(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    
    sender = models.ForeignKey('muckd.User', related_name='friendship_sender', on_delete=models.CASCADE)
    receiver = models.ForeignKey('muckd.User', related_name='friendship_receiver', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('sender', 'receiver')

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"

class Post(models.Model):
    user = models.ForeignKey('muckd.User', on_delete=models.CASCADE)
    image = models.ImageField(
        upload_to='posts/',
        storage=MediaStorage()
    )
    caption = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s post at {self.created_at}"

class Message(models.Model):
    sender = models.ForeignKey('muckd.User', related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey('muckd.User', related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username}"

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('friend_request', 'Friend Request'),
        ('friend_accepted', 'Friend Accepted'),
        ('hungry_status', 'Hungry Status'),
        ('new_post', 'New Post'),
        ('message', 'New Message'),
    )

    user = models.ForeignKey('muckd.User', on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.notification_type}"

class User(AbstractUser):
    phone_number = PhoneNumberField(unique=True, null=True, blank=True)
    is_phone_verified = models.BooleanField(default=False)
    bio = models.TextField(max_length=500, blank=True, default="")
    location = models.CharField(max_length=100, default="unset location")

class PhoneVerification(models.Model):
    user = models.ForeignKey('muckd.User', on_delete=models.CASCADE)
    phone_number = PhoneNumberField()
    verification_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at'] 