import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

const STAGES = [
  { flex: 1.2, color: '#3A2FA0', label: 'Deep', time: '1h 22m' },
  { flex: 1.8, color: Colors.purple, label: 'REM', time: '2h 05m' },
  { flex: 3, color: '#B8B0F8', label: 'Light', time: '3h 30m' },
  { flex: 0.5, color: Colors.border, label: 'Awake', time: '15m' },
];

export default function SleepCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Feather name="moon" size={16} color={Colors.purple} />
          <Text style={styles.title}>Last night</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>Score 70</Text>
        </View>
      </View>

      <Text style={styles.meta}>11:30 PM → 6:42 AM · 7h 12m</Text>

      <View style={styles.stages}>
        {STAGES.map((s) => (
          <View key={s.label} style={[styles.stageBar, { flex: s.flex, backgroundColor: s.color }]} />
        ))}
      </View>

      <View style={styles.legend}>
        {STAGES.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.stats}>
        {STAGES.map((s) => (
          <View key={s.label} style={styles.stat}>
            <Text style={styles.statVal}>{s.time}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textDark,
  },
  scoreBadge: {
    backgroundColor: Colors.purpleBg,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 20,
  },
  scoreText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.purple,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 10,
  },
  stages: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 6,
    overflow: 'hidden',
    gap: 1,
    marginBottom: 10,
  },
  stageBar: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textLight,
  },
  stats: {
    flexDirection: 'row',
    gap: 4,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textDark,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.75,
    color: Colors.textLight,
    marginTop: 2,
  },
});
