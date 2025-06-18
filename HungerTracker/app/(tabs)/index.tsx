import React, { useRef, useState, useEffect } from "react";
import { View, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapScreen from "../components/MapScreen";
import { colors, spacing } from "../theme";
import { Link, router } from "expo-router";
import MotiveInvitation from "../components/MotiveInvitation";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import FriendsBottomSheet from "../components/FriendsBottomSheet";
import type MapView from "react-native-maps";
import { auth, users } from "../services/api";
import { FriendData } from "../components/Friend";

type LocationSharingMode = 'invisible' | 'all_friends' | 'select_friends';

interface UserProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    location_sharing_mode?: string;
    selected_friends?: number[];
  };
  profile_image: string | null;
}

interface Friend {
  id: number;
  sender: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  receiver: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface FriendLocation {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  display_location: string;
  last_location_update?: string;
}

interface UserLocation {
  id: number;
  name: string;
  profile_image: string | null;
}

export default function Index() {
  const [showInvite, setShowInvite] = useState(false);
  const [showMotiveButton, setShowMotiveButton] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [friendsLocations, setFriendsLocations] = useState<FriendLocation[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [sharingMode, setSharingMode] = useState<LocationSharingMode>('all_friends');
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [allFriends, setAllFriends] = useState<UserLocation[]>([]);
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    loadUserProfile();
    loadFriendsData();
    loadAllFriends();
  }, []);

  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      const profile = await auth.getProfile();
      console.log('User profile data:', profile);
      setUserProfile(profile);

