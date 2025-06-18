import React, { useRef, useState, useEffect } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Modal, Text, ScrollView } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import MapScreen from "../components/MapScreen";
import { colors, spacing } from "../theme";
import { Link } from "expo-router";
import MotiveInvitation from "../components/MotiveInvitation";
import CreateMotive from "../components/CreateMotive";
import { auth, users } from "../services/api";

type LocationSharingMode = 'invisible' | 'all_friends' | 'select_friends';

interface UserLocation {
  id: number;
  name: string;
  profile_image: string | null;
}

export default function Index() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [sharingMode, setSharingMode] = useState<LocationSharingMode>('all_friends');
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [allFriends, setAllFriends] = useState<UserLocation[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await auth.getProfile();
        if (response?.profile_image) {
          setProfileImage(response.profile_image);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

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
      <Link href={{ pathname: "/profile" }} asChild>
        <TouchableOpacity style={styles.profileButton}>
          {profileImage ? (
            <Image 
              source={{ uri: profileImage }} 
              style={styles.profileImage}
              defaultSource={require("../../assets/images/placeholder/jeff-profile.jpg")}
            />
          ) : (
            <Image 
              source={require("../../assets/images/placeholder/jeff-profile.jpg")} 
              style={styles.profileImage} 
            />
          )}
        </TouchableOpacity>
      </Link>
      {/* Motive Create Button */}
      <TouchableOpacity 
        style={styles.motiveButton}
        onPress={() => setShowInvite(true)}
      >
        <Ionicons name="add" size={24} color={colors.text[1]} />
      </TouchableOpacity>
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
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{}}>
            <CreateMotive />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      {renderSettingsModal()}
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
  settingsButton: {
    position: "absolute",
    bottom: spacing.xl + 80,
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
    zIndex: 1001,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.bg[2],
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text[1],
  },
  sharingOptions: {
    marginBottom: 20,
  },
  sharingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: colors.bg[1],
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: colors.acc.p1,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.text[1],
  },
  selectedText: {
    color: colors.acc.p1,
    fontWeight: 'bold',
  },
  friendsList: {
    maxHeight: 300,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg[1],
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendName: {
    fontSize: 16,
    color: colors.text[1],
  },
  defaultAvatar: {
    backgroundColor: colors.bg[1],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
