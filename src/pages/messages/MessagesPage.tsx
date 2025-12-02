import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/MainNavigator';
import { colors, spacing, typography } from '../../styles/common';
import { Ionicons } from '@expo/vector-icons';

type MessagesNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Messages'>;

interface Props {
  navigation: MessagesNavigationProp;
}

// Mock conversation data
const mockConversations = [
  {
    id: '1',
    name: 'Alex & Sarah',
    lastMessage: 'That sounds amazing! When are you free?',
    timestamp: '2 min ago',
    unreadCount: 2,
    isOnline: true,
    avatar: null,
  },
  {
    id: '2',
    name: 'Jessica',
    lastMessage: 'Thanks for the chat yesterday! 😊',
    timestamp: '1 hour ago',
    unreadCount: 0,
    isOnline: false,
    avatar: null,
  },
  {
    id: '3',
    name: 'Mike & Jen',
    lastMessage: 'Looking forward to meeting up!',
    timestamp: '3 hours ago',
    unreadCount: 1,
    isOnline: true,
    avatar: null,
  },
  {
    id: '4',
    name: 'Event Chat: Weekend Party',
    lastMessage: 'David: Count me in! 🎉',
    timestamp: '1 day ago',
    unreadCount: 15,
    isGroup: true,
    avatar: null,
  },
];

const ConversationItem: React.FC<{ 
  conversation: any; 
  onPress: () => void; 
}> = ({ conversation, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: colors.base200,
      padding: spacing.md,
      marginHorizontal: spacing.sm,
      marginVertical: spacing.xs,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <View style={{
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: conversation.isGroup ? colors.base300 : colors.brandPrimary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
      position: 'relative',
    }}>
      {conversation.isGroup ? (
        <Ionicons name="people" size={28} color="#FFFFFF" />
      ) : (
        <Ionicons name="person" size={28} color="#FFFFFF" />
      )}
      {conversation.isOnline && !conversation.isGroup && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: colors.success,
          borderWidth: 2,
          borderColor: colors.base200,
        }} />
      )}
    </View>
    
    <View style={{ flex: 1 }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
      }}>
        <Text style={{
          color: colors.textPrimary,
          fontSize: typography.lg,
          fontWeight: '600',
        }}>
          {conversation.name}
        </Text>
        <Text style={{
          color: colors.textMuted,
          fontSize: typography.xs,
        }}>
          {conversation.timestamp}
        </Text>
      </View>
      
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Text style={{
          color: colors.textSecondary,
          fontSize: typography.sm,
          flex: 1,
        }} numberOfLines={1}>
          {conversation.lastMessage}
        </Text>
        
        {conversation.unreadCount > 0 && (
          <View style={{
            backgroundColor: colors.brandPrimary,
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: spacing.sm,
          }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: typography.xs,
              fontWeight: 'bold',
            }}>
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export const MessagesPage: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'groups'>('all');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderConversationItem = ({ item }: any) => (
    <ConversationItem
      conversation={item}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
    />
  );

  const tabs = [
    { key: 'all', label: 'All', count: mockConversations.length },
    { key: 'unread', label: 'Unread', count: mockConversations.filter(c => c.unreadCount > 0).reduce((sum, c) => sum + c.unreadCount, 0) },
    { key: 'groups', label: 'Groups', count: mockConversations.filter(c => c.isGroup).length },
  ];

  const getFilteredConversations = () => {
    switch (activeTab) {
      case 'unread':
        return mockConversations.filter(c => c.unreadCount > 0);
      case 'groups':
        return mockConversations.filter(c => c.isGroup);
      default:
        return mockConversations;
    }
  };

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
            Messages
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="create-outline" size={24} color={colors.brandPrimary} />
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
              <Text style={{
                color: activeTab === tab.key ? '#FFFFFF' : colors.textSecondary,
                fontSize: typography.sm,
                fontWeight: '600',
              }}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={{
                  marginLeft: spacing.xs,
                  backgroundColor: activeTab === tab.key ? '#FFFFFF' : colors.brandPrimary,
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    color: activeTab === tab.key ? colors.brandPrimary : '#FFFFFF',
                    fontSize: typography.xs,
                    fontWeight: 'bold',
                  }}>
                    {tab.count > 99 ? '99+' : tab.count}
                  </Text>
                </View>
              )}
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
          data={getFilteredConversations()}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={() => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing.xxl,
            }}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.textMuted} />
              <Text style={{
                color: colors.textSecondary,
                fontSize: typography.lg,
                marginTop: spacing.md,
                textAlign: 'center',
              }}>
                No messages yet
              </Text>
              <Text style={{
                color: colors.textMuted,
                fontSize: typography.sm,
                marginTop: spacing.xs,
                textAlign: 'center',
              }}>
                Start a conversation with someone new!
              </Text>
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
};