import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Post"
          handlePress={() => {
            Alert.alert("Post");
          }}
          containerStyles="bg-acc-p1 rounded-xl min-h-[56px]"
          textStyles="text-white font-psemibold text-lg"
          isLoading={false}
        />
      </View>
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
});
