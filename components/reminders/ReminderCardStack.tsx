import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/colors';
import type { Reminder } from '@/contexts/RemindersContext';
import { formatTime12h } from '@/utils/time';
import ReminderIcon from './ReminderIcon';

const CARD_W = 160;
const CARD_H = 188;
const GAP = 12;
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
      <View style={[styles.empty, { width: width - 40, marginLeft: 20 }]}>
        <Text style={styles.emptyText}>All done for today ✓</Text>
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
          outputRange: [0.92, 1, 0.92],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.6, 1, 0.6],
          extrapolate: 'clamp',
        });

        const { hm, period } = formatTime12h(r.time);

        return (
          <Animated.View
            key={r.id}
            style={{
              width: CARD_W,
              marginRight: i === reminders.length - 1 ? 0 : GAP,
              transform: [{ scale }],
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
                <ReminderIcon icon={r.icon} size={26} color={Colors.purple} />
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
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    justifyContent: 'space-between',
  },
  time: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: Colors.textDark,
  },
  period: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textLight,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.purpleBg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textDark,
    textAlign: 'center',
  },
  detail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 1,
  },
  empty: {
    height: CARD_H,
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textLight,
  },
});
