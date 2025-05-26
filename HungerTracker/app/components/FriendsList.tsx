import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme';
import { auth, users } from '../services/api';

interface Friend {
  id: number;
  sender: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  receiver: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export default function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      const profile = await users.getProfile();
      setCurrentUser(profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await auth.getFriends();
      // Filter to only show accepted friendships
      const acceptedFriends = response.data.filter((friend: Friend) => friend.status === 'accepted');
      setFriends(acceptedFriends);
      setError(null);
    } catch (err) {
      setError('Failed to load friends');
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchFriends();
  }, []);

  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await auth.acceptFriendRequest(friendshipId);
      fetchFriends(); // Refresh the list
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  const handleRejectRequest = async (friendshipId: number) => {
    try {
      await auth.rejectFriendRequest(friendshipId);
      fetchFriends(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting friend request:', err);
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const isPending = item.status === 'pending';
    const isReceiver = item.receiver.id === currentUser?.user?.id;
    const friend = isReceiver ? item.sender : item.receiver;

    return (
      <View style={styles.friendItem}>
        <View style={styles.friendInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.friendName}>
              {friend.first_name} {friend.last_name}
            </Text>
            <Text style={styles.friendUsername}>
              @{friend.username}
            </Text>
          </View>
        </View>
        {isPending && isReceiver && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptRequest(item.id)}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectRequest(item.id)}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        {isPending && !isReceiver && (
          <Text style={styles.pendingText}>Request Sent</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={friends}
      renderItem={renderFriendItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No friends yet. Add some friends to get started!</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  friendItem: {
    backgroundColor: colors.bg[1],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'column',
  },
  friendName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  friendUsername: {
    color: colors.text[2],
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.text[1],
    fontSize: 14,
    fontWeight: '500',
  },
  pendingText: {
    color: colors.text[2],
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
  emptyText: {
    color: colors.text[2],
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
}); 