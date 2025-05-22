import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSizes } from "../theme";

export default function Profile() {
  // Example user data - in a real app, this would come from your backend
  const user = {
    name: "John Doe",
    username: "@johndoe",
    bio: "Food lover and adventure seeker 🍔🌮",
    location: "San Francisco, CA",
    stats: {
      posts: 42,
      followers: 1234,
      following: 567,
    },
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.color.primary1} />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <Image
          source={{ uri: "https://i.pravatar.cc/300" }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.bio}>{user.bio}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.location}>{user.location}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.stats.posts}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.stats.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.stats.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color={colors.color.primary1} />
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Ionicons name="restaurant-outline" size={24} color={colors.color.primary1} />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Checked in at Burger Palace</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="heart-outline" size={24} color={colors.color.primary1} />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Liked Sarah's post</Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="star-outline" size={24} color={colors.color.primary1} />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Rated Pizza Place 5 stars</Text>
              <Text style={styles.activityTime}>Yesterday</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background[4],
  },
  header: {
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  settingsButton: {
    padding: spacing.sm,
  },
  profileInfo: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSizes.xlarge,
    fontWeight: "bold",
    color: colors.color.primary1,
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: fontSizes.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  bio: {
    fontSize: fontSizes.medium,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  location: {
    fontSize: fontSizes.small,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.background[3],
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: fontSizes.large,
    fontWeight: "bold",
    color: colors.color.primary1,
  },
  statLabel: {
    fontSize: fontSizes.small,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.sm,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.color.primary1,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: colors.text.primary,
    fontSize: fontSizes.medium,
    fontWeight: "600",
  },
  shareButton: {
    backgroundColor: colors.background[3],
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.large,
    fontWeight: "600",
    color: colors.color.primary1,
    marginBottom: spacing.md,
  },
  activityList: {
    gap: spacing.md,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: fontSizes.medium,
    color: colors.text.primary,
  },
  activityTime: {
    fontSize: fontSizes.small,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
