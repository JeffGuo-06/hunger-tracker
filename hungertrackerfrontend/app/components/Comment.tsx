import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSizes } from '../theme';

export type CommentData = {
  id: string;
  user: { name: string; profileImage: any };
  time: string;
  text: string;
};

type CommentProps = {
  comment: CommentData;
  onReply?: () => void;
};

export default function Comment({ comment, onReply }: CommentProps) {
  return (
    <View style={styles.container}>
      <Image source={comment.user.profileImage} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>{comment.user.name}</Text>
          <Text style={styles.time}>{comment.time}</Text>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
        {onReply && (
          <TouchableOpacity onPress={onReply} style={styles.replyButton}>
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: colors.text[1],
    fontWeight: '600',
    marginRight: spacing.sm,
    fontSize: fontSizes.medium,
  },
  time: {
    color: colors.text[2],
    fontSize: fontSizes.small,
  },
  text: {
    color: colors.text[1],
    marginTop: 2,
    fontSize: fontSizes.medium,
  },
  replyButton: {
    marginTop: spacing.xs,
  },
  replyText: {
    color: colors.acc.p1,
    fontSize: fontSizes.small,
  },
});
