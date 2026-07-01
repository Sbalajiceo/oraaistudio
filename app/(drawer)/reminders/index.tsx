import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
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

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topbar}>
        <View>
          <Text style={styles.heading}>Reminders</Text>
          <Text style={styles.subheading}>{formatTodayLabel()}</Text>
        </View>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.openDrawer()}
          hitSlop={8}
        >
          <Feather name="menu" size={18} color={Colors.textMedium} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ReminderCardStack
          reminders={pending}
          onCardPress={(id) => router.push(`/reminders/${id}`)}
        />

        <View style={styles.listCard}>
          <View style={styles.listTitleRow}>
            <Feather name="check-circle" size={15} color={Colors.purple} />
            <Text style={styles.listTitle}>Today's reminders</Text>
          </View>

          {reminders.map((r, i) => {
            const { hm, period } = formatTime12h(r.time);
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.row, i === reminders.length - 1 && styles.rowLast]}
                activeOpacity={0.8}
                onPress={() => router.push(`/reminders/${r.id}`)}
              >
                <View style={styles.rowInfo}>
                  <View style={styles.rowIcon}>
                    <ReminderIcon icon={r.icon} size={16} color={Colors.purple} />
                  </View>
                  <View>
                    <Text style={[styles.rowTitleText, r.done && styles.rowTitleDone]} numberOfLines={1}>
                      {r.title}
                    </Text>
                    {r.detail ? <Text style={styles.rowDetail}>{r.detail}</Text> : null}
                  </View>
                </View>
                <View style={styles.trailing}>
                  <Text style={styles.rowTime}>
                    {hm} {period}
                  </Text>
                  <TouchableOpacity
                    style={[styles.check, r.done && styles.checkDone]}
                    onPress={() => toggleDone(r.id)}
                    hitSlop={8}
                  >
                    <Feather name="check" size={13} color={r.done ? Colors.white : Colors.borderLight} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}

          {reminders.length === 0 && (
            <Text style={styles.emptyList}>No reminders yet — add your first one.</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.addRow}
          activeOpacity={0.7}
          onPress={() => router.push('/reminders/add')}
        >
          <Feather name="plus-circle" size={16} color={Colors.purple} />
          <Text style={styles.addRowText}>Add a reminder</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  topbar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  heading: {
    fontFamily: 'Lora_400Regular',
    fontSize: 22,
    color: Colors.textDark,
    lineHeight: 28,
  },
  subheading: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    letterSpacing: 0.6,
    color: Colors.textLight,
    marginTop: 2,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.metricBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  listCard: {
    marginHorizontal: 16,
    marginTop: 22,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  listTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textDark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: Colors.metricBg,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.purpleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitleText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
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
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  emptyList: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 10,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  addRowText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.purple,
  },
});
