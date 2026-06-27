import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function HealthSummaryCard() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push('/health')}
      activeOpacity={0.85}
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>Today's health</Text>
        <Feather name="chevron-right" size={14} color={Colors.textGhost} />
      </View>

      <View style={styles.metricsGrid}>
        <MetricCell label="Heart rate" value="68" unit="bpm" dotColor={Colors.green} />
        <MetricCell label="Blood pressure" value="118" unit="/78" dotColor={Colors.green} />
        <MetricCell label="SpO2" value="98" unit="%" dotColor={Colors.green} />
      </View>

      <View style={styles.secondaryRow}>
        <SecondaryMetric
          icon={<MaterialCommunityIcons name="shoe-sneaker" size={15} color={Colors.purple} />}
          label="Steps"
          value="4.5k"
        />
        <SecondaryMetric
          icon={<Feather name="droplet" size={15} color={Colors.purple} />}
          label="Water"
          value="3/8"
        />
        <SecondaryMetric
          icon={<MaterialCommunityIcons name="pill" size={15} color={Colors.orange} />}
          label="Meds"
          value="1 due"
        />
      </View>
    </TouchableOpacity>
  );
}

function MetricCell({
  label,
  value,
  unit,
  dotColor,
}: {
  label: string;
  value: string;
  unit: string;
  dotColor: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>
        {value}
        <Text style={styles.metricUnit}>{unit}</Text>
      </Text>
      <View style={[styles.metricDot, { backgroundColor: dotColor }]} />
    </View>
  );
}

function SecondaryMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.secondaryMetric}>
      {icon}
      <View>
        <Text style={styles.secondaryLabel}>{label}</Text>
        <Text style={styles.secondaryVal}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 14,
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: Colors.textLight,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  metricLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: Colors.textLight,
    marginBottom: 2,
    textAlign: 'center',
  },
  metricValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    color: Colors.textDark,
    lineHeight: 20,
  },
  metricUnit: {
    fontSize: 9,
    color: Colors.textLight,
  },
  metricDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 3,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryMetric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  secondaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.75,
    color: Colors.textLight,
  },
  secondaryVal: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textDark,
  },
});
