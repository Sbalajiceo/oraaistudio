import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';

const CHIPS = [
  'Explain my latest labs',
  'Is my BP okay?',
  'What should I eat today?',
];

type Props = {
  onChipPress?: (text: string) => void;
};

export default function PromptChips({ onChipPress }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CHIPS.map((chip) => (
        <TouchableOpacity
          key={chip}
          style={styles.chip}
          onPress={() => onChipPress?.(chip)}
          activeOpacity={0.7}
        >
          <Text style={styles.chipText}>{chip}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  chipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textMedium,
  },
});
