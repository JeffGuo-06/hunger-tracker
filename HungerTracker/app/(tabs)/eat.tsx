import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import Camera from "../components/Camera";
import React from "react";

export default function Eat() {
  return (
    <SafeAreaView style={styles.container}>
      <Camera />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
