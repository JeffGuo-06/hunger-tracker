import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Image, Modal, TouchableOpacity, ScrollView } from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { users } from "../services/api";
import { colors } from "../theme";
import { Ionicons } from "@expo/vector-icons";

type LocationCoords = {
  latitude: number;
  longitude: number;
} | null;

interface UserLocation {
  id: number;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  last_location_update: string | null;
  profile_image: string | null;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

type LocationSharingMode = 'invisible' | 'all_friends' | 'select_friends';

const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const [location, setLocation] = useState<LocationCoords>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [currentUser, setCurrentUser] = useState<UserLocation | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [sharingMode, setSharingMode] = useState<LocationSharingMode>('all_friends');
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [allFriends, setAllFriends] = useState<UserLocation[]>([]);

  const updateLocation = async (coords: Location.LocationObjectCoords) => {
    try {
      const locationData = {
        latitude: coords.latitude,
        longitude: coords.longitude
      };
      await users.updateLocation(JSON.stringify(locationData));
      const profile = await users.getProfile();
      setCurrentUser({
        id: profile.user.id,
        name: `${profile.user.first_name} ${profile.user.last_name}`,
        location: profile.user.location,
        last_location_update: profile.user.last_location_update,
        profile_image: profile.profile_image,
        coordinates: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const fetchUserLocations = async () => {
    try {
      const profile = await users.getProfile();
      setCurrentUser({
        id: profile.user.id,
        name: `${profile.user.first_name} ${profile.user.last_name}`,
        location: profile.user.location,
        last_location_update: profile.user.last_location_update,
        profile_image: profile.profile_image,
      });

      // Fetch friends' locations
      const friendsLocations = await users.getFriendsLocations();
      setAllFriends(friendsLocations);
      
      // Only include friends who have shared their location
      const visibleLocations = friendsLocations.filter((friend: UserLocation) => 
        friend.location !== null
      );

      setUserLocations(visibleLocations.map((friend: UserLocation) => {
        if (!friend.location) return null;
        return {
          id: friend.id,
          name: friend.name,
          location: friend.location,
          last_location_update: friend.last_location_update,
          profile_image: friend.profile_image,
          coordinates: {
            latitude: friend.location.latitude,
            longitude: friend.location.longitude,
          },
        };
      }).filter((location: UserLocation | null): location is UserLocation => location !== null));
    } catch (error) {
      console.error('Error fetching user locations:', error);
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

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          setIsLoading(false);
          return;
        }

        let userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const newLocation = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        };
        setLocation(newLocation);
        setRegion({
          ...newLocation,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        // Update location in backend
        await updateLocation(userLocation.coords);
        await fetchUserLocations();
      } catch (error) {
        setErrorMsg("Error getting location");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    fetchUserLocations();
  }, [sharingMode, selectedFriends]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMarkerTitle = (userId: number, name: string, lastUpdate: string | null | undefined) => {
    if (selectedMarker !== userId) {
      return name;
    }
    return `${name} (Last updated: ${formatTimestamp(lastUpdate || '')})`;
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.acc.p1} />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setIsSettingsVisible(true)}
      >
        <Ionicons name="settings" size={24} color={colors.acc.p1} />
      </TouchableOpacity>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        followsUserLocation={false}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={getMarkerTitle(-1, "You", currentUser?.last_location_update)}
            onPress={() => setSelectedMarker(selectedMarker === -1 ? null : -1)}
          >
            <View style={styles.currentUserMarker}>
              <View style={styles.currentUserMarkerInner} />
            </View>
          </Marker>
        )}
        {userLocations.map((user) => (
          user.coordinates && (
            <Marker
              key={user.id}
              coordinate={user.coordinates}
              title={getMarkerTitle(user.id, user.name, user.last_location_update)}
              onPress={() => setSelectedMarker(selectedMarker === user.id ? null : user.id)}
            >
              <View style={styles.userMarker}>
                {user.profile_image ? (
                  <Image
                    source={{ uri: user.profile_image }}
                    style={styles.userAvatar}
                  />
                ) : (
                  <View style={[styles.userAvatar, styles.defaultAvatar]}>
                    <Ionicons name="person" size={24} color={colors.text[2]} />
                  </View>
                )}
              </View>
            </Marker>
          )
        ))}
      </MapView>
      {renderSettingsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    padding: 20,
  },
  currentUserMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.acc.p1,
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  currentUserMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: colors.acc.p1,
    overflow: "hidden",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    backgroundColor: colors.bg[1],
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: colors.bg[2],
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
});
