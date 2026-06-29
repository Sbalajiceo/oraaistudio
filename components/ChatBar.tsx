import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';

type Props = {
  onOpen: () => void;
};

function OrbDot({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="orbGrad2" cx="38%" cy="32%" r="70%" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#D4CEFF" />
          <Stop offset="45%" stopColor="#7B6EF6" />
          <Stop offset="75%" stopColor="#4A3ABF" />
          <Stop offset="100%" stopColor="#2E228A" />
        </RadialGradient>
      </Defs>
      <Circle cx="12" cy="12" r="12" fill="url(#orbGrad2)" />
    </Svg>
  );
}

export default function ChatBar({ onOpen }: Props) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.bar} onPress={onOpen} activeOpacity={0.75}>
        <Feather name="camera" size={19} color={Colors.textLight} />
        <Text style={styles.placeholder}>Talk to Ora...</Text>
        <View style={styles.trailing} pointerEvents="none">
          <Feather name="mic" size={19} color={Colors.textLight} />
          <OrbDot size={24} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 16,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 28,
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  placeholder: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textFaint,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
