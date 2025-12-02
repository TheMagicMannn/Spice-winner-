import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { HeroPage } from '../pages/auth/HeroPage';
import { colors } from '../styles/common';

export type AuthStackParamList = {
  Hero: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.base100 },
      }}
    >
      <Stack.Screen name="Hero" component={HeroPage} />
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="Signup" component={SignupPage} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordPage} />
    </Stack.Navigator>
  );
};<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.base200,
        },
        headerTintColor: colors.textPrimary,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Hero" 
        component={HeroPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginPage}
        options={{ title: 'Login' }}
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupPage}
        options={{ title: 'Sign Up' }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordPage}
        options={{ title: 'Reset Password' }}
      />
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPasswordPage}
        options={{ title: 'Create New Password' }}
      />
    </Stack.Navigator>
  );
};