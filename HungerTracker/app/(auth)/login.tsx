import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

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

  const handleSendCode = () => {
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) {
      setErrors({ phoneNumber: phoneError });
      return;
    }

    // Skip verification and go directly to the app
    router.replace("/(tabs)");
  };

  const handleVerifyCode = () => {
    const codeError = validateVerificationCode(formData.verificationCode);
    if (codeError) {
      setErrors({ verificationCode: codeError });
      return;
    }

    // Skip verification and go directly to the app
    router.replace("/(tabs)");
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
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  value={formData.phoneNumber}
                  onChangeText={(text) => {
                    setFormData({ ...formData, phoneNumber: text });
                    if (errors.phoneNumber) {
                      setErrors({});
                    }
                  }}
                />
              </View>
              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={handleSendCode}
              >
                <Text style={styles.buttonText}>Send Code</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={formData.verificationCode}
                  onChangeText={(text) => {
                    setFormData({ ...formData, verificationCode: text });
                    if (errors.verificationCode) {
                      setErrors({});
                    }
                  }}
                />
              </View>
              {errors.verificationCode && (
                <Text style={styles.errorText}>
                  {errors.verificationCode}
                </Text>
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyCode}
              >
                <Text style={styles.buttonText}>Verify Code</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/signup" asChild>
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
    backgroundColor: '#fff',
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
    color: '#023047',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
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
    color: '#333',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#023047',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: '#023047',
    fontSize: 14,
    fontWeight: '600',
  },
}); 