import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const STORAGE_KEY = 'ora_reminders_v1';

const SEED_REMINDERS: Reminder[] = [
  {
    id: 'seed-appointment',
    time: '08:30',
    title: "Doctor's appointment",
    icon: 'appointment',
    done: false,
  },
  {
    id: 'seed-lunch',
    time: '12:00',
    title: 'Lunch',
    icon: 'meal',
    done: false,
  },
  {
    id: 'seed-paracetamol',
    time: '15:00',
    title: 'Paracetamol',
    detail: '1 x 200mg',
    instructions: 'Take 1 x 200mg with or without food, avoid alcohol. Clean your hands!',
    icon: 'pill',
    done: false,
  },
  {
    id: 'seed-walk',
    time: '17:00',
    title: 'Walk the dog',
    icon: 'walk',
    done: false,
  },
  {
    id: 'seed-sleep',
    time: '20:30',
    title: 'Go to sleep',
    icon: 'sleep',
    done: false,
  },
];

interface RemindersContextValue {
  reminders: Reminder[];
  loaded: boolean;
  toggleDone: (id: string) => void;
  addReminder: (input: Omit<Reminder, 'id' | 'done'>) => void;
  removeReminder: (id: string) => void;
  getById: (id: string) => Reminder | undefined;
}

const RemindersContext = createContext<RemindersContextValue | null>(null);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>(SEED_REMINDERS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setReminders(JSON.parse(stored));
        } catch {
          // ignore malformed cache, fall back to seed data
        }
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders, loaded]);

  const value = useMemo<RemindersContextValue>(
    () => ({
      reminders: [...reminders].sort((a, b) => a.time.localeCompare(b.time)),
      loaded,
      toggleDone: (id) =>
        setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))),
      addReminder: (input) =>
        setReminders((prev) => [...prev, { ...input, id: `${Date.now()}`, done: false }]),
      removeReminder: (id) => setReminders((prev) => prev.filter((r) => r.id !== id)),
      getById: (id) => reminders.find((r) => r.id === id),
    }),
    [reminders, loaded],
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders() {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used within a RemindersProvider');
  return ctx;
}