      // Set location sharing preferences from profile
      if (profile?.user?.location_sharing_mode) {
        setSharingMode(profile.user.location_sharing_mode as LocationSharingMode);
      }
      if (profile?.user?.selected_friends) {
        setSelectedFriends(profile.user.selected_friends);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadAllFriends = async () => {
    try {
      const friendsResponse = await auth.getFriends();
      const acceptedFriends = friendsResponse.data.filter((f: Friend) => f.status === 'accepted');
      const currentUserProfile = await users.getProfile();
      const currentUserId = currentUserProfile.user.id;

      const friendsList: UserLocation[] = await Promise.all(
        acceptedFriends.map(async (friendship: Friend) => {
          const friend = friendship.sender.id === currentUserId ? friendship.receiver : friendship.sender;
          try {
            const friendProfile = await auth.getProfileById(friend.id);
            return {
              id: friend.id,
              name: `${friend.first_name} ${friend.last_name}`,
              profile_image: friendProfile?.profile_image || null,
            };
          } catch (error) {
            return {
              id: friend.id,
              name: `${friend.first_name} ${friend.last_name}`,
              profile_image: null,
            };
          }
        })
      );

      setAllFriends(friendsList);
    } catch (error) {
      console.error('Error loading all friends:', error);
    }
  };

  const handleSharingModeChange = async (mode: LocationSharingMode) => {
    try {
      await users.updateLocationSharing(mode, mode === 'select_friends' ? selectedFriends : []);
      setSharingMode(mode);
      if (mode === 'all_friends') {
        setSelectedFriends([]);
      }
    } catch (error) {
      console.error('Error updating location sharing settings:', error);
    }
  };

  const toggleFriendSelection = async (friendId: number) => {
    const newSelectedFriends = selectedFriends.includes(friendId)
      ? selectedFriends.filter(id => id !== friendId)
      : [...selectedFriends, friendId];

    setSelectedFriends(newSelectedFriends);

    if (sharingMode === 'select_friends') {
      try {
        await users.updateLocationSharing('select_friends', newSelectedFriends);
      } catch (error) {
        console.error('Error updating selected friends:', error);
      }
    }
  };

  const formatLocationTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Location unknown';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInMinutes / 1440);
      return `${diffInDays}d ago`;
    }
  };

  const loadFriendsData = async () => {
    try {
      setFriendsLoading(true);

      // Load friends list
      const friendsResponse = await auth.getFriends();
      console.log('Friends response:', friendsResponse);

      const acceptedFriends = friendsResponse.data.filter((f: Friend) => f.status === 'accepted');
      console.log('Accepted friends:', acceptedFriends);

      // Load current user profile to determine current user ID
      const currentUserProfile = await users.getProfile();
      const currentUserId = currentUserProfile.user.id;
      console.log('Current user ID:', currentUserId);

      // Load friends locations
      const locationsResponse = await users.getFriendsLocations();
      console.log('Friends locations response:', locationsResponse);
      const friendsLocationData = locationsResponse.data || [];
      setFriendsLocations(friendsLocationData);

      // For each friend, get their profile data to get profile image
      const friendsWithProfiles = await Promise.all(
        acceptedFriends.map(async (friendship: Friend) => {
          const friend = friendship.sender.id === currentUserId ? friendship.receiver : friendship.sender;

          try {
            // Get friend's profile data
            const friendProfile = await auth.getProfileById(friend.id);
            console.log(`Profile for ${friend.username}:`, friendProfile);

            // Find location data for this friend
            const locationData = friendsLocationData.find((loc: FriendLocation) =>
              loc.id === friend.id
            );

            // Create subtitle with location and timestamp
            const getSubtitle = () => {
              if (locationData?.location) {
                const locationTime = formatLocationTimestamp(locationData.last_location_update);
                const displayLocation = locationData.display_location || 'Unknown location';
                return `${displayLocation} • ${locationTime}`;
              }
              return `@${friend.username}`;
            };

            return {
              id: friend.id.toString(),
              name: `${friend.first_name} ${friend.last_name}`,
              avatar: friendProfile?.profile_image ? { uri: friendProfile.profile_image } : require("../../assets/images/muckd-icon-prototype1.png"),
              coordinate: locationData?.location ? {
                latitude: locationData.location.latitude,
                longitude: locationData.location.longitude,
              } : { latitude: 0, longitude: 0 },
              subtitle: getSubtitle(),
            };
          } catch (error) {
            console.error(`Error getting profile for friend ${friend.id}:`, error);
            // Return friend data without profile image if profile fetch fails
            return {
              id: friend.id.toString(),
              name: `${friend.first_name} ${friend.last_name}`,
              avatar: require("../../assets/images/muckd-icon-prototype1.png"),
              coordinate: { latitude: 0, longitude: 0 },
              subtitle: `@${friend.username}`,
            };
          }
        })
      );

      console.log('Transformed friends with profiles:', friendsWithProfiles);
      setFriends(friendsWithProfiles);

    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleFriendPress = (friend: FriendData) => {
    // Navigate to friend's profile or focus on map location
    if (friend.coordinate.latitude !== 0 && friend.coordinate.longitude !== 0) {
      mapRef.current?.animateToRegion({
        latitude: friend.coordinate.latitude,
        longitude: friend.coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    // Close bottom sheet to show map
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleSheetChange = (index: number) => {
    setShowMotiveButton(index < 1);
  };

  const getProfileImageSource = () => {
    console.log('User profile for image:', userProfile);
    if (userProfile?.profile_image) {
      console.log('Using profile image:', userProfile.profile_image);
      return { uri: userProfile.profile_image };
    }
    console.log('Using default image');
    // Default app icon as fallback
    return require("../../assets/images/muckd-icon-prototype1.png");
  };

  const renderSettingsModal = () => (
    <Modal
      visible={isSettingsVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsSettingsVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Location Sharing</Text>
            <TouchableOpacity onPress={() => setIsSettingsVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text[1]} />
            </TouchableOpacity>
          </View>

          <View style={styles.sharingOptions}>
            <TouchableOpacity
              style={[styles.sharingOption, sharingMode === 'invisible' && styles.selectedOption]}
              onPress={() => handleSharingModeChange('invisible')}
            >
              <Ionicons
                name="eye-off"
                size={24}
                color={sharingMode === 'invisible' ? colors.acc.p1 : colors.text[1]}
              />
              <Text style={[styles.optionText, sharingMode === 'invisible' && styles.selectedText]}>
                Invisible
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sharingOption, sharingMode === 'all_friends' && styles.selectedOption]}
              onPress={() => handleSharingModeChange('all_friends')}
            >
              <Ionicons
                name="people"
                size={24}
                color={sharingMode === 'all_friends' ? colors.acc.p1 : colors.text[1]}
              />
              <Text style={[styles.optionText, sharingMode === 'all_friends' && styles.selectedText]}>
                All Friends
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sharingOption, sharingMode === 'select_friends' && styles.selectedOption]}
              onPress={() => handleSharingModeChange('select_friends')}
            >
              <Ionicons
                name="person-add"
                size={24}
                color={sharingMode === 'select_friends' ? colors.acc.p1 : colors.text[1]}
              />
              <Text style={[styles.optionText, sharingMode === 'select_friends' && styles.selectedText]}>
                Select Friends
              </Text>
            </TouchableOpacity>
          </View>

          {sharingMode === 'select_friends' && (
            <ScrollView style={styles.friendsList}>
              {allFriends.map(friend => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => toggleFriendSelection(friend.id)}
                >
                  <View style={styles.friendInfo}>
                    {friend.profile_image ? (
                      <Image source={{ uri: friend.profile_image }} style={styles.friendAvatar} />
                    ) : (
                      <View style={[styles.friendAvatar, styles.defaultAvatar]}>
                        <Ionicons name="person" size={24} color={colors.text[2]} />
                      </View>
                    )}
                    <Text style={styles.friendName}>{friend.name}</Text>
                  </View>
                  <Ionicons
                    name={selectedFriends.includes(friend.id) ? "checkbox" : "square-outline"}
                    size={24}
                    color={selectedFriends.includes(friend.id) ? colors.acc.p1 : colors.text[2]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <MapScreen friends={friends} friendsLocations={friendsLocations} />
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
          {profileLoading ? (
            <View style={styles.profileImageContainer}>
              <ActivityIndicator size="small" color={colors.acc.p1} />
            </View>
          ) : (
            <Image
              source={getProfileImageSource()}
              style={styles.profileImage}
            />
          )}
        </TouchableOpacity>
      </Link>
      {/* Motive Create Button */}
      {showMotiveButton && (
        <LinearGradient
          colors={colors.grad.p1}
          style={styles.motiveButton}
        >
          <TouchableOpacity
            onPress={() => {
              bottomSheetRef.current?.snapToIndex(0);
              router.push('/(stack)/motivecreate');
            }}
          >
            <Ionicons name="add" size={24} color={colors.text[1]} />
          </TouchableOpacity>
        </LinearGradient>
      )}
      {/* Location Settings Button */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setIsSettingsVisible(true)}
      >
        <Ionicons name="settings" size={24} color={colors.text[1]} />
      </TouchableOpacity>

      {/* Motive Invitation Overlay */}
      {showInvite && (
        <TouchableOpacity
          style={styles.inviteOverlay}
          activeOpacity={1}
          onPress={() => setShowInvite(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => { }} style={{}}>
            <MotiveInvitation onNotNow={() => setShowInvite(false)} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {renderSettingsModal()}

      <FriendsBottomSheet
        bottomSheetRef={bottomSheetRef}
        friends={friends}
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
    zIndex: 999,
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
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 32,
    backgroundColor: colors.bg[2],
    justifyContent: 'center',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.bg[1],
    padding: spacing.md,
    borderRadius: 16,
    width: "80%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text[1],
  },
  sharingOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sharingOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.text[2],
    borderRadius: 8,
  },
  selectedOption: {
    borderColor: colors.acc.p1,
  },
  selectedText: {
    fontWeight: "bold",
  },
  optionText: {
    marginLeft: spacing.md,
    color: colors.text[1],
  },
  friendsList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.text[2],
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  defaultAvatar: {
    backgroundColor: colors.bg[2],
    justifyContent: "center",
    alignItems: "center",
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text[1],
  },
  settingsButton: {
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
    zIndex: 1003,
  },
});
