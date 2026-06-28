import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  useWindowDimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';
import { Colors } from '@/constants/colors';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─────────────────────────────────────────────────────────
// DATA CONTRACTS
// Replace the SAMPLE_* constants below with real data from
// your backend / conversational-memory service at runtime.
// ─────────────────────────────────────────────────────────

export interface LabBiomarker {
  id: string;
  shortName: string;
  value: number;
  unit: string;
  /** Lower bound of reference range (0 = one-sided / lower-is-better) */
  refMin: number;
  refMax: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface BPReading {
  /** Short day label, e.g. "M", "T" */
  label: string;
  systolic: number;
  diastolic: number;
}

export interface MealEntry {
  emoji: string;
  name: string;
  items: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface HealthCardsProps {
  labs?: {
    biomarkers: LabBiomarker[];
    reportDate: string;
  };
  bloodPressure?: {
    current: { systolic: number; diastolic: number; pulse: number };
    trend: BPReading[];
    /** e.g. "Normal", "Elevated", "Stage 1 HTN" */
    classification: string;
    classificationColor?: string;
  };
  nutrition?: {
    targetCalories: number;
    targetProteinG: number;
    targetCarbsG: number;
    targetFatG: number;
    meals: MealEntry[];
    micros: { name: string; value: string; pct: number }[];
  };
  onChipPress?: (text: string) => void;
}

// ─────────────────────────────────────────────────────────
// SAMPLE DATA  (swap for real user data at runtime)
// ─────────────────────────────────────────────────────────

const SAMPLE_LABS: NonNullable<HealthCardsProps['labs']> = {
  reportDate: 'Jun 12, 2026',
  biomarkers: [
    { id: 'glucose', shortName: 'Glucose', value: 95,  unit: 'mg/dL',  refMin: 70,  refMax: 99,  trend: 'stable' },
    { id: 'hba1c',   shortName: 'HbA1c',   value: 5.4, unit: '%',      refMin: 4.0, refMax: 5.6, trend: 'down'   },
    { id: 'ldl',     shortName: 'LDL',     value: 112, unit: 'mg/dL',  refMin: 0,   refMax: 100, trend: 'stable' },
    { id: 'hdl',     shortName: 'HDL',     value: 58,  unit: 'mg/dL',  refMin: 40,  refMax: 200, trend: 'up'     },
    { id: 'tsh',     shortName: 'TSH',     value: 2.1, unit: 'mIU/L',  refMin: 0.4, refMax: 4.0, trend: 'stable' },
    { id: 'vitd',    shortName: 'Vit D',   value: 28,  unit: 'ng/mL',  refMin: 30,  refMax: 100, trend: 'down'   },
  ],
};

const SAMPLE_BP: NonNullable<HealthCardsProps['bloodPressure']> = {
  current: { systolic: 118, diastolic: 78, pulse: 68 },
  classification: 'Normal',
  classificationColor: Colors.green,
  trend: [
    { label: 'M', systolic: 122, diastolic: 80 },
    { label: 'T', systolic: 119, diastolic: 78 },
    { label: 'W', systolic: 125, diastolic: 82 },
    { label: 'T', systolic: 118, diastolic: 77 },
    { label: 'F', systolic: 121, diastolic: 79 },
    { label: 'S', systolic: 116, diastolic: 76 },
    { label: 'S', systolic: 118, diastolic: 78 },
  ],
};

const SAMPLE_NUTRITION: NonNullable<HealthCardsProps['nutrition']> = {
  targetCalories: 1800,
  targetProteinG: 145,
  targetCarbsG: 180,
  targetFatG: 60,
  meals: [
    {
      emoji: '🌅',
      name: 'Breakfast',
      items: 'Greek yogurt, granola, blueberries',
      calories: 380, proteinG: 22, carbsG: 45, fatG: 10,
    },
    {
      emoji: '☀️',
      name: 'Lunch',
      items: 'Grilled chicken salad, olive oil',
      calories: 520, proteinG: 38, carbsG: 28, fatG: 18,
    },
    {
      emoji: '🌙',
      name: 'Dinner',
      items: 'Salmon, quinoa, steamed broccoli',
      calories: 650, proteinG: 42, carbsG: 55, fatG: 22,
    },
  ],
  micros: [
    { name: 'Omega-3', value: '1.8g',  pct: 90 },
    { name: 'Iron',    value: '14mg',  pct: 78 },
    { name: 'Vit D',   value: '15μg',  pct: 75 },
    { name: 'B12',     value: '2.1μg', pct: 88 },
  ],
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

type BioStatus = 'normal' | 'borderline' | 'high' | 'low';

function getBioStatus(b: LabBiomarker): BioStatus {
  if (b.refMin === 0) {
    if (b.value > b.refMax * 1.1) return 'high';
    if (b.value > b.refMax) return 'borderline';
    return 'normal';
  }
  if (b.value < b.refMin * 0.9) return 'low';
  if (b.value < b.refMin || b.value > b.refMax) return 'borderline';
  if (b.value > b.refMax * 1.1) return 'high';
  return 'normal';
}

function statusColor(s: BioStatus): string {
  if (s === 'normal')     return Colors.green;
  if (s === 'borderline') return Colors.orange;
  if (s === 'high')       return Colors.red;
  return Colors.blue;
}

function buildSparklinePath(
  values: number[],
  w: number,
  h: number,
  yMin: number,
  yMax: number,
): string {
  const xStep = w / Math.max(values.length - 1, 1);
  const yRange = Math.max(yMax - yMin, 1);
  const mapY = (v: number) => h - ((v - yMin) / yRange) * h;
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i * xStep).toFixed(1)} ${mapY(v).toFixed(1)}`)
    .join(' ');
}

// ─────────────────────────────────────────────────────────
// SHARED SUB-COMPONENTS
// ─────────────────────────────────────────────────────────

function CardHeader({
  icon,
  title,
  badge,
  badgeColor,
  expanded,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeColor?: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const bc = badgeColor ?? Colors.green;
  return (
    <TouchableOpacity style={styles.cardHeader} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.cardHeaderLeft}>
        {icon}
        <Text style={styles.cardTitle}>{title}</Text>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: bc + '22' }]}>
            <Text style={[styles.badgeText, { color: bc }]}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Feather
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={15}
        color={Colors.textGhost}
      />
    </TouchableOpacity>
  );
}

function AskOraLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.askOraBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.askOraText}>{label} →</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────
// LABS CARD
// ─────────────────────────────────────────────────────────

function BiomarkerRow({ b }: { b: LabBiomarker }) {
  const status = getBioStatus(b);
  const color  = statusColor(status);

  const isOneSided = b.refMin === 0;
  const visMin = isOneSided ? 0 : Math.max(0, b.refMin * 0.6);
  const visMax = b.refMax * 1.4;
  const range  = Math.max(visMax - visMin, 1);

  const fillPct       = Math.min(Math.max((b.value - visMin) / range, 0), 1);
  const normalLeftPct = isOneSided ? 0 : Math.max(((b.refMin - visMin) / range) * 100, 0);
  const normalRightPct = Math.max((1 - Math.min((b.refMax - visMin) / range, 1)) * 100, 0);

  const trendIcon =
    b.trend === 'up' ? '↑' : b.trend === 'down' ? '↓' : '→';
  const trendColor =
    b.trend === 'stable' ? Colors.textGhost : status === 'normal' ? Colors.green : Colors.orange;

  return (
    <View style={styles.bioRow}>
      <Text style={styles.bioName}>{b.shortName}</Text>

      <View style={styles.bioBarWrap}>
        <View style={styles.bioBarBg} />
        <View
          style={[
            styles.normalZone,
            { left: `${normalLeftPct}%`, right: `${normalRightPct}%` },
          ]}
        />
        <View
          style={[styles.valueFill, { width: `${fillPct * 100}%`, backgroundColor: color }]}
        />
      </View>

      <View style={styles.bioValueWrap}>
        <Text style={[styles.bioValue, { color }]}>
          {b.value}
          <Text style={styles.bioUnit}> {b.unit}</Text>
        </Text>
        <Text style={[styles.bioTrend, { color: trendColor }]}>{trendIcon}</Text>
      </View>
    </View>
  );
}

function LabsCard({
  data,
  expanded,
  onToggle,
  onAskOra,
}: {
  data: NonNullable<HealthCardsProps['labs']>;
  expanded: boolean;
  onToggle: () => void;
  onAskOra: () => void;
}) {
  const normalCount = data.biomarkers.filter(b => getBioStatus(b) === 'normal').length;
  const total       = data.biomarkers.length;

  return (
    <View style={styles.card}>
      <CardHeader
        icon={<MaterialCommunityIcons name="flask-outline" size={17} color={Colors.purple} />}
        title="Latest Labs"
        badge={`${normalCount}/${total} Normal`}
        badgeColor={normalCount === total ? Colors.green : Colors.orange}
        expanded={expanded}
        onToggle={onToggle}
      />

      {!expanded && (
        <View style={styles.collapsedPreview}>
          <Text style={styles.previewMeta}>Report · {data.reportDate}</Text>
          <View style={styles.miniDots}>
            {data.biomarkers.map(b => (
              <View
                key={b.id}
                style={[styles.miniDot, { backgroundColor: statusColor(getBioStatus(b)) }]}
              />
            ))}
          </View>
        </View>
      )}

      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.subLabel}>Report · {data.reportDate}</Text>
          {data.biomarkers.map(b => (
            <BiomarkerRow key={b.id} b={b} />
          ))}
          <AskOraLink label="Ask Ora to explain" onPress={onAskOra} />
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// BP CARD
// ─────────────────────────────────────────────────────────

function BPCard({
  data,
  expanded,
  onToggle,
  onAskOra,
}: {
  data: NonNullable<HealthCardsProps['bloodPressure']>;
  expanded: boolean;
  onToggle: () => void;
  onAskOra: () => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const chartW = screenWidth - 80;
  const chartH = 60;

  const sysList  = data.trend.map(r => r.systolic);
  const diasList = data.trend.map(r => r.diastolic);
  const allVals  = [...sysList, ...diasList];
  const yMin     = Math.min(...allVals) - 6;
  const yMax     = Math.max(...allVals) + 6;

  const sysPath  = buildSparklinePath(sysList, chartW, chartH, yMin, yMax);
  const diasPath = buildSparklinePath(diasList, chartW, chartH, yMin, yMax);

  const xStep  = chartW / Math.max(data.trend.length - 1, 1);
  const yRange = Math.max(yMax - yMin, 1);
  const mapY   = (v: number) => chartH - ((v - yMin) / yRange) * chartH;

  return (
    <View style={styles.card}>
      <CardHeader
        icon={<Feather name="heart" size={15} color={Colors.red} />}
        title="Blood Pressure"
        badge={data.classification}
        badgeColor={data.classificationColor ?? Colors.green}
        expanded={expanded}
        onToggle={onToggle}
      />

      {!expanded && (
        <View style={styles.collapsedPreview}>
          <Text style={styles.bpCollapsed}>
            {data.current.systolic}
            <Text style={styles.bpSep}>/</Text>
            {data.current.diastolic}
            <Text style={styles.bpCollapsedUnit}> mmHg</Text>
          </Text>
          <Text style={styles.previewMeta}>{data.current.pulse} bpm</Text>
        </View>
      )}

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.bpCurrentRow}>
            <View>
              <Text style={styles.subLabel}>Current reading</Text>
              <Text style={styles.bpBig}>
                {data.current.systolic}
                <Text style={styles.bpSep}>/</Text>
                {data.current.diastolic}
              </Text>
              <Text style={styles.bpMeta}>mmHg · {data.current.pulse} bpm</Text>
            </View>
            <View style={styles.bpLegendCol}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: Colors.purple }]} />
                <Text style={styles.legendLabel}>Systolic</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: Colors.blue }]} />
                <Text style={styles.legendLabel}>Diastolic</Text>
              </View>
              <Text style={[styles.legendLabel, { marginTop: 4, color: Colors.textGhost }]}>
                7-day trend
              </Text>
            </View>
          </View>

          <View style={styles.chartWrap}>
            <Svg width={chartW} height={chartH}>
              {/* Shaded fill under systolic line */}
              <Path
                d={`${sysPath} L ${chartW.toFixed(1)} ${chartH} L 0 ${chartH} Z`}
                fill={Colors.purple + '12'}
              />
              <Path
                d={sysPath}
                stroke={Colors.purple}
                strokeWidth={1.8}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d={diasPath}
                stroke={Colors.blue}
                strokeWidth={1.8}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {sysList.map((v, i) => (
                <Circle
                  key={`s${i}`}
                  cx={(i * xStep).toFixed(1)}
                  cy={mapY(v).toFixed(1)}
                  r={i === sysList.length - 1 ? 3 : 2}
                  fill={Colors.purple}
                />
              ))}
              {diasList.map((v, i) => (
                <Circle
                  key={`d${i}`}
                  cx={(i * xStep).toFixed(1)}
                  cy={mapY(v).toFixed(1)}
                  r={i === diasList.length - 1 ? 3 : 2}
                  fill={Colors.blue}
                />
              ))}
            </Svg>

            <View style={styles.xLabels}>
              {data.trend.map((r, i) => (
                <Text key={i} style={styles.xLabel}>{r.label}</Text>
              ))}
            </View>
          </View>

          <AskOraLink label="Ask Ora about this" onPress={onAskOra} />
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// NUTRITION CARD
// ─────────────────────────────────────────────────────────

function MacroPill({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min(value / Math.max(target, 1), 1);
  return (
    <View style={styles.macroPill}>
      <Text style={[styles.macroPillVal, { color }]}>
        {value}
        <Text style={styles.macroPillUnit}>{unit}</Text>
      </Text>
      <Text style={styles.macroPillLabel}>{label}</Text>
      <View style={styles.macroPillBarBg}>
        <View
          style={[
            styles.macroPillBarFill,
            { width: `${pct * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.macroPillTarget}>/ {target}{unit}</Text>
    </View>
  );
}

