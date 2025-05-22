import React from "react";
import { colors, spacing, fontSizes } from "../theme";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  // Example user data - in a real app, this would come from your backend
  const user = {
    name: "Jeff Guo",
    username: "@jeffguo",
    bio: "holy muck... 🍔🌮",
    location: "Markham, ON",
    stats: {
      mucks: 42,
      friends: 72,
    },
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#023047" />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <Image
          source={require('../../assets/images/placeholder/jeff-profile.jpg')}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.bio}>{user.bio}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.location}>{user.location}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.stats.mucks}</Text>
          <Text style={styles.statLabel}>Mucks</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.stats.friends}</Text>
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Ionicons name="restaurant-outline" size={24} color="#023047" />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Checked in at Burger Palace</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="heart-outline" size={24} color="#023047" />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Liked Sarah's post</Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="star-outline" size={24} color="#023047" />
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
});
