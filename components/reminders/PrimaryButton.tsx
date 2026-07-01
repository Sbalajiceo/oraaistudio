import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';

export default function PrimaryButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
}) {
  const [btnW, setBtnW] = useState(300);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLayout={(e) => setBtnW(e.nativeEvent.layout.width)}
      style={styles.wrap}
      activeOpacity={0.85}
    >
      <Svg width={btnW} height={50} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id="primaryBtnGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#9B8EF8" />
            <Stop offset="55%" stopColor="#7B6EF6" />
            <Stop offset="100%" stopColor="#4A3ABF" />
          </SvgLinearGradient>
        </Defs>
        <Rect width={btnW} height={50} rx={16} fill="url(#primaryBtnGrad)" />
      </Svg>
      <View style={styles.content}>
        {icon ? <Feather name={icon} size={16} color="white" /> : null}
        <Text style={styles.text}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  text: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'white',
    letterSpacing: 0.2,
  },
});
