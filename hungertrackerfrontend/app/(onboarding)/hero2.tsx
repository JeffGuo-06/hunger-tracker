import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, fontSizes } from '../theme';
import GradientButton from '../components/GradientButton';
import { Ionicons } from '@expo/vector-icons';
import IconButton from '../components/IconButton';

export default function Hero2() {
  return (
    <SafeAreaView style={styles.container}>
      <IconButton
        iosName="chevron.backward"
        androidName="arrow-back"
        containerStyle={{ position: 'absolute', top: spacing.xl+25, left: spacing.xl, zIndex: 10 }}
        onPress={() => router.back()}
      />
      <View style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.heroImagePlaceholder}>
            <Ionicons name="location-outline" size={200} color={colors.acc.p1} />
          </View>
        </View>
        
        <View style={styles.bottomSection}>
          <Text style={styles.title}>See where your friends are eating</Text>
          <Text style={styles.subtitle}>
            Get real-time updates on the hottest spots your crew is hitting up right now
          </Text>
          
          {/* <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
          </View> */}
          
          <GradientButton 
            style={styles.button}
            onPress={() => router.push('./hero3')}
          >
            <Text style={styles.buttonText}>Next</Text>
          </GradientButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  heroImagePlaceholder: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text[1],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSizes.medium,
    color: colors.text[2],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text[3],
  },
  activeDot: {
    backgroundColor: colors.acc.p1,
    width: 24,
  },
  button: {
    marginTop: spacing.md,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
}); 