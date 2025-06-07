import React, { useCallback, useMemo, MutableRefObject } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { colors, spacing, fontSizes } from '../theme';
import Friend, { FriendData } from './Friend';

interface Props {
  bottomSheetRef: MutableRefObject<BottomSheetModal | null>;
  friends: FriendData[];
  onFriendPress: (friend: FriendData) => void;
  onChange?: (index: number) => void;
}

export default function FriendsBottomSheet({ bottomSheetRef, friends, onFriendPress, onChange }: Props) {
  const snapPoints = useMemo(() => ['25%', '60%', '90%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    onChange?.(index);
  }, [onChange]);

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
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}
    >
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>Friends</Text>
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Friend friend={item} onPress={() => onFriendPress(item)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  background: {
    backgroundColor: colors.bg[1],
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.bg[3],
    borderRadius: 2,
  },
  title: {
    fontSize: fontSizes.large,
    color: colors.text[1],
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
