import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { CommunityPage } from '../pages/community/CommunityPage';
import { EventsPage } from '../pages/events/EventsPage';
import { MessagesPage } from '../pages/messages/MessagesPage';
import { BrowsePage } from '../pages/browse/BrowsePage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { ChatPage } from '../pages/messages/ChatPage';
import { EventDetailPage } from '../pages/events/EventDetailPage';
import { UserProfilePage } from '../pages/profile/UserProfilePage';
import { SettingsPage } from '../pages/profile/SettingsPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminVerificationPage } from '../pages/admin/AdminVerificationPage';
import { HelpSupportPage } from '../pages/common/HelpSupportPage';
import { AboutSpicePage } from '../pages/common/AboutSpicePage';
import { LearningJourneyPage } from '../pages/learning/LearningJourneyPage';
import { SpiceGroupsPage } from '../pages/groups/SpiceGroupsPage';
import { ISOPage } from '../pages/iso/ISOPage';
import { ISOPostDetailPage } from '../pages/iso/ISOPostDetailPage';
import { colors } from '../styles/common';

export type MainTabParamList = {
  Community: undefined;
  Events: undefined;
  Messages: undefined;
  Browse: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Chat: { conversationId: string };
  EventDetail: { eventId: string };
  UserProfile: { userId: string };
  Settings: undefined;
  AdminDashboard: undefined;
  AdminVerification: undefined;
  HelpSupport: undefined;
  AboutSpice: undefined;
  LearningJourney: undefined;
  SpiceGroups: undefined;
  ISO: undefined;
  ISOPostDetail: { postId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const getTabBarStyle = (route: any) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Community';
  const noTabBarScreens = ['Chat', 'EventDetail', 'UserProfile', 'Settings'];
  
  if (noTabBarScreens.includes(routeName)) {
    return { display: 'none' };
  }
  
  return {
    backgroundColor: colors.base200,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    height: 80,
  };
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Browse') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.base200,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        headerStyle: {
          backgroundColor: colors.base200,
        },
        headerTintColor: colors.textPrimary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Community" 
        component={CommunityPage}
        options={{ 
          title: 'Community',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsPage}
        options={{ 
          title: 'Events',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesPage}
        options={{ 
          title: 'Messages',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Browse" 
        component={BrowsePage}
        options={{ 
          title: 'Browse',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfilePage}
        options={{ 
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.base100 },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="Chat" 
        component={ChatPage}
        options={{ 
          headerShown: true, 
          title: 'Chat',
          headerStyle: { backgroundColor: colors.base200 },
          headerTintColor: colors.textPrimary,
        }}
      />
      <Stack.Screen 
        name="EventDetail" 
        component={EventDetailPage}
        options={{ 
          headerShown: true, 
          title: 'Event Details',
          headerStyle: { backgroundColor: colors.base200 },
          headerTintColor: colors.textPrimary,
        }}
      />
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfilePage}
        options={{ 
          headerShown: true, 
          title: 'Profile',
          headerStyle: { backgroundColor: colors.base200 },
          headerTintColor: colors.textPrimary,
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsPage}
        options={{ 
          headerShown: true, 
          title: 'Settings',
          headerStyle: { backgroundColor: colors.base200 },
          headerTintColor: colors.textPrimary,
        }}
      />
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboard}
        options={{ 
          headerShown: true, 
          title: 'Admin Dashboard',
          headerStyle: { backgroundColor: colors.base200 },
          headerTintColor: colors.textPrimary,
        }}
      />
      <Stack.Screen 
        name="AdminVerification" 
        component={AdminVerificationPage}
        options={{ 
          headerShown: true, 
          title: 'Verification',
          headerStyle: { backgroundColor: colors.base200 },
          headerTintColor: colors.textPrimary,
        }}
      />
      <Stack.Screen 
        name="HelpSupport" 
        component={HelpSupportPage}
        options={{ 
          headerShown: true, 
          title: 'Help & Support',
          headerStyle: { backgroundColor: colors.base200 },
          headerTintColor: colors.textPrimary,
        }}
      />
      <Stack.Screen 
        name="AboutSpice" 
        component={AboutSpicePage}
        options={{ 
          headerShown: true, 
          title: 'About SPICE',
          headerStyle: { backgroundColor: colors.base200 },
          headerTintColor: colors.textPrimary,
        }}
      />
      <Stack.Screen 
        name="LearningJourney" 
        component={LearningJourneyPage}
        options={{ 
          headerShown: true, 
          title: 'Learning Journey',
          headerStyle: { backgroundColor: colors.base200 },
          headerTintColor: colors.textPrimary,
        }}
      />
      <Stack.Screen 
        name="SpiceGroups" 
        component={SpiceGroupsPage}
        options={{ 
          headerShown: true, 
          title: 'SPICE Groups',
          headerStyle: { backgroundColor: colors.base200 },
          headerTintColor: colors.textPrimary,
        }}
      />
      <Stack.Screen 
        name="ISO" 
        component={ISOPage}
        options={{ 
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="ISOPostDetail" 
        component={ISOPostDetailPage}
        options={{ 
          headerShown: true, 
          title: 'ISO Post',
          headerStyle: { backgroundColor: colors.base200 },
          headerTintColor: colors.textPrimary,
        }}
      />
    </Stack.Navigator>
  );
};