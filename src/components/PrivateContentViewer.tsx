// src/components/PrivateContentViewer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { X, ChevronLeft, ChevronRight, AlertTriangle, Shield } from 'lucide-react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [showWarning, setShowWarning] = useState(true);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 50, y: 50 });
  const [isBlackoutActive, setIsBlackoutActive] = useState(false);

  // Black screen protection - detect screenshot attempts
  useEffect(() => {
    if (!isOpen) return;

    let blackoutTimer: NodeJS.Timeout;

    const triggerBlackout = () => {
      setIsBlackoutActive(true);
      setSuspiciousActivity(true);
      
      // Keep blackout for 3 seconds
      clearTimeout(blackoutTimer);
      blackoutTimer = setTimeout(() => {
        setIsBlackoutActive(false);
        setSuspiciousActivity(false);
      }, 3000);
    };

    // Detect visibility changes (screen recording detection)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerBlackout();
      }
    };

    // Detect window blur (potential screen recording)
    const handleBlur = () => {
      triggerBlackout();
    };

    // Detect focus loss
    const handleFocusOut = () => {
      triggerBlackout();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      clearTimeout(blackoutTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, [isOpen]);

  // Canvas-based image rendering for better screenshot protection
  useEffect(() => {
    if (!isOpen || contentType !== 'photo' || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    const img = imageRef.current;

    const drawImage = () => {
      if (!img.complete) return;

      // Set canvas size to match image
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0);

      // Add noise/interference layer to make screenshots harder
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Add subtle noise that's barely visible but interferes with screen capture
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() > 0.99) {
          const noise = Math.random() * 10 - 5;
          data[i] = Math.max(0, Math.min(255, data[i] + noise));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    if (img.complete) {
      drawImage();
    } else {
      img.onload = drawImage;
    }

    // Redraw periodically to prevent frame capture
    const interval = setInterval(drawImage, 100);
    return () => clearInterval(interval);
  }, [isOpen, contentType, contentUrl]);

  // Dynamic watermark that moves to prevent easy removal
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setWatermarkPosition({
        x: Math.random() * 80 + 10, // 10-90%
        y: Math.random() * 80 + 10
      });
    }, 3000); // Move every 3 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  // Screenshot protection - disable right click
  useEffect(() => {
    if (!isOpen) return;

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setSuspiciousActivity(true);
      setTimeout(() => setSuspiciousActivity(false), 2000);
      return false;
    };

    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, [isOpen]);

  // Keyboard shortcuts protection
  useEffect(() => {
    if (!isOpen) return;

    const preventScreenshot = (e: KeyboardEvent) => {
      // Print Screen, Windows+Shift+S (Snipping Tool), Cmd+Shift+4/5 (Mac)
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) ||
        (e.ctrlKey && e.shiftKey && e.key === 'S')
      ) {
        e.preventDefault();
        setSuspiciousActivity(true);
        setTimeout(() => setSuspiciousActivity(false), 2000);
        
        // Log suspicious activity
        console.warn('Screenshot attempt detected');
        return false;
      }

      // Prevent F12, Ctrl+Shift+I (DevTools)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', preventScreenshot);
    return () => document.removeEventListener('keydown', preventScreenshot);
  }, [isOpen]);

  // Video protection - pause when window loses focus (potential screen recording)
  useEffect(() => {
    if (!isOpen || contentType !== 'video') return;

    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause();
        setSuspiciousActivity(true);
        setTimeout(() => setSuspiciousActivity(false), 2000);
      }
    };

    const handleBlur = () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setSuspiciousActivity(true);
        setTimeout(() => setSuspiciousActivity(false), 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isOpen, contentType]);

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
            <span className="font-semibold">Suspicious activity detected! This content is protected.</span>
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
              className="max-w-full max-h-full object-contain select-none pointer-events-none"
              draggable="false"
              onDragStart={preventDragStart}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
              data-testid="viewer-image"
            />
          ) : (
            <video
              ref={videoRef}
              src={contentUrl}
              controls
              controlsList="nodownload nofullscreen"
              disablePictureInPicture
              className="max-w-full max-h-full object-contain select-none"
              onContextMenu={(e) => e.preventDefault()}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
              data-testid="viewer-video"
            />
          )}

          {/* Dynamic Watermark Overlays - Multiple for better protection */}
          <div
            className="absolute text-white/20 font-bold text-lg pointer-events-none select-none transform -rotate-12"
            style={{
              top: `${watermarkPosition.y}%`,
              left: `${watermarkPosition.x}%`,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            {ownerName || 'Private Content'} • {user?.email || 'Protected'}
          </div>
          
          <div
            className="absolute text-white/15 font-bold text-sm pointer-events-none select-none transform rotate-12"
            style={{
              top: `${(watermarkPosition.y + 30) % 90}%`,
              left: `${(watermarkPosition.x + 40) % 90}%`,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            DO NOT SHARE • PRIVATE
          </div>

          <div
            className="absolute text-white/10 font-bold text-xs pointer-events-none select-none"
            style={{
              top: `${(watermarkPosition.y + 60) % 90}%`,
              left: `${(watermarkPosition.x + 20) % 90}%`,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            {new Date().toLocaleString()}
          </div>

          {/* Corner Watermarks */}
          <div className="absolute top-2 left-2 text-white/10 text-xs font-semibold pointer-events-none select-none">
            PRIVATE
          </div>
          <div className="absolute top-2 right-2 text-white/10 text-xs font-semibold pointer-events-none select-none">
            DO NOT SHARE
          </div>
          <div className="absolute bottom-2 left-2 text-white/10 text-xs font-semibold pointer-events-none select-none">
            PROTECTED CONTENT
          </div>
          <div className="absolute bottom-2 right-2 text-white/10 text-xs font-semibold pointer-events-none select-none">
            {user?.email}
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
