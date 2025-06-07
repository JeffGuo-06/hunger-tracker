import React, { useCallback, useMemo, MutableRefObject } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { colors, spacing, fontSizes } from '../theme';
import Comment, { CommentData } from './Comment';

interface Props {
  bottomSheetRef: MutableRefObject<BottomSheetModal>;
  comments: CommentData[];
}

export default function CommentsBottomSheet({ bottomSheetRef, comments }: Props) {
  // Variables
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  // Callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

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
        <Text style={styles.countText}>{comments.length} comments</Text>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Comment comment={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          bounces={false}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment"
            placeholderTextColor={colors.text[2]}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
    padding: spacing.md,
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
  countText: {
    fontSize: fontSizes.large,
    color: colors.text[1],
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  inputRow: {
    borderTopWidth: 1,
    borderTopColor: colors.bg[2],
    paddingTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.bg[2],
    color: colors.text[1],
    padding: spacing.sm,
    borderRadius: 12,
  },
});
