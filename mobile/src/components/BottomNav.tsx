import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Users, Heart, Search, MessageSquare, User } from 'lucide-react-native';

const navItems = [
  { icon: Users, label: 'Community', path: 'Community', testId: 'nav-community' },
  { icon: Heart, label: 'Matches', path: 'Matches', testId: 'nav-matches' },
  { icon: Search, label: 'Browse', path: 'Browse', testId: 'nav-browse' },
  { icon: MessageSquare, label: 'Messages', path: 'Messages', testId: 'nav-messages' },
  { icon: User, label: 'Profile', path: 'Profile', testId: 'nav-profile' },
];

export const BottomNav: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View style={styles.navContainer}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = route.name === item.path;

        return (
          <TouchableOpacity
            key={item.path}
            onPress={() => navigation.navigate(item.path)}
            style={styles.navItem}
            testID={item.testId}
          >
            <Icon color={isActive ? '#FF69B4' : '#FFFFFF'} size={24} />
            <Text style={[styles.navLabel, isActive && styles.activeLabel]}>{item.label}</Text>
          </TouchableOpacity>
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
    borderTopColor: 'rgba(255, 105, 180, 0.3)',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
  },
  activeLabel: {
    color: '#FF69B4',
  },
});
