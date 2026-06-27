import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';

export default function InsightCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Svg width={20} height={20} viewBox="0 0 20 20">
          <Defs>
            <RadialGradient id="insightOrb" cx="38%" cy="32%" r="70%" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#D4CEFF" />
              <Stop offset="55%" stopColor="#7B6EF6" />
              <Stop offset="100%" stopColor="#3A2FA0" />
            </RadialGradient>
          </Defs>
          <Circle cx="10" cy="10" r="10" fill="url(#insightOrb)" />
        </Svg>
        <Text style={styles.label}>Ora's read on today</Text>
      </View>
      <Text style={styles.text}>
        Your HRV is above your baseline and recovery is strong at 82. You slept lighter than usual
        but REM was solid. A moderate workout today makes sense — don't push strain past 14.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.purpleBg,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: Colors.purpleBorder,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.purple,
  },
  text: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 14,
    color: Colors.purpleDeeper,
    lineHeight: 22,
  },
});
