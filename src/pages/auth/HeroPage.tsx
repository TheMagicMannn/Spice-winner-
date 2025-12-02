import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius } from '../../styles/common';
import { Ionicons } from '@expo/vector-icons';

type HeroPageNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Hero'>;

interface Props {
  navigation: HeroPageNavigationProp;
}

export const HeroPage: React.FC<Props> = ({ navigation }) => {
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.base100 }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Hero Section */}
      <LinearGradient
        colors={[colors.brandPrimary, colors.brandSecondary]}
        style={{
          padding: spacing.xxl,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60%',
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Text style={{
            fontSize: typography.huge * 1.5,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: spacing.md,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowRadius: 4,
          }}>
            SPICE
          </Text>
          <Text style={{
            fontSize: typography.lg,
            color: '#FFFFFF',
            textAlign: 'center',
            opacity: 0.9,
          }}>
            The Real Lifestyle Connection Community
          </Text>
        </View>

        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          width: '100%',
          alignItems: 'center',
        }}>
          <Ionicons name="people" size={48} color="#FFFFFF" />
          <Text style={{
            color: '#FFFFFF',
            fontSize: typography.lg,
            fontWeight: '600',
            marginTop: spacing.sm,
            textAlign: 'center',
          }}>
            Connect with Like-Minded Adults
          </Text>
          <Text style={{
            color: '#FFFFFF',
            fontSize: typography.sm,
            marginTop: spacing.xs,
            textAlign: 'center',
            opacity: 0.8,
          }}>
            Join thousands exploring their desires in a safe, discreet environment
          </Text>
        </View>
      </LinearGradient>

      {/* Features Section */}
      <View style={{ padding: spacing.xl, backgroundColor: colors.base100 }}>
        <Text style={{
          fontSize: typography.xxl,
          fontWeight: 'bold',
          color: colors.textPrimary,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}>
          Why Choose SPICE?
        </Text>

        <View style={{ gap: spacing.lg }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.base200,
            padding: spacing.lg,
            borderRadius: borderRadius.lg,
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.brandPrimary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.md,
            }}>
              <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: colors.textPrimary,
                fontSize: typography.lg,
                fontWeight: '600',
                marginBottom: spacing.xs,
              }}>
                Verified Members Only
              </Text>
              <Text style={{
                color: colors.textSecondary,
                fontSize: typography.sm,
              }}>
                All members are verified to ensure a safe and authentic community
              </Text>
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.base200,
            padding: spacing.lg,
            borderRadius: borderRadius.lg,
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.brandPrimary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.md,
            }}>
              <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: colors.textPrimary,
                fontSize: typography.lg,
                fontWeight: '600',
                marginBottom: spacing.xs,
              }}>
                Complete Privacy & Discretion
              </Text>
              <Text style={{
                color: colors.textSecondary,
                fontSize: typography.sm,
              }}>
                Your privacy is our priority with advanced security features
              </Text>
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.base200,
            padding: spacing.lg,
            borderRadius: borderRadius.lg,
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.brandPrimary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.md,
            }}>
              <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: colors.textPrimary,
                fontSize: typography.lg,
                fontWeight: '600',
                marginBottom: spacing.xs,
              }}>
                Explore Your Desires
              </Text>
              <Text style={{
                color: colors.textSecondary,
                fontSize: typography.sm,
              }}>
                Open-minded community welcoming all lifestyles and preferences
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={{
        padding: spacing.xl,
        backgroundColor: colors.base200,
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: typography.xl,
          fontWeight: 'bold',
          color: colors.textPrimary,
          textAlign: 'center',
          marginBottom: spacing.md,
        }}>
          Ready to Join the Adventure?
        </Text>
        <Text style={{
          fontSize: typography.sm,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}>
          Connect with thousands of open-minded adults exploring their fantasies
        </Text>

        <View style={{ width: '100%', gap: spacing.md }}>
          <Button
            onPress={handleSignup}
            size="large"
            style={{ width: '100%' }}
          >
            Create Free Account
          </Button>
          
          <TouchableOpacity onPress={handleLogin}>
            <Text style={{
              color: colors.brandPrimary,
              fontSize: typography.sm,
              textAlign: 'center',
              fontWeight: '600',
            }}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{
          marginTop: spacing.xl,
          padding: spacing.md,
          backgroundColor: colors.base100,
          borderRadius: borderRadius.md,
          width: '100%',
        }}>
          <Text style={{
            color: colors.brandPrimary,
            fontSize: typography.sm,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: spacing.xs,
          }}>
            🔒 18+ Adults Only
          </Text>
          <Text style={{
            color: colors.textSecondary,
            fontSize: typography.xs,
            textAlign: 'center',
            lineHeight: 16,
          }}>
            By continuing, you confirm you are 18+ and agree to our terms of service and community guidelines.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};