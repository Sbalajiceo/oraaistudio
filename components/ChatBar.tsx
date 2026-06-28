import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import OraOrb from './OraOrb';
import { Colors } from '@/constants/colors';

type Props = {
  onOpen: () => void;
};

export default function ChatBar({ onOpen }: Props) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.bar} onPress={onOpen} activeOpacity={0.75}>
        <Feather name="camera" size={19} color={Colors.textLight} />
        <Text style={styles.placeholder}>Talk to Ora...</Text>
        <View style={styles.trailing}>
          <Feather name="mic" size={19} color={Colors.textLight} />
          <OraOrb size={24} onPress={onOpen} />
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
