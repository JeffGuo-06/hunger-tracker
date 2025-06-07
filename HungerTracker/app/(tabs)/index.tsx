import React, { useRef, useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapScreen, { EXAMPLE_USERS, MapUser } from "../components/MapScreen";
import { colors, spacing } from "../theme";
import { Link, router } from "expo-router";
import MotiveInvitation from "../components/MotiveInvitation";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet, { BottomSheetMethods } from "@gorhom/bottom-sheet";
import FriendsBottomSheet from "../components/FriendsBottomSheet";
import type MapView from "react-native-maps";

export default function Index() {
  const [showInvite, setShowInvite] = useState(false);
  const [showMotiveButton, setShowMotiveButton] = useState(true);
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  const handleFriendPress = (friend: MapUser) => {
    bottomSheetRef.current?.snapToIndex(0);
    mapRef.current?.animateToRegion(
      {
        ...friend.location,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      500
    );
  };

  const handleSheetChange = (index: number) => {
    setShowMotiveButton(index < 2);
  };

  return (
    <View style={styles.container}>
      <MapScreen mapRef={mapRef} />
      {/* Notification Button */}
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => setShowInvite((v) => !v)}
      >
        <Ionicons name="notifications" size={24} color={colors.text[1]} />
      </TouchableOpacity>
      {/* Profile Button */}
      <Link href="/(tabs)/profile" asChild>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={require("../../assets/images/placeholder/jeff-profile.jpg")}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </Link>
      {/* Motive Create Button */}
      {showMotiveButton && (
        <LinearGradient colors={colors.grad.p1} style={styles.motiveButton}>
          <TouchableOpacity
            onPress={() => {
              bottomSheetRef.current?.close();
              router.push('/(stack)/motivecreate');
            }}
          >
            <Ionicons name="add" size={24} color={colors.text[1]} />
          </TouchableOpacity>
        </LinearGradient>
      )}

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

      <FriendsBottomSheet
        bottomSheetRef={bottomSheetRef}
        friends={EXAMPLE_USERS.map((u) => ({ ...u, subtitle: 'last mucked 2hrs ago - 3.7km' }))}
        onFriendPress={handleFriendPress}
        onChange={handleSheetChange}
      />
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
    backgroundColor: colors.bg[1],
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
