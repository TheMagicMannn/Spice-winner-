import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useResponsive } from '../../hooks/useResponsive';
import { colors, spacing, borderRadius, shadows, commonStyles } from '../../styles/common';

interface ButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  isLoading = false, 
  children, 
  variant = 'primary',
  size = 'medium',
  onPress,
  style = {},
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false
}) => {
  const { scale } = useResponsive();
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.xs * scale,
          paddingHorizontal: spacing.sm * scale,
          minHeight: 36 * scale,
        };
      case 'large':
        return {
          paddingVertical: spacing.md * scale,
          paddingHorizontal: spacing.lg * scale,
          minHeight: 52 * scale,
        };
      default:
        return {
          paddingVertical: spacing.sm * scale,
          paddingHorizontal: spacing.md * scale,
          minHeight: 44 * scale,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14 * scale;
      case 'large':
        return 18 * scale;
      default:
        return 16 * scale;
    }
  };

  const baseStyles = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: borderRadius.md * scale,
    ...getSizeStyles(),
    ...(fullWidth ? { width: '100%' } : {}),
  };

  const ButtonContent = () => (
    <View style={commonStyles.row}>
      {icon && iconPosition === 'left' && (
        <View style={{ marginRight: spacing.sm * scale }}>
          {icon}
        </View>
      )}
      
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : colors.textPrimary} 
        />
      ) : (
        <Text style={{
          color: getTextColor(),
          fontWeight: 'bold',
          fontSize: getTextSize(),
          textAlign: 'center',
        }}>
          {children}
        </Text>
      )}
      
      {icon && iconPosition === 'right' && (
        <View style={{ marginLeft: spacing.sm * scale }}>
          {icon}
        </View>
      )}
    </View>
  );

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    if (variant === 'primary' || variant === 'secondary') return '#FFFFFF';
    return colors.textPrimary;
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.base300;
    if (variant === 'secondary') return colors.base300;
    if (variant === 'ghost') return 'transparent';
    return colors.brandPrimary;
  };

  const getBorderColor = () => {
    if (variant === 'outline') return colors.border;
    return 'transparent';
  };

  const disabledStyles = disabled ? {
    opacity: 0.5,
  } : {};

  // Primary gradient button
  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={[baseStyles, style, shadows.md]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.brandPrimary, colors.brandSecondary]}
          style={[baseStyles, style, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <ButtonContent />
        </LinearGradient>
        <View style={{ position: 'absolute' }}>
          <ButtonContent />
        </View>
      </TouchableOpacity>
    );
  }

  // Other variants
  return (
    <TouchableOpacity
      style={[
        baseStyles, 
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor: getBorderColor(),
        },
        disabledStyles,
        style,
        variant !== 'ghost' ? shadows.sm : {}
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={variant === 'ghost' ? 0.5 : 0.7}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};