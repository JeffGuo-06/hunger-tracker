import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Use your computer's local IP address instead of localhost
const API_URL = 'http://192.168.40.242:8000';  // Your computer's IP address

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and handling auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
      // Clear auth tokens
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      
      // Redirect to login page
      router.replace('/(auth)/login');
    }

    return Promise.reject(error);
  }
);

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Format phone number to E.164 format
const formatPhoneNumber = (phoneNumber: string) => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  // Add +1 prefix if it's a US number without country code
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  // Add + if it's missing
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

// Auth endpoints
export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/token/', { username: email, password });
    const { access, refresh } = response.data;
    await AsyncStorage.setItem('token', access);
    await AsyncStorage.setItem('refreshToken', refresh);
    return response.data;
  },
  register: async (userData: { 
    email: string; 
    password1: string; 
    password2: string; 
    phone_number: string;
    first_name: string;
    last_name: string;
    username: string;
  }) => {
    const response = await api.post('/auth/registration/', {
      ...userData,
      phone_number: formatPhoneNumber(userData.phone_number),
    });
    
    // After successful registration, get the auth tokens
    const authResponse = await api.post('/api/token/', {
      username: userData.username,
      password: userData.password1,
    });
    
    const { access, refresh } = authResponse.data;
    await AsyncStorage.setItem('token', access);
    await AsyncStorage.setItem('refreshToken', refresh);
    
    // After successful registration, create a profile in the database
    await api.post('/profiles/', {
      email: userData.email,
      phone_number: formatPhoneNumber(userData.phone_number),
    });
    
    return authResponse.data;
  },
  requestPhoneVerification: async (phoneNumber: string) => {
    console.log('Requesting phone verification for:', phoneNumber);
    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log('Formatted phone number:', formattedNumber);
    const response = await api.post('/auth/phone/request-verification/', {
      phone_number: formattedNumber,
    });
    console.log('Phone verification request response:', response.data);
    return response.data;
  },
  verifyPhone: async (phoneNumber: string, code: string) => {
    console.log('Verifying phone with code:', { phoneNumber, code });
    const formattedNumber = formatPhoneNumber(phoneNumber);
    const response = await api.post('/auth/phone/verify/', {
      phone_number: formattedNumber,
      code,
    });
    console.log('Phone verification response:', response.data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/api/profiles/me/');
    return response.data;
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
  },
  // Friend-related endpoints
  getFriends: () => api.get('/api/friendships/'),
  sendFriendRequest: (username: string) => api.post('/api/friendships/send/', { username }),
  acceptFriendRequest: (friendshipId: number) => api.post(`/api/friendships/${friendshipId}/accept/`),
  rejectFriendRequest: (friendshipId: number) => api.post(`/api/friendships/${friendshipId}/reject/`),
  removeFriend: (friendshipId: number) => api.delete(`/api/friendships/${friendshipId}/`),
};

// User endpoints
export const users = {
  getProfile: async () => {
    const response = await api.get('/api/profiles/me/');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.patch('/api/profiles/me/', data);
    return response.data;
  },
};

// Posts endpoints
export const posts = {
  getAll: async () => {
    const response = await api.get('/api/posts/');
    return response.data;
  },
  create: async (data: FormData) => {
    const response = await api.post('/api/posts/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Messages endpoints
export const messages = {
  getAll: async () => {
    const response = await api.get('/api/messages/');
    return response.data;
  },
  send: async (data: any) => {
    const response = await api.post('/api/messages/', data);
    return response.data;
  },
};

export default api; 