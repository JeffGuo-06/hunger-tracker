from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
from django.db.models import Q
from .models import Profile, Friendship, Post, Message, Notification, PhoneVerification, Comment
from .serializers import (
    UserSerializer, ProfileSerializer, FriendshipSerializer,
    PostSerializer, MessageSerializer, NotificationSerializer, CommentSerializer
)
from .services import generate_verification_code, send_verification_sms
from phonenumber_field.phonenumber import PhoneNumber
from django.shortcuts import render, get_object_or_404
from django.conf import settings
from twilio.rest import Client
from django.contrib import messages
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken
import random
import logging
from django.core.files.storage import default_storage
from storages.backends.s3boto3 import S3Boto3Storage
import json

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
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        username = request.data.get('username')

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
                phone_number=phone_number,
                first_name=first_name,
                last_name=last_name,
                username=username
            )
            logger.info(f"User created successfully: {user.email}")

            # Create profile for the user
            Profile.objects.create(user=user)

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
    http_method_names = ['get', 'post', 'patch', 'put', 'delete']

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            # Create profile if it doesn't exist
            profile = Profile.objects.create(user=request.user)
        
        if request.method == 'PATCH':
            # Handle user fields
            user_fields = ['first_name', 'last_name', 'username', 'bio']
            for field in user_fields:
                if field in request.data:
                    setattr(request.user, field, request.data[field])
            
            # Handle profile image
            if 'profile_image' in request.FILES:
                profile.profile_image = request.FILES['profile_image']
            
            # Handle location update
            if 'location' in request.data:
                try:
                    location_data = request.data['location']
                    if isinstance(location_data, str):
                        location_data = json.loads(location_data)
                    request.user.location = location_data
                    request.user.last_location_update = timezone.now()
                except json.JSONDecodeError:
                    return Response(
                        {'error': 'Invalid location format'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Handle location sharing mode update
            if 'location_sharing_mode' in request.data:
                request.user.location_sharing_mode = request.data['location_sharing_mode']
            
            # Handle selected friends update
            if 'selected_friends' in request.data:
                request.user.selected_friends.clear()
                if request.data['selected_friends']:
                    request.user.selected_friends.add(*request.data['selected_friends'])
            
            # Save both user and profile
            request.user.save()
            profile.save()
            
            # Return updated profile data
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def friends_locations(self, request):
        # Get all accepted friendships
        friendships = Friendship.objects.filter(
            (models.Q(sender=request.user) | models.Q(receiver=request.user)),
            status='accepted'
        )
        
        # Get friends' profiles with their locations
        friends_data = []
        for friendship in friendships:
            friend = friendship.receiver if friendship.sender == request.user else friendship.sender
            
            # Skip if friend has set their location to invisible
            if friend.location_sharing_mode == 'invisible':
                continue
                
            # Check if friend has allowed this user to see their location
            should_show_location = False
            if friend.location_sharing_mode == 'all_friends':
                should_show_location = True
            elif friend.location_sharing_mode == 'select_friends':
                should_show_location = friend.selected_friends.filter(id=request.user.id).exists()
            
            if should_show_location and friend.location is not None:
                friends_data.append({
                    'id': friend.id,
                    'name': f"{friend.first_name} {friend.last_name}",
                    'location': friend.location,
                    'last_location_update': friend.last_location_update,
                    'profile_image': friend.profile.profile_image.url if friend.profile.profile_image else None
                })
        
        return Response(friends_data)

    def retrieve(self, request, pk=None):
        # pk is user_id
        try:
            profile = Profile.objects.get(user__id=pk)
        except Profile.DoesNotExist:
            return Response({'detail': 'Profile not found.'}, status=404)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        if 'location' in request.data:
            try:
                # Try to parse location as JSON if it's a string
                location_data = request.data['location']
                if isinstance(location_data, str):
                    location_data = json.loads(location_data)
                request.user.location = location_data
                request.user.last_location_update = timezone.now()
                request.user.save()
            except json.JSONDecodeError:
                return Response(
                    {'error': 'Invalid location format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if 'location' in request.data:
            try:
                # Try to parse location as JSON if it's a string
                location_data = request.data['location']
                if isinstance(location_data, str):
                    location_data = json.loads(location_data)
                request.user.location = location_data
                request.user.last_location_update = timezone.now()
                request.user.save()
            except json.JSONDecodeError:
                return Response(
                    {'error': 'Invalid location format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return super().partial_update(request, *args, **kwargs)

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
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Friendship.objects.filter(
            models.Q(sender=user) | models.Q(receiver=user)
        ).order_by('-created_at')

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user_friends(self, request, user_id=None):
        friendships = Friendship.objects.filter(
            (models.Q(sender__id=user_id) | models.Q(receiver__id=user_id)),
            status='accepted'
        )
        serializer = self.get_serializer(friendships, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def send(self, request):
        username = request.data.get('username')
        if not username:
            return Response(
                {'detail': 'Username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            receiver = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if receiver == request.user:
            return Response(
                {'detail': 'Cannot send friend request to yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if friendship already exists
        existing_friendship = Friendship.objects.filter(
            models.Q(sender=request.user, receiver=receiver) |
            models.Q(sender=receiver, receiver=request.user)
        ).first()

        if existing_friendship:
            if existing_friendship.status == 'pending':
                return Response(
                    {'detail': 'Friend request already sent'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif existing_friendship.status == 'accepted':
                return Response(
                    {'detail': 'Already friends'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        friendship = Friendship.objects.create(
            sender=request.user,
            receiver=receiver,
            status='pending'
        )
        serializer = self.get_serializer(friendship)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        friendship = self.get_object()
        if friendship.receiver != request.user:
            return Response(
                {'detail': 'Not authorized to accept this request'},
                status=status.HTTP_403_FORBIDDEN
            )
        if friendship.status != 'pending':
            return Response(
                {'detail': 'Friend request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )

        friendship.status = 'accepted'
        friendship.save()
        serializer = self.get_serializer(friendship)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        friendship = self.get_object()
        if friendship.receiver != request.user:
            return Response(
                {'detail': 'Not authorized to reject this request'},
                status=status.HTTP_403_FORBIDDEN
            )
        if friendship.status != 'pending':
            return Response(
                {'detail': 'Friend request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )

        friendship.status = 'rejected'
        friendship.save()
        serializer = self.get_serializer(friendship)
        return Response(serializer.data)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at').distinct()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user_posts(self, request, user_id=None):
        posts = Post.objects.filter(user__id=user_id).order_by('-created_at')
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        logger.info("=== Starting post creation process ===")
        logger.info(f"Request data: {self.request.data}")
        logger.info(f"Request FILES: {self.request.FILES}")
        
        try:
            # Test S3 connection
            logger.info("Testing S3 connection...")
            try:
                # Try to list objects in the bucket
                bucket_name = settings.AWS_STORAGE_BUCKET_NAME
                logger.info(f"Attempting to access bucket: {bucket_name}")
                s3_storage = S3Boto3Storage()
                s3_client = s3_storage.connection.meta.client
                response = s3_client.list_objects_v2(Bucket=bucket_name, MaxKeys=1)
                logger.info(f"S3 connection successful. Bucket contents: {response.get('Contents', [])}")
            except Exception as e:
                logger.error(f"S3 connection test failed: {str(e)}")
                logger.error(f"Error type: {type(e)}")
                if hasattr(e, 'response'):
                    logger.error(f"Error response: {e.response}")
                raise
            
            # Get the image file
            image_file = self.request.FILES.get('image')
            if image_file:
                logger.info(f"Image file details - Name: {image_file.name}, Size: {image_file.size}, Content Type: {image_file.content_type}")
                logger.info(f"Image file type: {type(image_file)}")
                logger.info(f"Image file attributes: {dir(image_file)}")
            else:
                logger.error("No image file found in request.FILES")
                raise ValueError("No image file provided")
            
            # Save the post
            post = serializer.save(user=self.request.user)
            logger.info(f"Post created successfully with ID: {post.id}")
            
            # Log the image path and storage details
            if post.image:
                logger.info(f"Post image path: {post.image.url}")
                logger.info(f"Post image name: {post.image.name}")
                logger.info(f"Post image storage: {post.image.storage}")
                logger.info(f"Post image storage class: {type(post.image.storage)}")
                logger.info(f"Post image storage attributes: {dir(post.image.storage)}")
                
                # Try to verify the file exists in S3
                try:
                    exists = post.image.storage.exists(post.image.name)
                    logger.info(f"Image exists in storage: {exists}")
                    if exists:
                        logger.info(f"Image URL: {post.image.url}")
                        logger.info(f"Image storage path: {post.image.storage.path(post.image.name)}")
                    else:
                        logger.error(f"Image file does not exist in storage at path: {post.image.name}")
                        # Try to get the file from storage
                        try:
                            file = post.image.storage.open(post.image.name)
                            logger.info(f"Successfully opened file from storage: {file}")
                            file.close()
                        except Exception as e:
                            logger.error(f"Failed to open file from storage: {str(e)}")
                except Exception as e:
                    logger.error(f"Error checking if image exists in storage: {str(e)}")
                    logger.error(f"Error type: {type(e)}")
                    logger.error(f"Error details: {e.__dict__ if hasattr(e, '__dict__') else 'No details available'}")
            else:
                logger.error("Post created but no image field was set")
            
            # Update user's profile
            profile = self.request.user.profile
            profile.last_post_at = timezone.now()
            profile.save()
            logger.info(f"Updated user profile last_post_at to: {profile.last_post_at}")
            
            # Notify friends
            friends = Friendship.objects.filter(
                (models.Q(sender=self.request.user) | models.Q(receiver=self.request.user)),
                status='accepted'
            )
            
            for friendship in friends:
                friend = friendship.receiver if friendship.sender == self.request.user else friendship.sender
                Notification.objects.create(
                    user=friend,
                    notification_type='new_post',
                    content=f"{self.request.user.username} posted a new photo"
                )
            logger.info(f"Created notifications for {friends.count()} friends")
            
        except Exception as e:
            logger.error(f"Error in perform_create: {str(e)}")
            logger.error(f"Error type: {type(e)}")
            if hasattr(e, 'response'):
                logger.error(f"Error response: {e.response}")
            raise

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs.get('post_pk')
        return Comment.objects.filter(post_id=post_id)

    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_pk')
        post = get_object_or_404(Post, id=post_id)
        serializer.save(user=self.request.user, post=post)

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

    try:
        # Get or create user
        user, created = User.objects.get_or_create(
            phone_number=phone_number,
            defaults={
                'username': phone_number,  # Use phone number as username
                'is_active': True
            }
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Mark phone number as verified
        cache.set(f'phone_verified_{phone_number}', True, timeout=3600)  # 1 hour
        logger.info(f"Phone number {phone_number} verified successfully")

        return Response({
            'message': 'Phone number verified successfully',
            'access': access_token,
            'refresh': refresh_token
        })
    except Exception as e:
        logger.error(f"Error during verification: {str(e)}")
        return Response(
            {'error': 'An error occurred during verification'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

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