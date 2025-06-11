import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { colors, spacing } from '../theme';

export default function BottomSheetExample() {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
        <Text style={styles.buttonText}>Open Bottom Sheet</Text>
      </TouchableOpacity>

      <Modal
        isVisible={visible}
        onBackdropPress={() => setVisible(false)}
        swipeDirection="down"
        onSwipeComplete={() => setVisible(false)}
        style={styles.modal}
        useNativeDriverForBackdrop
      >
        <View style={styles.contentContainer}>
          <View style={styles.handle} />
          <Text style={styles.title}>This is a Bottom Sheet</Text>
          <Text style={styles.subtitle}>You can drag it up and down</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.bg[1],
  },
  button: {
    backgroundColor: colors.grad[1],
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
    backgroundColor: colors.bg[1],
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bg[3],
    alignSelf: 'center',
    marginBottom: spacing.md,
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
