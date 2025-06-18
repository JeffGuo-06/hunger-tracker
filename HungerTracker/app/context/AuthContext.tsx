import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { auth } from '../services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: {
        email: string;
        password1: string;
        password2: string;
        phone_number: string;
        first_name: string;
        last_name: string;
        username: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                // Verify token is still valid by fetching user profile
                const userProfile = await auth.getProfile();
                setUser(userProfile);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // Token is invalid, clear it
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('refreshToken');
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await auth.login(email, password);
            const userProfile = await auth.getProfile();
            setUser(userProfile);
            setIsAuthenticated(true);
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData: {
        email: string;
        password1: string;
        password2: string;
        phone_number: string;
        first_name: string;
        last_name: string;
        username: string;
    }) => {
        try {
            const response = await auth.register(userData);
            const userProfile = await auth.getProfile();
            setUser(userProfile);
            setIsAuthenticated(true);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await auth.logout();
            setIsAuthenticated(false);
            setUser(null);
            // Redirect to login page
            router.replace("/(onboarding)/phone");
        } catch (error) {
            console.error('Logout error:', error);
            // Even if there's an error, clear local state and redirect
            setIsAuthenticated(false);
            setUser(null);
            router.replace("/(onboarding)/phone");
        }
    };

    const value = {
        isAuthenticated,
        user,
        login,
        register,
        logout,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 