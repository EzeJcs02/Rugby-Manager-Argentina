import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClubProvider } from '../context/ClubContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClubProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="partido/[id]" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        </Stack>
      </ClubProvider>
    </GestureHandlerRootView>
  );
}
