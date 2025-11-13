import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

export const Textarea: React.FC<TextInputProps> = ({ style, ...props }) => {
  return (
    <TextInput
      style={[styles.textarea, style]}
      placeholderTextColor="#a0a0a0"
      multiline
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  textarea: {
    width: '100%',
    minHeight: 100,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 16,
    textAlignVertical: 'top',
  },
});
