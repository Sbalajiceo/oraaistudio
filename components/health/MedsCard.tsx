import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';

type Med = {
  key: string;
  name: string;
  dose: string;
  time: string;
  dotColor: string;
};

const MEDS: Med[] = [
  { key: 'med_vitamin_d', name: 'Vitamin D3', dose: '1000 IU', time: '8:00 AM', dotColor: Colors.green },
  { key: 'med_omega3', name: 'Omega 3', dose: '1000 mg', time: '2:00 PM', dotColor: Colors.orange },
  { key: 'med_magnesium', name: 'Magnesium', dose: '400 mg', time: '10:00 PM', dotColor: '#B8B0F8' },
];

export default function MedsCard() {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    med_vitamin_d: true,
    med_omega3: false,
    med_magnesium: false,
  });

  useEffect(() => {
    (async () => {
      const stored: Record<string, boolean> = {};
      for (const med of MEDS) {
        const val = await AsyncStorage.getItem(med.key);
        if (val !== null) stored[med.key] = val === 'true';
      }
      if (Object.keys(stored).length) setChecked((prev) => ({ ...prev, ...stored }));
    })();
  }, []);

  const toggle = async (key: string) => {
    const next = !checked[key];
    setChecked((prev) => ({ ...prev, [key]: next }));
    await AsyncStorage.setItem(key, String(next));
  };

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="pill" size={16} color={Colors.orange} />
        <Text style={styles.title}>Today's reminders</Text>
      </View>

      {MEDS.map((med, i) => (
        <View key={med.key} style={[styles.row, i === MEDS.length - 1 && styles.rowLast]}>
          <View style={styles.info}>
            <View style={[styles.dot, { backgroundColor: med.dotColor }]} />
            <View>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medDose}>{med.dose}</Text>
            </View>
          </View>
          <View style={styles.trailing}>
            <Text style={styles.time}>{med.time}</Text>
            <TouchableOpacity
              style={[styles.check, checked[med.key] && styles.checkDone]}
              onPress={() => toggle(med.key)}
              hitSlop={8}
            >
              <Feather
                name="check"
                size={13}
                color={checked[med.key] ? Colors.white : Colors.borderLight}
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textDark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: Colors.metricBg,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  medName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textDark,
  },
  medDose: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textLight,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  time: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textLight,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
});
