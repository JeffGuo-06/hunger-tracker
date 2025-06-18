import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSizes } from "../theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { auth, posts } from "../services/api";
import PhotoBoard from "../components/PhotoBoard";

const API_URL = 'http://18.219.233.137';

interface UserProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    bio?: string;
    location?: {
      latitude: number;
      longitude: number;
    } | null;
    display_location?: string;
  };
  profile_image: string | null;
  last_ate?: string | null;
  is_hungry?: boolean;
  created_at: string;
  updated_at: string;
}

interface UserPost {
  id: string;
  image: string;
  caption: string;
  created_at: string;
}

export default function ViewProfile() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }

    const loadProfileAndPosts = async () => {
      setLoading(true);
      try {
        const resolvedUserId = Array.isArray(userId) ? userId[0] : userId;
        console.log('Loading profile for user:', resolvedUserId);

        const profile = await auth.getProfileById(resolvedUserId);
        console.log('Profile loaded:', profile);
        setUser(profile);

        await fetchUserPosts(Number(resolvedUserId));
        await fetchFriendsCount(Number(resolvedUserId));
      } catch (err: any) {
        console.error('Error loading profile:', err);
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
      console.log('User posts loaded:', response);
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

  const handleSendFriendRequest = async () => {
    if (!user) return;

    try {
      await auth.sendFriendRequest(user.user.username);
      Alert.alert('Success', 'Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text[1]} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.acc.p1} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text[1]} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load profile'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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

  const formatLocation = (location: { latitude: number; longitude: number } | null, displayLocation?: string) => {
    if (displayLocation) {
      return displayLocation;
    }
    return 'Location not set';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text[1]} />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.profileImageContainer}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.defaultProfileImage]}>
                <Ionicons name="person" size={50} color={colors.text[2]} />
              </View>
            )}
          </View>

          <Text style={styles.name}>
            {user.user.first_name} {user.user.last_name}
          </Text>
          <Text style={styles.username}>@{user.user.username}</Text>

          {user.user.bio && (
            <Text style={styles.bio}>{user.user.bio}</Text>
          )}

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={colors.text[2]} />
            <Text style={styles.location}>
              {formatLocation(user.user.location || null, user.user.display_location)}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{friendsCount}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Motives</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.addFriendButton}
              onPress={handleSendFriendRequest}
            >
              <Text style={styles.addFriendButtonText}>Add Friend</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => router.push('/(stack)/motivecreate')}
            >
              <Text style={styles.inviteButtonText}>Invite to Motive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.acc.p1} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts Section */}
        <View style={styles.postsSection}>
          <View style={styles.postsSectionHeader}>
            <Text style={styles.postsSectionTitle}>Posts</Text>
            <Ionicons name="grid-outline" size={20} color={colors.text[2]} />
          </View>

          {userPosts.length > 0 ? (
            <PhotoBoard posts={transformedPosts} />
          ) : (
            <View style={styles.noPostsContainer}>
              <Ionicons name="camera-outline" size={50} color={colors.text[2]} />
              <Text style={styles.noPostsText}>No posts yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerSpacer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.text[2],
    fontSize: 16,
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  errorText: {
    color: colors.text[1],
    fontSize: 16,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.acc.p1,
    padding: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text[1],
    fontSize: 16,
    fontWeight: "600",
  },
  profileInfo: {
    alignItems: "center",
    padding: spacing.lg,
  },
  profileImageContainer: {
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  defaultProfileImage: {
    backgroundColor: colors.bg[2],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text[1],
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: 16,
    color: colors.text[2],
    marginBottom: spacing.sm,
  },
  bio: {
    fontSize: 16,
    color: colors.text[1],
    textAlign: "center",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  location: {
    fontSize: 14,
    color: colors.text[2],
    marginLeft: spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  stat: {
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
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  addFriendButton: {
    backgroundColor: colors.acc.p1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  addFriendButtonText: {
    color: colors.text[1],
    fontSize: 16,
    fontWeight: "600",
  },
  inviteButton: {
    backgroundColor: colors.bg[2],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inviteButtonText: {
    color: colors.text[1],
    fontSize: 16,
    fontWeight: "600",
  },
  messageButton: {
    backgroundColor: colors.bg[2],
    padding: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postsSection: {
    flex: 1,
    padding: spacing.md,
  },
  postsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  postsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text[1],
  },
  noPostsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },
  noPostsText: {
    fontSize: 16,
    color: colors.text[2],
    marginTop: spacing.md,
    textAlign: "center",
  },
});
