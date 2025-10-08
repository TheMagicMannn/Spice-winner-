import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

type ToastVariant = 'success' | 'destructive' | 'default';

interface ToastMessage {
  id: number;
  title: string;
  description: string;
  variant: ToastVariant;
}

interface ToastOptions {
  title: string;
  description: string;
  variant?: ToastVariant;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);
const ToastsStateContext = createContext<ToastMessage[] | undefined>(undefined);

let toastId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: ToastOptions) => {
    const id = toastId++;
    setToasts((prevToasts) => [...prevToasts, { id, title, description, variant }]);
    
    // Automatically remove the toast after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastsStateContext.Provider value={toasts}>
        {children}
      </ToastsStateContext.Provider>
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

// Internal hook to get the toasts state
export const useToasts = (): ToastMessage[] => {
  const context = useContext(ToastsStateContext);
  if (!context) {
    throw new Error('useToasts must be used within a ToastProvider');
  }
  return context;
};