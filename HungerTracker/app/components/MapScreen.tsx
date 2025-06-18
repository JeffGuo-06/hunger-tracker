import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Image } from 'expo-image';
import { colors } from '../theme';

type LocationCoords = {
  latitude: number;
  longitude: number;
} | null;

export type MapUser = {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  avatar: string;
};

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

export interface FriendData {
  id: string;
  name: string;
  avatar: any;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  subtitle: string;
}

interface MapScreenProps {
  friends?: FriendData[];
  friendsLocations?: FriendLocation[];
}

export default function MapScreen({ friends = [], friendsLocations = [] }: MapScreenProps) {
  const [location, setLocation] = useState<LocationCoords>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        setErrorMsg('Error getting location');
        console.error('Location error:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const initialRegion: Region = {
    latitude: location?.latitude || 37.78825,
    longitude: location?.longitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.acc.p1} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  const renderFriendMarker = (friend: FriendData) => {
    // Only render markers for friends with valid coordinates
    if (friend.coordinate.latitude === 0 && friend.coordinate.longitude === 0) {
      return null;
    }

    const getAvatarSource = () => {
      if (friend.avatar && friend.avatar.uri) {
        return { uri: friend.avatar.uri };
      }
      return friend.avatar || require('../../assets/images/muckd-icon-prototype1.png');
    };

    return (
      <Marker
        key={friend.id}
        coordinate={friend.coordinate}
        title={friend.name}
        description={friend.subtitle}
      >
        <View style={styles.markerContainer}>
          <Image
            source={getAvatarSource()}
            style={styles.markerImage}
            contentFit="cover"
          />
        </View>
      </Marker>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        mapType="standard"
      >
        {/* Current user location marker */}
        {location && (
          <Marker
            coordinate={location}
            title="You are here"
            pinColor={colors.acc.p1}
          />
        )}

        {/* Friend location markers */}
        {friends.map(renderFriendMarker)}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg[1],
  },
  loadingText: {
    marginTop: 10,
    color: colors.text[2],
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg[1],
    padding: 20,
  },
  errorText: {
    color: colors.acc.p1,
    fontSize: 16,
    textAlign: 'center',
  },
  markerContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.bg[2],
    borderWidth: 3,
    borderColor: colors.acc.p1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});
