import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from "../theme";
import { auth } from '../services/api';

interface FormData {
  phoneNumber: string;
  verificationCode: string;
}

interface FormErrors {
  phoneNumber?: string;
  verificationCode?: string;
}

export default function Login() {
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    verificationCode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

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
      await auth.verifyPhone(formData.phoneNumber, formData.verificationCode);
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
          {!showVerification ? (
            <>
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
                  value={formData.phoneNumber}
                  onChangeText={(text) => {
                    setFormData({ ...formData, phoneNumber: text });
                    if (errors.phoneNumber) {
                      setErrors({});
                    }
                  }}
                  editable={!loading}
                />
              </View>
              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
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
                  value={formData.verificationCode}
                  onChangeText={(text) => {
                    setFormData({ ...formData, verificationCode: text });
                    if (errors.verificationCode) {
                      setErrors({});
                    }
                  }}
                  editable={!loading}
                />
              </View>
              {errors.verificationCode && (
                <Text style={styles.errorText}>
                  {errors.verificationCode}
                </Text>
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