import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function FriendsBottomSheet({ visible, onClose }: Props) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      swipeDirection="down"
      onSwipeComplete={onClose}
      style={styles.modal}
      useNativeDriverForBackdrop
    >
      <View style={styles.container}>
        <View style={styles.handle} />
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>This is a test bottom sheet</Text>
      </View>
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
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bg[3],
    alignSelf: 'center',
    marginBottom: 8,
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
