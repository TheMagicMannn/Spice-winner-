import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/MainNavigator';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius } from '../../styles/common';
import { Ionicons } from '@expo/vector-icons';

type ProfileNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Profile'>;

interface Props {
  navigation: ProfileNavigationProp;
}

export const ProfilePage: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    setIsLoading(false);
  };

  const profile = user?.profile;

  const menuItems = [
    {
      icon: 'person-outline' as const,
      label: 'Edit Profile',
      onPress: () => navigation.navigate('UserProfile', { userId: user?.id || '' }),
    },
    {
      icon: 'settings-outline' as const,
      label: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'shield-checkmark-outline' as const,
      label: 'Verification',
      onPress: () => {},
    },
    {
      icon: 'card-outline' as const,
      label: 'Membership',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline' as const,
      label: 'Notifications',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline' as const,
      label: 'Help & Support',
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      icon: 'information-circle-outline' as const,
      label: 'About SPICE',
      onPress: () => navigation.navigate('AboutSpice'),
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.base100 }}>
      {/* Profile Header */}
      <View style={{
        backgroundColor: colors.base200,
        padding: spacing.lg,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.base300,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: spacing.md,
          borderWidth: 3,
          borderColor: colors.brandPrimary,
        }}>
          <Ionicons name="person" size={60} color={colors.textSecondary} />
        </View>
        
        <Text style={{
          fontSize: typography.xxl,
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: spacing.xs,
        }}>
          {profile?.displayName || 'Your Name'}
        </Text>
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        }}>
          {profile?.isVerified && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: `${colors.brandPrimary}20`,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: borderRadius.sm,
            }}>
              <Ionicons name="checkmark-circle" size={16} color={colors.brandPrimary} />
              <Text style={{
                color: colors.brandPrimary,
                fontSize: typography.xs,
                marginLeft: spacing.xs,
              }}>
                Verified
              </Text>
            </View>
          )}
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: `${colors.textSecondary}20`,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.sm,
          }}>
            <Ionicons name="star" size={16} color={colors.textSecondary} />
            <Text style={{
              color: colors.textSecondary,
              fontSize: typography.xs,
              marginLeft: spacing.xs,
            }}>
              {profile?.membershipTier?.toUpperCase() || 'BASIC'}
            </Text>
          </View>
        </View>

        {profile?.bio && (
          <Text style={{
            color: colors.textSecondary,
            fontSize: typography.sm,
            textAlign: 'center',
            marginTop: spacing.md,
            paddingHorizontal: spacing.lg,
          }}>
            {profile.bio}
          </Text>
        )}
      </View>

      {/* Stats */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.base200,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{
            fontSize: typography.xl,
            fontWeight: 'bold',
            color: colors.textPrimary,
          }}>
            --
          </Text>
          <Text style={{
            fontSize: typography.sm,
            color: colors.textSecondary,
          }}>
            Connections
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{
            fontSize: typography.xl,
            fontWeight: 'bold',
            color: colors.textPrimary,
          }}>
            --
          </Text>
          <Text style={{
            fontSize: typography.sm,
            color: colors.textSecondary,
          }}>
            Events
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{
            fontSize: typography.xl,
            fontWeight: 'bold',
            color: colors.textPrimary,
          }}>
            --
          </Text>
          <Text style={{
            fontSize: typography.sm,
            color: colors.textSecondary,
          }}>
            Messages
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={{ padding: spacing.md }}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.base200,
              padding: spacing.lg,
              borderRadius: borderRadius.md,
              marginBottom: spacing.sm,
            }}
            onPress={item.onPress}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={colors.textSecondary}
              style={{ marginRight: spacing.md }}
            />
            <Text style={{
              flex: 1,
              color: colors.textPrimary,
              fontSize: typography.base,
            }}>
              {item.label}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <Button
          onPress={handleLogout}
          isLoading={isLoading}
          variant="outline"
          style={{
            marginTop: spacing.lg,
            backgroundColor: colors.error + '20',
            borderColor: colors.error,
          }}
        >
          <Text style={{ color: colors.error, fontWeight: 'bold' }}>
            Log Out
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
};