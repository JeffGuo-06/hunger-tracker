import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { colors, spacing, fontSizes } from '../theme';
import Comment, { CommentData } from './Comment';

interface Props {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  comments: CommentData[];
}

export default function CommentsBottomSheet({ bottomSheetRef, comments }: Props) {
  const snapPoints = useMemo(() => ['50%', '75%'], []);

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
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.contentContainer}
      >
        <Text style={styles.countText}>{comments.length} comments</Text>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Comment comment={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment"
            placeholderTextColor={colors.text[2]}
          />
        </View>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.bg[1],
  },
  handleIndicator: {
    backgroundColor: colors.bg[3],
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: spacing.md,
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
