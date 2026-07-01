import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useReminders, ReminderIcon as ReminderIconKey } from '@/contexts/RemindersContext';
import ReminderIcon from '@/components/reminders/ReminderIcon';
import PrimaryButton from '@/components/reminders/PrimaryButton';

const ICON_OPTIONS: ReminderIconKey[] = ['pill', 'meal', 'water', 'walk', 'sleep', 'appointment'];

export default function AddReminderScreen() {
  const router = useRouter();
  const { addReminder } = useReminders();

  const [icon, setIcon] = useState<ReminderIconKey>('pill');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [time, setTime] = useState('');
  const [instructions, setInstructions] = useState('');

  const submit = () => {
    const trimmedTitle = title.trim();
    const trimmedTime = time.trim();
    if (!trimmedTitle || !/^\d{1,2}:\d{2}$/.test(trimmedTime)) {
      Alert.alert('Missing info', 'Please add a title and a time in HH:MM format (e.g. 15:00).');
      return;
    }
    addReminder({
      title: trimmedTitle,
      time: trimmedTime,
      detail: detail.trim() || undefined,
      instructions: instructions.trim() || undefined,
      icon,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} hitSlop={8}>
          <Feather name="chevron-left" size={20} color={Colors.textMedium} />
        </TouchableOpacity>
        <Text style={styles.heading}>New reminder</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Type</Text>
        <View style={styles.iconRow}>
          {ICON_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.iconOption, icon === opt && styles.iconOptionActive]}
              onPress={() => setIcon(opt)}
              activeOpacity={0.8}
            >
              <ReminderIcon icon={opt} size={18} color={icon === opt ? Colors.purple : Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Paracetamol"
          placeholderTextColor={Colors.textFaint}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Time (24h)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 15:00"
          placeholderTextColor={Colors.textFaint}
          value={time}
          onChangeText={setTime}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Dose / detail (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1 x 200mg"
          placeholderTextColor={Colors.textFaint}
          value={detail}
          onChangeText={setDetail}
        />

        <Text style={styles.label}>Instructions (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g. Take with food, avoid alcohol"
          placeholderTextColor={Colors.textFaint}
          value={instructions}
          onChangeText={setInstructions}
          multiline
        />

        <View style={styles.ctaWrap}>
          <PrimaryButton label="Add reminder" icon="plus" onPress={submit} />
        </View>
      </ScrollView>
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
    paddingBottom: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.metricBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontFamily: 'Lora_400Regular',
    fontSize: 18,
    color: Colors.textDark,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 28,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: Colors.textLight,
    marginBottom: 8,
    marginTop: 18,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconOption: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionActive: {
    backgroundColor: Colors.purpleBg,
    borderColor: Colors.purpleBorder,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textDark,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  ctaWrap: {
    marginTop: 26,
  },
});
