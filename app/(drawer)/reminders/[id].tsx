import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useReminders } from '@/contexts/RemindersContext';
import { formatTime12h } from '@/utils/time';
import ReminderIcon from '@/components/reminders/ReminderIcon';

export default function ReminderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getById, toggleDone, removeReminder } = useReminders();

  const reminder = getById(id);

  if (!reminder) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[Colors.purple, Colors.purpleDark, Colors.purpleDeep]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.notFound}>
          <Text style={styles.notFoundText}>Reminder not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
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
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.purple, Colors.purpleDark, Colors.purpleDeep]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
            <Feather name="chevron-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete} hitSlop={8}>
            <Feather name="trash-2" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <Text style={styles.time}>
            {hm}
            <Text style={styles.period}> {period}</Text>
          </Text>

          <View style={styles.iconCircle}>
            <ReminderIcon icon={reminder.icon} size={40} color={Colors.purple} />
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
          <TouchableOpacity
            style={[styles.ctaBtn, reminder.done && styles.ctaBtnDone]}
            activeOpacity={0.85}
            onPress={() => toggleDone(reminder.id)}
          >
            <Feather
              name={reminder.done ? 'rotate-ccw' : 'check'}
              size={17}
              color={Colors.purpleDeep}
            />
            <Text style={styles.ctaText}>
              {reminder.done ? 'Mark as not done' : 'Mark as done'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.overlayCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginTop: 36,
    gap: 14,
  },
  time: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    color: '#FFFFFF',
  },
  period: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  detail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  instructionsCard: {
    marginTop: 32,
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 20,
  },
  instructionsLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.textLight,
    marginBottom: 8,
  },
  instructions: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textDark,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 28,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 16,
  },
  ctaBtnDone: {
    backgroundColor: Colors.purpleLight,
  },
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.purpleDeep,
    letterSpacing: 0.3,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  notFoundText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
  },
  backLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.gold,
  },
});
