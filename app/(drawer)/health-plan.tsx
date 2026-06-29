import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Colors } from '@/constants/colors';
import VoiceOverlay from '@/components/VoiceOverlay';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─────────────────────────────────────────────────────────
// DATA CONTRACTS — swap SAMPLE_* with real backend data
// ─────────────────────────────────────────────────────────

type FactorStatus = 'optimal' | 'borderline' | 'attention';

interface RiskFactor {
  name: string;
  detail: string;
  status: FactorStatus;
}

interface HealthArea {
  id: string;
  title: string;
  iconSet: 'Feather' | 'MCI';
  icon: string;
  status: FactorStatus;
  description: string;
  factors: RiskFactor[];
  ctaQuery: string;
}

interface BiomarkerSummary {
  total: number;
  optimal: number;
  borderline: number;
  outOfRange: number;
  lastUpdated: string;
}

const SAMPLE_SUMMARY: BiomarkerSummary = {
  total: 28,
  optimal: 19,
  borderline: 5,
  outOfRange: 4,
  lastUpdated: 'Jun 2026',
};

const SAMPLE_AREAS: HealthArea[] = [
  {
    id: 'metabolic',
    title: 'Metabolic Health',
    iconSet: 'Feather',
    icon: 'zap',
    status: 'attention',
    description: 'Indicators show added strain on your metabolism. Your glucose and lipid markers need monitoring.',
    factors: [
      { name: 'HbA1c', detail: 'Out of range · 5.8%', status: 'attention' },
      { name: 'Fasting Glucose', detail: 'Borderline · 102 mg/dL', status: 'borderline' },
      { name: 'Triglycerides', detail: 'Elevated · 185 mg/dL', status: 'borderline' },
    ],
    ctaQuery: 'What should I do about my metabolic health markers — my HbA1c is 5.8% and glucose is 102?',
  },
  {
    id: 'heart',
    title: 'Heart Health',
    iconSet: 'MCI',
    icon: 'heart-pulse',
    status: 'borderline',
    description: 'Blood pressure and cholesterol trends suggest early-stage monitoring. Stay ahead of it.',
    factors: [
      { name: 'Blood Pressure', detail: 'Stage 1 HTN · 132/84 mmHg', status: 'borderline' },
      { name: 'LDL Cholesterol', detail: 'Borderline · 138 mg/dL', status: 'borderline' },
      { name: 'Resting Heart Rate', detail: 'Optimal · 68 bpm', status: 'optimal' },
    ],
    ctaQuery: 'Explain my blood pressure of 132/84 and LDL of 138 — what should I do?',
  },
  {
    id: 'nutrition',
    title: 'Nutrition & Weight',
    iconSet: 'Feather',
    icon: 'coffee',
    status: 'borderline',
    description: 'Your BMI and Vitamin D levels suggest diet and lifestyle adjustments are worthwhile.',
    factors: [
      { name: 'BMI', detail: 'Borderline · 27.4', status: 'borderline' },
      { name: 'Vitamin D', detail: 'Deficient · 18 ng/mL', status: 'attention' },
      { name: 'Iron', detail: 'Optimal · 92 μg/dL', status: 'optimal' },
    ],
    ctaQuery: 'Help me build a nutrition plan to address my BMI and low Vitamin D',
  },
  {
    id: 'sleep',
    title: 'Sleep & Recovery',
    iconSet: 'Feather',
    icon: 'moon',
    status: 'optimal',
    description: 'Your sleep metrics are within healthy ranges. Consistency is your edge — keep it.',
    factors: [
      { name: 'Avg Sleep', detail: 'Optimal · 7.4 hrs', status: 'optimal' },
      { name: 'Sleep Quality', detail: 'Good · 82 / 100', status: 'optimal' },
      { name: 'Recovery Score', detail: 'Optimal · 78%', status: 'optimal' },
    ],
    ctaQuery: 'How can I maintain and improve my sleep quality over time?',
  },
];

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

const STATUS_DOT_COLOR: Record<FactorStatus, string> = {
  optimal: Colors.green,
  borderline: Colors.orange,
  attention: Colors.red,
};

const STATUS_TAG_LABEL: Record<FactorStatus, string> = {
  optimal: 'On Track',
  borderline: 'Monitor',
  attention: 'Needs Attention',
};

const STATUS_TAG_BG: Record<FactorStatus, string> = {
  optimal: '#E8F5E9',
  borderline: '#FFF3E0',
  attention: '#FEECEB',
};

const STATUS_TAG_COLOR: Record<FactorStatus, string> = {
  optimal: '#388E3C',
  borderline: '#E65100',
  attention: '#C0392B',
};

const STATUS_ICON_BG: Record<FactorStatus, string> = {
  optimal: `${Colors.green}18`,
  borderline: `${Colors.orange}18`,
  attention: `${Colors.red}18`,
};

