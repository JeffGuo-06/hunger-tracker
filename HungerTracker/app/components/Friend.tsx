import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSizes } from '../theme';
import { router } from 'expo-router';
import { MapUser } from './MapScreen';

export interface FriendData {
  id: string;
  name: string;
  avatar: any;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  subtitle: string;
}

interface Props {
  friend: FriendData;
  onPress?: () => void;
  onInvite?: () => void;
}

export default function Friend({ friend, onPress, onInvite }: Props) {
  const handleInvite = () => {
    onInvite?.();
    router.push('/(stack)/motivecreate');
  };

  const getImageSource = (source: any) => {
    if (typeof source === 'string') {
      return { uri: source };
    }
    return source; // For require() statements
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.infoRow}>
        <Image source={getImageSource(friend.avatar)} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{friend.name}</Text>
          <Text style={styles.subtitle}>{friend.subtitle}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
        <Text style={styles.inviteText}>invite to motive</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg[2],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    color: colors.text[1],
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.text[2],
    fontSize: fontSizes.small,
    marginTop: 2,
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
