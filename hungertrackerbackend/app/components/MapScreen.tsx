import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Image } from "react-native";
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
  const [loadingAvatars, setLoadingAvatars] = useState<Record<number, boolean>>({});

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

  const handleImageLoad = (userId: number) => {
    setLoadingAvatars({ ...loadingAvatars, [userId]: false });
  };

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
  loadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
