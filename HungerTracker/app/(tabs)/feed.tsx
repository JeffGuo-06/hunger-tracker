import { View, StyleSheet, Alert, FlatList, ActivityIndicator, Text } from "react-native";
import { colors } from "../theme";
import Post from "../components/Post";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { posts } from "../services/api";

interface PostData {
  id: string;
  user: {
    name: string;
    profileImage: string;
  };
  image: string;
  caption: string;
  created_at: string;
  comments_count: number;
}

export default function Feed() {
  const [feedPosts, setFeedPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await posts.getAll();
      setFeedPosts(response);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostPress = (post: PostData) => {
    Alert.alert('Post Details', `Comments: ${post.comments_count}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.acc.p1} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={feedPosts}
        renderItem={({ item }) => (
          <Post post={item} />
        )}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchPosts}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[2],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.acc.p1,
    fontSize: 16,
    textAlign: 'center',
  },
});