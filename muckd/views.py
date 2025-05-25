from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
from .models import Profile, Friendship, Post, Message, Notification, PhoneVerification
from .serializers import (
    UserSerializer, ProfileSerializer, FriendshipSerializer,
    PostSerializer, MessageSerializer, NotificationSerializer
)
from .services import generate_verification_code, send_verification_sms
from phonenumber_field.phonenumber import PhoneNumber
from django.shortcuts import render
from django.conf import settings
from twilio.rest import Client
from django.contrib import messages
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken
import random
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        phone_number = request.data.get('phone_number')
        email = request.data.get('email')
        password = request.data.get('password')

        logger.info(f"Attempting to register user with phone: {phone_number}")

        # Check if phone number is verified
        verification_key = f'phone_verified_{phone_number}'
        if not cache.get(verification_key):
            logger.error(f"Phone number {phone_number} not verified")
            return Response(
                {'error': 'Phone number not verified'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user
        try:
            user = User.objects.create_user(
                email=email,
                password=password,
                phone_number=phone_number
            )
            logger.info(f"User created successfully: {user.email}")

            # Clear verification cache
            cache.delete(verification_key)

            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def toggle_hungry(self, request, pk=None):
        profile = self.get_object()
        profile.is_hungry = not profile.is_hungry
        profile.save()

        # Create notification for friends
        if profile.is_hungry:
            friends = Friendship.objects.filter(
                (models.Q(sender=profile.user) | models.Q(receiver=profile.user)),
                status='accepted'
            )
            for friendship in friends:
                friend = friendship.receiver if friendship.sender == profile.user else friendship.sender
                Notification.objects.create(
                    user=friend,
                    notification_type='hungry_status',
                    content=f"{profile.user.username} is hungry!"
                )

        return Response(self.get_serializer(profile).data)

class FriendshipViewSet(viewsets.ModelViewSet):
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        friendship = self.get_object()
        if friendship.receiver != request.user:
            return Response(
                {"error": "You can only accept friend requests sent to you."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        friendship.status = 'accepted'
        friendship.save()

        # Create notification
        Notification.objects.create(
            user=friendship.sender,
            notification_type='friend_accepted',
            content=f"{friendship.receiver.username} accepted your friend request!"
        )

        return Response(self.get_serializer(friendship).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        friendship = self.get_object()
        if friendship.receiver != request.user:
            return Response(
                {"error": "You can only reject friend requests sent to you."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        friendship.status = 'rejected'
        friendship.save()
        return Response(self.get_serializer(friendship).data)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user)
        post.user.profile.last_ate = timezone.now()
        post.user.profile.save()

        # Create notifications for friends
        friends = Friendship.objects.filter(
            (models.Q(sender=post.user) | models.Q(receiver=post.user)),
            status='accepted'
        )
        for friendship in friends:
            friend = friendship.receiver if friendship.sender == post.user else friendship.sender
            Notification.objects.create(
                user=friend,
                notification_type='new_post',
                content=f"{post.user.username} just posted a new food picture!"
            )

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user)
        Notification.objects.create(
            user=message.receiver,
            notification_type='message',
            content=f"New message from {message.sender.username}"
        )

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(self.get_serializer(notification).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def request_phone_verification(request):
    phone_number = request.data.get('phone_number')
    logger.info(f"Requesting verification for phone: {phone_number}")

    if not phone_number:
        logger.error("No phone number provided")
        return Response(
            {'error': 'Phone number is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Generate verification code
    verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    logger.info(f"Generated verification code for {phone_number}")
    
    # Store verification code in cache
    cache.set(f'phone_verification_{phone_number}', verification_code, timeout=300)  # 5 minutes

    # Send SMS using Twilio
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f'Your verification code is: {verification_code}',
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        logger.info(f"Verification SMS sent successfully to {phone_number}")
        return Response({'message': 'Verification code sent'})
    except Exception as e:
        logger.error(f"Error sending SMS: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_phone_number(request):
    phone_number = request.data.get('phone_number')
    code = request.data.get('code')
    logger.info(f"Verifying code for phone: {phone_number}")

    if not phone_number or not code:
        logger.error("Missing phone number or code")
        return Response(
            {'error': 'Phone number and verification code are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check verification code
    verification_key = f'phone_verification_{phone_number}'
    stored_code = cache.get(verification_key)

    if not stored_code or stored_code != code:
        logger.error(f"Invalid verification code for {phone_number}")
        return Response(
            {'error': 'Invalid verification code'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Mark phone number as verified
    cache.set(f'phone_verified_{phone_number}', True, timeout=3600)  # 1 hour
    logger.info(f"Phone number {phone_number} verified successfully")

    return Response({'message': 'Phone number verified successfully'})

def send_sms_view(request):
    if request.method == 'POST':
        to_number = request.POST.get('to_number')
        message_body = request.POST.get('message')
        try:
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=message_body,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to_number
            )
            messages.success(request, f"Message sent! SID: {message.sid}")
        except Exception as e:
            messages.error(request, f"Error: {e}")
    return render(request, 'send_sms.html') 