import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../theme';
import GradientButton from '../components/GradientButton';
import IconButton from '../components/IconButton';
import { auth } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Phone() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');

  const validatePhoneNumber = (phone: string) => {
    if (!phone) return "Phone number is required";
    if (!/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleContinue = async () => {
    if (loginMethod === 'phone') {
      const phoneError = validatePhoneNumber(phoneNumber);
      if (phoneError) {
        setError(phoneError);
        return;
      }

      try {
        setLoading(true);
        setError('');
        console.log('Sending verification request for:', phoneNumber);

        // Call the backend API to send verification code
        const response = await auth.requestPhoneVerification(phoneNumber);
        console.log('Verification request response:', response);

        Alert.alert(
          'Verification Code Sent',
          'Please check your phone for the verification code.'
        );

        // Navigate to code screen with phone number
        router.push({
          pathname: './code',
          params: { phoneNumber }
        });
      } catch (error: any) {
        console.error('Verification request error:', error.response?.data || error.message);
        let errorMessage = 'Failed to send verification code. Please try again.';

        if (error.message.includes('Network error') || error.message.includes('Unable to connect')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.response?.status === 429) {
          errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }

        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Email login
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);

      if (emailError || passwordError) {
        setError(emailError || passwordError);
        return;
      }

      try {
        setLoading(true);
        setError('');
        console.log('Attempting email login for:', email);

        const response = await auth.login(email, password);
        console.log('Email login response:', response);

        // Store the JWT token
        if (response.access) {
          await AsyncStorage.setItem('token', response.access);
          if (response.refresh) {
            await AsyncStorage.setItem('refreshToken', response.refresh);
          }
        }

        router.replace("/(tabs)");
      } catch (error: any) {
        console.error('Email login error:', error.response?.data || error.message);
        let errorMessage = 'Invalid email or password. Please try again.';

        if (error.message.includes('Network error') || error.message.includes('Unable to connect')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        }

        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
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
          <Text style={styles.title}>
            {loginMethod === 'phone' ? "What's your number?" : "Welcome back!"}
          </Text>
          <Text style={styles.subtitle}>
            {loginMethod === 'phone'
              ? "We'll text you a code to verify your phone"
              : "Sign in with your email and password"
            }
          </Text>
        </View>

        {/* Login Method Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, loginMethod === 'phone' && styles.toggleButtonActive]}
            onPress={() => {
              setLoginMethod('phone');
              setError('');
            }}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={18}
              color={loginMethod === 'phone' ? colors.text[1] : colors.text[2]}
            />
            <Text style={[styles.toggleText, loginMethod === 'phone' && styles.toggleTextActive]}>
              Phone
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, loginMethod === 'email' && styles.toggleButtonActive]}
            onPress={() => {
              setLoginMethod('email');
              setError('');
            }}
          >
            <Ionicons
              name="mail-outline"
              size={18}
              color={loginMethod === 'email' ? colors.text[1] : colors.text[2]}
            />
            <Text style={[styles.toggleText, loginMethod === 'email' && styles.toggleTextActive]}>
              Email
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {loginMethod === 'phone' ? (
            <View style={styles.inputContainer}>
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color={colors.text[2]}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={colors.text[2]}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (error) setError('');
                }}
                editable={!loading}
              />
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.text[2]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor={colors.text[2]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  editable={!loading}
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.text[2]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.text[2]}
                  secureTextEntry
                  autoComplete="password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError('');
                  }}
                  editable={!loading}
                />
              </View>
            </>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}

          <GradientButton
            style={[
              styles.button,
              (loading || (loginMethod === 'phone' ? !phoneNumber : (!email || !password))) && styles.buttonDisabled
            ]}
            onPress={handleContinue}
            disabled={loading || (loginMethod === 'phone' ? !phoneNumber : (!email || !password))}
          >
            <Text style={styles.buttonText}>
              {loading
                ? (loginMethod === 'phone' ? 'Sending...' : 'Signing in...')
                : (loginMethod === 'phone' ? 'Continue' : 'Sign In')
              }
            </Text>
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
    marginBottom: spacing.xl,
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.bg[2],
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.xl,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    gap: spacing.xs,
  },
  toggleButtonActive: {
    backgroundColor: colors.bg[1],
  },
  toggleText: {
    fontSize: fontSizes.medium,
    color: colors.text[2],
    fontWeight: '500',
  },
  toggleTextActive: {
    color: colors.text[1],
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
}); 