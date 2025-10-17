// Shared theme system based on Hero.tsx design
import backgroundImage from '../images/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png';

export const spiceTheme = {
  // Color palette from Hero.tsx
  colors: {
    primary: {
      pink: '#ff1493',      // Deep Pink
      lightPink: '#ff69b4', // Hot Pink  
      softPink: '#ff91a4',  // Light Pink
      pinkRgba: 'rgba(255, 20, 147, 0.5)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
      background: 'radial-gradient(ellipse at center, rgba(255,20,147,0.15) 0%, rgba(16,16,16,1) 70%)',
      button: 'linear-gradient(90deg, #ff1493, #ff69b4)'
    },
    background: {
      dark: 'bg-gradient-to-b from-gray-900 via-black to-black',
      card: 'bg-black/50',
      overlay: 'bg-black/70'
    }
  },

  // Animation classes from Hero.tsx
  animations: {
    fadeIn: 'animate-fade-in',
    glow: 'animate-glow',
    pulse: 'animate-pulse'
  },

  // Background image
  backgroundImage,

  // Common component styles
  components: {
    // Header style consistent across pages
    header: 'sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4 flex-shrink-0',
    
    // Card styles with Hero theme
    card: 'bg-black/50 border-pink-500/30 hover:border-pink-500/60 transition-all duration-300',
    
    // Button styles matching Hero.tsx AnimatedButton
    button: {
      primary: 'bg-gray-900 text-white font-bold rounded-full border-2 border-pink-500/50 transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/50 animate-glow',
      secondary: 'border-pink-500/50 text-pink-400 hover:bg-pink-500/10 transition-all duration-300',
      gradient: 'bg-pink-600 hover:bg-pink-700 text-white transition-all duration-300'
    },

    // Text styles with gradients  
    text: {
      logo: 'font-bold transition-transform duration-1500 ease-in-out',
      gradient: 'bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent',
      title: 'text-white font-bold',
      subtitle: 'text-white/70'
    },

    // Badge styles
    badge: {
      verified: 'bg-blue-500/90 text-white border-0',
      premium: 'bg-yellow-500/90 text-black border-0',
      online: 'bg-green-500/90 text-white border-0',
      pink: 'bg-pink-500/20 text-pink-400 border-pink-500/50'
    }
  }
};

// CSS animations from Hero.tsx
export const themeStyles = `
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .animate-glow {
    animation: glow 2.4s ease-in-out infinite;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 8px rgba(255, 20, 147, 0.5);
      border-color: rgba(255, 20, 147, 0.5);
    }
    50% {
      box-shadow: 0 0 16px rgba(255, 20, 147, 1);
      border-color: rgba(255, 20, 147, 1);
    }
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Logo component with Hero styling
export const SpiceLogo: React.FC<{ className?: string; showUnderline?: boolean }> = ({ 
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

export default spiceTheme;