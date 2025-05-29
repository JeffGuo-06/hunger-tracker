import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../theme';
import GradientButton from '../components/GradientButton';
import IconButton from '../components/IconButton';

export default function Code() {
  const { phoneNumber } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const validateCode = (code: string) => {
    if (!code) return "Verification code is required";
    if (code.length !== 6) return "Code must be 6 digits";
    return "";
  };

  const handleVerify = () => {
    const codeError = validateCode(code);
    if (codeError) {
      setError(codeError);
      return;
    }

    // Here you would verify the code with your backend
    // If user exists, go to app
    // If new user, continue onboarding
    
    // For demo, let's assume it's a new user
    const isExistingUser = false;
    
    if (isExistingUser) {
      // Clear navigation and go to app
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/(tabs)');
    } else {
      // Continue onboarding for new user
      router.push('./name');
    }
  };

  const handleResend = () => {
    // Resend verification code
    console.log('Resending code to', phoneNumber);
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
          <Text style={styles.title}>Enter verification code</Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.subtitle}>We sent a code to <Text style={{ color: colors.acc.p1, fontWeight: 'bold' }}>{phoneNumber}</Text></Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="key-outline"
              size={20}
              color={colors.text[2]}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit code"
              placeholderTextColor={colors.text[2]}
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={(text) => {
                setCode(text);
                if (error) setError('');
              }}
            />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <GradientButton 
            style={styles.button}
            onPress={handleVerify}
          >
            <Text style={styles.buttonText}>Verify</Text>
          </GradientButton>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
          >
            <Text style={styles.resendButtonText}>Resend Code</Text>
          </TouchableOpacity>
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
  resendButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  resendButtonText: {
    color: colors.acc.p1,
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
}); 