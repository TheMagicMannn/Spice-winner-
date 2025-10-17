import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Heart, Search, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Users, label: 'Community', path: '/community', testId: 'nav-community' },
  { icon: Heart, label: 'Matches', path: '/matches', testId: 'nav-matches' },
  { icon: Search, label: 'Browse', path: '/browse', testId: 'nav-browse' },
  { icon: MessageSquare, label: 'Messages', path: '/messages', testId: 'nav-messages' },
  { icon: User, label: 'Profile', path: '/profile', testId: 'nav-profile' },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-pink-500/30">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive
                  ? "text-pink-400"
                  : "text-white/60 hover:text-white/80"
              )}
              data-testid={item.testId}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-pink-400/20")} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
