import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/theme';

const TAB_ICON = {
  inicio:        { focused: 'home',           unfocused: 'home-outline' },
  plantel:       { focused: 'people',         unfocused: 'people-outline' },
  jornada:       { focused: 'american-football', unfocused: 'american-football-outline' },
  tabla:         { focused: 'bar-chart',      unfocused: 'bar-chart-outline' },
  mercado:       { focused: 'swap-horizontal',unfocused: 'swap-horizontal-outline' },
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICON[route.name] ?? { focused: 'ellipse', unfocused: 'ellipse-outline' };
          return <Ionicons name={focused ? icons.focused : icons.unfocused} size={22} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="inicio"   options={{ title: 'Inicio' }} />
      <Tabs.Screen name="plantel"  options={{ title: 'Plantel' }} />
      <Tabs.Screen name="jornada"  options={{ title: 'Jornada' }} />
      <Tabs.Screen name="tabla"    options={{ title: 'Tabla' }} />
      <Tabs.Screen name="mercado"  options={{ title: 'Mercado' }} />
    </Tabs>
  );
}
