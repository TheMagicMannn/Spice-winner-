import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

export const Input: React.FC<TextInputProps> = ({ style, ...props }) => {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor="#a0a0a0"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 16,
  },
});