function MealRow({ meal }: { meal: MealEntry }) {
  return (
    <View style={styles.mealRow}>
      <Text style={styles.mealEmoji}>{meal.emoji}</Text>
      <View style={styles.mealInfo}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealItems} numberOfLines={1}>{meal.items}</Text>
      </View>
      <View style={styles.mealRight}>
        <Text style={styles.mealCal}>{meal.calories} cal</Text>
        <Text style={styles.mealMacroLine}>
          P{meal.proteinG} · C{meal.carbsG} · F{meal.fatG}
        </Text>
      </View>
    </View>
  );
}

function GradientButton({ label, onPress }: { label: string; onPress: () => void }) {
  const [btnW, setBtnW] = useState(300);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLayout={e => setBtnW(e.nativeEvent.layout.width)}
      style={styles.gradBtnWrap}
      activeOpacity={0.85}
    >
      <Svg
        width={btnW}
        height={46}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Defs>
          <SvgLinearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#9B8EF8" />
            <Stop offset="55%"  stopColor="#7B6EF6" />
            <Stop offset="100%" stopColor="#4A3ABF" />
          </SvgLinearGradient>
        </Defs>
        <Rect width={btnW} height={46} rx={14} fill="url(#btnGrad)" />
      </Svg>
      <View style={styles.gradBtnContent}>
        <Text style={styles.gradBtnText}>{label}</Text>
        <Feather name="arrow-right" size={14} color="white" />
      </View>
    </TouchableOpacity>
  );
}

