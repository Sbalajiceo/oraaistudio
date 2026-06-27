import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';

const CIRCUMFERENCE = 2 * Math.PI * 22;

function ScoreRing({
  score,
  color,
  label,
  sub,
}: {
  score: number;
  color: string;
  label: string;
  sub: string;
}) {
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <View style={styles.card}>
      <View style={styles.ringWrap}>
        <Svg width={56} height={56} viewBox="0 0 56 56">
          <Circle
            cx={28} cy={28} r={22}
            fill="none" stroke={Colors.metricBg} strokeWidth={5}
          />
          <Circle
            cx={28} cy={28} r={22}
            fill="none" stroke={color} strokeWidth={5}
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            rotation={-90}
            origin="28, 28"
          />
        </Svg>
        <Text style={styles.ringVal}>{score}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

export default function ScoreRings() {
  return (
    <View style={styles.row}>
      <ScoreRing score={82} color={Colors.green} label="Recovery" sub="Good to push" />
      <ScoreRing score={60} color={Colors.purple} label="Strain" sub="Moderate load" />
      <ScoreRing score={70} color={Colors.orange} label="Sleep" sub="7h 12m total" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
  },
  ringWrap: {
    width: 56,
    height: 56,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringVal: {
    position: 'absolute',
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.textDark,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.textLight,
  },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textFaint,
    textAlign: 'center',
    lineHeight: 13,
  },
});
