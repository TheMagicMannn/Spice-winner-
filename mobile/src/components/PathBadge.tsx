import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Award, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PathBadgeProps {
  pathId: string;
  pathTitle: string;
  isEarned: boolean;
  earnedDate?: string;
}

const badgeDesigns: Record<string, { colors: string[]; icon: string }> = {
  'path-1': { colors: ['#3b82f6', '#06b6d4'], icon: '💬' },
  'path-2': { colors: ['#22c55e', '#10b981'], icon: '🛡️' },
  'path-3': { colors: ['#a855f7', '#ec4899'], icon: '❤️' },
};

export const PathBadge: React.FC<PathBadgeProps> = ({ pathId, pathTitle, isEarned }) => {
  const design = badgeDesigns[pathId] || badgeDesigns['path-1'];

  if (!isEarned) {
    return (
      <View style={styles.container}>
        <View style={[styles.badge, styles.lockedBadge]}>
          <Lock size={32} color="#a0a0a0" />
        </View>
        <Text style={[styles.title, styles.lockedTitle]}>{pathTitle}</Text>
        <Text style={styles.status}>Locked</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={design.colors} style={styles.badge}>
        <Text style={styles.icon}>{design.icon}</Text>
        <View style={styles.awardContainer}>
          <Award size={12} color="#ffffff" />
        </View>
      </LinearGradient>
      <Text style={styles.title}>{pathTitle}</Text>
      <Text style={[styles.status, styles.completedStatus]}>Completed ✓</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBadge: {
    backgroundColor: '#3a3a3a',
    opacity: 0.7,
  },
  icon: {
    fontSize: 40,
  },
  awardContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  title: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  lockedTitle: {
    color: '#a0a0a0',
  },
  status: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  completedStatus: {
    color: '#22c55e',
  },
});
