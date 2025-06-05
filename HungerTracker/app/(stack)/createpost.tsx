import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import IconButton from '../components/IconButton';
import GradientButton from '../components/GradientButton';
import { colors, spacing } from '../theme';

export default function CreatePost() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <IconButton
        iosName="chevron.backward"
        androidName="arrow-back"
        containerStyle={styles.backButton}
        onPress={() => router.back()}
      />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} />
      )}
      <GradientButton style={styles.postButton} onPress={() => {}}>
        <Text style={styles.postButtonText}>Post</Text>
      </GradientButton>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  backButton: {
    position: 'absolute',
    top: spacing.xl + 25,
    left: spacing.xl,
    zIndex: 10,
  },
  image: {
    flex: 1,
    width: '100%',
    height: undefined,
  },
  postButton: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  postButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
