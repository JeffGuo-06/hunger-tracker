import React, { useRef, useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import MapScreen from "../components/MapScreen";
import { colors, spacing } from "../theme";
import { Link } from "expo-router";
import MotiveInvitation from "../components/MotiveInvitation";

export default function Index() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [showInvite, setShowInvite] = useState(false);

  return (
    <View style={styles.container}>
      <MapScreen />
      {/* Notification Button */}
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => setShowInvite((v) => !v)}
      >
        <Ionicons
          name="notifications"
          size={24}
          color={colors.text[1]}
        />
      </TouchableOpacity>
      {/* Profile Button */}
      <Link href="/(tabs)/profile" asChild>
        <TouchableOpacity style={styles.profileButton}>
          <Image source={require("../../assets/images/placeholder/jeff-profile.jpg")} style={styles.profileImage} />
        </TouchableOpacity>
      </Link>
      {/* Motive Create Button */}
      <Link href="/(stack)/motivecreate" asChild>
        <TouchableOpacity style={styles.motiveButton}>
          <Ionicons name="add" size={24} color={colors.text[1]} />
        </TouchableOpacity>
      </Link>
      {/* Motive Invitation Overlay */}
      {showInvite && (
        <TouchableOpacity
          style={styles.inviteOverlay}
          activeOpacity={1}
          onPress={() => setShowInvite(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{}}>
            <MotiveInvitation onNotNow={() => setShowInvite(false)} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  
  notificationButton: {
    position: "absolute",
    top: spacing.xl + 30,
    right: spacing.xl,
    backgroundColor: colors.bg[2],
    padding: spacing.md,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1002,
  },
  motiveButton: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.acc.p1,
    padding: spacing.md,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  profileButton: {
    position: "absolute",
    top: spacing.xl + 30,
    left: spacing.xl,
    backgroundColor: colors.acc.p1,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 32,
  },
  inviteOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
});
