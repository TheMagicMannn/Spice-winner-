import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Plus } from 'lucide-react-native';

const mockConversations = [
  { id: '1', name: 'Alice', photo: 'https://randomuser.me/api/portraits/women/1.jpg', lastMessage: 'Hey, how are you?', unreadCount: 2, isOnline: true },
  { id: '2', name: 'Bob', photo: 'https://randomuser.me/api/portraits/men/2.jpg', lastMessage: 'Let\'s catch up soon!', unreadCount: 0, isOnline: false },
  { id: '3', name: 'Group Chat', photo: '', lastMessage: 'Sounds good!', unreadCount: 5, isOnline: false, isGroup: true },
];

const ConversationRow: React.FC<{ conversation: any, onPress: () => void }> = ({ conversation, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <View style={styles.avatarContainer}>
      <Image source={{ uri: conversation.photo || 'https://via.placeholder.com/150' }} style={styles.avatar} />
      {conversation.isOnline && <View style={styles.onlineIndicator} />}
    </View>
    <View style={styles.rowText}>
      <Text style={styles.rowName}>{conversation.name}</Text>
      <Text style={styles.rowMessage}>{conversation.lastMessage}</Text>
    </View>
    {conversation.unreadCount > 0 && (
      <View style={styles.unreadBadge}>
        <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
      </View>
    )}
  </TouchableOpacity>
);

export const MessagesPage: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity>
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      {/* Conversation List */}
      <ScrollView>
        {mockConversations.map(convo => (
          <ConversationRow
            key={convo.id}
            conversation={convo}
            onPress={() => console.log('Navigate to chat with', convo.name)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,105,180,0.3)' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  onlineIndicator: { position: 'absolute', bottom: 0, right: 0, width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#2ecc71', borderWidth: 2, borderColor: '#1a1a1a' },
  rowText: { flex: 1, marginLeft: 16 },
  rowName: { color: 'white', fontWeight: 'bold' },
  rowMessage: { color: '#b0b0b0', marginTop: 4 },
  unreadBadge: { backgroundColor: '#FF69B4', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  unreadText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});
