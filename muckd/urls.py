"""
URL configuration for muckd project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from . import views
from django_ratelimit.decorators import ratelimit

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'profiles', views.ProfileViewSet, basename='profile')
router.register(r'friendships', views.FriendshipViewSet, basename='friendship')
router.register(r'posts', views.PostViewSet)
router.register(r'messages', views.MessageViewSet)
router.register(r'notifications', views.NotificationViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
    path('accounts/', include('allauth.urls')),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/phone/request-verification/', views.request_phone_verification, name='request-phone-verification'),
    path('auth/phone/verify/', views.verify_phone_number, name='verify-phone-number'),
    path('send-sms/', views.send_sms_view, name='send_sms'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

INSTALLED_APPS = [
    # ... existing apps ...
    'rest_framework',
    'rest_framework_simplejwt',
    'django.contrib.auth',
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'corsheaders',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Add your mobile app's domain
]

@ratelimit(key='ip', rate='5/m', block=True)
def your_view(request):
    # Your view logic here
    pass




