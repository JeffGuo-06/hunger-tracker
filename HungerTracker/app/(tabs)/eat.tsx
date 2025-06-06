import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import CameraView from "../components/Camera";
import React from "react";
import { colors } from "../theme";
export default function Eat() {
  return (
    <SafeAreaView style={styles.container}>
      <CameraView/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
});
