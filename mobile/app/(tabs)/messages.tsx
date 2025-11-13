import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { MessageService } from '../../src/services/messageService';
import { Spinner } from '../../src/components/Spinner';

const ConversationRow: React.FC<{ conversation: any, onPress: () => void }> = ({ conversation, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <View style={styles.avatarContainer}>
      <Image source={{ uri: conversation.photo || 'https://via.placeholder.com/150' }} style={styles.avatar} />
      {/* Add online indicator logic if available */}
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

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      MessageService.getConversations(user.id).then(data => {
        setConversations(data);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <Spinner />;

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
        {conversations.map(convo => (
          <ConversationRow
            key={convo.id}
            conversation={convo}
            onPress={() => router.push(`/chat?matchId=${convo.id}`)}
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
  rowText: { flex: 1, marginLeft: 16 },
  rowName: { color: 'white', fontWeight: 'bold' },
  rowMessage: { color: '#b0b0b0', marginTop: 4 },
  unreadBadge: { backgroundColor: '#FF69B4', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  unreadText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});
