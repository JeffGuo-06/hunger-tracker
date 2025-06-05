import React from 'react';
import { StyleSheet, Text, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from '../components/IconButton';
import GradientButton from '../components/GradientButton';
import { colors, spacing } from '../theme';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function CreatePost() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const router = useRouter();

  return (
    <Animated.View
      layout={LinearTransition}
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.wrapper}
    >
      <SafeAreaView style={styles.container}>
        <IconButton
          iosName="chevron.backward"
          androidName="arrow-back"
          onPress={() => router.back()}
          containerStyle={styles.backButton}
        />
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
          />
        )}
        <GradientButton style={styles.postButton} onPress={() => Alert.alert('Post')}>
          <Text style={styles.postButtonText}>Post</Text>
        </GradientButton>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xl,
    zIndex: 10,
  },
  image: {
    flex: 1,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 12,
    marginTop: spacing.xl * 2,
    marginBottom: spacing.xl * 3,
  },
  postButton: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  postButtonText: {
    color: colors.text[1],
    fontSize: 18,
    fontWeight: '600',
  },
});
