import { createContext, useContext, ReactNode } from 'react';

// Simple toast interface compatible with uploaded pages
export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

const ToastContext = createContext<{
  toast: (props: Toast) => void;
} | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback to console for now
    return {
      toast: ({ title, description }: Toast) => {
        console.log('[Toast]', title, description);
        alert(`${title}${description ? '\n' + description : ''}`);
      }
    };
  }
  return context;
};

export const ToastContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toast = ({ title, description, variant, duration }: Toast) => {
    // Simple alert implementation for now
    console.log('[Toast]', { title, description, variant, duration });
    if (variant === 'destructive') {
      alert(`❌ ${title}${description ? '\n' + description : ''}`);
    } else {
      alert(`✓ ${title}${description ? '\n' + description : ''}`);
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  );
};
