import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg[1] },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="hero1" />
      <Stack.Screen name="hero2" />
      <Stack.Screen name="hero3" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="code" />
      <Stack.Screen name="name" />
      <Stack.Screen name="username" />
      <Stack.Screen name="profile-picture" />
      <Stack.Screen name="contacts-permission" />
      <Stack.Screen name="invite-friends" />
    </Stack>
  );
} 