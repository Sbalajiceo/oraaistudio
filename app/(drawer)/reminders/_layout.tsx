import { Stack } from 'expo-router';
import { RemindersProvider } from '@/contexts/RemindersContext';

export default function RemindersLayout() {
  return (
    <RemindersProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[id]" />
        <Stack.Screen name="add" />
      </Stack>
    </RemindersProvider>
  );
}
