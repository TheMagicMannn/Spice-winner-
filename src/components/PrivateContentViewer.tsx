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

  // Disable drag and drop
  const preventDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  const canGoBack = allContent && currentIndex !== undefined && currentIndex > 0;
  const canGoForward = allContent && currentIndex !== undefined && currentIndex < allContent.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-full h-full bg-black border-none p-0 overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Black Screen Overlay - Active during screenshot attempts */}
        {isBlackoutActive && (
          <div 
            className="absolute inset-0 bg-black z-[100] flex items-center justify-center"
            style={{
              backdropFilter: 'blur(50px)',
              WebkitBackdropFilter: 'blur(50px)'
            }}
          >
            <div className="text-white text-2xl font-bold text-center p-8 animate-pulse">
              <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <p>SCREENSHOT BLOCKED</p>
              <p className="text-sm mt-2 text-red-400">This content is protected</p>
            </div>
          </div>
        )}

        {/* Privacy Warning Banner */}
        {showWarning && (
          <div className="absolute top-0 left-0 right-0 bg-red-500/90 text-white px-4 py-3 z-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5" />
              <div className="text-sm">
                <p className="font-semibold">Private Content - Do Not Screenshot or Share</p>
                <p className="text-xs text-white/90">This content is private and protected. Unauthorized sharing is prohibited.</p>
              </div>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="text-white/80 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Suspicious Activity Alert */}
        {suspiciousActivity && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg z-50 flex items-center space-x-2 shadow-lg animate-pulse">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Screenshot attempt blocked! This content is protected.</span>
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
            <div className="relative max-w-full max-h-full">
              {/* Hidden image for loading */}
              <img
                ref={imageRef}
                src={contentUrl}
                alt={description || 'Private content'}
                className="hidden"
                crossOrigin="anonymous"
              />
              
              {/* Canvas for protected rendering */}
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain select-none pointer-events-none"
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  imageRendering: 'pixelated',
                  filter: 'contrast(1.01)', // Subtle filter to interfere with screen capture
                }}
                data-testid="viewer-image"
              />
            </div>
          ) : (
            <div className="relative max-w-full max-h-full">
              <video
                ref={videoRef}
                src={contentUrl}
                controls
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                disableRemotePlayback
                className="max-w-full max-h-full object-contain select-none"
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  filter: 'contrast(1.01)', // Subtle filter to interfere with screen capture
                }}
                data-testid="viewer-video"
              />
            </div>
          )}

          {/* Enhanced Dynamic Watermark Overlays - "SPICE CONTENT- OUTSIDE OF SPICE IS UNAUTHORIZED USE" */}
          <div
            className="absolute text-red-500/40 font-bold text-2xl pointer-events-none select-none transform -rotate-12"
            style={{
              top: `${watermarkPosition.y}%`,
              left: `${watermarkPosition.x}%`,
              textShadow: '3px 3px 6px rgba(0,0,0,0.8), 0 0 20px rgba(255,0,0,0.3)',
              fontFamily: 'monospace',
              letterSpacing: '0.1em'
            }}
          >
            SPICE CONTENT
          </div>
          
          <div
            className="absolute text-red-500/35 font-bold text-lg pointer-events-none select-none transform rotate-12"
            style={{
              top: `${(watermarkPosition.y + 25) % 90}%`,
              left: `${(watermarkPosition.x + 40) % 90}%`,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 15px rgba(255,0,0,0.3)',
              fontFamily: 'monospace',
              letterSpacing: '0.1em'
            }}
          >
            OUTSIDE OF SPICE IS UNAUTHORIZED USE
          </div>

          <div
            className="absolute text-white/20 font-bold text-base pointer-events-none select-none transform -rotate-6"
            style={{
              top: `${(watermarkPosition.y + 50) % 90}%`,
              left: `${(watermarkPosition.x + 20) % 90}%`,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'monospace'
            }}
          >
            {ownerName || 'Private'} • {user?.email || 'Protected'}
          </div>

          <div
            className="absolute text-white/15 font-bold text-sm pointer-events-none select-none"
            style={{
              top: `${(watermarkPosition.y + 70) % 90}%`,
              left: `${(watermarkPosition.x + 60) % 90}%`,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            {new Date().toLocaleString()}
          </div>

          {/* Corner Watermarks with Updated Text */}
          <div className="absolute top-2 left-2 text-red-400/30 text-xs font-semibold pointer-events-none select-none">
            SPICE CONTENT
          </div>
          <div className="absolute top-2 right-2 text-red-400/30 text-xs font-semibold pointer-events-none select-none">
            UNAUTHORIZED USE PROHIBITED
          </div>
          <div className="absolute bottom-2 left-2 text-white/15 text-xs font-semibold pointer-events-none select-none">
            PROTECTED CONTENT
          </div>
          <div className="absolute bottom-2 right-2 text-white/15 text-xs font-semibold pointer-events-none select-none">
            {user?.email}
          </div>

          {/* Additional scattered watermarks for better protection */}
          <div className="absolute top-1/4 right-1/4 text-red-500/20 text-sm font-bold pointer-events-none select-none transform rotate-45">
            SPICE CONTENT
          </div>
          <div className="absolute top-3/4 left-1/4 text-red-500/20 text-sm font-bold pointer-events-none select-none transform -rotate-45">
            UNAUTHORIZED USE
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
