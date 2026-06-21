import { useEffect } from 'react';
import { Stack } from 'expo-router';
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { notificationService } from '../services/notifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);




  useEffect(() => {
    setupNotifications();

    // Log any notification that actually arrives while the app is open,
    // so it shows up in the notifications history list.
    const subscription = notificationService.registerReceivedListener();
    return () => subscription.remove();
  }, []);

  const setupNotifications = async () => {
    const granted = await notificationService.requestPermissions();
    if (granted) {
      await notificationService.scheduleDailyReminders();
    }
  };

  if (!fontsLoaded) return null;


  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}