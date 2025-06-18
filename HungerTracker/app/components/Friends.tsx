import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSizes } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';

const API_URL = 'http://18.219.233.137';

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

interface Props {
  friends: Friend[];
  currentUser: any;
  onRefresh?: () => void;
}

export default function Friends({ friends, currentUser, onRefresh }: Props) {
  const renderFriendItem = ({ item }: { item: Friend }) => {
    // Determine which user is the friend (not the current user)
    const isCurrentUserSender = item.sender.id === currentUser?.user?.id;
    const friend = isCurrentUserSender ? item.receiver : item.sender;

    const handleViewProfile = () => {
      router.push({
        pathname: '/(stack)/viewprofile',
        params: { userId: friend.id }
      });
    };

    // The friends API doesn't return profile images directly
    // For now, we'll use the default image. To get real profile images,
    // we would need to fetch each friend's profile separately or
    // modify the backend to include profile images in the friends response
    const getProfileImageSource = () => {
      return require('../../assets/images/muckd-icon-prototype1.png');
    };

    return (
      <TouchableOpacity style={styles.friendItem} onPress={handleViewProfile}>
        <View style={styles.friendInfo}>
          <Image
            source={getProfileImageSource()}
            style={styles.profileImage}
            contentFit="cover"
          />
          <View style={styles.nameContainer}>
            <Text style={styles.friendName}>
              {friend.first_name} {friend.last_name}
            </Text>
            <Text style={styles.friendUsername}>
              @{friend.username}
            </Text>
          </View>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => {
              router.push('/(stack)/motivecreate');
            }}
          >
            <Text style={styles.inviteText}>Invite</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={friends}
      renderItem={renderFriendItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.md,
  },
  friendItem: {
    backgroundColor: colors.bg[2],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  nameContainer: {
    flex: 1,
  },
  friendName: {
    color: colors.text[1],
    fontSize: fontSizes.medium,
    fontWeight: '600',
    marginBottom: 4,
  },
  friendUsername: {
    color: colors.text[2],
    fontSize: fontSizes.small,
  },
  actionContainer: {
    marginLeft: spacing.sm,
  },
  inviteButton: {
    backgroundColor: colors.acc.p1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  inviteText: {
    color: colors.text[1],
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
});
