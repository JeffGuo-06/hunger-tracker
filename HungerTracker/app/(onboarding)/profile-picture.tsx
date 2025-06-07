import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, fontSizes } from "../theme";
import GradientButton from "../components/GradientButton";
import IconButton from "../components/IconButton";

export default function ProfilePicture() {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }

    console.log(!result.canceled);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required to take a photo.");
      return;
    }

    // 2. Launch the camera
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1], // square crop
      quality: 1,
    });

    // 3. If the user took a photo, save its URI
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    // Save profile picture
    router.push("./contacts-permission");
  };

  const handleSkip = () => {
    router.push("./contacts-permission");
  };

  return (
    <SafeAreaView style={styles.container}>
      <IconButton
        iosName="chevron.backward"
        androidName="arrow-back"
        containerStyle={{
          position: "absolute",
          top: spacing.xl + 25,
          left: spacing.xl,
          zIndex: 10,
        }}
        onPress={() => router.back()}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Add a profile picture</Text>
          <Text style={styles.subtitle}>Help your friends recognize you</Text>
        </View>

        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={60} color={colors.text[3]} />
              </View>
            )}
            <View style={styles.editButton}>
              <Ionicons name="camera" size={20} color={colors.text[1]} />
            </View>
          </TouchableOpacity>

          <View style={styles.photoOptions}>
            <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
              <Ionicons name="images" size={24} color={colors.acc.p1} />
              <Text style={styles.optionText}>Choose from library</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color={colors.acc.p1} />
              <Text style={styles.optionText}>Take a photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttons}>
          <GradientButton style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </GradientButton>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "space-between",
  },
  header: {
    marginTop: spacing.xl * 2,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text[1],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.medium,
    color: colors.text[2],
    lineHeight: 24,
  },
  photoSection: {
    alignItems: "center",
  },
  photoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: spacing.xl,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.bg[2],
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.acc.p1,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.bg[1],
  },
  photoOptions: {
    gap: spacing.md,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  optionText: {
    color: colors.text[1],
    fontSize: fontSizes.medium,
  },
  buttons: {
    paddingBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: fontSizes.medium,
    fontWeight: "600",
  },
  skipButton: {
    alignItems: "center",
    padding: spacing.md,
  },
  skipButtonText: {
    color: colors.text[2],
    fontSize: fontSizes.medium,
  },
});
