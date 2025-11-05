// src/components/KinkQuizPrompt.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onViewResults: () => void;
  onRetake: () => void;
  onClose: () => void;
}

export const KinkQuizPrompt: React.FC<Props> = ({ onViewResults, onRetake, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-black/90 border-2 border-pink-500/50 rounded-2xl p-6 max-w-md w-full"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-pink-500/20 p-4 rounded-full">
              <AlertCircle className="h-8 w-8 text-pink-400" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-white">
            You've Already Taken the Quiz
          </h3>
          
          <p className="text-white/70">
            You have existing quiz results saved. Would you like to view your previous results or retake the quiz?
          </p>

          <p className="text-sm text-pink-400">
            Note: Retaking will overwrite your previous results
          </p>

          <div className="space-y-3 pt-4">
            <Button
              onClick={onViewResults}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-full py-3 transition-all"
              data-testid="view-results-button"
            >
              View My Results
            </Button>
            
            <Button
              onClick={onRetake}
              className="w-full bg-gray-900 text-white font-bold rounded-full border-2 border-pink-500/50 hover:border-pink-500 py-3 transition-all"
              data-testid="retake-quiz-button"
            >
              Retake Quiz
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-white/70 hover:text-white hover:bg-white/10 rounded-full py-3"
              data-testid="cancel-button"
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
