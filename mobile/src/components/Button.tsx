import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, style, isLoading, disabled, ...props }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, (disabled || isLoading) && styles.disabled]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : <Text style={styles.buttonText}>{children}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 18,
    backgroundColor: '#1a1a1a',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 20, 147, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
});
