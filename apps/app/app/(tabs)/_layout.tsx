import { Tabs } from 'expo-router';
import { copy } from '@lumen/structure';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#475569',
        headerStyle: { backgroundColor: '#FFFFFF' },
        tabBarStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Tabs.Screen name="chats" options={{ title: copy.chats }} />
      <Tabs.Screen name="friends" options={{ title: copy.friends }} />
      <Tabs.Screen name="settings" options={{ title: copy.settings }} />
    </Tabs>
  );
}
