import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GuestProvider, useGuest } from '@/hooks/use-guest';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  function AppStack() {
    const { user, loading } = useAuth();
    const { isGuest } = useGuest();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user && !isGuest) {
        router.replace('/login');
      }
    }, [loading, user, isGuest, router]);

    return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GuestProvider>
        <AppStack />
      </GuestProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
