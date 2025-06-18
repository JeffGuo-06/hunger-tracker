import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, router, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, fontSizes } from "../theme";
import { auth } from '../services/api';

interface FormData {
  phoneNumber: string;
  verificationCode: string;
}

interface FormErrors {
  phoneNumber?: string;
  verificationCode?: string;
}

export default function SignUp() {
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    verificationCode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Reset form when component mounts
  useEffect(() => {
    setFormData({
      phoneNumber: '',
      verificationCode: '',
    });
    setErrors({});
    setIsCodeSent(false);
  }, []);

  const validatePhoneNumber = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVerificationCode = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = 'Code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!validatePhoneNumber()) {
      return;
    }

    try {
      setLoading(true);
      console.log('Sending verification request for:', formData.phoneNumber);
      const response = await auth.requestPhoneVerification(formData.phoneNumber);
      console.log('Verification request response:', response);
      setIsCodeSent(true);
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
    if (!validateVerificationCode()) {
      return;
    }

    try {
      setLoading(true);
      console.log('Verifying code:', formData.verificationCode, 'for phone:', formData.phoneNumber);
      const response = await auth.verifyPhone(formData.phoneNumber, formData.verificationCode);
      console.log('Verification response:', response);
      router.replace('/(tabs)');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Muckd to start sharing your food journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              onChangeText={(text) => {
                setFormData({ ...formData, phoneNumber: text });
                if (errors.phoneNumber) {
                  setErrors({});
                }
              }}
              placeholder="+1 (555) 555-5555"
              placeholderTextColor={colors.text[2]}
              keyboardType="phone-pad"
              editable={!isCodeSent && !loading}
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          </View>

          {isCodeSent && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                value={formData.verificationCode}
                onChangeText={(text) => {
                  setFormData({ ...formData, verificationCode: text });
                  if (errors.verificationCode) {
                    setErrors({});
                  }
                }}
                placeholder="Enter 6-digit code"
                placeholderTextColor={colors.text[2]}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
              {errors.verificationCode && <Text style={styles.errorText}>{errors.verificationCode}</Text>}
            </View>
          )}

          {!isCodeSent ? (
            <TouchableOpacity 
              style={[styles.button, (!formData.phoneNumber || loading) && styles.buttonDisabled]} 
              onPress={handleSendCode}
              disabled={loading || !formData.phoneNumber}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send Code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.button, (!formData.verificationCode || loading) && styles.buttonDisabled]} 
                onPress={handleVerifyCode}
                disabled={loading || !formData.verificationCode}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Verifying...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.resendButton} 
                onPress={() => {
                  setIsCodeSent(false);
                  setFormData({ ...formData, verificationCode: '' });
                }}
                disabled={loading}
              >
                <Text style={styles.resendButtonText}>Change Phone Number</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Link href="./login" replace asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Log In</Text>
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
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text[1],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.acc.p1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text[1],
    backgroundColor: colors.bg[1],
  },
  errorText: {
    color: colors.acc.p1,
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.acc.p1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: colors.text[2],
  },
  buttonText: {
    color: colors.bg[1],
    fontSize: 18,
    fontWeight: '600',
  },
  resendButton: {
    padding: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    color: colors.acc.p1,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: colors.text[2],
    fontSize: 16,
  },
  loginLink: {
    color: colors.acc.p1,
    fontSize: 16,
    fontWeight: '600',
  },
}); 