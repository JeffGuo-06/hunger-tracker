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
import { router } from "expo-router";

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
    location: string;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    fetchProfile();
    fetchFriendsCount();
    fetchUserPosts();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await auth.getProfile();
      setUser(response);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await posts.getAll();
      // Filter posts for the current user
      const currentUserPosts = response.filter((post: any) => post.user.id === user?.user.id);
      setUserPosts(currentUserPosts);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    }
  };

  const fetchFriendsCount = async () => {
    try {
      const response = await auth.getFriends();
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
    ? `${API_URL}${user.profile_image}`
    : null;

  // Transform posts for PhotoBoard
  const transformedPosts = userPosts.map(post => ({
    id: post.id,
    imageUrl: post.image,
    comments: 0, // You can add comments count if needed
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#023047" />
          </TouchableOpacity>
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
          <Text style={styles.name}>{`${user.user.first_name} ${user.user.last_name}`}</Text>
          <Text style={styles.username}>@{user.user.username}</Text>
          <Text style={styles.bio}>{user.user.bio || 'No bio yet'}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.location}>{user.user.location}</Text>
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
  settingsButton: {
    padding: 8,
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: colors.text[3],
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
});
