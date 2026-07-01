import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReminderIcon as ReminderIconKey } from '@/contexts/RemindersContext';

const ICON_NAMES: Record<ReminderIconKey, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  pill: 'pill',
  meal: 'silverware-fork-knife',
  water: 'cup-water',
  walk: 'paw',
  sleep: 'sleep',
  appointment: 'doctor',
};

export default function ReminderIcon({
  icon,
  size = 22,
  color = '#FFFFFF',
}: {
  icon: ReminderIconKey;
  size?: number;
  color?: string;
}) {
  return <MaterialCommunityIcons name={ICON_NAMES[icon]} size={size} color={color} />;
}
