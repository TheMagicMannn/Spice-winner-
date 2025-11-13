import { Tabs } from 'expo-router';
import React from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import { Stack } from 'expo-router';
import { BottomNav } from '../../src/components/BottomNav';

export default function TabLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return (
      <Stack>
        <Stack.Screen name="hero" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Tabs tabBar={props => <BottomNav {...props} />}>
      <Tabs.Screen name="index" options={{ headerShown: false, title: 'Browse' }}/>
      <Tabs.Screen name="matches" options={{ headerShown: false, title: 'Matches' }}/>
      <Tabs.Screen name="messages" options={{ headerShown: false, title: 'Messages' }}/>
      <Tabs.Screen name="community" options={{ headerShown: false, title: 'Community' }}/>
      <Tabs.Screen name="profile" options={{ headerShown: false, title: 'Profile' }}/>
    </Tabs>
  );
}
