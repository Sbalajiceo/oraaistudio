import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function PlansSection() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Made for you</Text>
        <Text style={styles.subtitle}>Based on your data today</Text>
      </View>

      {/* Featured plan */}
      <TouchableOpacity style={styles.featured} activeOpacity={0.85}>
        <View style={styles.featuredBg} />
        <View style={styles.tag}>
          <MaterialCommunityIcons name="shimmer" size={11} color="#B8B0F8" />
          <Text style={styles.tagText}>Priority today</Text>
        </View>
        <Text style={styles.featuredTitle}>
          Your LDL is elevated —{'\n'}here's your heart plan
        </Text>
        <Text style={styles.featuredDesc}>
          Omega-3s, dietary swaps & movement targets built around your numbers.
        </Text>
        <View style={styles.featuredArrow}>
          <Feather name="arrow-right" size={15} color="#B8B0F8" />
        </View>
      </TouchableOpacity>

      {/* Small plan cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsRow}
      >
        <PlanCard
          accent={['#7B6EF6', '#B8B0F8']}
          emoji="🌙"
          title="Sleep supplement stack"
          desc="Magnesium, ashwagandha & timing tweaks for deeper REM."
          tag="Sleep"
          tagBg="#EEEDFE"
          tagColor={Colors.purple}
        />
        <PlanCard
          accent={['#4CAF50', '#A5D6A7']}
          emoji="🥗"
          title="Anti-inflammatory diet plan"
          desc="7-day meal guide tuned to your HbA1c and LDL levels."
          tag="Nutrition"
          tagBg="#EAF3DE"
          tagColor="#3B6D11"
        />
        <PlanCard
          accent={['#FF9800', '#FFCC80']}
          emoji="⚡"
          title="Boost your HRV this week"
          desc="Breathwork, cold exposure & recovery windows for your baseline."
          tag="Recovery"
          tagBg="#FFF3E0"
          tagColor="#E65100"
        />
        <PlanCard
          accent={['#00B0FF', '#80D8FF']}
          emoji="🫁"
          title="Breathwork for SpO2"
          desc="5-minute Wim Hof protocol to improve oxygen saturation."
          tag="Breathing"
          tagBg="#E1F5FE"
          tagColor="#0277BD"
        />
      </ScrollView>
    </View>
  );
}

function PlanCard({
  accent,
  emoji,
  title,
  desc,
  tag,
  tagBg,
  tagColor,
}: {
  accent: [string, string];
  emoji: string;
  title: string;
  desc: string;
  tag: string;
  tagBg: string;
  tagColor: string;
}) {
  return (
    <TouchableOpacity style={styles.planCard} activeOpacity={0.8}>
      <View
        style={[
          styles.planAccent,
          { backgroundColor: accent[0] },
        ]}
      />
      <Text style={styles.planEmoji}>{emoji}</Text>
      <Text style={styles.planTitle}>{title}</Text>
      <Text style={styles.planDesc}>{desc}</Text>
      <View style={[styles.planTag, { backgroundColor: tagBg }]}>
        <Text style={[styles.planTagText, { color: tagColor }]}>{tag}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: Colors.textLight,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textFaint,
  },
  featured: {
    backgroundColor: '#1C1829',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#2E2A40',
    padding: 18,
    paddingBottom: 16,
    minHeight: 110,
    overflow: 'hidden',
  },
  featuredBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
    backgroundColor: '#7B6EF6',
    borderRadius: 20,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(123,110,246,0.25)',
    borderWidth: 0.5,
    borderColor: 'rgba(123,110,246,0.4)',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  tagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#B8B0F8',
  },
  featuredTitle: {
    fontFamily: 'Lora_400Regular',
    fontSize: 17,
    color: Colors.white,
    lineHeight: 22,
    marginBottom: 6,
  },
  featuredDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 16.5,
  },
  featuredArrow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(123,110,246,0.3)',
    borderWidth: 0.5,
    borderColor: 'rgba(123,110,246,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsRow: {
    gap: 10,
    paddingBottom: 4,
  },
  planCard: {
    width: 148,
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 14,
    paddingTop: 17,
    overflow: 'hidden',
  },
  planAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  planEmoji: {
    fontSize: 20,
    marginBottom: 8,
  },
  planTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 17,
    marginBottom: 4,
  },
  planDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textLight,
    lineHeight: 14,
  },
  planTag: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  planTagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
});
