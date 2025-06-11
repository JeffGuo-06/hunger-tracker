import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

interface Props extends React.ComponentProps<typeof TouchableOpacity> {
  style?: ViewStyle | ViewStyle[];
}

export default function GradientButton({ style, children, ...rest }: Props) {
  return (
    <LinearGradient
      colors={colors.grad.p1}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradient, style]}
    >
      <TouchableOpacity style={styles.touchable} {...rest}>
        {children}
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 12,
  },
  touchable: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
}); 