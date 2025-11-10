import React from 'react';
import { Award, Lock } from 'lucide-react';

interface PathBadgeProps {
  pathId: string;
  pathTitle: string;
  isEarned: boolean;
  earnedDate?: string;
}

export const PathBadge: React.FC<PathBadgeProps> = ({ 
  pathId, 
  pathTitle, 
  isEarned,
  earnedDate 
}) => {
  const getBadgeDesign = (id: string) => {
    const designs: Record<string, { color: string; gradient: string; icon: string }> = {
      'path-1': {
        color: 'from-blue-500 to-cyan-500',
        gradient: 'from-blue-500/20 to-cyan-500/20',
        icon: '💬'
      },
      'path-2': {
        color: 'from-green-500 to-emerald-500',
        gradient: 'from-green-500/20 to-emerald-500/20',
        icon: '🛡️'
      },
      'path-3': {
        color: 'from-purple-500 to-pink-500',
        gradient: 'from-purple-500/20 to-pink-500/20',
        icon: '❤️'
      }
    };

    return designs[id] || designs['path-1'];
  };

  const design = getBadgeDesign(pathId);

  if (!isEarned) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-700 rounded-full opacity-50"></div>
          <Lock className="h-8 w-8 text-gray-500 z-10" />
        </div>
        <p className="text-white/40 text-sm mt-2 text-center">{pathTitle}</p>
        <p className="text-white/30 text-xs">Locked</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 flex items-center justify-center group cursor-pointer">
        {/* Outer glow ring */}
        <div className={`absolute inset-0 bg-gradient-to-br ${design.color} rounded-full animate-pulse`}></div>
        
        {/* Badge circle */}
        <div className={`absolute inset-2 bg-gradient-to-br ${design.gradient} border-2 border-current rounded-full flex items-center justify-center`}>
          <span className="text-4xl">{design.icon}</span>
        </div>

        {/* Achievement indicator */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
          <Award className="h-3 w-3 text-white" />
        </div>

        {/* Hover tooltip */}
        <div className="absolute bottom-full mb-2 hidden group-hover:block">
          <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap border border-pink-500/30">
            Earned on {earnedDate || 'Unknown'}
          </div>
        </div>
      </div>
      
      <p className="text-white font-semibold text-sm mt-2 text-center">{pathTitle}</p>
      <p className="text-green-400 text-xs">Completed ✓</p>
    </div>
  );
};
