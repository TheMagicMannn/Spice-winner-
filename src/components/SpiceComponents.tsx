import React from 'react';
import { spiceTheme } from '../styles/theme';
import backgroundImage from '../images/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png';

// Logo component with Hero styling
export const SpiceLogo: React.FC<{ 
  className?: string; 
  showUnderline?: boolean;
}> = ({ 
  className = "text-6xl md:text-7xl", 
  showUnderline = true 
}) => {
  return (
    <div className="text-center">
      <h1 
        className={`${className} font-bold mb-2 transition-transform duration-1500 ease-in-out`}
        style={{ 
          background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 30px rgba(255, 20, 147, 0.5)',
        }}
      >
        SPICE
      </h1>
      {showUnderline && (
        <div 
          className="w-24 h-1 mx-auto rounded-full"
          style={{
            background: 'linear-gradient(90deg, #ff1493, #ff69b4)',
            boxShadow: '0 0 10px rgba(255, 20, 147, 0.8)'
          }}
        />
      )}
    </div>
  );
};

// Animated Button component from Hero.tsx
export const SpiceButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'gradient';
  className?: string;
  disabled?: boolean;
  'data-testid'?: string;
}> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '',
  disabled = false,
  'data-testid': dataTestId
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return spiceTheme.components.button.secondary;
      case 'gradient':
        return spiceTheme.components.button.gradient;
      default:
        return spiceTheme.components.button.primary;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
      className={`py-4 px-5 font-bold text-lg rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${className}`}
    >
      {children}
    </button>
  );
};

// Background wrapper component
export const SpiceBackground: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  showBackgroundImage?: boolean;
}> = ({ 
  children, 
  className = "min-h-screen", 
  showBackgroundImage = true 
}) => {
  return (
    <div className={`relative ${className} overflow-hidden bg-base-100`}>
      {/* Background Image/Gradient */}
      {showBackgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: 'blur(2px)',
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      {/* Fallback Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: showBackgroundImage 
            ? 'rgba(0,0,0,0.7)' 
            : 'radial-gradient(ellipse at center, rgba(255,20,147,0.15) 0%, rgba(16,16,16,1) 70%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};