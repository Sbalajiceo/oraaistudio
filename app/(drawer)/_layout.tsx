import { Drawer } from 'expo-router/drawer';
import DrawerContent from '@/components/DrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right',
        drawerType: 'front',
        overlayColor: 'rgba(28,27,26,0.3)',
        drawerStyle: {
          width: 220,
          backgroundColor: '#FBF9F4',
          borderTopLeftRadius: 36,
          borderBottomLeftRadius: 36,
          borderLeftWidth: 0.5,
          borderColor: '#E0DBD3',
        },
        swipeEnabled: true,
        swipeEdgeWidth: 60,
      }}
    >
      <Drawer.Screen name="index" options={{ drawerLabel: 'My health' }} />
      <Drawer.Screen name="health-plan" options={{ drawerLabel: '🗂️ Health Plan' }} />
      <Drawer.Screen name="reminders" options={{ drawerLabel: 'Reminders' }} />
      <Drawer.Screen name="insights" options={{ drawerLabel: 'Insights' }} />
      <Drawer.Screen name="me" options={{ drawerLabel: 'Me' }} />
    </Drawer>
  );
}
