import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../styles/common';
import { Toast } from 'react-native-toast-message';

const toastConfig = {
  success: (props: any) => (
    <View style={[styles.toastContainer, styles.successToast]}>
      <Ionicons name="checkmark-circle" size={24} color={colors.success} style={styles.icon} />
      <View style={styles.content}>
        <Text style={[styles.title, styles.successTitle]}>{props.text1}</Text>
        {props.text2 && <Text style={styles.message}>{props.text2}</Text>}
      </View>
    </View>
  ),
  
  error: (props: any) => (
    <View style={[styles.toastContainer, styles.errorToast]}>
      <Ionicons name="alert-circle" size={24} color={colors.error} style={styles.icon} />
      <View style={styles.content}>
        <Text style={[styles.title, styles.errorTitle]}>{props.text1}</Text>
        {props.text2 && <Text style={styles.message}>{props.text2}</Text>}
      </View>
    </View>
  ),
  
  warning: (props: any) => (
    <View style={[styles.toastContainer, styles.warningToast]}>
      <Ionicons name="warning" size={24} color={colors.warning} style={styles.icon} />
      <View style={styles.content}>
        <Text style={[styles.title, styles.warningTitle]}>{props.text1}</Text>
        {props.text2 && <Text style={styles.message}>{props.text2}</Text>}
      </View>
    </View>
  ),
  
  info: (props: any) => (
    <View style={[styles.toastContainer, styles.infoToast]}>
      <Ionicons name="information-circle" size={24} color={colors.info} style={styles.icon} />
      <View style={styles.content}>
        <Text style={[styles.title, styles.infoTitle]}>{props.text1}</Text>
        {props.text2 && <Text style={styles.message}>{props.text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    backgroundColor: colors.base200,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  
  successToast: {
    borderColor: colors.success,
    backgroundColor: colors.base100,
  },
  
  errorToast: {
    borderColor: colors.error,
    backgroundColor: colors.base100,
  },
  
  warningToast: {
    borderColor: colors.warning,
    backgroundColor: colors.base100,
  },
  
  infoToast: {
    borderColor: colors.info,
    backgroundColor: colors.base100,
  },
  
  icon: {
    marginRight: spacing.sm,
  },
  
  content: {
    flex: 1,
  },
  
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  
  successTitle: {
    color: colors.success,
  },
  
  errorTitle: {
    color: colors.error,
  },
  
  warningTitle: {
    color: colors.warning,
  },
  
  infoTitle: {
    color: colors.info,
  },
  
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toast config={toastConfig} />
    </>
  );
};