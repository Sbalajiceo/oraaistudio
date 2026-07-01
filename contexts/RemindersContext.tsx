import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  configureNotifications,
  scheduleReminderNotification,
  cancelReminderNotification,
} from '@/utils/notifications';

export type ReminderIcon = 'pill' | 'meal' | 'water' | 'walk' | 'sleep' | 'appointment';

export interface Reminder {
  id: string;
  time: string; // 24h "HH:MM"
  title: string;
  detail?: string;
  instructions?: string;
  icon: ReminderIcon;
  done: boolean;
}

export type ReminderInput = Omit<Reminder, 'id' | 'done'>;

interface StoredReminder extends Omit<Reminder, 'done'> {
  lastCompletedDate?: string; // "YYYY-MM-DD"
  notificationId?: string;
}

const STORAGE_KEY = 'ora_reminders_v2';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const SEED_REMINDERS: StoredReminder[] = [
  { id: 'seed-appointment', time: '08:30', title: "Doctor's appointment", icon: 'appointment' },
  { id: 'seed-lunch', time: '12:00', title: 'Lunch', icon: 'meal' },
  {
    id: 'seed-paracetamol',
    time: '15:00',
    title: 'Paracetamol',
    detail: '1 x 200mg',
    instructions: 'Take 1 x 200mg with or without food, avoid alcohol. Clean your hands!',
    icon: 'pill',
  },
  { id: 'seed-walk', time: '17:00', title: 'Walk the dog', icon: 'walk' },
  { id: 'seed-sleep', time: '20:30', title: 'Go to sleep', icon: 'sleep' },
];

interface RemindersContextValue {
  reminders: Reminder[];
  loaded: boolean;
  toggleDone: (id: string) => void;
  addReminder: (input: ReminderInput) => void;
  updateReminder: (id: string, input: ReminderInput) => void;
  removeReminder: (id: string) => void;
  getById: (id: string) => Reminder | undefined;
}

const RemindersContext = createContext<RemindersContextValue | null>(null);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useState<StoredReminder[]>(SEED_REMINDERS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await configureNotifications();

      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      let initial = SEED_REMINDERS;
      if (raw) {
        try {
          initial = JSON.parse(raw);
        } catch {
          // ignore malformed cache, fall back to seed data
        }
      }

      // (Re)schedule notifications for any reminder missing one, e.g. first run.
      const withNotifications = await Promise.all(
        initial.map(async (r) => {
          if (r.notificationId) return r;
          const notificationId = await scheduleReminderNotification({
            title: r.title,
            body: r.detail,
            time: r.time,
          });
          return { ...r, notificationId };
        }),
      );

      setStored(withNotifications);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [stored, loaded]);

  const value = useMemo<RemindersContextValue>(() => {
    const today = todayKey();

    const toPublic = (r: StoredReminder): Reminder => {
      const { lastCompletedDate, notificationId, ...rest } = r;
      return { ...rest, done: lastCompletedDate === today };
    };

    return {
      reminders: [...stored].sort((a, b) => a.time.localeCompare(b.time)).map(toPublic),
      loaded,

      toggleDone: (id) =>
        setStored((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, lastCompletedDate: r.lastCompletedDate === today ? undefined : today }
              : r,
          ),
        ),

      addReminder: (input) => {
        const id = `${Date.now()}`;
        scheduleReminderNotification({ title: input.title, body: input.detail, time: input.time }).then(
          (notificationId) => {
            setStored((prev) => [...prev, { ...input, id, notificationId }]);
          },
        );
      },

      updateReminder: (id, input) => {
        const existing = stored.find((r) => r.id === id);
        if (existing?.notificationId) cancelReminderNotification(existing.notificationId);
        scheduleReminderNotification({ title: input.title, body: input.detail, time: input.time }).then(
          (notificationId) => {
            setStored((prev) => prev.map((r) => (r.id === id ? { ...r, ...input, notificationId } : r)));
          },
        );
      },

      removeReminder: (id) => {
        const existing = stored.find((r) => r.id === id);
        if (existing?.notificationId) cancelReminderNotification(existing.notificationId);
        setStored((prev) => prev.filter((r) => r.id !== id));
      },

      getById: (id) => {
        const found = stored.find((r) => r.id === id);
        return found ? toPublic(found) : undefined;
      },
    };
  }, [stored, loaded]);

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders() {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used within a RemindersProvider');
  return ctx;
}
