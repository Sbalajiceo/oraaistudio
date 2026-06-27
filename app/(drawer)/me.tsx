import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/colors';

export default function MeScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.center}>
        <Text style={styles.label}>Sandeep</Text>
        <Text style={styles.sub}>Profile coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { fontFamily: 'Lora_400Regular_Italic', fontSize: 24, color: Colors.purple },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.textLight },
});
