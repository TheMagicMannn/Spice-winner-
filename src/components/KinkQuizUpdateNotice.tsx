// src/components/KinkQuizUpdateNotice.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KinkQuizUpdateNoticeProps {
  onRetake: () => void;
  onDismiss: () => void;
}

export const KinkQuizUpdateNotice: React.FC<KinkQuizUpdateNoticeProps> = ({
  onRetake,
  onDismiss
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-lg p-6 mb-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <RefreshCw className="h-6 w-6 text-pink-400" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-pink-400" />
            <h3 className="text-lg font-semibold text-white">
              Kink Quiz Updated!
            </h3>
          </div>
          
          <div className="space-y-2 text-white/80">
            <p>
              We've improved the kink quiz with <strong className="text-pink-400">more accurate category mappings</strong> to give you better results.
            </p>
            
            <div className="bg-black/30 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Fixed:</strong> Statements now correctly match their categories (e.g., dominant statements only in dominant categories)
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Improved:</strong> All 25 role categories have been verified for logical consistency
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Enhanced:</strong> More accurate personality profiles based on your answers
                </p>
              </div>
            </div>
            
            <p className="text-sm text-white/60 italic">
              Your previous results have been safely backed up. Retake the quiz to get your updated, more accurate profile!
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onRetake}
              className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white px-6"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake Quiz Now
            </Button>
            
            <Button
              onClick={onDismiss}
              variant="outline"
              className="border-pink-500/30 text-white/70 hover:text-white hover:border-pink-500/60"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
