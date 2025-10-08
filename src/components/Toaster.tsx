import React from 'react';
import { useToasts } from '../hooks/useToast';

export const Toaster: React.FC = () => {
    const toasts = useToasts();
    
    const variantClasses = {
        default: 'bg-base-300 border-base-300 text-text-primary',
        destructive: 'bg-red-900/50 border-red-500/50 text-red-100',
        success: 'bg-green-900/50 border-green-500/50 text-green-100',
    };

    return (
        <div className="fixed top-4 right-4 w-full max-w-sm space-y-2 z-50">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`w-full p-4 rounded-lg shadow-lg border animate-fade-in ${variantClasses[toast.variant]}`}
                    role="alert"
                >
                    <div className="flex items-start">
                        <div className="flex-1">
                            <p className="font-bold">{toast.title}</p>
                            <p className="text-sm">{toast.description}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};