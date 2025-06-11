import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const SPACING = 2;
const ITEM_WIDTH = (SCREEN_WIDTH - (NUM_COLUMNS - 1) * SPACING) / NUM_COLUMNS;

interface Post {
  id: string;
  imageUrl: string;
  comments?: number;
}

interface PhotoBoardProps {
  posts: Post[];
  onPhotoPress?: (post: Post) => void;
}

export default function PhotoBoard({ posts, onPhotoPress }: PhotoBoardProps) {
  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => onPhotoPress?.(item)}
      activeOpacity={0.9}
    >
      <Image
        source={item.imageUrl}
        style={styles.photo}
        contentFit="cover"
        transition={200}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {posts.map((post) => (
        <View key={post.id} style={styles.photoWrapper}>
          {renderItem({ item: post })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    
  },
  photoWrapper: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    padding: SPACING / 2,
  },
  photoContainer: {
    flex: 1,
    backgroundColor: colors.bg[2],
    borderRadius: 4,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
}); 