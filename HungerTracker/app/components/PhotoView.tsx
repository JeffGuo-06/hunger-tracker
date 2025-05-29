import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text} from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { colors } from '../theme';
import CustomButton from './CustomButton';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import GradientButton from './GradientButton';
import { router } from 'expo-router';

interface PhotoViewProps {
  photo: string;
  onClose: () => void;
}

export default function PhotoView({ photo, onClose }: PhotoViewProps) {
  return (
    <Animated.View
      layout={LinearTransition}
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.container}
    >
      <Image
        source={photo}
        style={styles.image}
        contentFit="cover"
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <SymbolView
          name="xmark.circle.fill"
          type="hierarchical"
          tintColor="white"
          size={40}
        />
      </TouchableOpacity>
      
          <GradientButton 
            style={styles.button}
            onPress={() => Alert.alert("Post")}
          >
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
  buttonContainer: {
    position: 'absolute',
    bottom: 16,
    paddingHorizontal: 16,
    width: '100%',
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
