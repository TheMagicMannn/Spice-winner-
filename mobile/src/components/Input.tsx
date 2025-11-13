import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

interface InputProps extends React.ComponentProps<typeof TextInput> {}

export const Input = React.forwardRef<TextInput, InputProps>(({ style, ...props }, ref) => {
  return (
    <View style={styles.container}>
      <TextInput
        ref={ref}
        style={[styles.input, style]}
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 20, 147, 0.5)',
    color: 'white',
    borderRadius: 10,
    padding: 15,
  },
});
