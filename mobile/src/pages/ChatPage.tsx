import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { Send, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const mockMessages = [
  { id: '1', content: 'Hey!', senderId: 'user1', createdAt: new Date() },
  { id: '2', content: 'Hi there!', senderId: 'user2', createdAt: new Date() },
  { id: '3', content: 'How are you?', senderId: 'user1', createdAt: new Date() },
];

const MessageBubble: React.FC<{ message: any; isMine: boolean }> = ({ message, isMine }) => (
  <View style={[styles.messageRow, isMine ? styles.myMessageRow : styles.theirMessageRow]}>
    <View style={[styles.messageBubble, isMine ? styles.myMessageBubble : styles.theirMessageBubble]}>
      <Text style={styles.messageText}>{message.content}</Text>
    </View>
  </View>
);

export const ChatPage: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState('');
  const myUserId = 'user1'; // Mock my user ID

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: (messages.length + 1).toString(),
        content: inputText,
        senderId: myUserId,
        createdAt: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <Image source={{ uri: 'https://randomuser.me/api/portraits/women/2.jpg' }} style={styles.headerAvatar} />
        <Text style={styles.headerName}>Alice</Text>
      </View>

      {/* Message List */}
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} isMine={item.senderId === myUserId} />}
        keyExtractor={item => item.id}
        style={styles.messageList}
        inverted // To show latest messages at the bottom
      />

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#a0a0a0"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Send color="white" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,105,180,0.3)',
    backgroundColor: '#2a2a2a'
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 12 },
  headerName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  messageList: { flex: 1, paddingHorizontal: 16 },
  messageRow: { flexDirection: 'row', marginVertical: 4 },
  myMessageRow: { justifyContent: 'flex-end' },
  theirMessageRow: { justifyContent: 'flex-start' },
  messageBubble: { padding: 12, borderRadius: 20, maxWidth: '70%' },
  myMessageBubble: { backgroundColor: '#FF69B4' },
  theirMessageBubble: { backgroundColor: '#3a3a3a' },
  messageText: { color: 'white', fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,105,180,0.3)',
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: 'white',
    marginRight: 8,
  },
  sendButton: { padding: 8 },
});
