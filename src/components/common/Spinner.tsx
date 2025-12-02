import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { colors, spacing } from '../../styles/common';

interface SpinnerProps {
  size?: 'small' | 'large' | number;
  color?: string;
  style?: any;
  overlay?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'small', 
  color = colors.brandPrimary, 
  style = {}, 
  overlay = false 
}) => {
  const { scale } = useResponsive();

  const getSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return size as number;
    }
  };

  if (overlay) {
    return (
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <ActivityIndicator size={getSize()} color={color} />
      </View>
    );
  }

  return (
    <View style={[commonStyles.center, style]}>
      <ActivityIndicator size={getSize()} color={color} />
    </View>
  );
};