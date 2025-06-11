from celery import shared_task
from django.core.cache import cache
from django.conf import settings
from .models import User, Profile, Friendship
import json
from django.db import models

@shared_task
def update_user_location(user_id, latitude, longitude):
    """Update user location in background"""
    try:
        user = User.objects.get(id=user_id)
        user.location = json.dumps({
            'latitude': latitude,
            'longitude': longitude
        })
        user.save()
        
        # Cache the updated location (avoid caching large objects)
        cache_key = f'user_location_{user_id}'
        cache.set(cache_key, user.location, timeout=300)  # Cache for 5 minutes
        
        return True
    except Exception as e:
        print(f"Error updating location: {str(e)}")
        return False

@shared_task
def fetch_friends_locations(user_id):
    """Fetch and cache friends' locations"""
    try:
        user = User.objects.get(id=user_id)
        # Get all accepted friendships
        friendships = Friendship.objects.filter(
            (models.Q(sender=user) | models.Q(receiver=user)),
            status='accepted'
        ).select_related('sender', 'receiver')
        
        locations = []
        for friendship in friendships:
            # Get the friend (the other user in the friendship)
            friend = friendship.receiver if friendship.sender == user else friendship.sender
            
            if friend.location_sharing_mode != 'invisible':
                locations.append({
                    'id': friend.id,
                    'name': f"{friend.first_name} {friend.last_name}",
                    'location': friend.location,
                    'profile_image': friend.profile.profile_image.url if friend.profile.profile_image else None
                })
        
        # Cache the results (keep timeout short for memory efficiency)
        cache_key = f'friends_locations_{user_id}'
        cache.set(cache_key, locations, timeout=60)  # Cache for 1 minute
        
        return locations
    except Exception as e:
        print(f"Error fetching friends locations: {str(e)}")
        return []

@shared_task
def cleanup_old_locations():
    """Clean up old location data"""
    # Implement cleanup logic here
    pass 