import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  isLoading = false,
  disabled = false,
  variant = 'primary',
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return [styles.base, styles.primary];
      case 'outline':
        return [styles.base, styles.outline];
      default:
        return [styles.base, styles.primary];
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return [styles.text, styles.primaryText];
      case 'outline':
        return [styles.text, styles.outlineText];
      default:
        return [styles.text, styles.primaryText];
    }
  };

  const buttonStyles = getButtonStyles();
  const textStyles = getTextStyles();

  if (disabled || isLoading) {
    buttonStyles.push(styles.disabled);
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={textStyles}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    transition: 'all 0.2s ease-in-out',
  },
  primary: {
    backgroundColor: '#FF69B4', // Gradient approximation
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#333333',
  },
  disabled: {
    backgroundColor: '#cccccc',
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryText: {
    color: '#ffffff',
  },
  outlineText: {
    color: '#333333',
  },
});
