import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
  CameraPosition,
} from "react-native-vision-camera";
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";
import { colors } from "../theme";

export default function Camera() {
  const [cameraFacing, setCameraFacing] = useState<CameraPosition>("back");
  const [cameraFlash, setCameraFlash] = useState<'on' | 'off'>("off");
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(cameraFacing, cameraFacing === 'back' ? { physicalDevices: ['ultra-wide-angle-camera', 'wide-angle-camera'] } : undefined);
  const [zoom, setZoom] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isCameraMounted, setIsCameraMounted] = useState(false);
  const [toggleCooldown, setToggleCooldown] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const router = useRouter();

  const hasUltraWide = device ? device.minZoom < device.neutralZoom : false;

  useEffect(() => {
    if (device?.neutralZoom != null) {
      setZoom(device.neutralZoom);
    }
  }, [device]);

  useEffect(() => {
    if (photo) {
      router.push({
        pathname: '/(stack)/createpost',
        params: { imageUri: photo },
      });
      setPhoto(null);
    }
  }, [photo]);
  
  async function handleTakePhoto() {
    if (!cameraRef.current || !isCameraMounted || isFrozen) return;

    setIsFrozen(true);
    try {
      const response = await cameraRef.current.takePhoto({ flash: cameraFlash });
      if (response?.path) {
        setPhoto(`file://${response.path}`);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    } finally {
      setIsFrozen(false);
    }
  }

  if (!hasPermission) {
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

  function zoomIn() {
    if (!device) return;
    setZoom((z) => Math.min(z + 0.1, device.maxZoom));
  }

  function zoomOut() {
    if (!device) return;
    setZoom((z) => Math.max(z - 0.1, device.minZoom));
  }

  function toggleUltraWide() {
    if (!device || !hasUltraWide) return;
    const ultra = Math.max(device.minZoom, device.neutralZoom / 2);
    setZoom((z) => (Math.abs(z - ultra) < 0.01 ? device.neutralZoom : ultra));
  }


  return (
    <View style={styles.container}>
      {device && (
        <Camera
          key={cameraFacing}
          ref={cameraRef}
          device={device}
          isActive={!isFrozen}
          photo
          enableZoomGesture={false}
          zoom={zoom}
          torch={cameraFlash}
          style={styles.camera}
          onInitialized={() => setIsCameraMounted(true)}
        />
      )}
      {!isCameraMounted && (
        <View style={styles.loadingOverlay}>
          <Image
            source={require("../../assets/images/loading.jpg")}
            style={styles.loadingImage}
            resizeMode="cover"
          />
        </View>
      )}
      {device && (
        <View style={styles.zoomControls} pointerEvents={!isCameraMounted || isFrozen ? 'none' : 'auto'}>
          <TouchableOpacity onPress={zoomOut} style={styles.smallButton}>
            <SymbolView name="minus" type="hierarchical" tintColor="white" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleUltraWide} style={styles.zoomCircle}>
            <Text style={styles.zoomText}>{`${zoom.toFixed(1)}x`}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={zoomIn} style={styles.smallButton}>
            <SymbolView name="plus" type="hierarchical" tintColor="white" size={20} />
          </TouchableOpacity>
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
  zoomControls: {
    position: 'absolute',
    bottom: 130,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
  },
  zoomCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'hsla(0,0%,0%,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  zoomText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  smallButton: {
    padding: 10,
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