function FoodCard({
  data,
  expanded,
  onToggle,
  onAskOra,
}: {
  data: NonNullable<HealthCardsProps['nutrition']>;
  expanded: boolean;
  onToggle: () => void;
  onAskOra: () => void;
}) {
  const totalCal     = data.meals.reduce((s, m) => s + m.calories,  0);
  const totalProtein = data.meals.reduce((s, m) => s + m.proteinG, 0);
  const totalCarbs   = data.meals.reduce((s, m) => s + m.carbsG,   0);
  const totalFat     = data.meals.reduce((s, m) => s + m.fatG,     0);

  return (
    <View style={styles.card}>
      <CardHeader
        icon={<MaterialCommunityIcons name="food-apple-outline" size={17} color={Colors.orange} />}
        title="Today's Nutrition"
        badge={`${totalCal} cal`}
        badgeColor={Colors.orange}
        expanded={expanded}
        onToggle={onToggle}
      />

      {!expanded && (
        <View style={[styles.collapsedPreview, { gap: 8 }]}>
          {[
            { label: 'Protein', val: totalProtein, color: Colors.purple },
            { label: 'Carbs',   val: totalCarbs,   color: Colors.orange },
            { label: 'Fat',     val: totalFat,     color: Colors.blue   },
          ].map(m => (
            <View key={m.label} style={[styles.macroChip, { backgroundColor: m.color + '18' }]}>
              <Text style={[styles.macroChipVal, { color: m.color }]}>{m.val}g</Text>
              <Text style={styles.macroChipLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
      )}

      {expanded && (
        <View style={styles.expandedContent}>
          {/* Macro pills */}
          <View style={styles.macroRow}>
            <MacroPill label="Protein" value={totalProtein} target={data.targetProteinG} unit="g" color={Colors.purple} />
            <MacroPill label="Carbs"   value={totalCarbs}   target={data.targetCarbsG}   unit="g" color={Colors.orange} />
            <MacroPill label="Fat"     value={totalFat}     target={data.targetFatG}      unit="g" color={Colors.blue}   />
          </View>

          {/* Meals */}
          {data.meals.map(meal => (
            <MealRow key={meal.name} meal={meal} />
          ))}

          {/* Micros */}
          <Text style={[styles.subLabel, { marginTop: 12, marginBottom: 6 }]}>
            Key Micronutrients
          </Text>
          <View style={styles.microsWrap}>
            {data.micros.map(m => (
              <View key={m.name} style={styles.microItem}>
                <Text style={styles.microName}>{m.name}</Text>
                <View style={styles.microBarBg}>
                  <View
                    style={[
                      styles.microBarFill,
                      {
                        width: `${m.pct}%`,
                        backgroundColor:
                          m.pct >= 80 ? Colors.green : m.pct >= 50 ? Colors.orange : Colors.red,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.microValue}>{m.value}</Text>
              </View>
            ))}
          </View>

          {/* Gradient CTA */}
          <GradientButton label="View Full Meal Plan" onPress={onAskOra} />
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────

export default function ExpandableHealthCards({
  labs          = SAMPLE_LABS,
  bloodPressure = SAMPLE_BP,
  nutrition     = SAMPLE_NUTRITION,
  onChipPress,
}: HealthCardsProps) {
  const [expanded, setExpanded] = useState<'labs' | 'bp' | 'food' | null>(null);

  const toggle = (card: 'labs' | 'bp' | 'food') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => (prev === card ? null : card));
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LabsCard
        data={labs!}
        expanded={expanded === 'labs'}
        onToggle={() => toggle('labs')}
        onAskOra={() => onChipPress?.('Explain my latest labs')}
      />
      <BPCard
        data={bloodPressure!}
        expanded={expanded === 'bp'}
        onToggle={() => toggle('bp')}
        onAskOra={() => onChipPress?.('Is my BP okay?')}
      />
      <FoodCard
        data={nutrition!}
        expanded={expanded === 'food'}
        onToggle={() => toggle('food')}
        onAskOra={() => onChipPress?.('What should I eat today?')}
      />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 10,
  },

  // Card shell
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textDark,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
  },

  // Collapsed preview strip
  collapsedPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 13,
  },
  previewMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textLight,
  },
  miniDots: {
    flexDirection: 'row',
    gap: 5,
  },
  miniDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  // Expanded content wrapper
  expandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  subLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: Colors.textLight,
    marginBottom: 8,
  },

  // Ask Ora link
  askOraBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  askOraText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.purple,
  },

  // ── Labs ──
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
    gap: 8,
  },
  bioName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.textMedium,
    width: 40,
  },
  bioBarWrap: {
    flex: 1,
    height: 6,
  },
  bioBarBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.metricBg,
    borderRadius: 3,
  },
  normalZone: {
    position: 'absolute',
    top: 0, bottom: 0,
    backgroundColor: Colors.green + '30',
    borderRadius: 3,
  },
  valueFill: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    borderRadius: 3,
    opacity: 0.75,
  },
  bioValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minWidth: 72,
    justifyContent: 'flex-end',
  },
  bioValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  bioUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: Colors.textLight,
  },
  bioTrend: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },

  // ── BP ──
  bpCollapsed: {
    fontFamily: 'Inter_500Medium',
    fontSize: 22,
    color: Colors.textDark,
    lineHeight: 26,
  },
  bpSep: {
    color: Colors.textLight,
  },
  bpCollapsedUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textLight,
  },
  bpCurrentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bpBig: {
    fontFamily: 'Inter_500Medium',
    fontSize: 30,
    color: Colors.textDark,
    lineHeight: 34,
  },
  bpMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  bpLegendCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textLight,
  },
  chartWrap: {
    marginBottom: 4,
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  xLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: Colors.textGhost,
    textAlign: 'center',
    flex: 1,
  },

  // ── Nutrition collapsed ──
  macroChip: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 6,
  },
  macroChipVal: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  macroChipLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: Colors.textLight,
    marginTop: 1,
  },

  // ── Nutrition expanded ──
  macroRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  macroPill: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  macroPillVal: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
  },
  macroPillUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
  },
  macroPillLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
    marginBottom: 5,
  },
  macroPillBarBg: {
    width: '100%',
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroPillBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroPillTarget: {
    fontFamily: 'Inter_400Regular',
    fontSize: 8,
    color: Colors.textGhost,
    marginTop: 3,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  mealEmoji: {
    fontSize: 20,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.textDark,
  },
  mealItems: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 1,
  },
  mealRight: {
    alignItems: 'flex-end',
  },
  mealCal: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.textDark,
  },
  mealMacroLine: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: Colors.textLight,
    marginTop: 1,
  },
  microsWrap: {
    gap: 6,
  },
  microItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  microName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textMedium,
    width: 48,
  },
  microBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.metricBg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  microBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  microValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textLight,
    width: 36,
    textAlign: 'right',
  },

  // Gradient CTA button
  gradBtnWrap: {
    height: 46,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  gradBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'white',
    letterSpacing: 0.2,
  },
});
