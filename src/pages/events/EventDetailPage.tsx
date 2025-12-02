import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../styles/common';

interface Props {
  route: {
    params: {
      eventId: string;
    };
  };
}

export const EventDetailPage: React.FC<Props> = ({ route }) => {
  const { eventId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Details</Text>
      <Text style={styles.subtitle}>Event ID: {eventId}</Text>
      <Text style={styles.placeholder}>Event detail functionality coming soon...</Text>
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