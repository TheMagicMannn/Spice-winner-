import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/MainNavigator';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius } from '../../styles/common';
import { Ionicons } from '@expo/vector-icons';

type EventsNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Events'>;

interface Props {
  navigation: EventsNavigationProp;
}

export const EventsPage: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'my'>('upcoming');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const mockEvents = [
    {
      id: '1',
      title: 'Weekend Mixer Party',
      date: 'Dec 15, 2024',
      time: '8:00 PM',
      location: 'New York, NY',
      attendees: 24,
      maxAttendees: 50,
      image: null,
    },
    {
      id: '2',
      title: 'Lifestyle Workshop',
      date: 'Dec 20, 2024',
      time: '2:00 PM',
      location: 'Los Angeles, CA',
      attendees: 12,
      maxAttendees: 30,
      image: null,
    },
  ];

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', icon: 'calendar' as const },
    { key: 'past', label: 'Past', icon: 'time' as const },
    { key: 'my', label: 'My Events', icon: 'person' as const },
  ];

  const EventCard: React.FC<{ event: any }> = ({ event }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      style={{
        backgroundColor: colors.base200,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginHorizontal: spacing.sm,
        marginVertical: spacing.xs,
      }}
    >
      <View style={{
        height: 120,
        backgroundColor: colors.base300,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Ionicons name="calendar" size={48} color={colors.textMuted} />
      </View>
      
      <View style={{ padding: spacing.md }}>
        <Text style={{
          fontSize: typography.lg,
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: spacing.sm,
        }}>
          {event.title}
        </Text>
        
        <View style={{ gap: spacing.xs, marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} style={{ marginRight: spacing.xs }} />
            <Text style={{ color: colors.textSecondary, fontSize: typography.sm }}>
              {event.date} at {event.time}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} style={{ marginRight: spacing.xs }} />
            <Text style={{ color: colors.textSecondary, fontSize: typography.sm }}>
              {event.location}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} style={{ marginRight: spacing.xs }} />
            <Text style={{ color: colors.textSecondary, fontSize: typography.sm }}>
              {event.attendees}/{event.maxAttendees} attending
            </Text>
          </View>
        </View>
        
        <Button size="small" style={{ width: '100%' }}>
          View Details
        </Button>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.base100 }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.base200,
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.sm,
        }}>
          <Text style={{
            fontSize: typography.xxl,
            fontWeight: 'bold',
            color: colors.textPrimary,
          }}>
            Events
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="add-circle-outline" size={24} color={colors.brandPrimary} />
          </TouchableOpacity>
        </View>
        
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
        {mockEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xxl,
        }}>
          <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
          <Text style={{
            color: colors.textSecondary,
            fontSize: typography.lg,
            marginTop: spacing.md,
            textAlign: 'center',
          }}>
            More events coming soon!
          </Text>
          <Button
            onPress={() => {}}
            style={{ marginTop: spacing.md }}
          >
            Create Event
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};