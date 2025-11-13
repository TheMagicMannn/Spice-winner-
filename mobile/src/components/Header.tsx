import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { useAuth } from '../hooks/useAuth'; // This will be implemented later

export const Header: React.FC = () => {
  // const { user, logout } = useAuth(); // Placeholder for authentication logic
  const user = { email: 'user@example.com' }; // Mock user for now
  const logout = () => console.log('Logout pressed'); // Mock logout function

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <Text style={styles.logo}>SPI App</Text>
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
    backgroundColor: '#f0f0f0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  email: {
    color: '#666666',
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
