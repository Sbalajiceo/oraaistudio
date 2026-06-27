import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import HealthSummaryCard from '@/components/HealthSummaryCard';
import PromptChips from '@/components/PromptChips';
import ChatBar from '@/components/ChatBar';
import VoiceOverlay from '@/components/VoiceOverlay';
import { Colors } from '@/constants/colors';

export default function HomeScreen() {
  const navigation = useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState<string | undefined>(undefined);

  const openVoice = (query?: string) => {
    setVoiceQuery(query);
    setVoiceOpen(true);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeTop} />

      <View style={styles.screen}>
        {/* Top bar */}
        <View style={styles.topbar}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.greetingName}>Sandeep</Text>
          </View>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => navigation.openDrawer()}
            hitSlop={8}
          >
            <Feather name="menu" size={18} color={Colors.textMedium} />
          </TouchableOpacity>
        </View>

        <HealthSummaryCard />

        <PromptChips onChipPress={(chip) => openVoice(chip)} />

        <View style={styles.spacer} />

        <ChatBar onOrbPress={() => openVoice()} />
        <Text style={styles.disclaimer}>
          Ora provides health information, not medical advice.
        </Text>
      </View>

      <VoiceOverlay
        visible={voiceOpen}
        initialQuery={voiceQuery}
        onClose={() => setVoiceOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeTop: {
    backgroundColor: Colors.background,
  },
  screen: {
    flex: 1,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  greeting: {
    fontFamily: 'Lora_400Regular',
    fontSize: 22,
    color: Colors.textDark,
    lineHeight: 28,
  },
  greetingName: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 22,
    color: Colors.purple,
    lineHeight: 28,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.metricBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  disclaimer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textGhost,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingBottom: 14,
  },
});
