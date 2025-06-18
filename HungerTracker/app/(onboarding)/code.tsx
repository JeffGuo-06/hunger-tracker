import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../theme';
import GradientButton from '../components/GradientButton';
import IconButton from '../components/IconButton';
import { auth } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Code() {
  const { phoneNumber } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateCode = (code: string) => {
    if (!code) return "Verification code is required";
    if (code.length !== 6) return "Code must be 6 digits";
    return "";
  };

  const handleVerify = async () => {
    const codeError = validateCode(code);
    if (codeError) {
      setError(codeError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Verifying code:', code, 'for phone:', phoneNumber);

      // Call the backend API to verify the code
      const response = await auth.verifyPhone(phoneNumber as string, code);
      console.log('Verification response:', response);

      // Store the JWT tokens if provided
      if (response.access) {
        await AsyncStorage.setItem('token', response.access);
        if (response.refresh) {
          await AsyncStorage.setItem('refreshToken', response.refresh);
        }
      }

      // Check if this is an existing user or new user
      // If tokens were provided, it means the user already exists
      const isExistingUser = !!response.access;

      if (isExistingUser) {
        // Clear navigation and go to app
        Alert.alert(
          'Welcome back!',
          'Phone number verified successfully.',
          [
            {
              text: 'Continue',
              onPress: () => {
                if (router.canDismiss()) {
                  router.dismissAll();
                }
                router.replace('/(tabs)');
              }
            }
          ]
        );
      } else {
        // Continue onboarding for new user
        Alert.alert(
          'Phone verified!',
          'Let\'s complete your profile.',
          [
            {
              text: 'Continue',
              onPress: () => router.push('./name')
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Verification error:', error.response?.data || error.message);
      let errorMessage = 'Invalid verification code. Please try again.';

      if (error.message.includes('Network error') || error.message.includes('Unable to connect')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('SSL') || error.message.includes('Secure connection')) {
        errorMessage = 'Secure connection failed. Please try again later.';
      } else if (error.message.includes('Session expired')) {
        errorMessage = 'Session expired. Please try again.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      console.log('Resending code to', phoneNumber);

      // Call the backend API to resend verification code
      const response = await auth.requestPhoneVerification(phoneNumber as string);
      console.log('Resend verification response:', response);

      Alert.alert(
        'Code Resent',
        'A new verification code has been sent to your phone.'
      );
    } catch (error: any) {
      console.error('Resend error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        'Failed to resend verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <IconButton
        iosName="chevron.backward"
        androidName="arrow-back"
        containerStyle={{ position: 'absolute', top: spacing.xl + 25, left: spacing.xl, zIndex: 10 }}
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
              editable={!loading}
            />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <GradientButton
            style={[styles.button, (loading || !code) && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={loading || !code}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Verify'}
            </Text>
          </GradientButton>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
            disabled={loading}
          >
            <Text style={[styles.resendButtonText, { opacity: loading ? 0.6 : 1 }]}>
              {loading ? 'Sending...' : 'Resend Code'}
            </Text>
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
  buttonDisabled: {
    opacity: 0.6,
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