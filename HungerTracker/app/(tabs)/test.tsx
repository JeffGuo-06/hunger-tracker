import React, { useRef, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { colors, spacing } from "../theme";

export default function Test() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handlePresentPress = useCallback(() => {
    console.log('Button pressed');
    bottomSheetRef.current?.present();
  }, []);

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Test Page</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handlePresentPress}
        >
          <Text style={styles.buttonText}>Open Bottom Sheet</Text>
        </TouchableOpacity>

        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={['25%', '50%']}
          index={0}
          style={styles.bottomSheet}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Test Content</Text>
          </View>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: colors.text[1],
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.acc.p1,
    padding: spacing.md,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.text[1],
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSheet: {
    backgroundColor: colors.bg[1],
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 