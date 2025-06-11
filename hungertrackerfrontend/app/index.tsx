import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors } from './theme';

export default function Index() {
  useEffect(() => {
    // Redirect to onboarding on mount
    router.replace("/(onboarding)/hero1");
  }, []);

  return (
    <View style={styles.container}>
      {/* Empty view while redirecting */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
}); 