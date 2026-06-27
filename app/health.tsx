import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScoreRings from '@/components/health/ScoreRings';
import PlansSection from '@/components/health/PlansSection';
import VitalsGrid from '@/components/health/VitalsGrid';
import HRVCard from '@/components/health/HRVCard';
import SleepCard from '@/components/health/SleepCard';
import ActivityCard from '@/components/health/ActivityCard';
import MedsCard from '@/components/health/MedsCard';
import InsightCard from '@/components/health/InsightCard';
import { Colors } from '@/constants/colors';

export default function HealthScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeTop} />

      {/* Sticky header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={17} color={Colors.textMedium} />
        </TouchableOpacity>
        <Text style={styles.title}>Today's health</Text>
        <Text style={styles.date}>Sun, 28 Jun</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <ScoreRings />

        <SectionLabel>Made for you</SectionLabel>
        <PlansSection />

        <SectionLabel>Vitals</SectionLabel>
        <VitalsGrid />

        <SectionLabel>Heart rate variability</SectionLabel>
        <HRVCard />

        <SectionLabel>Sleep</SectionLabel>
        <SleepCard />

        <SectionLabel>Activity</SectionLabel>
        <ActivityCard />

        <SectionLabel>Medications</SectionLabel>
        <MedsCard />

        <InsightCard />
      </ScrollView>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={sectionLabelStyle}>{children}</Text>;
}

const sectionLabelStyle: object = {
  fontFamily: 'Inter_500Medium',
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: 1.2,
  color: Colors.textLight,
  paddingTop: 2,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeTop: {
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 0.5,
    borderColor: Colors.metricBg,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.metricBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontFamily: 'Lora_400Regular',
    fontSize: 20,
    color: Colors.textDark,
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textLight,
    marginLeft: 'auto',
  },
  scroll: {
    flex: 1,
  },
  body: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
});
