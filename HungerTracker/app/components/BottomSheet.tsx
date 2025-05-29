import React, { useCallback, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { colors, spacing } from '../theme';

export default function BottomSheetExample() {
  console.log('Rendering BottomSheetExample');
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  // Memoize snap points
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  const handlePresentPress = useCallback(() => {
    console.log('Button pressed');
    try {
      if (bottomSheetRef.current) {
        console.log('Snapping to index 0...');
        bottomSheetRef.current.snapToIndex(0);
      } else {
        console.error('Bottom sheet ref is null');
      }
    } catch (error) {
      console.error('Error presenting bottom sheet:', error);
    }
  }, []);

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={handlePresentPress}
      >
        <Text style={styles.buttonText}>Open Bottom Sheet</Text>
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onChange={(index) => console.log('Sheet index changed:', index)}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>This is a Bottom Sheet</Text>
          <Text style={styles.subtitle}>You can drag it up and down</Text>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.bg[1],
  },
  button: {
   background: colors.grad[1],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  buttonText: {
    color: colors.text[1],
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text[1],
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text[2],
  },
});
