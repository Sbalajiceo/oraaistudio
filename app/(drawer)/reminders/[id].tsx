import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useReminders } from '@/contexts/RemindersContext';
import { formatTime12h } from '@/utils/time';
import ReminderIcon from '@/components/reminders/ReminderIcon';
import PrimaryButton from '@/components/reminders/PrimaryButton';

export default function ReminderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getById, toggleDone, removeReminder } = useReminders();

  const reminder = getById(id);

  if (!reminder) {
    return (
      <SafeAreaView style={styles.notFoundRoot}>
        <Text style={styles.notFoundText}>Reminder not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { hm, period } = formatTime12h(reminder.time);

  const confirmDelete = () => {
    Alert.alert('Delete reminder', `Remove "${reminder.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeReminder(reminder.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} hitSlop={8}>
          <Feather name="chevron-left" size={20} color={Colors.textMedium} />
        </TouchableOpacity>
        <View style={styles.topbarActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push(`/reminders/add?id=${reminder.id}`)}
            hitSlop={8}
          >
            <Feather name="edit-2" size={15} color={Colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={confirmDelete} hitSlop={8}>
            <Feather name="trash-2" size={16} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.time}>
          {hm}
          <Text style={styles.period}> {period}</Text>
        </Text>

        <View style={styles.iconCircle}>
          <ReminderIcon icon={reminder.icon} size={36} color={Colors.purple} />
        </View>

        <Text style={styles.title}>{reminder.title}</Text>
        {reminder.detail ? <Text style={styles.detail}>{reminder.detail}</Text> : null}
      </View>

      {reminder.instructions ? (
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsLabel}>Instructions</Text>
          <Text style={styles.instructions}>{reminder.instructions}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <PrimaryButton
          label={reminder.done ? 'Mark as not done' : 'Mark as done'}
          icon={reminder.done ? 'rotate-ccw' : 'check'}
          onPress={() => toggleDone(reminder.id)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.metricBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarActions: {
    flexDirection: 'row',
    gap: 10,
  },
  hero: {
    alignItems: 'center',
    marginTop: 28,
    gap: 12,
  },
  time: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 30,
    color: Colors.textDark,
  },
  period: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textLight,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.purpleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  title: {
    fontFamily: 'Lora_400Regular',
    fontSize: 20,
    color: Colors.textDark,
    textAlign: 'center',
  },
  detail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textLight,
  },
  instructionsCard: {
    marginTop: 28,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 18,
  },
  instructionsLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: Colors.textLight,
    marginBottom: 8,
  },
  instructions: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textDark,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
  notFoundRoot: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  notFoundText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.textDark,
  },
  backLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.purple,
  },
});
