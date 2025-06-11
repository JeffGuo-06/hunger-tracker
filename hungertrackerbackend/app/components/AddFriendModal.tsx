import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../theme';
import { auth } from '../services/api';

interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
  onFriendAdded: () => void;
}

export default function AddFriendModal({ visible, onClose, onFriendAdded }: AddFriendModalProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    setLoading(true);
    try {
      await auth.sendFriendRequest(username);
      Alert.alert('Success', 'Friend request sent successfully');
      setUsername('');
      onFriendAdded();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add Friend</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor={colors.text[2]}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAddFriend}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text[1]} size="small" />
              ) : (
                <Text style={styles.buttonText}>Add Friend</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.bg[1],
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    color: colors.text[1],
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.bg[2],
    borderRadius: 8,
    padding: 12,
    color: colors.text[1],
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.bg[2],
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.text[1],
    fontSize: 16,
    fontWeight: '500',
  },
}); 