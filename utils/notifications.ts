import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configureNotifications(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let granted = existing.granted;
  if (!granted && existing.canAskAgain) {
    const requested = await Notifications.requestPermissionsAsync();
    granted = requested.granted;
  }
  return granted;
}

export async function scheduleReminderNotification(input: {
  title: string;
  body?: string;
  time: string; // "HH:MM"
}): Promise<string | undefined> {
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return undefined;

  const [hour, minute] = input.time.split(':').map(Number);
  return Notifications.scheduleNotificationAsync({
    content: {
      title: input.title,
      body: input.body ?? "It's time — tap to open Ora.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? 'reminders' : undefined,
    },
  });
}

export async function cancelReminderNotification(notificationId?: string): Promise<void> {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
