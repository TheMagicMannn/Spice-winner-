import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Toast } from 'react-native-toast-message';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toast = useCallback(({ title, description, variant = 'info', duration = 3000 }: ToastOptions) => {
    const id = toastId++;
    
    const toastConfig = {
      text1: title,
      text2: description,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 50,
      bottomOffset: 40,
    };

    switch (variant) {
      case 'success':
        Toast.show({
          ...toastConfig,
          type: 'success',
        });
        break;
      case 'error':
        Toast.show({
          ...toastConfig,
          type: 'error',
        });
        break;
      case 'warning':
        Toast.show({
          ...toastConfig,
          type: 'warning',
        });
        break;
      default:
        Toast.show({
          ...toastConfig,
          type: 'info',
        });
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};<ToastContextType | undefined>(undefined);

let toastId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toast = useCallback(({ 
    title, 
    description, 
    variant = 'info', 
    duration = 3000 
  }: ToastOptions) => {
    const id = toastId++;
    
    const getToastType = () => {
      switch (variant) {
        case 'success':
          return 'success';
        case 'error':
          return 'error';
        case 'warning':
          return 'info'; // React Native Toast doesn't have warning type
        default:
          return 'info';
      }
    };

    Toast.show({
      type: getToastType(),
      text1: title,
      text2: description,
      visibilityTime: duration,
      position: 'top',
      topOffset: 50,
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};