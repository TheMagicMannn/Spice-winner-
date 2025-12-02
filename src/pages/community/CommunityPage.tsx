import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/MainNavigator';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography } from '../../styles/common';
import { Ionicons } from '@expo/vector-icons';

type CommunityNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Community'>;

interface Props {
  navigation: CommunityNavigationProp;
}

// Mock data for demonstration
const mockProfiles = [
  {
    id: '1',
    displayName: 'Alex & Sarah',
    age: 28,
    location: 'New York, NY',
    bio: 'Fun-loving couple looking to explore new adventures',
    avatar: null,
    isVerified: true,
    isOnline: true,
  },
  {
    id: '2',
    displayName: 'Jessica',
    age: 25,
    location: 'Los Angeles, CA',
    bio: 'Curious and ready to meet new people',
    avatar: null,
    isVerified: true,
    isOnline: false,
  },
  {
    id: '3',
    displayName: 'Mike & Jen',
    age: 32,
    location: 'Chicago, IL',
    bio: 'Experienced couple seeking like-minded friends',
    avatar: null,
    isVerified: false,
    isOnline: true,
  },
];

// Mock ProfileCard component for now
const ProfileCard: React.FC<{ profile: any; onPress: () => void }> = ({ profile, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: colors.base200,
      borderRadius: 12,
      padding: spacing.md,
      marginHorizontal: spacing.sm,
      marginVertical: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <View style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.base300,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    }}>
      <Ionicons name="person" size={30} color={colors.textSecondary} />
    </View>
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
        <Text style={{
          color: colors.textPrimary,
          fontSize: typography.lg,
          fontWeight: '600',
        }}>{profile.displayName}</Text>
        {profile.isVerified && <Ionicons name="checkmark-circle" size={16} color={colors.brandPrimary} style={{ marginLeft: spacing.xs }} />}
        {profile.isOnline && <View style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.success,
          marginLeft: spacing.sm,
        }} />}
      </View>
      <Text style={{
        color: colors.textSecondary,
        fontSize: typography.sm,
        marginBottom: spacing.xs,
      }}>{profile.age} • {profile.location}</Text>
      <Text style={{
        color: colors.textSecondary,
        fontSize: typography.sm,
      }} numberOfLines={2}>{profile.bio}</Text>
    </View>
  </TouchableOpacity>
);

export const CommunityPage: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'nearby' | 'online' | 'new'>('nearby');

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderProfileItem = ({ item }: any) => (
    <ProfileCard
      profile={item}
      onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
    />
  );

  const tabs = [
    { key: 'nearby', label: 'Nearby', icon: 'location' as const },
    { key: 'online', label: 'Online', icon: 'radio' as const },
    { key: 'new', label: 'New', icon: 'person-add' as const },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.base100 }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.base200,
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <Text style={{
          fontSize: typography.xxl,
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: spacing.sm,
        }}>
          Community
        </Text>
        
        <View style={{
          flexDirection: 'row',
          gap: spacing.sm,
        }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: 8,
                backgroundColor: activeTab === tab.key ? colors.brandPrimary : colors.base300,
              }}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={activeTab === tab.key ? '#FFFFFF' : colors.textSecondary}
                style={{ marginRight: spacing.xs }}
              />
              <Text style={{
                color: activeTab === tab.key ? '#FFFFFF' : colors.textSecondary,
                fontSize: typography.sm,
                fontWeight: '600',
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brandPrimary}
            colors={[colors.brandPrimary]}
          />
        }
        contentContainerStyle={{ padding: spacing.md }}
      >
        <FlatList
          data={mockProfiles}
          renderItem={renderProfileItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={() => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing.xxl,
            }}>
              <Ionicons name="people-outline" size={64} color={colors.textMuted} />
              <Text style={{
                color: colors.textSecondary,
                fontSize: typography.lg,
                marginTop: spacing.md,
                textAlign: 'center',
              }}>
                No profiles found
              </Text>
              <Text style={{
                color: colors.textMuted,
                fontSize: typography.sm,
                marginTop: spacing.xs,
                textAlign: 'center',
              }}>
                Try adjusting your filters or check back later
              </Text>
            </View>
          )}
        />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={{
        position: 'absolute',
        bottom: spacing.lg,
        right: spacing.lg,
      }}>
        <Button
          onPress={() => {}}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.brandPrimary,
          }}
        >
          <Ionicons name="filter" size={24} color="#FFFFFF" />
        </Button>
      </View>
    </View>
  );
};