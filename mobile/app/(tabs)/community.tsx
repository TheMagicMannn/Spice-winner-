import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CommunityPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Community Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
