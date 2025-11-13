import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { spiceTheme } from '../styles/theme';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <Text style={styles.logo}>SPICE</Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.email}>{user.email}</Text>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: spiceTheme.colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: spiceTheme.colors.border,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: spiceTheme.colors.primary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  email: {
    color: spiceTheme.colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: spiceTheme.colors.text,
    fontWeight: 'bold',
  },
});
