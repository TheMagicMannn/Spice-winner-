import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme } from '@/styles/theme';
import { ModuleContent } from '@/components/ModuleContent';
import { ModuleQuiz } from '@/components/ModuleQuiz';
import { PathBadge } from '@/components/PathBadge';
import { useAuth } from '@/hooks/useAuth';
import { learningService, ModuleProgress } from '@/services/learningService';
import { 
  BookOpen, 
  CheckCircle, 
  Lock, 
  ArrowLeft, 
  Play,
  Award,
  TrendingUp,
  Target,
  Clock
} from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'locked';
  progress: number;
  category: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  totalModules: number;
  completedModules: number;
  modules: LearningModule[];
}

export const LearningJourneyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<ModuleProgress[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [showModuleContent, setShowModuleContent] = useState(false);
  const [showModuleQuiz, setShowModuleQuiz] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock learning paths data
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([
    {
      id: 'path-1',
      title: 'Communication Fundamentals',
      description: 'Master effective communication in relationships and lifestyle dynamics',
      totalModules: 6,
      completedModules: 2,
      modules: [
        {
          id: 'mod-1',
          title: 'Introduction to Lifestyle Communication',
          description: 'Learn the basics of open and honest communication',
          duration: '15 min',
          status: 'completed',
          progress: 100,
          category: 'Communication'
        },
        {
          id: 'mod-2',
          title: 'Setting Boundaries',
          description: 'Understand how to establish and respect boundaries',
          duration: '20 min',
          status: 'completed',
          progress: 100,
          category: 'Communication'
        },
        {
          id: 'mod-3',
          title: 'Consent and Negotiation',
          description: 'Essential skills for healthy interactions',
          duration: '25 min',
          status: 'in-progress',
          progress: 45,
          category: 'Communication'
        },
        {
          id: 'mod-4',
          title: 'Difficult Conversations',
          description: 'Navigate challenging discussions with confidence',
          duration: '30 min',
          status: 'locked',
          progress: 0,
          category: 'Communication'
        },
        {
          id: 'mod-5',
          title: 'Active Listening',
          description: 'Enhance your listening skills for deeper connections',
          duration: '15 min',
          status: 'locked',
          progress: 0,
          category: 'Communication'
        },
        {
          id: 'mod-6',
          title: 'Communication Mastery',
          description: 'Advanced techniques for lifestyle communication',
          duration: '35 min',
          status: 'locked',
          progress: 0,
          category: 'Communication'
        }
      ]
    },
    {
      id: 'path-2',
      title: 'Safety & Privacy',
      description: 'Essential knowledge for maintaining privacy and safety in the lifestyle',
      totalModules: 5,
      completedModules: 0,
      modules: [
        {
          id: 'mod-7',
          title: 'Digital Privacy Basics',
          description: 'Protect your online identity and information',
          duration: '20 min',
          status: 'locked',
          progress: 0,
          category: 'Safety'
        },
        {
          id: 'mod-8',
          title: 'Meeting Safely',
          description: 'Best practices for safe first meetings',
          duration: '25 min',
          status: 'locked',
          progress: 0,
          category: 'Safety'
        },
        {
          id: 'mod-9',
          title: 'Red Flags & Warning Signs',
          description: 'Identify potentially unsafe situations',
          duration: '20 min',
          status: 'locked',
          progress: 0,
          category: 'Safety'
        },
        {
          id: 'mod-10',
          title: 'Physical Safety Protocols',
          description: 'Essential safety measures for lifestyle encounters',
          duration: '30 min',
          status: 'locked',
          progress: 0,
          category: 'Safety'
        },
        {
          id: 'mod-11',
          title: 'Community Safety Standards',
          description: 'Understanding community guidelines and expectations',
          duration: '15 min',
          status: 'locked',
          progress: 0,
          category: 'Safety'
        }
      ]
    },
    {
      id: 'path-3',
      title: 'Relationship Dynamics',
      description: 'Navigate various relationship structures in the lifestyle community',
      totalModules: 4,
      completedModules: 1,
      modules: [
        {
          id: 'mod-12',
          title: 'Understanding Relationship Types',
          description: 'Explore different relationship structures',
          duration: '20 min',
          status: 'completed',
          progress: 100,
          category: 'Relationships'
        },
        {
          id: 'mod-13',
          title: 'Polyamory Fundamentals',
          description: 'Introduction to ethical non-monogamy',
          duration: '30 min',
          status: 'locked',
          progress: 0,
          category: 'Relationships'
        },
        {
          id: 'mod-14',
          title: 'Managing Jealousy',
          description: 'Healthy approaches to complex emotions',
          duration: '25 min',
          status: 'locked',
          progress: 0,
          category: 'Relationships'
        },
        {
          id: 'mod-15',
          title: 'Building Trust',
          description: 'Foundation of strong lifestyle relationships',
          duration: '20 min',
          status: 'locked',
          progress: 0,
          category: 'Relationships'
        }
      ]
    }
  ]);

  const totalProgress = learningPaths.reduce((acc, path) => {
    return acc + (path.completedModules / path.totalModules * 100);
  }, 0) / learningPaths.length;

  const totalCompleted = learningPaths.reduce((acc, path) => acc + path.completedModules, 0);
  const totalModules = learningPaths.reduce((acc, path) => acc + path.totalModules, 0);

  const handleModuleClick = (module: LearningModule) => {
    if (module.status === 'locked') {
      return;
    }
    // Navigate to module content or open modal
    console.log('Opening module:', module.title);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'in-progress':
        return <Play className="h-5 w-5 text-pink-400" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <SpiceBackground className="min-h-screen pb-20">
      {/* Header */}
      <div className={spiceTheme.components.header}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="text-white hover:text-pink-400 transition-colors"
            data-testid="back-to-profile"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className={`text-2xl ${spiceTheme.components.text.title} mb-1`}>
              My Learning Journey
            </h1>
            <p className={spiceTheme.components.text.subtitle}>
              Expand your knowledge and grow in the lifestyle
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Overall Progress Card */}
        <Card className={`${spiceTheme.components.card} animate-fade-in`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-500/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Overall Progress</h3>
                  <p className="text-white/60 text-sm">{totalCompleted} of {totalModules} modules completed</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-pink-400">{Math.round(totalProgress)}%</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-pink-400" />
                </div>
                <div className="text-2xl font-bold text-white">{learningPaths.length}</div>
                <div className="text-xs text-white/60">Active Paths</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">{totalCompleted}</div>
                <div className="text-xs text-white/60">Completed</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white">{totalModules - totalCompleted}</div>
                <div className="text-xs text-white/60">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Paths */}
        {learningPaths.map((path) => (
          <Card 
            key={path.id} 
            className={`${spiceTheme.components.card} animate-fade-in`}
            data-testid={`learning-path-${path.id}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-xl mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-pink-400" />
                    {path.title}
                  </CardTitle>
                  <p className="text-white/70 text-sm mb-3">{path.description}</p>
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span>{path.completedModules}/{path.totalModules} modules</span>
                    <span>•</span>
                    <span>{Math.round((path.completedModules / path.totalModules) * 100)}% complete</span>
                  </div>
                </div>
              </div>
              
              {/* Path Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(path.completedModules / path.totalModules) * 100}%` }}
                />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {path.modules.map((module, index) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module)}
                  disabled={module.status === 'locked'}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    module.status === 'locked'
                      ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-pink-500/50'
                  }`}
                  data-testid={`module-${module.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getStatusIcon(module.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-semibold">
                          {index + 1}. {module.title}
                        </h4>
                        <Badge 
                          className={
                            module.status === 'completed' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : module.status === 'in-progress'
                              ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }
                        >
                          {module.status === 'completed' ? 'Completed' : 
                           module.status === 'in-progress' ? 'In Progress' : 'Locked'}
                        </Badge>
                      </div>
                      <p className="text-white/70 text-sm mb-2">{module.description}</p>
                      <div className="flex items-center text-xs text-white/60">
                        <Clock className="h-3 w-3 mr-1" />
                        {module.duration}
                      </div>
                      
                      {/* Module Progress Bar for in-progress items */}
                      {module.status === 'in-progress' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-pink-500 to-pink-600 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Motivational Card */}
        <Card className={`${spiceTheme.components.card} bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30`}>
          <CardContent className="p-6 text-center">
            <Award className="h-12 w-12 text-pink-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold text-lg mb-2">Keep Learning!</h3>
            <p className="text-white/70 text-sm">
              Complete all modules to unlock exclusive community features and earn your certification badges.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Theme Styles */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
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
      `}</style>
    </SpiceBackground>
  );
};
