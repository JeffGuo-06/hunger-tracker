import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { auth } from '../services/api';

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

interface FriendData {
  id: string;
  name: string;
}

export default function MotiveCreate() {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setFriendsLoading(true);
      const friendsResponse = await auth.getFriends();
      const acceptedFriends = friendsResponse.data.filter((f: Friend) => f.status === 'accepted');

      // Get current user ID to determine which friend is which
      const currentUserProfile = await auth.getProfile();
      const currentUserId = currentUserProfile.user.id;

      const friendsList: FriendData[] = acceptedFriends.map((friendship: Friend) => {
        const friend = friendship.sender.id === currentUserId ? friendship.receiver : friendship.sender;
        return {
          id: friend.id.toString(),
          name: `${friend.first_name} ${friend.last_name}`,
        };
      });

      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleBeginMotive = () => {
    // Handle motive creation logic here
    console.log('Creating motive with:', {
      time: selectedTime,
      selectedFriends,
    });

    // For now, just go back
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text[1]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create a new Motive</Text>
        <View style={styles.backButton} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color={colors.text[1]} />
            <Text style={styles.sectionTitle}>Place</Text>
          </View>
          <View style={styles.placeBox}>
            <Text style={styles.placeholderText}>Select a location</Text>
          </View>
        </View>

        {/* Time Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={24} color={colors.text[1]} />
            <Text style={styles.sectionTitle}>Time</Text>
          </View>
          <View style={styles.timeContainer}>
            <TouchableOpacity
              style={styles.timeSelector}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeText}>
                {formatTime(selectedTime)}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.text[1]} />
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                style={styles.timePicker}
              />
            )}
            <Text style={styles.timeHint}>
              Select when you want to meet
            </Text>
          </View>
        </View>

        {/* Friends Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={24} color={colors.text[1]} />
            <Text style={styles.sectionTitle}>Invite Friends</Text>
          </View>
          {friendsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.acc.p1} />
              <Text style={styles.loadingText}>Loading friends...</Text>
            </View>
          ) : (
            <ScrollView style={styles.friendsList}>
              {friends.length === 0 ? (
                <Text style={styles.noFriendsText}>No friends to invite yet</Text>
              ) : (
                friends.map(friend => (
                  <TouchableOpacity
                    key={friend.id}
                    style={[
                      styles.friendItem,
                      selectedFriends.includes(friend.id) && styles.selectedFriend
                    ]}
                    onPress={() => toggleFriendSelection(friend.id)}
                  >
                    <Text style={styles.friendName}>{friend.name}</Text>
                    {selectedFriends.includes(friend.id) && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.acc.p1} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Begin Motive Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.beginButton}
          onPress={handleBeginMotive}
        >
          <Text style={styles.beginButtonText}>Begin Motive</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  header: {
    backgroundColor: colors.bg[1],
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text[1],
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text[1],
    marginLeft: spacing.sm,
  },
  placeBox: {
    height: 100,
    backgroundColor: colors.bg[2],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.text[2],
    fontSize: 16,
  },
  timeContainer: {
    backgroundColor: colors.bg[2],
    borderRadius: 12,
    padding: spacing.md,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg[1],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  timeText: {
    color: colors.text[1],
    fontSize: 18,
    fontWeight: '600',
  },
  timePicker: {
    backgroundColor: colors.bg[1],
    borderRadius: 8,
  },
  timeHint: {
    color: colors.text[2],
    fontSize: 14,
    textAlign: 'center',
  },
  friendsList: {
    maxHeight: 200,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg[2],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  selectedFriend: {
    backgroundColor: colors.acc.p1 + '20',
    borderWidth: 2,
    borderColor: colors.acc.p1,
  },
  friendName: {
    color: colors.text[1],
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.text[2],
    fontSize: 16,
    marginTop: spacing.sm,
  },
  noFriendsText: {
    color: colors.text[2],
    fontSize: 16,
    textAlign: 'center',
    padding: spacing.xl,
  },
  buttonContainer: {
    padding: spacing.md,
    backgroundColor: colors.bg[1],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  beginButton: {
    backgroundColor: colors.acc.p1,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  beginButtonText: {
    color: colors.text[1],
    fontSize: 18,
    fontWeight: 'bold',
  },
});
