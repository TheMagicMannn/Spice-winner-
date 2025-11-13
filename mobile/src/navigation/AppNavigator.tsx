import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HeroPage } from '../pages/Hero';
import { LoginPage } from '../pages/Login';
import { SignupPage } from '../pages/Signup';
// Import other pages as they are created
// import { CommunityPage } from '../pages/Community';
// import { MatchesPage } from '../pages/Matches';
// import { BrowsePage } from '../pages/Browse';
// import { MessagesPage } from '../pages/Messages';
// import { ProfilePage } from '../pages/Profile';

import { BottomNav } from '../components/BottomNav';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Mock components for pages that are not yet created
const Placeholder = () => <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Coming Soon</Text></View>;


const MainAppTabs = () => {
  return (
    <Tab.Navigator tabBar={props => <BottomNav {...props} />}>
      <Tab.Screen name="Community" component={Placeholder} options={{ headerShown: false }} />
      <Tab.Screen name="Matches" component={Placeholder} options={{ headerShown: false }} />
      <Tab.Screen name="Browse" component={Placeholder} options={{ headerShown: false }} />
      <Tab.Screen name="Messages" component={Placeholder} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={Placeholder} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};


const AppNavigator: React.FC = () => {
  const isAuthenticated = false; // This will be driven by useAuth hook later

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={MainAppTabs} />
        ) : (
          <>
            <Stack.Screen name="Hero" component={HeroPage} />
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Signup" component={SignupPage} />
            {/* Add other auth-related screens like ForgotPassword here */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
