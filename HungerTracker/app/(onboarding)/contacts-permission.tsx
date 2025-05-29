import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { colors, spacing, fontSizes } from '../theme';
import GradientButton from '../components/GradientButton';
import IconButton from '../components/IconButton';

export default function ContactsPermission() {
  const handleRequestPermission = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    
    if (status === 'granted') {
      router.push('./invite-friends');
    } else {
      // Permission denied, but still allow to continue
      router.push('./invite-friends');
    }
  };

  const handleSkip = () => {
    router.push('./invite-friends');
  };

  return (
    <SafeAreaView style={styles.container}>
      <IconButton
        iosName="chevron.backward"
        androidName="arrow-back"
        containerStyle={{ position: 'absolute', top: spacing.xl+25, left: spacing.xl, zIndex: 10 }}
        onPress={() => router.back()}
      />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="people" size={60} color={colors.acc.p1} />
          </View>
        </View>

        <View style={styles.textContent}>
          <Text style={styles.title}>Find your friends</Text>
          <Text style={styles.subtitle}>
            We know you have tons of friends, so we'll help you find them
          </Text>
          
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={24} color={colors.acc.p1} />
              <Text style={styles.featureText}>See which friends are already here</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={24} color={colors.acc.p1} />
              <Text style={styles.featureText}>Easily invite friends to join</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={24} color={colors.acc.p1} />
              <Text style={styles.featureText}>Your contacts stay private</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttons}>
          <GradientButton 
            style={styles.button}
            onPress={handleRequestPermission}
          >
            <Text style={styles.buttonText}>Allow Access</Text>
          </GradientButton>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Not now</Text>
          </TouchableOpacity>
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
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: spacing.xl * 3,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.bg[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
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
  features: {
    gap: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    color: colors.text[1],
    fontSize: fontSizes.medium,
    flex: 1,
  },
  buttons: {
    paddingBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  skipButtonText: {
    color: colors.text[2],
    fontSize: fontSizes.medium,
  },
}); 