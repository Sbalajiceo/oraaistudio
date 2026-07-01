import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/colors';
import type { Reminder } from '@/contexts/RemindersContext';
import { formatTime12h } from '@/utils/time';
import ReminderIcon from './ReminderIcon';

const CARD_W = 176;
const CARD_H = 210;
const GAP = 14;
const ITEM_SIZE = CARD_W + GAP;

export default function ReminderCardStack({
  reminders,
  onCardPress,
}: {
  reminders: Reminder[];
  onCardPress: (id: string) => void;
}) {
  const { width } = useWindowDimensions();
  const sidePad = (width - CARD_W) / 2;
  const scrollX = useRef(new Animated.Value(0)).current;

  if (reminders.length === 0) {
    return (
      <View style={[styles.empty, { width: CARD_W, height: CARD_H, marginLeft: sidePad }]}>
        <Text style={styles.emptyEmoji}>✓</Text>
        <Text style={styles.emptyText}>All done for today</Text>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_SIZE}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: sidePad }}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: true,
      })}
      scrollEventThrottle={16}
    >
      {reminders.map((r, i) => {
        const inputRange = [(i - 1) * ITEM_SIZE, i * ITEM_SIZE, (i + 1) * ITEM_SIZE];
        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.86, 1, 0.86],
          extrapolate: 'clamp',
        });
        const translateY = scrollX.interpolate({
          inputRange,
          outputRange: [22, 0, 22],
          extrapolate: 'clamp',
        });
        const rotate = scrollX.interpolate({
          inputRange,
          outputRange: ['-8deg', '0deg', '8deg'],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.55, 1, 0.55],
          extrapolate: 'clamp',
        });

        const { hm, period } = formatTime12h(r.time);

        return (
          <Animated.View
            key={r.id}
            style={{
              width: CARD_W,
              marginRight: i === reminders.length - 1 ? 0 : GAP,
              transform: [{ scale }, { translateY }, { rotate }],
              opacity,
            }}
          >
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => onCardPress(r.id)}
            >
              <Text style={styles.time}>
                {hm}
                <Text style={styles.period}> {period}</Text>
              </Text>

              <View style={styles.iconCircle}>
                <ReminderIcon icon={r.icon} size={30} color={Colors.purple} />
              </View>

              <View>
                <Text style={styles.title} numberOfLines={2}>
                  {r.title}
                </Text>
                {r.detail ? <Text style={styles.detail}>{r.detail}</Text> : null}
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: Colors.white,
    borderRadius: 26,
    padding: 18,
    justifyContent: 'space-between',
    shadowColor: '#1C1450',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  time: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.purpleDeep,
  },
  period: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.textLight,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.purpleBg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.textDark,
    textAlign: 'center',
  },
  detail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
  empty: {
    backgroundColor: Colors.overlayCard,
    borderWidth: 1,
    borderColor: Colors.overlayCardBorder,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 28,
    color: Colors.gold,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
});
