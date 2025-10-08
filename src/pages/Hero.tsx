import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const headlineWords = [
  'Start',
  'your',
  'dating',
  'journey',
  'today',
];

const subtext =
  'Join thousands of adventurous singles\nand couples exploring connections in a\nsafe, premium environment.';

export const HeroPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Animation states
  const [showSubtext, setShowSubtext] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [logoScale, setLogoScale] = useState(1);
  const [headlineVisible, setHeadlineVisible] = useState<boolean[]>(new Array(headlineWords.length).fill(false));

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  useEffect(() => {
    // Logo pulse animation
    const logoInterval = setInterval(() => {
      setLogoScale(prev => prev === 1 ? 1.05 : 1);
    }, 1500);

    // Animate headline words
    headlineWords.forEach((_, i) => {
      setTimeout(() => {
        setHeadlineVisible(prev => {
          const newVisible = [...prev];
          newVisible[i] = true;
          return newVisible;
        });
      }, i * 100);
    });

    setTimeout(() => setShowSubtext(true), 1500);
    setTimeout(() => setShowButtons(true), 2000);
    setTimeout(() => setShowDisclaimer(true), 2500);

    return () => clearInterval(logoInterval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-100">
      {/* Background Image/Gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          // Using a gradient as a fallback for the missing image
          background: 'radial-gradient(ellipse at center, rgba(255,20,147,0.15) 0%, rgba(16,16,16,1) 70%)',
          filter: 'blur(2px)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-8 py-10">
        
        <div className="flex-1" />

        {/* SPICE Logo */}
        <div className="mb-6 text-center">
          <h1 
            className="text-6xl md:text-7xl font-bold mb-2 transition-transform duration-1500 ease-in-out"
            style={{ 
              transform: `scale(${logoScale})`,
              background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(255, 20, 147, 0.5)',
            }}
          >
            SPICE
          </h1>
          <div 
            className="w-24 h-1 mx-auto rounded-full"
            style={{
              background: 'linear-gradient(90deg, #ff1493, #ff69b4)',
              boxShadow: '0 0 10px rgba(255, 20, 147, 0.8)'
            }}
          />
        </div>

        {/* Headline */}
        <div className="flex flex-wrap justify-center mb-5">
          {headlineWords.map((word, index) => (
            <span
              key={index}
              className={`text-3xl md:text-4xl font-bold text-white mx-1 transition-all duration-500 ${
                headlineVisible[index] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-5'
              }`}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Subtext */}
        {showSubtext && (
          <p className="text-base text-white/80 text-center mb-10 leading-6 whitespace-pre-line animate-fade-in">
            {subtext}
          </p>
        )}

        {/* Buttons */}
        {showButtons && (
          <div className="w-full max-w-sm space-y-4 animate-fade-in">
            <AnimatedButton onClick={handleSignIn} text="Sign In" />
            <AnimatedButton onClick={handleSignUp} text="Sign Up" />
          </div>
        )}

        {/* Disclaimer Card */}
        {showDisclaimer && (
          <div className="bg-black/70 rounded-2xl border-2 border-pink-500/60 p-4 mt-10 max-w-sm shadow-lg shadow-pink-500/20 animate-fade-in">
            <div className="flex items-center mb-2">
              <span className="text-xl text-pink-400 mr-2">⚠️</span>
              <h3 className="font-bold text-base text-white">Adults Only Platform</h3>
            </div>
            <p className="text-xs text-white/70 text-center leading-4 mb-1">
              Premium lifestyle community for 18+ verified{'\n'}members only.
            </p>
            <p className="text-xs text-white/70 text-center leading-4">
              Your privacy and discretion are our top priorities.
            </p>
          </div>
        )}

        <div className="flex-[2]" />
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-glow {
          animation: glow 2.4s ease-in-out infinite;
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
      `}</style>
    </div>
  );
}

interface AnimatedButtonProps {
  onClick: () => void;
  text: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ onClick, text }) => {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 px-5 bg-gray-900 text-white font-bold text-lg rounded-full border-2 border-pink-500/50 transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/50 animate-glow"
    >
      {text}
    </button>
  );
};