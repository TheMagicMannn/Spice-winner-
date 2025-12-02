import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/MainNavigator';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius } from '../../styles/common';
import { Ionicons } from '@expo/vector-icons';

type BrowseNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Browse'>;

interface Props {
  navigation: BrowseNavigationProp;
}

export const BrowsePage: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const browseCategories = [
    {
      title: 'New Members',
      description: 'Recently joined members',
      icon: 'person-add' as const,
      count: 156,
    },
    {
      title: 'Online Now',
      description: 'Members currently active',
      icon: 'radio' as const,
      count: 89,
    },
    {
      title: 'Verified Members',
      description: 'Profile verified members',
      icon: 'checkmark-circle' as const,
      count: 423,
    },
    {
      title: 'Nearby',
      description: 'Members in your area',
      icon: 'location' as const,
      count: 67,
    },
  ];

  const CategoryCard: React.FC<{ category: any }> = ({ category }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.base200,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginHorizontal: spacing.sm,
        marginVertical: spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={() => navigation.navigate('Community')}
    >
      <View style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.brandPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
      }}>
        <Ionicons name={category.icon} size={28} color="#FFFFFF" />
      </View>
      
      <View style={{ flex: 1 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xs,
        }}>
          <Text style={{
            fontSize: typography.lg,
            fontWeight: 'bold',
            color: colors.textPrimary,
          }}>
            {category.title}
          </Text>
          <View style={{
            backgroundColor: colors.base300,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.sm,
          }}>
            <Text style={{
              color: colors.textSecondary,
              fontSize: typography.xs,
              fontWeight: '600',
            }}>
              {category.count}
            </Text>
          </View>
        </View>
        
        <Text style={{
          color: colors.textSecondary,
          fontSize: typography.sm,
        }}>
          {category.description}
        </Text>
      </View>
      
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textMuted}
        style={{ marginLeft: spacing.sm }}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.base100 }}
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
      {/* Header */}
      <View style={{
        backgroundColor: colors.base200,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
      }}>
        <Text style={{
          fontSize: typography.xxl,
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: spacing.sm,
        }}>
          Discover
        </Text>
        <Text style={{
          color: colors.textSecondary,
          fontSize: typography.sm,
        }}>
          Explore and connect with like-minded members
        </Text>
      </View>

      {/* Categories */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{
          fontSize: typography.lg,
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: spacing.md,
          marginHorizontal: spacing.sm,
        }}>
          Browse by Category
        </Text>
        
        {browseCategories.map((category) => (
          <CategoryCard key={category.title} category={category} />
        ))}
      </View>

      {/* Quick Actions */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{
          fontSize: typography.lg,
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: spacing.md,
          marginHorizontal: spacing.sm,
        }}>
          Quick Actions
        </Text>
        
        <View style={{
          backgroundColor: colors.base200,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginHorizontal: spacing.sm,
          gap: spacing.md,
        }}>
          <Button
            onPress={() => navigation.navigate('Events')}
            icon="calendar-outline"
            iconPosition="left"
            style={{ backgroundColor: colors.base300 }}
          >
            Browse Events
          </Button>
          
          <Button
            onPress={() => navigation.navigate('Community')}
            icon="people-outline"
            iconPosition="left"
            style={{ backgroundColor: colors.base300 }}
          >
            Explore Community
          </Button>
          
          <Button
            onPress={() => {}}
            icon="sparkles-outline"
            iconPosition="left"
            style={{ backgroundColor: colors.base300 }}
          >
            Take Compatibility Quiz
          </Button>
        </View>
      </View>

      {/* Featured Members */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{
          fontSize: typography.lg,
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: spacing.md,
          marginHorizontal: spacing.sm,
        }}>
          Featured Members
        </Text>
        
        <View style={{
          backgroundColor: colors.base200,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginHorizontal: spacing.sm,
          alignItems: 'center',
        }}>
          <Ionicons name="star-outline" size={64} color={colors.brandPrimary} />
          <Text style={{
            fontSize: typography.lg,
            fontWeight: '600',
            color: colors.textPrimary,
            marginTop: spacing.md,
            textAlign: 'center',
          }}>
            Discover Amazing People
          </Text>
          <Text style={{
            color: colors.textSecondary,
            fontSize: typography.sm,
            textAlign: 'center',
            marginTop: spacing.sm,
            marginBottom: spacing.lg,
          }}>
            Connect with verified members in your area
          </Text>
          
          <Button onPress={() => navigation.navigate('Community')}>
            Start Browsing
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};