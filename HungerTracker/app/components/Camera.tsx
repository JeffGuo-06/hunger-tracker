import {
  CameraView,
  CameraType,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { SymbolView } from "expo-symbols";
import PhotoView from "../components/PhotoView";
import IconButton from "../components/IconButton";
import { colors } from "../theme";

export default function Camera() {
  const [cameraFacing, setCameraFacing] = useState<CameraType>("back");
  const [cameraFlash, setCameraFlash] = useState<FlashMode>("off");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isCameraMounted, setIsCameraMounted] = useState(false);
  const [toggleCooldown, setToggleCooldown] = useState(false);
  const cameraRef = React.useRef<CameraView>(null);
  
  async function handleTakePhoto() {
    if (!cameraRef.current || !isCameraMounted || isFrozen) return;
    
    setIsFrozen(true);
    try {
      const response = await cameraRef.current.takePictureAsync({});
      if (response?.uri) {
        setPhoto(response.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    } finally {
      setIsFrozen(false);
    }
  }

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    if (isFrozen || toggleCooldown) return;
    setToggleCooldown(true);
    setTimeout(() => setToggleCooldown(false), 500);
    setIsCameraMounted(false);
    setCameraFacing((current) => (current === "back" ? "front" : "back"));
  }

  function toggleCameraFlash() {
    setCameraFlash((current) => (current === "off" ? "on" : "off"));
  }

  if (photo) {
    return <PhotoView photo={photo} onClose={() => setPhoto(null)} />;
  }

  return (
    <View style={styles.container}>
      <CameraView
        key={cameraFacing}
        ref={cameraRef}
        facing={cameraFacing}
        flash={cameraFlash}
        style={styles.camera}
        mirror={cameraFacing === "front"}
        active={!isFrozen}
        onCameraReady={() => setIsCameraMounted(true)}
      />
      {!isCameraMounted && (
        <View style={styles.loadingOverlay}>
          <Image
            source={require("../../assets/images/loading.jpg")}
            style={styles.loadingImage}
            resizeMode="cover"
          />
        </View>
      )}
      <View
        style={styles.bottombar}
        pointerEvents={!isCameraMounted || isFrozen || toggleCooldown ? "none" : "auto"}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={toggleCameraFlash}
          disabled={!isCameraMounted || isFrozen || toggleCooldown}
        >
          <SymbolView
            name={cameraFlash === "on" ? "bolt.fill" : "bolt.slash.fill"}
            type="hierarchical"
            tintColor="white"
            size={40}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleTakePhoto}
          disabled={!isCameraMounted || isFrozen || toggleCooldown}
        >
          <SymbolView
            name="circle"
            type="hierarchical"
            tintColor={(!isCameraMounted || isFrozen || toggleCooldown) ? "gray" : "white"}
            size={90}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={toggleCameraFacing}
          disabled={!isCameraMounted || isFrozen || toggleCooldown}
        >
          <SymbolView
            name="camera.rotate.fill"
            type="hierarchical"
            tintColor="white"
            size={40}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  button: {
    flex: 1,
    //backgroundColor: "hsla(0, 0%, 0%, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    textAlign: "center",
    fontSize: 18,
    margin: 20,
    color: colors.text[1],
  },
  bottombar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "hsla(0, 0%, 0%, 0.5)",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "hsla(0, 0%, 0%, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingImage: {
    width: "100%",
    height: "100%",
  },
});
