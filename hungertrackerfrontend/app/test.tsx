import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import CommentsBottomSheet from './components/CommentsBottomSheet';
import { colors } from './theme';

export default function TestBottomSheet() {
  const [visible, setVisible] = useState(false);

  const comments = [
    {
      id: '1',
      user: {
        name: 'Test User',
        profileImage: require('../assets/images/placeholder/jeff-profile.jpg'),
      },
      time: 'now',
      text: 'Example comment',
    },
  ];

  return (
    <View style={styles.container}>
      <Button title="Open Comments" onPress={() => setVisible(true)} />
      <CommentsBottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        comments={comments}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg[1],
  },
});
