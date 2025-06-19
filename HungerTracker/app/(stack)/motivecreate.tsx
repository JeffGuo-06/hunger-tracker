import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import GradientButton from '../components/GradientButton';

export default function MotiveCreate() {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const router = useRouter();

  // Mock friends data - replace with actual data later
  const friends = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
    { id: '4', name: 'Sarah Williams' },
    { id: '5', name: 'David Brown' },
  ];

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
        <Text style={styles.headerTitle}>What's the motive?</Text>
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
            <Text style={styles.placeholderText}>Where's the function?
            </Text>
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
          <View style={styles.friendsList}>
            {friends.map(friend => (
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
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Begin Motive Button */}
      <View style={styles.buttonContainer}>
          <GradientButton 
            style={styles.beginButton}
            onPress={handleBeginMotive}
          >
          <Text style={styles.beginButtonText}>Begin Motive</Text>
        </GradientButton>
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
    backgroundColor: colors.bg[1],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.text[2],
    fontSize: 16,
  },
  timeContainer: {
    gap: spacing.sm,
  },
  timeSelector: {
    backgroundColor: colors.bg[1],
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 18,
    color: colors.text[1],
    fontWeight: '500',
  },
  timeHint: {
    fontSize: 14,
    color: colors.text[2],
    marginTop: spacing.xs,
  },
  timePicker: {
    backgroundColor: colors.bg[1],
    height: 200,
  },
  friendsList: {
    maxHeight: 200,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg[1],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedFriend: {
    borderColor: colors.acc.p1,
  },
  friendName: {
    fontSize: 16,
    color: colors.text[1],
  },
  buttonContainer: {
    padding: spacing.md,
    backgroundColor: colors.bg[1],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  beginButton: {
    padding: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
  },
  beginButtonText: {
    color: colors.text[1],
    fontSize: 18,
    fontWeight: '600',
  },
});
