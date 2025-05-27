import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSizes } from "../theme";
import { Link, useRouter } from "expo-router";

export default function ViewProfile() {
  // Example user data - replace with real data as needed
  const user = {
    name: "Jeff Guo",
    username: "@jeffguo",
    bio: "holy muck... 🍔🌮",
    location: "Markham, ON",
    profileImage: require("../../assets/images/placeholder/jeff-profile.jpg"),
  };
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text[1]} />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <Image source={user.profileImage} style={styles.profileImage} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.bio}>{user.bio}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.location}>{user.location}</Text>
        </View>
      </View>

      {/* Invite to Motive Button */}
      <View style={styles.actionButtons}>
        <Link href="./motivecreate" replace asChild>
        <TouchableOpacity style={styles.inviteButton}>
          <Text style={styles.inviteButtonText}>Invite to Motive</Text>
        </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[2],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,

  },
  backButton: {
    padding: spacing.sm,
  },
  profileInfo: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: spacing.xl,
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    padding: spacing.lg,
  },
  inviteButton: {
    backgroundColor: colors.acc.p1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    alignItems: "center",
  },
  inviteButtonText: {
    color: colors.text[1],
    fontSize: 18,
    fontWeight: "600",
  },
});
