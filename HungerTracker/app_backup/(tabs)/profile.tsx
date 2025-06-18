import React, { useState, useEffect } from "react";
import { colors, spacing, fontSizes } from "../theme";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PhotoBoard from "../components/PhotoBoard";
import { auth, posts } from "../services/api";
import { router, useLocalSearchParams } from "expo-router";
import SettingsModal from "../components/SettingsModal";

const API_URL = 'http://192.168.40.242:8000';

interface UserProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    bio: string;
    location: {
      latitude: number;
      longitude: number;
    } | null;
    display_location: string;
  };
  profile_image: string | null;
  last_ate: string | null;
  is_hungry: boolean;
  created_at: string;
  updated_at: string;
}

interface UserPost {
  id: string;
  image: string;
  caption: string;
  created_at: string;
}

export default function Profile() {
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  useEffect(() => {
    const loadProfileAndPosts = async () => {
      setLoading(true);
      try {
        let profile;
        let id;
        let resolvedUserId = Array.isArray(userId) ? userId[0] : userId;
        if (resolvedUserId) {
          // Fetch another user's profile
          profile = await auth.getProfileById(resolvedUserId);
          id = resolvedUserId;
        } else {
          // Fetch current user's profile
          profile = await auth.getProfile();
          id = profile.user.id;
        }
        setUser(profile);
        await fetchUserPosts(Number(id));
        await fetchFriendsCount(Number(id));
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfileAndPosts();
  }, [userId]);

  const fetchUserPosts = async (userId: number) => {
    try {
      const response = await posts.getUserPosts(userId);
      setUserPosts(response);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    }
  };

  const fetchFriendsCount = async (userId: number) => {
    try {
      const response = await auth.getFriendsOfUser(userId);
      const acceptedFriends = response.data.filter(
        (friend: any) => friend.status === 'accepted'
      );
      setFriendsCount(acceptedFriends.length);
    } catch (err) {
      console.error('Error fetching friends count:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true); // Show loading state
      let profile;
      let id;
      let resolvedUserId = Array.isArray(userId) ? userId[0] : userId;
      if (resolvedUserId) {
        profile = await auth.getProfileById(resolvedUserId);
        id = resolvedUserId;
      } else {
        profile = await auth.getProfile();
        id = profile.user.id;
      }
      setUser(profile);
      await fetchUserPosts(Number(id));
      await fetchFriendsCount(Number(id));
    } catch (err: any) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.acc.p1} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load profile'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const profileImageUrl = user.profile_image 
    ? user.profile_image.startsWith('http') 
      ? user.profile_image 
      : `${API_URL}${user.profile_image}`
    : null;

  // Transform posts for PhotoBoard
  const transformedPosts = userPosts.map(post => ({
    id: post.id,
    imageUrl: post.image,
    comments: 0, // You can add comments count if needed
  }));

  const formatLocation = (location: { latitude: number; longitude: number } | null) => {
    return 'Location not set';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {userId ? (
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/profile')}>
              <Ionicons name="arrow-back" size={24} color="#FFA500" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.settingsButton} 
              onPress={() => setIsSettingsVisible(true)}
            >
              <Ionicons name="settings-outline" size={24} color="#FFA500" />
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          {profileImageUrl ? (
            <Image
              source={{ uri: profileImageUrl }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.defaultProfileImage]}>
              <Ionicons name="person" size={60} color="#9E9E9E" />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.user.first_name} {user.user.last_name}</Text>
            <Text style={styles.username}>@{user.user.username}</Text>
            {user.user.bio && <Text style={styles.bio}>{user.user.bio}</Text>}
            {user.user.display_location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color={colors.text[2]} />
                <Text style={styles.location}>{user.user.display_location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userPosts.length}</Text>
            <Text style={styles.statLabel}>Mucks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{friendsCount}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color="#023047" />
          </TouchableOpacity> */}
        </View>

        {/* Recent Activity */}
        <PhotoBoard 
          posts={transformedPosts} 
          onPhotoPress={(post) => {
            // Handle post press if needed
            console.log('Post pressed:', post);
          }}
        />

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButtonContainer} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Settings Modal */}
      {user && (
        <SettingsModal
          visible={isSettingsVisible}
          onClose={() => setIsSettingsVisible(false)}
          user={user.user}
          profileImage={profileImageUrl}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[2],
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  logoutButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.acc.p1,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  userInfo: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text[1],
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: colors.text[2],
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: colors.text[1],
    textAlign: "center",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: colors.text[2],
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderColor: colors.bg[3],
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text[1],
  },
  statLabel: {
    fontSize: 14,
    color: colors.text[2],
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.acc.p1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: colors.text[1],
    fontSize: 16,
    fontWeight: "600",
  },
  shareButton: {
    backgroundColor: colors.bg[3],
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text[1],
    marginBottom: 16,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: colors.text[1],
  },
  activityTime: {
    fontSize: 14,
    color: colors.text[2],
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.text[2],
    fontSize: 16,
    textAlign: 'center',
  },
  defaultProfileImage: {
    backgroundColor: colors.bg[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  settingsButton: {
    padding: 8,
    marginRight: 8,
  },
});
