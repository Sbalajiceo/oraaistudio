import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function ActivityCard() {
  const pct = 45;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Feather name="zap" size={16} color={Colors.orange} />
          <Text style={styles.title}>Today's strain</Text>
        </View>
        <Text style={styles.goal}>Goal: 10k steps</Text>
      </View>

      <View style={styles.grid}>
        <StatBox value="4,521" label="Steps" />
        <StatBox value="312" unit=" kcal" label="Active cal" />
        <StatBox value="3.1" unit=" km" label="Distance" />
      </View>

      <View style={styles.progressWrap}>
        <View style={[styles.progressBar, { width: `${pct}%` }]} />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressText}>0</Text>
        <Text style={styles.progressText}>{pct}% of goal</Text>
        <Text style={styles.progressText}>10k</Text>
      </View>
    </View>
  );
}

function StatBox({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statVal}>
        {value}
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    marginBottom: 12,
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
  goal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textLight,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  statVal: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    color: Colors.textDark,
  },
  statUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textLight,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.75,
    color: Colors.textLight,
    marginTop: 3,
  },
  progressWrap: {
    marginTop: 12,
    backgroundColor: Colors.metricBg,
    borderRadius: 6,
    height: 6,
  },
  progressBar: {
    height: 6,
    borderRadius: 6,
    backgroundColor: Colors.orange,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textFaint,
  },
});
