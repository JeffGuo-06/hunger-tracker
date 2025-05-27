import React from "react";
import { colors, spacing, fontSizes } from "../theme";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PhotoBoard from "../components/PhotoBoard";
import { Link } from "expo-router";

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
  const EXAMPLE_POSTS = [
    {
      id: '1',
      imageUrl: require('../../assets/images/muckd-icon-prototype1.png'),
      comments: 5,
    },
    {
      id: '2',
      imageUrl: require('../../assets/images/muckd-icon-prototype1.png'),
      comments: 3,
    },
    {
      id: '3',
      imageUrl: require('../../assets/images/muckd-icon-prototype1.png'),
      comments: 2,
    },
    {
      id: '4',
      imageUrl: require('../../assets/images/muckd-icon-prototype1.png'),
      comments: 4,
    },
    {
      id: '5',
      imageUrl: require('../../assets/images/muckd-icon-prototype1.png'),
      comments: 1,
    },
    {
      id: '6',
      imageUrl: require('../../assets/images/muckd-icon-prototype1.png'),
      comments: 3,
    },
    {
      id: '7',
      imageUrl: require('../../assets/images/muckd-icon-prototype1.png'),
      comments: 3,
    },
  ];
 
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Link href="/(stack)/settings" asChild>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color={colors.text[1]} />
            </TouchableOpacity>
          </Link>
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
          <Link href="/(tabs)/friends" asChild>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.friends}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </TouchableOpacity>
          </Link>
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
          posts={EXAMPLE_POSTS} 
          //onPhotoPress={handlePhotoPress}
        />
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
