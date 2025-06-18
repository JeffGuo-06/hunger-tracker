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

export default function FriendRequests() {
  const [incomingRequests, setIncomingRequests] = useState<Friend[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Friend[]>([]);
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

  const fetchRequests = async () => {
    try {
      const response = await auth.getFriends();
      const pendingRequests = response.data.filter((friend: Friend) => friend.status === 'pending');
      
      // Split requests into incoming and outgoing
      const incoming = pendingRequests.filter((friend: Friend) => 
        friend.receiver.id === currentUser?.user?.id
      );
      const outgoing = pendingRequests.filter((friend: Friend) => 
        friend.sender.id === currentUser?.user?.id
      );

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      setError(null);
    } catch (err) {
      setError('Failed to load friend requests');
      console.error('Error fetching friend requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, [currentUser]);

  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await auth.acceptFriendRequest(friendshipId);
      fetchRequests(); // Refresh the list
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  const handleRejectRequest = async (friendshipId: number) => {
    try {
      await auth.rejectFriendRequest(friendshipId);
      fetchRequests(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting friend request:', err);
    }
  };

  const renderIncomingRequest = ({ item }: { item: Friend }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>
          {item.sender.first_name} {item.sender.last_name}
        </Text>
        <Text style={styles.requestUsername}>
          @{item.sender.username}
        </Text>
      </View>
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
    </View>
  );

  const renderOutgoingRequest = ({ item }: { item: Friend }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>
          {item.receiver.first_name} {item.receiver.last_name}
        </Text>
        <Text style={styles.requestUsername}>
          @{item.receiver.username}
        </Text>
      </View>
      <Text style={styles.pendingText}>Request Sent</Text>
    </View>
  );

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

  const allRequestsEmpty = incomingRequests.length === 0 && outgoingRequests.length === 0;

  return (
    <FlatList
      data={[
        { type: 'incoming', data: incomingRequests },
        { type: 'outgoing', data: outgoingRequests }
      ]}
      renderItem={({ item }) => (
        <View style={styles.section}>
          {item.type === 'incoming' && item.data.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Incoming Requests</Text>
              {item.data.map((request) => (
                <View key={request.id}>
                  {renderIncomingRequest({ item: request })}
                </View>
              ))}
            </>
          )}
          {item.type === 'outgoing' && item.data.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Outgoing Requests</Text>
              {item.data.map((request) => (
                <View key={request.id}>
                  {renderOutgoingRequest({ item: request })}
                </View>
              ))}
            </>
          )}
        </View>
      )}
      keyExtractor={(item) => item.type}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        allRequestsEmpty ? (
          <Text style={styles.emptyText}>No pending friend requests</Text>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text[1],
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  requestItem: {
    backgroundColor: colors.bg[1],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    color: colors.text[1],
    fontSize: 16,
    fontWeight: '600',
  },
  requestUsername: {
    color: colors.text[2],
    fontSize: 14,
    marginTop: 2,
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