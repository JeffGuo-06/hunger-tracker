import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/api';
import { colors } from '../theme';

export default function Register() {
  const [step, setStep] = useState<'phone' | 'verification' | 'details'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      return "Please enter a valid 10-digit phone number";
    }
    return "";
  };

  const handleRequestVerification = async () => {
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      Alert.alert('Error', phoneError);
      return;
    }

    try {
      setLoading(true);
      console.log('Sending verification request for:', phoneNumber);
      const response = await auth.requestPhoneVerification(phoneNumber);
      console.log('Verification request response:', response);
      setStep('verification');
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
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      console.log('Verifying code:', verificationCode, 'for phone:', phoneNumber);
      const response = await auth.verifyPhone(phoneNumber, verificationCode);
      console.log('Verification response:', response);
      setStep('details');
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

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      console.log('Registering user with:', { email, phoneNumber });
      await register({
        email,
        password,
        phone_number: phoneNumber,
      });
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to create account. Please try again.'
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>

        {step === 'phone' && (
          <>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="(XXX) XXX-XXXX"
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
              keyboardType="phone-pad"
              maxLength={14}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, (!phoneNumber || loading) && styles.buttonDisabled]}
              onPress={handleRequestVerification}
              disabled={loading || !phoneNumber}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'verification' && (
          <>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, (!verificationCode || loading) && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={loading || !verificationCode}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                setStep('phone');
                setVerificationCode('');
              }}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>Change Phone Number</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'details' && (
          <>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, (!email || !password || loading) && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading || !email || !password}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </>
        )}
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text[1],
    marginTop: 60,
    marginBottom: 40,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: colors.text[1],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.acc.p1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text[1],
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.acc.p1,
    padding: 16,
    borderRadius: 12,
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
}); 