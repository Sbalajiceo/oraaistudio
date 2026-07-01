import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useReminders, ReminderIcon as ReminderIconKey } from '@/contexts/RemindersContext';
import ReminderIcon from '@/components/reminders/ReminderIcon';

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
                <ReminderIcon icon={opt} size={20} color={icon === opt ? Colors.purple : '#FFFFFF'} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Paracetamol"
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Time (24h)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 15:00"
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={time}
            onChangeText={setTime}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>Dose / detail (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1 x 200mg"
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={detail}
            onChangeText={setDetail}
          />

          <Text style={styles.label}>Instructions (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g. Take with food, avoid alcohol"
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={instructions}
            onChangeText={setInstructions}
            multiline
          />
        </ScrollView>

        <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85} onPress={submit}>
          <Text style={styles.ctaText}>ADD REMINDER</Text>
        </TouchableOpacity>
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
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.overlayCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 8,
    marginTop: 18,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.overlayCard,
    borderWidth: 1,
    borderColor: Colors.overlayCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  input: {
    backgroundColor: Colors.overlayCard,
    borderWidth: 1,
    borderColor: Colors.overlayCardBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  ctaBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  ctaText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 1,
    color: Colors.purpleDeep,
  },
});
