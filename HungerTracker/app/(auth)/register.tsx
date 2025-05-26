import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/api';
import { colors } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface FormData {
  phoneNumber: string;
  verificationCode: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface FormErrors {
  phoneNumber?: string;
  verificationCode?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    verificationCode: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [registerMethod, setRegisterMethod] = useState<'phone' | 'email'>('phone');
  const { register } = useAuth();

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

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const validateName = (name: string, field: 'firstName' | 'lastName') => {
    if (!name) return `${field === 'firstName' ? 'First' : 'Last'} name is required`;
    if (name.length < 2) return `${field === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
    return "";
  };

  const validateUsername = (username: string) => {
    if (!username) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return "";
  };

  const generateUsername = (first: string, last: string) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    return `${first.toLowerCase()}${last.toLowerCase()}${randomNum}`;
  };

  const handleRequestVerification = async () => {
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) {
      setErrors({ phoneNumber: phoneError });
      return;
    }

    try {
      setLoading(true);
      console.log('Sending verification request for:', formData.phoneNumber);
      const response = await auth.requestPhoneVerification(formData.phoneNumber);
      console.log('Verification request response:', response);
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
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      console.log('Verifying code:', formData.verificationCode, 'for phone:', formData.phoneNumber);
      const response = await auth.verifyPhone(formData.phoneNumber, formData.verificationCode);
      console.log('Verification response:', response);
      setShowVerification(false);
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
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    const firstNameError = validateName(formData.firstName, 'firstName');
    const lastNameError = validateName(formData.lastName, 'lastName');
    const usernameError = validateUsername(formData.username);

    if (emailError || passwordError || confirmPasswordError || firstNameError || lastNameError || usernameError) {
      setErrors({
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
        firstName: firstNameError,
        lastName: lastNameError,
        username: usernameError,
      });
      return;
    }

    try {
      setLoading(true);
      const username = formData.username || generateUsername(formData.firstName, formData.lastName);
      console.log('Registering user with:', { ...formData, username });
      await register({
        email: formData.email,
        password1: formData.password,
        password2: formData.confirmPassword,
        phone_number: formData.phoneNumber,
        first_name: formData.firstName,
        last_name: formData.lastName,
        username,
      });
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to create account. Please try again.'
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
          placeholderTextColor={colors.text[2]}
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>

        <View style={styles.registerMethodContainer}>
          <TouchableOpacity
            style={[
              styles.registerMethodButton,
              registerMethod === 'phone' && styles.registerMethodButtonActive
            ]}
            onPress={() => setRegisterMethod('phone')}
          >
            <Text style={[
              styles.registerMethodText,
              registerMethod === 'phone' && styles.registerMethodTextActive
            ]}>Phone</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.registerMethodButton,
              registerMethod === 'email' && styles.registerMethodButtonActive
            ]}
            onPress={() => setRegisterMethod('email')}
          >
            <Text style={[
              styles.registerMethodText,
              registerMethod === 'email' && styles.registerMethodTextActive
            ]}>Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {registerMethod === 'phone' ? (
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
                'Email',
                formData.email,
                (text) => {
                  setFormData({ ...formData, email: text });
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                },
                errors.email,
                {
                  placeholder: 'Enter your email',
                  keyboardType: 'email-address',
                  autoCapitalize: 'none',
                  autoComplete: 'email',
                  icon: 'mail-outline',
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

              {renderInput(
                'Confirm Password',
                formData.confirmPassword,
                (text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined });
                  }
                },
                errors.confirmPassword,
                {
                  placeholder: 'Confirm your password',
                  secureTextEntry: true,
                  autoComplete: 'password',
                  icon: 'lock-closed-outline',
                }
              )}
            </>
          )}

          {renderInput(
            'First Name',
            formData.firstName,
            (text) => {
              setFormData({ ...formData, firstName: text });
              if (errors.firstName) {
                setErrors({ ...errors, firstName: undefined });
              }
            },
            errors.firstName,
            {
              placeholder: 'Enter your first name',
              autoCapitalize: 'words',
              autoComplete: 'name',
              icon: 'person-outline',
            }
          )}

          {renderInput(
            'Last Name',
            formData.lastName,
            (text) => {
              setFormData({ ...formData, lastName: text });
              if (errors.lastName) {
                setErrors({ ...errors, lastName: undefined });
              }
            },
            errors.lastName,
            {
              placeholder: 'Enter your last name',
              autoCapitalize: 'words',
              autoComplete: 'name',
              icon: 'person-outline',
            }
          )}

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
              placeholder: 'Choose a username (optional)',
              autoCapitalize: 'none',
              autoComplete: 'username',
              icon: 'at-outline',
            }
          )}

          <TouchableOpacity
            style={[
              styles.button,
              (
                !formData.firstName ||
                !formData.lastName ||
                (registerMethod === 'email' && (!formData.email || !formData.password || !formData.confirmPassword)) ||
                (registerMethod === 'phone' && (!formData.phoneNumber || !formData.verificationCode)) ||
                loading
              ) && styles.buttonDisabled
            ]}
            onPress={handleRegister}
            disabled={
              loading ||
              !formData.firstName ||
              !formData.lastName ||
              (registerMethod === 'email' && (!formData.email || !formData.password || !formData.confirmPassword)) ||
              (registerMethod === 'phone' && (!formData.phoneNumber || !formData.verificationCode))
            }
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text[1],
    marginTop: 60,
    marginBottom: 40,
    textAlign: 'center',
  },
  registerMethodContainer: {
    flexDirection: 'row',
    backgroundColor: colors.bg[2],
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  registerMethodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  registerMethodButtonActive: {
    backgroundColor: colors.bg[1],
  },
  registerMethodText: {
    fontSize: 16,
    color: colors.text[2],
    fontWeight: '500',
  },
  registerMethodTextActive: {
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
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
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
  formContainer: {
    gap: 16,
  },
}); 