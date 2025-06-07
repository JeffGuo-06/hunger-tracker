import React from "react";
import { View, StyleSheet, Text } from "react-native";
import BottomSheetExample from './BottomSheet';
import { colors } from "../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Test() {
  console.log('Rendering Test page');
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.debugText}>Test Page Loaded</Text>
        <BottomSheetExample />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  debugText: {
    color: colors.text[1],
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  }
}); 