import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      gestureEnabled: true,
    }}>
      <Stack.Screen
        name="Login"
        options={{
          title: 'Giriş Yap',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Signup"
        options={{
          title: 'Üye Ol',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Forget"
        options={{
          title: 'Şifremi Unuttum',
        }}
      />
    </Stack>
  );
}