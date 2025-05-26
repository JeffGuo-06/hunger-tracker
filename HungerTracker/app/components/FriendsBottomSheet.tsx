import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { colors } from '../theme';

type FriendsBottomSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
};

export default function FriendsBottomSheet({ bottomSheetRef }: FriendsBottomSheetProps) {
  const snapPoints = useMemo(() => ['50%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>This is a test bottom sheet</Text>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: colors.bg[1],
  },
  handleIndicator: {
    backgroundColor: colors.bg[3],
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: colors.text[1],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text[2],
  },
});
