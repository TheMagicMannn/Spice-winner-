// src/components/PrivateContentViewer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface PrivateContentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  contentUrl: string;
  contentType: 'photo' | 'video';
  ownerName?: string;
  description?: string;
  allContent?: Array<{
    url: string;
    type: 'photo' | 'video';
    description?: string;
  }>;
  currentIndex?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export const PrivateContentViewer: React.FC<PrivateContentViewerProps> = ({
  isOpen,
  onClose,
  contentUrl,
  contentType,
  ownerName,
  description,
  allContent,
  currentIndex,
  onNavigate
}) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBlackScreen, setIsBlackScreen] = useState(false);

  // Simple black screen detection - screenshot and screen recording
  useEffect(() => {
    if (!isOpen) return;

    // Activate black screen on these events
    const activateBlackScreen = () => {
      setIsBlackScreen(true);
    };

    // Deactivate black screen
    const deactivateBlackScreen = () => {
      setIsBlackScreen(false);
    };

    // Detect screen recording (tab switch, window blur, visibility change)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        activateBlackScreen();
      } else {
        deactivateBlackScreen();
      }
    };

    const handleBlur = () => {
      activateBlackScreen();
    };

    const handleFocus = () => {
      deactivateBlackScreen();
    };

    // Detect screenshot shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen, Snipping Tool, Mac screenshots
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && e.key === 'S')
      ) {
        activateBlackScreen();
        setTimeout(deactivateBlackScreen, 2000);
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !onNavigate) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        onNavigate('next');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onNavigate, onClose]);

  const canGoBack = allContent && currentIndex !== undefined && currentIndex > 0;
  const canGoForward = allContent && currentIndex !== undefined && currentIndex < allContent.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-full h-full bg-black border-none p-0 overflow-hidden"
      >
        {/* Black Screen with thespiceapp.com watermark - Active during screenshot/recording */}
        {isBlackScreen && (
          <div className="absolute inset-0 bg-black z-[100] flex items-center justify-center">
            <div className="text-white text-4xl font-bold opacity-50">
              thespiceapp.com
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
          data-testid="close-viewer"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Navigation Buttons */}
        {allContent && onNavigate && (
          <>
            {canGoBack && (
              <button
                onClick={() => onNavigate('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all"
                data-testid="prev-content"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            
            {canGoForward && (
              <button
                onClick={() => onNavigate('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all"
                data-testid="next-content"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </>
        )}

        {/* Content Display */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {contentType === 'photo' ? (
            <img
              src={contentUrl}
              alt={description || 'Private content'}
              className="max-w-full max-h-full object-contain"
              data-testid="viewer-image"
            />
          ) : (
            <video
              ref={videoRef}
              src={contentUrl}
              controls
              className="max-w-full max-h-full object-contain"
              data-testid="viewer-video"
            />
          )}

          {/* Simple watermark overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="text-white/30 text-3xl font-bold select-none">
              thespiceapp.com
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-40">
            <p className="text-white text-center">{description}</p>
          </div>
        )}

        {/* Counter */}
        {allContent && currentIndex !== undefined && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm z-40">
            {currentIndex + 1} / {allContent.length}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrivateContentViewer;
