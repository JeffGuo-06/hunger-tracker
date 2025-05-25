import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Image } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";

type LocationCoords = {
  latitude: number;
  longitude: number;
} | null;

// Example user data - in a real app, this would come from your backend
const EXAMPLE_USERS = [
  {
    id: "1",
    name: "Laughter",
    location: {
      latitude: 43.4643,
      longitude: -80.5204,
    },
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    name: "Ethan",
    location: {
      latitude: 43.4675,
      longitude: -79.6877,
    },
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "3",
    name: "Hus",
    location: {
      latitude: 43.46843,
      longitude: -79.74241,
    },
    avatar: "https://i.pravatar.cc/150?img=3",
  },
];

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
      } catch (error) {
        setErrorMsg("Error getting location");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#023047" />
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
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {/* Current user location marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
          >
            <View style={styles.currentUserMarker}>
              <View style={styles.currentUserMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Other users markers */}
        {EXAMPLE_USERS.map((user) => (
          <Marker
            key={user.id}
            coordinate={user.location}
            title={user.name}
          >
            <View style={styles.userMarker}>
              <Image
                source={{ uri: user.avatar }}
                style={styles.userAvatar}
              />
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
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
    backgroundColor: "#023047",
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
    borderColor: "#023047",
    overflow: "hidden",
  },
  userAvatar: {
    width: "100%",
    height: "100%",
  },
});
