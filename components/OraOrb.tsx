import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

type Props = {
  size?: number;
  onPress?: () => void;
};

export default function OraOrb({ size = 24, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <RadialGradient id="orbGrad" cx="38%" cy="32%" r="70%" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#D4CEFF" />
            <Stop offset="45%" stopColor="#7B6EF6" />
            <Stop offset="75%" stopColor="#4A3ABF" />
            <Stop offset="100%" stopColor="#2E228A" />
          </RadialGradient>
        </Defs>
        <Circle cx="12" cy="12" r="12" fill="url(#orbGrad)" />
      </Svg>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#4A3ABF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
