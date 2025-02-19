import {
  CameraView,
  CameraType,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SymbolView, SymbolViewProps, SFSymbol } from "expo-symbols";
import PhotoView from "../components/PhotoView";
import IconButton from "../components/IconButton";
export default function Camera() {
  const [cameraFacing, setCameraFacing] = useState<CameraType>("back");
  const [cameraFlash, setCameraFlash] = useState<FlashMode>("off");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = React.useState<string>(
    "https://picsum.photos/seed/696/3000/2000"
  );
  const cameraRef = React.useRef<CameraView>(null);

  async function handleTakePhoto() {
    const response = await cameraRef.current?.takePictureAsync({});
    setPhoto(response!.uri);
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
        >
          <View style={styles.bottombar}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFlash}>
              <SymbolView
                name={cameraFlash === "on" ? "bolt.fill" : "bolt.slash.fill"}
                type="hierarchical"
                tintColor="white"
                size={40}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
              <SymbolView
                name="circle"
                type="hierarchical"
                tintColor="white"
                size={90}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={toggleCameraFacing}
            >
              <SymbolView
                name="camera.rotate.fill"
                type="hierarchical"
                tintColor="white"
                size={40}
              />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  bottombar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
    backgroundColor: "hsla(0, 0%, 0%, 0.5)",
    marginBottom: 10,
    flexDirection: "row",
  },
});
