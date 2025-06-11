import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../theme';
import GradientButton from '../components/GradientButton';
import IconButton from '../components/IconButton';

export default function Name() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const validateName = (name: string) => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const handleContinue = () => {
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    router.push('./username');
  };

  return (
    <SafeAreaView style={styles.container}>
      <IconButton
        iosName="chevron.backward"
        androidName="arrow-back"
        containerStyle={{ position: 'absolute', top: spacing.xl+25, left: spacing.xl, zIndex: 10 }}
        onPress={() => router.back()}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>What's your name?</Text>
          <Text style={styles.subtitle}>
            Let your friends know who you are
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.text[2]}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={colors.text[2]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError('');
              }}
              autoCapitalize="words"
            />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <GradientButton 
            style={styles.button}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </GradientButton>
        </View>
      </KeyboardAvoidingView>
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
  },
  header: {
    marginTop: spacing.xl * 2,
    marginBottom: spacing.xl * 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text[1],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.medium,
    color: colors.text[2],
    lineHeight: 24,
  },
  form: {
    gap: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.medium,
    color: colors.text[1],
  },
  errorText: {
    color: '#dc2626',
    fontSize: fontSizes.small,
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.lg,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
}); 