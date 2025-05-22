import {
  CameraView,
  CameraType,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import React, { useState, useEffect } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SymbolView } from "expo-symbols";
import PhotoView from "../components/PhotoView";

export default function Camera() {
  const [cameraFacing, setCameraFacing] = useState<CameraType>("back");
  const [cameraFlash, setCameraFlash] = useState<FlashMode>("off");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = React.useRef<CameraView>(null);

  useEffect(() => {
    console.log('Camera permission status:', permission?.granted);
    console.log('Camera ready status:', cameraReady);
  }, [permission, cameraReady]);

  async function handleTakePhoto() {
    if (!cameraRef.current || !cameraReady) {
      console.log('Camera is not ready');
      return;
    }
    try {
      console.log('Attempting to take photo...');
      const response = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
        exif: true,
        base64: true,
      });
      console.log('Photo taken successfully:', response.uri);
      setPhoto(response.uri);
    } catch (error) {
      console.error('Error taking photo:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permissions are still loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setCameraFacing((current) => (current === "back" ? "front" : "back"));
  }

  function toggleCameraFlash() {
    setCameraFlash((current) => (current === "off" ? "on" : "off"));
  }

  if (photo) return <PhotoView photo={photo} setPhoto={setPhoto} />;

  return (
    <>
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          facing={cameraFacing}
          flash={cameraFlash}
          style={styles.camera}
          onCameraReady={() => {
            console.log('Camera is ready');
            setCameraReady(true);
          }}
          onMountError={(error) => {
            console.error('Camera mount error:', error);
          }}
        />
        <View style={styles.bottombar}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={toggleCameraFlash}
            disabled={!cameraReady}
          >
            <SymbolView
              name={cameraFlash === "on" ? "bolt.fill" : "bolt.slash.fill"}
              type="hierarchical"
              tintColor={cameraReady ? "white" : "gray"}
              size={40}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleTakePhoto}
            disabled={!cameraReady}
          >
            <SymbolView
              name="circle"
              type="hierarchical"
              tintColor={cameraReady ? "white" : "gray"}
              size={90}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={toggleCameraFacing}
            disabled={!cameraReady}
          >
            <SymbolView
              name="camera.rotate.fill"
              type="hierarchical"
              tintColor={cameraReady ? "white" : "gray"}
              size={40}
            />
          </TouchableOpacity>
        </View>
        {!cameraReady && (
          <View style={styles.overlay}>
            <Text style={styles.message}>Camera is initializing...</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: 'black',
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  message: {
    textAlign: "center",
    fontSize: 18,
    margin: 20,
    color: "white",
  },
  bottombar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    alignItems: "center",
    backgroundColor: "hsla(0, 0%, 0%, 0.5)",
    marginBottom: 10,
    flexDirection: "row",
    paddingVertical: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
