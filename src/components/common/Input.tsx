import React, { useState } from 'react';
import { TextInput, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../hooks/useResponsive';
import { colors, spacing, borderRadius, commonStyles } from '../../styles/common';

interface InputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: any;
  icon?: keyof typeof Ionicons.glyphMap;
  onIconPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: 'default' | 'go' | 'google' | 'join' | 'next' | 'route' | 'search' | 'send' | 'yahoo' | 'done' | 'emergency-call';
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  error,
  label,
  helperText,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style = {},
  icon,
  onIconPress,
  onFocus,
  onBlur,
  onSubmitEditing,
  returnKeyType = 'default',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { scale } = useResponsive();

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const getInputStyles = () => {
    const baseStyle = {
      backgroundColor: colors.base200,
      borderRadius: borderRadius.md * scale,
      padding: spacing.md * scale,
      color: colors.textPrimary,
      fontSize: 16 * scale,
      borderWidth: 1,
      borderColor: error ? colors.error : (isFocused ? colors.brandPrimary : colors.border),
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      minHeight: 44 * scale,
    };

    if (multiline) {
      return {
        ...baseStyle,
        height: Math.max(44 * scale, numberOfLines * 24 * scale),
        textAlignVertical: 'top' as const,
      };
    }

    return baseStyle;
  };

  return (
    <View style={[{ width: '100%' }, style]}>
      {label && (
        <Text style={[
          commonStyles.caption,
          { 
            marginBottom: spacing.xs * scale,
            color: error ? colors.error : colors.textSecondary,
            fontWeight: '500',
          }
        ]}>
          {label}
        </Text>
      )}
      
      <View style={getInputStyles()}>
        {icon && (
          <Ionicons
            name={icon}
            size={20 * scale}
            color={colors.textSecondary}
            style={{ marginRight: spacing.sm * scale }}
          />
        )}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          style={{
            flex: 1,
            color: disabled ? colors.textMuted : colors.textPrimary,
            fontSize: 16 * scale,
            minHeight: 24 * scale,
          }}
          {...props}
        />
        
        {onIconPress && (
          <TouchableOpacity
            onPress={onIconPress}
            style={{ padding: spacing.xs * scale }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={secureTextEntry ? 'eye-off' : 'eye'}
              size={20 * scale}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[
          commonStyles.caption,
          { 
            marginTop: spacing.xs * scale,
            color: error ? colors.error : colors.textSecondary,
          }
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

// Re-export for convenience
export default Input;