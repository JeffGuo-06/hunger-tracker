import { View, StyleSheet, Alert, FlatList } from "react-native";
import { colors } from "../theme";
import Post from "../components/Post";
import CommentsBottomSheet from "../components/CommentsBottomSheet";
import { CommentData } from "../components/Comment";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";

// Example posts data
const EXAMPLE_POSTS = [
  {
    id: '1',
    user: { name: 'Jeff Guo', profileImage: require('../../assets/images/placeholder/jeff-profile.jpg') },
    subtitle: 'Muckd 2 hours ago',
    imageUrl: require('../../assets/images/placeholder/food1.png'),
    comments: 5,
  },
  {
    id: '2',
    user: { name: 'Jane Smith', profileImage: 'https://via.placeholder.com/150' },
    subtitle: 'Lunch time!',
    imageUrl: require('../../assets/images/placeholder/food2.png'),
    comments: 3,
  },
  {
    id: '3',
    user: { name: 'Mike Johnson', profileImage: 'https://via.placeholder.com/150' },
    subtitle: 'Dinner is served',
    imageUrl: require('../../assets/images/placeholder/food3.png'),
    comments: 2,
  },
  {
    id: '4',
    user: { name: 'Sarah Wilson', profileImage: 'https://via.placeholder.com/150' },
    subtitle: 'Midnight snack',
    imageUrl: require('../../assets/images/placeholder/food1.png'),
    comments: 4,
  },
  {
    id: '5',
    user: { name: 'Tom Brown', profileImage: 'https://via.placeholder.com/150' },
    subtitle: 'Brunch time',
    imageUrl: require('../../assets/images/placeholder/food2.png'),
    comments: 1,
  },
  {
    id: '6',
    user: { name: 'Lisa Davis', profileImage: 'https://via.placeholder.com/150' },
    subtitle: 'Afternoon tea',
    imageUrl: require('../../assets/images/placeholder/food3.png'),
    comments: 3,
  },
];

const EXAMPLE_COMMENTS: CommentData[] = [
  {
    id: '1',
    user: { name: 'Jeff Guo', profileImage: require('../../assets/images/placeholder/jeff-profile.jpg') },
    time: '2h',
    text: 'Looks delicious!'
  },
  {
    id: '2',
    user: { name: 'Jane Smith', profileImage: require('../../assets/images/placeholder/jeff-profile.jpg') },
    time: '1h',
    text: "Can't wait to try this."
  }
];

export default function Feed() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [comments] = useState<CommentData[]>(EXAMPLE_COMMENTS);

  const openComments = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={EXAMPLE_POSTS}
        renderItem={({ item }) => (
          <Post post={item} onCommentsPress={openComments} />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
      <CommentsBottomSheet bottomSheetRef={bottomSheetRef} comments={comments} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],  
  },
});