import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useReminders } from '@/contexts/RemindersContext';
import { formatTime12h, formatTodayLabel } from '@/utils/time';
import ReminderCardStack from '@/components/reminders/ReminderCardStack';
import ReminderIcon from '@/components/reminders/ReminderIcon';

export default function RemindersScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const { reminders, toggleDone } = useReminders();

  const pending = reminders.filter((r) => !r.done);
  const done = reminders.filter((r) => r.done);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.purple, Colors.purpleDark, Colors.purpleDeep]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topbar}>
          <View>
            <Text style={styles.heading}>Reminders</Text>
            <View style={styles.datePill}>
              <Feather name="calendar" size={11} color="rgba(255,255,255,0.75)" />
              <Text style={styles.dateText}>{formatTodayLabel()}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => navigation.openDrawer()}
            hitSlop={8}
          >
            <Feather name="menu" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.stackWrap}>
          <ReminderCardStack
            reminders={pending}
            onCardPress={(id) => router.push(`/reminders/${id}`)}
          />
        </View>

        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Up next</Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {reminders.map((r) => {
              const { hm, period } = formatTime12h(r.time);
              return (
                <TouchableOpacity
                  key={r.id}
                  style={styles.row}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/reminders/${r.id}`)}
                >
                  <View style={styles.rowIcon}>
                    <ReminderIcon icon={r.icon} size={17} color="#FFFFFF" />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={[styles.rowTitle, r.done && styles.rowTitleDone]} numberOfLines={1}>
                      {r.title}
                    </Text>
                    {r.detail ? <Text style={styles.rowDetail}>{r.detail}</Text> : null}
                  </View>
                  <Text style={styles.rowTime}>
                    {hm} {period}
                  </Text>
                  <TouchableOpacity
                    style={[styles.check, r.done && styles.checkDone]}
                    onPress={() => toggleDone(r.id)}
                    hitSlop={8}
                  >
                    <Feather name="check" size={13} color={r.done ? Colors.purpleDeep : 'rgba(255,255,255,0.5)'} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
            {reminders.length === 0 && (
              <Text style={styles.emptyList}>No reminders yet — add your first one.</Text>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/reminders/add')}
      >
        <Feather name="plus" size={24} color={Colors.purpleDeep} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: '#FFFFFF',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: Colors.overlayCard,
    borderWidth: 1,
    borderColor: Colors.overlayCardBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.85)',
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.overlayCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackWrap: {
    marginTop: 22,
  },
  listCard: {
    flex: 1,
    marginTop: 22,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.textLight,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 100,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: Colors.border,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.textDark,
  },
  rowTitleDone: {
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  rowDetail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 1,
  },
  rowTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textLight,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  emptyList: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 30,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
});
