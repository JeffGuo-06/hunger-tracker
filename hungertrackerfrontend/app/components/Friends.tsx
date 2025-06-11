import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSizes } from '../theme';
import { Ionicons } from '@expo/vector-icons';

// Example friend data - in a real app, this would come from your backend
const FRIENDS_DATA = [
  {
    id: '1',
    name: 'John Doe',
    username: '@johndoe',
    avatar: require('../../assets/images/placeholder/jeff-profile.jpg'),
    isOnline: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: '@janesmith',
    avatar: require('../../assets/images/placeholder/jeff-profile.jpg'),
    isOnline: false,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    username: '@mikej',
    avatar: require('../../assets/images/placeholder/jeff-profile.jpg'),
    isOnline: true,
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    username: '@sarahw',
    avatar: require('../../assets/images/placeholder/jeff-profile.jpg'),
    isOnline: false,
  },
];

type Friend = {
  id: string;
  name: string;
  username: string;
  avatar: any;
  isOnline: boolean;
};

const FriendItem = ({ friend }: { friend: Friend }) => (
  <TouchableOpacity style={styles.friendItem}>
    <View style={styles.avatarContainer}>
      <Image source={friend.avatar} style={styles.avatar} />
      {friend.isOnline && <View style={styles.onlineIndicator} />}
    </View>
    <View style={styles.friendInfo}>
      <Text style={styles.friendName}>{friend.name}</Text>
      <Text style={styles.friendUsername}>{friend.username}</Text>
    </View>
    <TouchableOpacity style={styles.messageButton}>
      <Ionicons name="chatbubble-outline" size={20} color={colors.text[2]} />
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function Friends() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.count}>{FRIENDS_DATA.length} friends</Text>
      </View>
      
      <FlatList
        data={FRIENDS_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FriendItem friend={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg[2],
  },
  title: {
    fontSize: fontSizes.large,
    color: colors.text[1],
    fontWeight: '600',
  },
  count: {
    fontSize: fontSizes.medium,
    color: colors.text[2],
  },
  list: {
    padding: spacing.md,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.bg[2],
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: colors.bg[1],
  },
  friendInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  friendName: {
    fontSize: fontSizes.medium,
    color: colors.text[1],
    fontWeight: '600',
  },
  friendUsername: {
    fontSize: fontSizes.small,
    color: colors.text[2],
    marginTop: 2,
  },
  messageButton: {
    padding: spacing.sm,
  },
});
