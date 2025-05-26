import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from "../theme";
import { auth } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FormData {
  phoneNumber: string;
  verificationCode: string;
  username: string;
  password: string;
}

interface FormErrors {
  phoneNumber?: string;
  verificationCode?: string;
  username?: string;
  password?: string;
}

export default function Login() {
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    verificationCode: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');

  const validatePhoneNumber = (phone: string) => {
    if (!phone) return "Phone number is required";
    if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  const validateVerificationCode = (code: string) => {
    if (!code) return "Verification code is required";
    if (code.length !== 6) return "Code must be 6 digits";
    return "";
  };

  const validateUsername = (username: string) => {
    if (!username) return "Username is required";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleRequestVerification = async () => {
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) {
      setErrors({ phoneNumber: phoneError });
      return;
    }

    try {
      setLoading(true);
      console.log('Requesting verification for:', formData.phoneNumber);
      await auth.requestPhoneVerification(formData.phoneNumber);
      setShowVerification(true);
      Alert.alert(
        'Verification Code Sent',
        'Please check your phone for the verification code.'
      );
    } catch (error: any) {
      console.error('Verification request error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to send verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const codeError = validateVerificationCode(formData.verificationCode);
    if (codeError) {
      setErrors({ verificationCode: codeError });
      return;
    }

    try {
      setLoading(true);
      console.log('Verifying code:', formData.verificationCode, 'for phone:', formData.phoneNumber);
      const response = await auth.verifyPhone(formData.phoneNumber, formData.verificationCode);
      
      // Store the JWT token
      if (response.access) {
        await AsyncStorage.setItem('token', response.access);
        if (response.refresh) {
          await AsyncStorage.setItem('refreshToken', response.refresh);
        }
      }
      
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error('Verification error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Invalid verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);

    if (usernameError || passwordError) {
      setErrors({
        username: usernameError,
        password: passwordError,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await auth.login(formData.username, formData.password);
      
      // Store the JWT token
      if (response.access) {
        await AsyncStorage.setItem('token', response.access);
        if (response.refresh) {
          await AsyncStorage.setItem('refreshToken', response.refresh);
        }
      }
      
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Invalid username or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    error: string | undefined,
    options: {
      placeholder: string;
      secureTextEntry?: boolean;
      keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
      autoCapitalize?: 'none' | 'words';
      autoComplete?: 'email' | 'password' | 'name' | 'username' | 'tel';
      icon: keyof typeof Ionicons.glyphMap;
      maxLength?: number;
    }
  ) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons
          name={options.icon}
          size={20}
          color={colors.text[2]}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={options.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={options.secureTextEntry}
          keyboardType={options.keyboardType}
          autoCapitalize={options.autoCapitalize}
          autoComplete={options.autoComplete}
          maxLength={options.maxLength}
          editable={!loading}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Log in to continue your Muckd journey
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.loginMethodContainer}>
            <TouchableOpacity
              style={[
                styles.loginMethodButton,
                loginMethod === 'phone' && styles.loginMethodButtonActive
              ]}
              onPress={() => setLoginMethod('phone')}
            >
              <Text style={[
                styles.loginMethodText,
                loginMethod === 'phone' && styles.loginMethodTextActive
              ]}>Phone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.loginMethodButton,
                loginMethod === 'email' && styles.loginMethodButtonActive
              ]}
              onPress={() => setLoginMethod('email')}
            >
              <Text style={[
                styles.loginMethodText,
                loginMethod === 'email' && styles.loginMethodTextActive
              ]}>Email</Text>
            </TouchableOpacity>
          </View>

          {loginMethod === 'phone' ? (
            !showVerification ? (
              <>
                {renderInput(
                  'Phone Number',
                  formData.phoneNumber,
                  (text) => {
                    setFormData({ ...formData, phoneNumber: text });
                    if (errors.phoneNumber) {
                      setErrors({ ...errors, phoneNumber: undefined });
                    }
                  },
                  errors.phoneNumber,
                  {
                    placeholder: 'Enter your phone number',
                    keyboardType: 'phone-pad',
                    autoComplete: 'tel',
                    icon: 'phone-portrait-outline',
                  }
                )}

                <TouchableOpacity
                  style={[styles.button, (!formData.phoneNumber || loading) && styles.buttonDisabled]}
                  onPress={handleRequestVerification}
                  disabled={loading || !formData.phoneNumber}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Sending...' : 'Send Code'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {renderInput(
                  'Verification Code',
                  formData.verificationCode,
                  (text) => {
                    setFormData({ ...formData, verificationCode: text });
                    if (errors.verificationCode) {
                      setErrors({ ...errors, verificationCode: undefined });
                    }
                  },
                  errors.verificationCode,
                  {
                    placeholder: 'Enter 6-digit code',
                    keyboardType: 'number-pad',
                    icon: 'key-outline',
                    maxLength: 6,
                  }
                )}

                <TouchableOpacity
                  style={[styles.button, (!formData.verificationCode || loading) && styles.buttonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={loading || !formData.verificationCode}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={() => {
                    setShowVerification(false);
                    setFormData({ ...formData, verificationCode: '' });
                  }}
                  disabled={loading}
                >
                  <Text style={styles.resendButtonText}>Change Phone Number</Text>
                </TouchableOpacity>
              </>
            )
          ) : (
            <>
              {renderInput(
                'Username',
                formData.username,
                (text) => {
                  setFormData({ ...formData, username: text });
                  if (errors.username) {
                    setErrors({ ...errors, username: undefined });
                  }
                },
                errors.username,
                {
                  placeholder: 'Enter your username',
                  autoCapitalize: 'none',
                  autoComplete: 'username',
                  icon: 'person-outline',
                }
              )}

              {renderInput(
                'Password',
                formData.password,
                (text) => {
                  setFormData({ ...formData, password: text });
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined });
                  }
                },
                errors.password,
                {
                  placeholder: 'Enter your password',
                  secureTextEntry: true,
                  autoComplete: 'password',
                  icon: 'lock-closed-outline',
                }
              )}

              <TouchableOpacity
                style={[styles.button, (!formData.username || !formData.password || loading) && styles.buttonDisabled]}
                onPress={handleEmailLogin}
                disabled={loading || !formData.username || !formData.password}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Logging in...' : 'Log In'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="./register" replace asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text[1],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text[2],
  },
  form: {
    gap: 16,
  },
  loginMethodContainer: {
    flexDirection: 'row',
    backgroundColor: colors.bg[2],
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  loginMethodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  loginMethodButtonActive: {
    backgroundColor: colors.bg[1],
  },
  loginMethodText: {
    fontSize: 16,
    color: colors.text[2],
    fontWeight: '500',
  },
  loginMethodTextActive: {
    color: colors.text[1],
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    color: colors.text[1],
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.acc.p1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text[1],
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.acc.p1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.text[2],
  },
  buttonText: {
    color: colors.bg[1],
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    padding: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    color: colors.acc.p1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.text[2],
    fontSize: 14,
  },
  footerLink: {
    color: colors.acc.p1,
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 