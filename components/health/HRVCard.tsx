import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function HRVCard() {
  const value = 68;
  const min = 20;
  const max = 100;
  const avg = 58;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <MaterialCommunityIcons name="sine-wave" size={16} color={Colors.purple} />
          <Text style={styles.title}>HRV</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Above baseline</Text>
        </View>
      </View>

      <Text style={styles.value}>
        {value}
        <Text style={styles.unit}> ms</Text>
      </Text>

      <View style={styles.barWrap}>
        <View style={[styles.bar, { width: `${pct}%` }]} />
      </View>
      <View style={styles.range}>
        <Text style={styles.rangeText}>{min} ms</Text>
        <Text style={styles.rangeText}>Your avg: {avg}</Text>
        <Text style={styles.rangeText}>{max} ms</Text>
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
  badge: {
    backgroundColor: '#EAF3DE',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.green,
  },
  value: {
    fontFamily: 'Inter_500Medium',
    fontSize: 32,
    color: Colors.textDark,
    lineHeight: 34,
  },
  unit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textLight,
  },
  barWrap: {
    backgroundColor: Colors.metricBg,
    borderRadius: 6,
    height: 6,
    marginTop: 12,
  },
  bar: {
    height: 6,
    borderRadius: 6,
    backgroundColor: Colors.purple,
  },
  range: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textFaint,
  },
});
