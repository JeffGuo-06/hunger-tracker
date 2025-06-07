import React, { useCallback, useMemo, MutableRefObject } from 'react';
import { Text, StyleSheet, FlatList } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetMethods } from '@gorhom/bottom-sheet';
import { colors, spacing, fontSizes } from '../theme';
import Friend, { FriendData } from './Friend';

interface Props {
  bottomSheetRef: MutableRefObject<BottomSheetMethods | null>;
  friends: FriendData[];
  onFriendPress: (friend: FriendData) => void;
  onChange?: (index: number) => void;
}

export default function FriendsBottomSheet({ bottomSheetRef, friends, onFriendPress, onChange }: Props) {
  const snapPoints = useMemo(() => ['10%', '60%', '90%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    onChange?.(index);
  }, [onChange]);


  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={false}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}
      bottomInset={0}
      style={styles.sheet}
    >
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>Friends</Text>
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Friend
              friend={item}
              onPress={() => onFriendPress(item)}
              onInvite={() => bottomSheetRef.current?.snapToIndex(0)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetView>
    </BottomSheet>
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
  sheet: {
    zIndex: 1002,
    elevation: 1002,
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
