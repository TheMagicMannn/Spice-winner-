import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';

export const Label: React.FC<TextProps> = ({ style, ...props }) => {
  return <Text style={[styles.label, style]} {...props} />;
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#b0b0b0',
    marginBottom: 8,
  },
});
