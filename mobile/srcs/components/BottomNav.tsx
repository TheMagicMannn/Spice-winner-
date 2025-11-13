import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, useSegments } from 'expo-router';
import { Users, Heart, Search, MessageSquare, User } from 'lucide-react-native';
import { spiceTheme } from '../styles/theme';

const navItems = [
  { icon: Search, label: 'Browse', path: '/' },
  { icon: Heart, label: 'Matches', path: '/matches' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: Users, label: 'Community', path: '/community' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const BottomNav: React.FC = () => {
  const segments = useSegments();
  const activePath = `/${segments[0] || ''}`;

  return (
    <View style={styles.navContainer}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePath === item.path;

        return (
          <Link key={item.path} href={item.path} style={styles.navItem}>
            <View style={styles.navItemContent}>
              <Icon color={isActive ? spiceTheme.colors.primary : spiceTheme.colors.text} size={24} />
              <Text style={[styles.navLabel, isActive && styles.activeLabel]}>{item.label}</Text>
            </View>
          </Link>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopWidth: 1,
    borderTopColor: spiceTheme.colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
  },
  navItem: {
    flex: 1,
  },
  navItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: spiceTheme.colors.text,
    marginTop: 4,
  },
  activeLabel: {
    color: spiceTheme.colors.primary,
  },
});
