import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'large', color = '#FF69B4' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
