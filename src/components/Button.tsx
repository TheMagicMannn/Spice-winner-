import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ isLoading = false, children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = 'flex items-center justify-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 transition-all duration-200 ease-in-out';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white focus:ring-brand-primary',
    outline: 'bg-transparent border-2 border-base-300 text-text-primary hover:bg-base-300 focus:ring-text-secondary'
  };

  const disabledClasses = 'bg-base-300 text-text-secondary cursor-not-allowed opacity-50';

  return (
    <button
      className={`${baseClasses} ${props.disabled || isLoading ? disabledClasses : variantClasses[variant]} ${className}`}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};