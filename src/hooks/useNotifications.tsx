import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  requestPermissions: () => Promise<boolean>;
  scheduleNotification: (content: Notifications.NotificationContentInput, trigger: Notifications.NotificationTriggerInput) => Promise<string>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    requestPermissions();
    
    // Listen for notifications
    const subscription1 = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const subscription2 = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      // Handle notification tap here
    });

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  useEffect(() => {
    if (user?.id && expoPushToken) {
      // Save push token to user profile
      updatePushToken(user.id, expoPushToken);
    }
  }, [user?.id, expoPushToken]);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return false;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions denied');
      return false;
    }

    // Get push token
    const token = await Notifications.getExpoPushTokenAsync();
    setExpoPushToken(token.data);
    return true;
  };

  const scheduleNotification = async (
    content: Notifications.NotificationContentInput,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> => {
    const result = await Notifications.scheduleNotificationAsync({
      content,
      trigger,
    });
    return result;
  };

  const updatePushToken = async (userId: string, token: string) => {
    try {
      // Here you would update the user's push token in your database
      // This is a placeholder for your actual implementation
      console.log('Updating push token for user:', userId, token);
    } catch (error) {
      console.error('Error updating push token:', error);
    }
  };

  const value: NotificationContextType = {
    expoPushToken,
    notification,
    requestPermissions,
    scheduleNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};