import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

type VitalData = {
  icon: React.ReactNode;
  value: string;
  unit: string;
  label: string;
  trend: string;
  trendColor: string;
  statusColor: string;
  sparkPoints: string;
  sparkColor: string;
};

const VITALS: VitalData[] = [
  {
    icon: <Feather name="heart" size={16} color={Colors.red} />,
    value: '68',
    unit: 'bpm',
    label: 'Heart rate',
    trend: '↓ 4 from yesterday',
    trendColor: Colors.green,
    statusColor: Colors.green,
    sparkPoints: '0,20 20,18 40,14 60,16 80,10 100,12 120,8',
    sparkColor: Colors.red,
  },
  {
    icon: <Feather name="activity" size={16} color={Colors.purple} />,
    value: '118',
    unit: '/78',
    label: 'Blood pressure',
    trend: '↔ Stable',
    trendColor: Colors.textFaint,
    statusColor: Colors.green,
    sparkPoints: '0,14 20,12 40,15 60,13 80,14 100,11 120,13',
    sparkColor: Colors.purple,
  },
  {
    icon: <MaterialCommunityIcons name="lungs" size={16} color={Colors.blue} />,
    value: '98',
    unit: '%',
    label: 'SpO2',
    trend: '↔ Optimal',
    trendColor: Colors.textFaint,
    statusColor: Colors.green,
    sparkPoints: '0,10 20,9 40,11 60,8 80,10 100,9 120,10',
    sparkColor: Colors.blue,
  },
  {
    icon: <Feather name="thermometer" size={16} color={Colors.orange} />,
    value: '36.6',
    unit: '°C',
    label: 'Temperature',
    trend: '↔ Normal',
    trendColor: Colors.textFaint,
    statusColor: Colors.green,
    sparkPoints: '0,14 20,13 40,14 60,14 80,13 100,14 120,14',
    sparkColor: Colors.orange,
  },
];

export default function VitalsGrid() {
  return (
    <View style={styles.grid}>
      {VITALS.map((v) => (
        <View key={v.label} style={styles.card}>
          <View style={styles.top}>
            {v.icon}
            <View style={[styles.dot, { backgroundColor: v.statusColor }]} />
          </View>
          <Text style={styles.value}>
            {v.value}
            <Text style={styles.unit}>{v.unit}</Text>
          </Text>
          <Text style={styles.label}>{v.label}</Text>
          <Text style={[styles.trend, { color: v.trendColor }]}>{v.trend}</Text>
          <View style={styles.spark}>
            <Svg width="100%" height={28} viewBox="0 0 120 28">
              <Polyline
                points={v.sparkPoints}
                fill="none"
                stroke={v.sparkColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.6}
              />
            </Svg>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '47.5%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 14,
    paddingBottom: 12,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  value: {
    fontFamily: 'Inter_500Medium',
    fontSize: 24,
    color: Colors.textDark,
    lineHeight: 26,
  },
  unit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textLight,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: Colors.textLight,
    marginTop: 4,
  },
  trend: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 3,
  },
  spark: {
    marginTop: 8,
  },
});
