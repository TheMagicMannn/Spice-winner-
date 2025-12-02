import React, { useState } from 'react';
import { View, Text, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { colors, spacing, typography, borderRadius } from '../../styles/common';
import { Ionicons } from '@expo/vector-icons';

type LoginPageNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginPageNavigationProp;
}

export const LoginPage: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both email and password',
        variant: 'error',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await login(email, password);
    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'error',
      });
    }
    // On success, the useAuth hook will handle navigation.
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/splash.png')}
      style={{
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
      }}
      blurRadius={2}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
      }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          <View style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: borderRadius.xl,
            padding: spacing.xl,
            borderWidth: 2,
            borderColor: `${colors.brandPrimary}60`,
            shadowColor: colors.brandPrimary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}>
            {/* Logo and Header */}
            <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
              <Text style={{
                fontSize: typography.xxxl,
                fontWeight: 'bold',
                color: colors.textPrimary,
                marginBottom: spacing.md,
                textAlign: 'center',
                // Gradient text effect (simulated)
                textShadowColor: colors.brandPrimary,
                textShadowRadius: 10,
              }}>
                SPICE
              </Text>
              <View style={{
                width: 64,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.brandPrimary,
                marginBottom: spacing.lg,
                shadowColor: colors.brandPrimary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
                elevation: 4,
              }} />
              <Text style={{
                fontSize: typography.xl,
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing.sm,
              }}>
                Welcome Back
              </Text>
              <Text style={{
                fontSize: typography.sm,
                color: colors.textSecondary,
                textAlign: 'center',
              }}>
                Sign in to continue your journey
              </Text>
            </View>

            {/* Form */}
            <View style={{ gap: spacing.lg }}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                icon="mail"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
              />

              <View style={{ gap: spacing.xs }}>
                <Text style={{
                  color: colors.textPrimary,
                  fontSize: typography.sm,
                  fontWeight: '500',
                  marginBottom: spacing.xs,
                }}>
                  Password
                </Text>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  icon="lock"
                  onIconPress={() => setShowPassword(!showPassword)}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  }}
                />
              </View>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                  }}
                  onPress={() => {}}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderRadius: 4,
                  }} />
                  <Text style={{
                    color: colors.textSecondary,
                    fontSize: typography.sm,
                  }}>
                    Remember me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={{
                    color: colors.brandPrimary,
                    fontSize: typography.sm,
                  }}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                onPress={handleSubmit}
                isLoading={isLoading}
                disabled={!email || !password}
                size="large"
                style={{
                  backgroundColor: colors.base100,
                  borderWidth: 2,
                  borderColor: `${colors.brandPrimary}80`,
                  minHeight: 56,
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: spacing.md,
              }}>
                <View style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: `${colors.brandPrimary}30`,
                }} />
                <Text style={{
                  color: colors.textSecondary,
                  fontSize: typography.sm,
                  paddingHorizontal: spacing.md,
                }}>
                  Or
                </Text>
                <View style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: `${colors.brandPrimary}30`,
                }} />
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  color: colors.textSecondary,
                  fontSize: typography.sm,
                }}>
                  New to SPICE?{' '}
                </Text>
                <TouchableOpacity onPress={handleSignup}>
                  <Text style={{
                    color: colors.brandPrimary,
                    fontSize: typography.sm,
                    fontWeight: '600',
                  }}>
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={{
              marginTop: spacing.xl,
              paddingTop: spacing.lg,
              borderTopWidth: 1,
              borderTopColor: `${colors.brandPrimary}30`,
              alignItems: 'center',
            }}>
              <Text style={{
                color: colors.brandPrimary,
                fontSize: typography.sm,
                fontWeight: '600',
                marginBottom: spacing.sm,
              }}>
                🔒 Adults Only Platform
              </Text>
              <Text style={{
                color: colors.textSecondary,
                fontSize: typography.xs,
                textAlign: 'center',
                lineHeight: 18,
              }}>
                Premium lifestyle community for 18+ verified members only. 
                Your privacy and discretion are our top priorities.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};<AuthStackParamList, 'Login'>;

interface LoginPageProps {
  navigation: LoginPageNavigationProp;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigation }) => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both email and password',
        variant: 'error',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await login(email, password);
    if (error) {
      toast({ 
        title: 'Login Failed', 
        description: error.message, 
        variant: 'error',
      });
    }
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('Signup');
  };

  return (