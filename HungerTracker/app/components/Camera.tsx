import React, { useState, useEffect, useRef } from "react";
import {
  Camera as VisionCamera,
  useCameraPermission,
  useCameraDevice,
  CameraPosition,
} from "react-native-vision-camera";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";
import { colors } from "../theme";

export default function Camera() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraFacing, setCameraFacing] = useState<CameraPosition>("back");
  const [cameraFlash, setCameraFlash] = useState<"on" | "off">("off");
  const [isCameraMounted, setIsCameraMounted] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [toggleCooldown, setToggleCooldown] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [displayZoom, setDisplayZoom] = useState(0.5);
  const [isUltraWide, setIsUltraWide] = useState(false);
  const baseZoom = useSharedValue(1);
  const cameraRef = useRef<VisionCamera>(null);
  const router = useRouter();

  const cameraDevice = useCameraDevice(
    cameraFacing,
    cameraFacing === "back"
      ? { physicalDevices: ["ultra-wide-angle-camera", "wide-angle-camera"] }
      : undefined,
  );

  const minZoom = isUltraWide ? 0.5 : 1;
  const maxZoom = 6;

  function updateDisplayZoom() {
    if (zoom <= 1) {
      setDisplayZoom(0.5);
    } else if (zoom >= 6) {
      setDisplayZoom(5);
    } else if (zoom <= 2) {
      // Linear interpolation between (1, 0.5) and (2, 1)
      setDisplayZoom(0.5 + (zoom - 1) * 0.5);
    } else {
      // Linear interpolation between (2, 1) and (6, 5)
      setDisplayZoom(1 + (zoom - 2));
    }
    console.log('Display Zoom:', displayZoom);
  }

  // Reset zoom when camera changes
  useEffect(() => {
    setZoom(1);
    baseZoom.value = 1;
    setIsUltraWide(false);
    updateDisplayZoom();
  }, [cameraFacing]);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      baseZoom.value = zoom;
    })
    .onUpdate((e) => {
      // Reduce sensitivity by using a smaller scale factor
      const sensitivityFactor = 0.5;
      const scaleFactor = 1 + (e.scale - 1) * sensitivityFactor;
      const targetZoom = zoom * scaleFactor;
      const zoomDelta = targetZoom - zoom;
      
      let newZoom;
      if (targetZoom > maxZoom) {
        const remainingZoom = maxZoom - zoom;
        newZoom = zoom + remainingZoom;
      } else if (targetZoom < minZoom) {
        const remainingZoom = minZoom - zoom;
        newZoom = zoom + remainingZoom;
      } else {
        newZoom = targetZoom;
      }
      
      // Handle camera switching at zoom level 1.0
      if (newZoom <= 1 && isUltraWide) {
        if (newZoom >= 0.5) {
          // Allow zooming between 0.5 and 1.0 in ultrawide mode
          runOnJS(setZoom)(newZoom);
          runOnJS(updateDisplayZoom)();
        } else {
          // Switch to normal wide angle when zooming below 0.5
          runOnJS(setIsUltraWide)(false);
          runOnJS(setZoom)(1);
          runOnJS(updateDisplayZoom)();
        }
      } else if (newZoom >= 1 && !isUltraWide) {
        runOnJS(setIsUltraWide)(true);
        runOnJS(setZoom)(0.5);
        runOnJS(updateDisplayZoom)();
      } else if ((newZoom > minZoom && newZoom < maxZoom) || 
          (newZoom === minZoom && zoomDelta < 0) || 
          (newZoom === maxZoom && zoomDelta > 0)) {
        runOnJS(setZoom)(newZoom);
        runOnJS(updateDisplayZoom)();
      }
    });

  const hasUltraWide = cameraDevice ? cameraDevice.minZoom < 1 : false;

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

  async function toggleCameraFacing() {
    if (isFrozen || toggleCooldown) return;
    
    setToggleCooldown(true);
    setIsFrozen(true);
    setIsCameraMounted(false);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setCameraFacing((current) => (current === "back" ? "front" : "back"));
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setIsFrozen(false);
    setToggleCooldown(false);
  }

  function toggleCameraFlash() {
    setCameraFlash((current) => (current === "off" ? "on" : "off"));
    console.log('Display Zoom:', displayZoom);
  }

  function zoomIn() { 
    if (zoom >= 1 && !isUltraWide) {
      setIsUltraWide(true);
      setZoom(0.5);
      updateDisplayZoom();
    } else {
      const newZoom = Math.min(zoom + 0.1, maxZoom);
      setZoom(newZoom);
      updateDisplayZoom();
    }
  }

  function zoomOut() {
    if (zoom <= 0.5 && isUltraWide) {
      setIsUltraWide(false);
      setZoom(1);
      updateDisplayZoom();
    } else {
      const newZoom = Math.max(zoom - 0.1, minZoom);
      setZoom(newZoom);
      updateDisplayZoom();
    }
  }

  function toggleUltraWide() {
    if (!cameraDevice) return;
    
    if (isUltraWide) {
      setZoom(1.049);
      setIsUltraWide(false);
      updateDisplayZoom();
    } else {
      setZoom(0.5);
      setIsUltraWide(true);
      updateDisplayZoom();
    }
  }

  function toggleZoom() {
    if (isUltraWide) {
      setZoom(2);
      setIsUltraWide(false);
      setDisplayZoom(1);
    } else {
      setZoom(1);
      setIsUltraWide(true);
      setDisplayZoom(0.5);
    }
  }

  return (
    <View style={styles.container}>
      {cameraDevice && (
        <GestureDetector gesture={pinchGesture}>
          <VisionCamera
            key={cameraFacing}
            ref={cameraRef}
            device={cameraDevice}
            isActive={!isFrozen}
            photo
            zoom={zoom}
            torch={cameraFlash}
            style={styles.camera}
            onInitialized={() => setIsCameraMounted(true)}
          />
        </GestureDetector>
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
      {cameraDevice && (
        <View style={styles.zoomControls} pointerEvents={!isCameraMounted || isFrozen ? 'none' : 'auto'}>
          <TouchableOpacity onPress={toggleZoom} style={styles.zoomCircle}>
            <Text style={styles.zoomText}>
              {`${displayZoom.toFixed(1)}x`}
            </Text>
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