// ─────────────────────────────────────────────────────────
// BIOMARKER RING (SVG)
// ─────────────────────────────────────────────────────────

const R = 62;
const CX = 80;
const CY = 80;
const CIRC = 2 * Math.PI * R; // ≈ 389.6
const SW = 14;
const SEG_GAP = 4; // units trimmed from each segment end for visual gap

function BiomarkerRing({ s }: { s: BiomarkerSummary }) {
  const optFrac = s.optimal / s.total;
  const borFrac = s.borderline / s.total;
  const outFrac = s.outOfRange / s.total;

  const optLen = Math.max(optFrac * CIRC - SEG_GAP, 0);
  const borLen = Math.max(borFrac * CIRC - SEG_GAP, 0);
  const outLen = Math.max(outFrac * CIRC - SEG_GAP, 0);

  const optRot = -90;
  const borRot = -90 + optFrac * 360;
  const outRot = -90 + (optFrac + borFrac) * 360;

  return (
    <View style={styles.ringWrap}>
      <Svg width={160} height={160} viewBox="0 0 160 160">
        {/* Background ring */}
        <Circle cx={CX} cy={CY} r={R} fill="none" stroke={Colors.border} strokeWidth={SW} />
        {/* Optimal — green */}
        <Circle
          cx={CX} cy={CY} r={R} fill="none"
          stroke={Colors.green} strokeWidth={SW} strokeLinecap="round"
          strokeDasharray={`${optLen} ${CIRC}`}
          transform={`rotate(${optRot} ${CX} ${CY})`}
        />
        {/* Borderline — orange */}
        <Circle
          cx={CX} cy={CY} r={R} fill="none"
          stroke={Colors.orange} strokeWidth={SW} strokeLinecap="round"
          strokeDasharray={`${borLen} ${CIRC}`}
          transform={`rotate(${borRot} ${CX} ${CY})`}
        />
        {/* Out of range — red */}
        <Circle
          cx={CX} cy={CY} r={R} fill="none"
          stroke={Colors.red} strokeWidth={SW} strokeLinecap="round"
          strokeDasharray={`${outLen} ${CIRC}`}
          transform={`rotate(${outRot} ${CX} ${CY})`}
        />
      </Svg>
      {/* Centre label */}
      <View style={styles.ringCenter} pointerEvents="none">
        <Text style={styles.ringTotal}>{s.total}</Text>
        <Text style={styles.ringSubLabel}>Biomarkers</Text>
        <Text style={styles.ringDate}>{s.lastUpdated}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// STAT PILL
// ─────────────────────────────────────────────────────────

function StatPill({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// GRADIENT CTA BUTTON
// ─────────────────────────────────────────────────────────

function AskOraButton({ onPress }: { onPress: () => void }) {
  const [w, setW] = useState(280);
  return (
    <TouchableOpacity
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={styles.actionBtn}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Svg width={w} height={46} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <SvgLinearGradient id="hpGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#9B8EF8" />
            <Stop offset="55%" stopColor="#7B6EF6" />
            <Stop offset="100%" stopColor="#4A3ABF" />
          </SvgLinearGradient>
        </Defs>
        <Rect width={w} height={46} rx={14} fill="url(#hpGrad)" />
      </Svg>
      <View style={styles.actionBtnContent}>
        <Feather name="zap" size={14} color="rgba(255,255,255,0.9)" />
        <Text style={styles.actionBtnText}>Ask Ora about this</Text>
        <Feather name="arrow-right" size={14} color="white" />
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────
// HEALTH AREA CARD (expandable)
// ─────────────────────────────────────────────────────────

function HealthAreaCard({
  area,
  onCta,
}: {
  area: HealthArea;
  onCta: (query: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dotColor = STATUS_DOT_COLOR[area.status];

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  const Icon = area.iconSet === 'MCI' ? MaterialCommunityIcons : Feather;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={toggle} activeOpacity={0.7}>
        <View style={[styles.cardIconWrap, { backgroundColor: STATUS_ICON_BG[area.status] }]}>
          <Icon name={area.icon as never} size={18} color={dotColor} />
        </View>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{area.title}</Text>
          <View style={[styles.tag, { backgroundColor: STATUS_TAG_BG[area.status] }]}>
            <Text style={[styles.tagText, { color: STATUS_TAG_COLOR[area.status] }]}>
              {STATUS_TAG_LABEL[area.status]}
            </Text>
          </View>
        </View>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textLight} />
      </TouchableOpacity>

      {open && (
        <View style={styles.cardBody}>
          <Text style={styles.cardDesc}>{area.description}</Text>

          <View style={styles.factorsBlock}>
            <Text style={styles.factorsHeading}>Risk Factors</Text>
            {area.factors.map((f, i) => (
              <View key={i} style={styles.factorRow}>
                <View style={[styles.factorDot, { backgroundColor: STATUS_DOT_COLOR[f.status] }]} />
                <Text style={styles.factorName}>{f.name}</Text>
                <Text style={styles.factorDetail}>{f.detail}</Text>
              </View>
            ))}
          </View>

          <AskOraButton onPress={() => onCta(area.ctaQuery)} />
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────

export default function HealthPlanScreen() {
  const navigation = useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState<string | undefined>(undefined);

  const openVoice = (query?: string) => {
    setVoiceQuery(query);
    setVoiceOpen(true);
  };

  const attentionFirst = [
    ...SAMPLE_AREAS.filter((a) => a.status === 'attention'),
    ...SAMPLE_AREAS.filter((a) => a.status === 'borderline'),
    ...SAMPLE_AREAS.filter((a) => a.status === 'optimal'),
  ];

  const needsCount = SAMPLE_AREAS.filter((a) => a.status !== 'optimal').length;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeTop} />

      {/* Top bar */}
      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('index' as never)}
          hitSlop={8}
        >
          <Feather name="arrow-left" size={18} color={Colors.textMedium} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Health Plan</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal heading */}
        <Text style={styles.headline}>
          {'Sandeep, '}
          <Text style={styles.headlineItalic}>let's improve.</Text>
        </Text>
        <Text style={styles.subline}>
          {needsCount} area{needsCount !== 1 ? 's' : ''} need your attention this month.
        </Text>

        {/* Ring + stats card */}
        <View style={styles.ringCard}>
          <BiomarkerRing s={SAMPLE_SUMMARY} />
          <View style={styles.statsRow}>
            <StatPill count={SAMPLE_SUMMARY.optimal} label="Optimal" color={Colors.green} />
            <View style={styles.statDivider} />
            <StatPill count={SAMPLE_SUMMARY.borderline} label="Borderline" color={Colors.orange} />
            <View style={styles.statDivider} />
            <StatPill count={SAMPLE_SUMMARY.outOfRange} label="Out of Range" color={Colors.red} />
          </View>
        </View>

        {/* Section heading */}
        <View style={styles.sectionHead}>
          <MaterialCommunityIcons name="clipboard-pulse-outline" size={15} color={Colors.purple} />
          <Text style={styles.sectionHeadText}>Your Action Plan</Text>
        </View>

        {/* Health area cards — attention first */}
        {attentionFirst.map((area) => (
          <HealthAreaCard key={area.id} area={area} onCta={openVoice} />
        ))}

        <Text style={styles.disclaimer}>
          Updated {SAMPLE_SUMMARY.lastUpdated} · Ora provides health information, not medical advice.
        </Text>
      </ScrollView>

      <VoiceOverlay
        visible={voiceOpen}
        initialQuery={voiceQuery}
        onClose={() => {
          setVoiceOpen(false);
          setVoiceQuery(undefined);
        }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safeTop: { backgroundColor: Colors.background },

  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.metricBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 17,
    color: Colors.textDark,
  },

  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 48,
  },

  headline: {
    fontFamily: 'Lora_400Regular',
    fontSize: 26,
    color: Colors.textDark,
    lineHeight: 34,
  },
  headlineItalic: {
    fontFamily: 'Lora_400Regular_Italic',
    color: Colors.purple,
  },
  subline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 5,
    marginBottom: 24,
  },

  // Ring card
  ringCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 16,
    gap: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  ringWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringTotal: {
    fontFamily: 'Lora_400Regular',
    fontSize: 32,
    color: Colors.textDark,
    lineHeight: 38,
  },
  ringSubLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textMedium,
    letterSpacing: 0.3,
  },
  ringDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textGhost,
    marginTop: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingVertical: 12,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statCount: {
    fontFamily: 'Lora_400Regular',
    fontSize: 24,
    lineHeight: 30,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textLight,
    textAlign: 'center',
  },
  statDivider: {
    width: 0.5,
    height: 30,
    backgroundColor: Colors.border,
  },

  // Section heading
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionHeadText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.purple,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Cards
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  cardIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleBlock: {
    flex: 1,
    gap: 5,
  },
  cardTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.textDark,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 9,
  },
  tagText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    letterSpacing: 0.2,
  },

  // Expanded body
  cardBody: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  cardDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textMedium,
    lineHeight: 20,
  },

  // Factors
  factorsBlock: { gap: 6 },
  factorsHeading: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  factorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  factorName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textDark,
    flex: 1,
  },
  factorDetail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textLight,
  },

  // Action button
  actionBtn: {
    height: 46,
    borderRadius: 14,
    overflow: 'hidden',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  actionBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'white',
  },

  disclaimer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textGhost,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 16,
  },
});
