import React from 'react';
import { StyleSheet, TouchableOpacity, Alert, Text } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import GradientButton from '../components/GradientButton';
import { colors } from '../theme';
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
      style={styles.container}
    >
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
      )}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <SymbolView
          name="xmark.circle.fill"
          type="hierarchical"
          tintColor="white"
          size={40}
        />
      </TouchableOpacity>
      <GradientButton style={styles.button} onPress={() => Alert.alert('Post')}>
        <Text style={styles.buttonText}>Post</Text>
      </GradientButton>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  button: {
    position: 'absolute',
    bottom: 16,
    paddingHorizontal: 16,
    width: '90%',
    alignSelf: 'center',
  },
  buttonText: {
    color: colors.text[1],
    fontSize: 16,
    fontWeight: 'bold',
  },
});
