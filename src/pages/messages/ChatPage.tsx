import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../styles/common';

interface Props {
  route: {
    params: {
      conversationId: string;
    };
  };
}

export const ChatPage: React.FC<Props> = ({ route }) => {
  const { conversationId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <Text style={styles.subtitle}>Conversation ID: {conversationId}</Text>
      <Text style={styles.placeholder}>Chat functionality coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  placeholder: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});