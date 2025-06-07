import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { colors, spacing, fontSizes } from '../theme';
import Comment, { CommentData } from './Comment';

interface Props {
  visible: boolean;
  onClose: () => void;
  comments: CommentData[];
}

export default function CommentsBottomSheet({ visible, onClose, comments }: Props) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      swipeDirection={['up', 'down']}
      onSwipeComplete={onClose}
      style={styles.modal}
      propagateSwipe
      useNativeDriverForBackdrop
      swipeThreshold={50}
      backdropTransitionOutTiming={0}
      hideModalContentWhileAnimating
      onSwipeMove={(percentageShown) => {
        // Optional: Add any custom behavior during swipe
        console.log('Swipe percentage:', percentageShown);
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.handle} />
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
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: colors.bg[1],
    padding: spacing.md,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bg[3],
    alignSelf: 'center',
    marginBottom: spacing.md,
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
