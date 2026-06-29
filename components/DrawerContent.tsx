import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

type NavItem = {
  label: string;
  route: string;
  icon: React.ReactNode;
};

export default function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const navItems: NavItem[] = [
    {
      label: 'My health',
      route: '/',
      icon: <MaterialCommunityIcons name="heart-pulse" size={16} color="inherit" />,
    },
    {
      label: 'Health Plan',
      route: '/health-plan',
      icon: <MaterialCommunityIcons name="clipboard-pulse-outline" size={16} color="inherit" />,
    },
    {
      label: 'Reminders',
      route: '/reminders',
      icon: <Feather name="bell" size={16} color="inherit" />,
    },
    {
      label: 'Insights',
      route: '/insights',
      icon: <Feather name="trending-up" size={16} color="inherit" />,
    },
    {
      label: 'Me',
      route: '/me',
      icon: <Feather name="user" size={16} color="inherit" />,
    },
  ];

  const isActive = (route: string) => {
    if (route === '/') return pathname === '/' || pathname === '';
    return pathname.startsWith(route);
  };

  const handleNav = (route: string) => {
    navigation.closeDrawer();
    router.push(route as never);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>Ora</Text>
        <TouchableOpacity onPress={() => navigation.closeDrawer()} hitSlop={8}>
          <Feather name="x" size={18} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.nav}>
        {navItems.map((item) => {
          const active = isActive(item.route);
          const color = active ? Colors.purple : Colors.textMedium;
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => handleNav(item.route)}
              activeOpacity={0.7}
            >
              <View style={{ color } as never}>{
                React.cloneElement(item.icon as React.ReactElement, { color })
              }</View>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

      <View style={styles.settingsNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Feather name="settings" size={16} color={Colors.textMedium} />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  logo: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 18,
    color: Colors.purple,
  },
  nav: {
    flex: 1,
    paddingHorizontal: 10,
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: Colors.purpleBg,
  },
  navLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textMedium,
  },
  navLabelActive: {
    fontFamily: 'Inter_500Medium',
    color: Colors.purple,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
    marginVertical: 10,
  },
  settingsNav: {
    paddingHorizontal: 10,
  },
});
