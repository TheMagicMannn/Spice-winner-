import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/hooks/useAuth';
import { ToastProvider } from './src/hooks/useToast';
import { NotificationProvider } from './src/hooks/useNotifications';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/styles/common';
import 'react-native-gesture-handler';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <NavigationContainer>
              <StatusBar 
                style="light" 
                backgroundColor={colors.base100}
                translucent={false}
              />
              <AppNavigator />
            </NavigationContainer>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}