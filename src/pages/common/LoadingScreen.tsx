import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../../styles/common';
import { commonStyles } from '../../styles/common';

export const LoadingScreen: React.FC = () => {
  return (
    <View style={[commonStyles.container, commonStyles.center]}>
      <ActivityIndicator size="large" color={colors.brandPrimary} />
      <Text style={{
        color: colors.textPrimary,
        fontSize: typography.base,
        marginTop: spacing.md,
        textAlign: 'center',
      }}>
        Loading SPICE...
      </Text>
    </View>
  );
};