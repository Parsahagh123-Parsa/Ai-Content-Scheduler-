'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon, VolumeUpIcon, VolumeOffIcon } from '@heroicons/react/24/outline';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  duration?: number;
  size?: number;
  format?: string;
  metadata?: {
    width?: number;
    height?: number;
    fps?: number;
    bitrate?: number;
  };
}

interface MediaCarouselProps {
  items: MediaItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showThumbnails?: boolean;
  showProgress?: boolean;
  glassmorphic?: boolean;
  onItemClick?: (item: MediaItem) => void;
  onItemChange?: (item: MediaItem, index: number) => void;
  className?: string;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({
  items,
  autoPlay = false,
  autoPlayInterval = 5000,
  showControls = true,
  showThumbnails = true,
  showProgress = true,
  glassmorphic = true,
  onItemClick,
  onItemChange,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem = items[currentIndex];

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && items.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, autoPlayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, items.length, autoPlayInterval]);

  // Progress tracking for videos/audio
  useEffect(() => {
    if (currentItem?.type === 'video' || currentItem?.type === 'audio') {
      const mediaElement = currentItem.type === 'video' ? videoRef.current : audioRef.current;
      
      if (mediaElement) {
        const updateProgress = () => {
          if (mediaElement.duration) {
            setProgress((mediaElement.currentTime / mediaElement.duration) * 100);
          }
        };

        mediaElement.addEventListener('timeupdate', updateProgress);
        return () => mediaElement.removeEventListener('timeupdate', updateProgress);
      }
    }
  }, [currentItem]);

  // Handle item change
  useEffect(() => {
    if (onItemChange) {
      onItemChange(currentItem, currentIndex);
    }
  }, [currentIndex, currentItem, onItemChange]);

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick(currentItem);
    }
  };

  const goToItem = (index: number) => {
    setCurrentIndex(index);
  };

  const renderMediaContent = () => {
    if (!currentItem) return null;

    switch (currentItem.type) {
      case 'image':
        return (
          <motion.img
            key={currentItem.id}
            src={currentItem.url}
            alt={currentItem.title}
            className="w-full h-full object-cover rounded-2xl"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            onClick={handleItemClick}
          />
        );

      case 'video':
        return (
          <motion.div
            key={currentItem.id}
            className="relative w-full h-full rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            onClick={handleItemClick}
          >
            <video
              ref={videoRef}
              src={currentItem.url}
              className="w-full h-full object-cover"
              muted={isMuted}
              loop
              playsInline
            />
            {showControls && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                  className="p-4 bg-white bg-opacity-20 rounded-full backdrop-blur-sm hover:bg-opacity-30 transition-all"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-8 h-8 text-white" />
                  ) : (
                    <PlayIcon className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>
            )}
          </motion.div>
        );

      case 'audio':
        return (
          <motion.div
            key={currentItem.id}
            className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            onClick={handleItemClick}
          >
            <audio
              ref={audioRef}
              src={currentItem.url}
              muted={isMuted}
              loop
            />
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <VolumeUpIcon className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{currentItem.title}</h3>
              {currentItem.description && (
                <p className="text-white text-opacity-80">{currentItem.description}</p>
              )}
            </div>
          </motion.div>
        );

      case 'document':
        return (
          <motion.div
            key={currentItem.id}
            className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            onClick={handleItemClick}
          >
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <div className="text-4xl">📄</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{currentItem.title}</h3>
              {currentItem.description && (
                <p className="text-white text-opacity-80">{currentItem.description}</p>
              )}
              {currentItem.format && (
                <p className="text-white text-opacity-60 text-sm">{currentItem.format.toUpperCase()}</p>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const renderThumbnails = () => {
    if (!showThumbnails || items.length <= 1) return null;

    return (
      <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => goToItem(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
              index === currentIndex
                ? 'ring-2 ring-blue-500 scale-110'
                : 'opacity-60 hover:opacity-80'
            }`}
          >
            <img
              src={item.thumbnail || item.url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    );
  };

  const renderProgressBar = () => {
    if (!showProgress || items.length <= 1) return null;

    return (
      <div className="w-full bg-gray-200 bg-opacity-20 rounded-full h-1 mt-4">
        <div
          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main carousel container */}
      <div
        className={`relative w-full h-96 rounded-2xl overflow-hidden ${
          glassmorphic
            ? 'bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20'
            : 'bg-gray-100'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Media content */}
        <AnimatePresence mode="wait">
          {renderMediaContent()}
        </AnimatePresence>

        {/* Navigation controls */}
        {showControls && items.length > 1 && (
          <>
            <button
              onClick={prevItem}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={nextItem}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Play/Pause and Mute controls */}
        {showControls && (currentItem?.type === 'video' || currentItem?.type === 'audio') && (
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-full bg-black bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5 text-white" />
              ) : (
                <PlayIcon className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-black bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all"
            >
              {isMuted ? (
                <VolumeOffIcon className="w-5 h-5 text-white" />
              ) : (
                <VolumeUpIcon className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        )}

        {/* Item counter */}
        {items.length > 1 && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black bg-opacity-20 backdrop-blur-sm text-white text-sm">
            {currentIndex + 1} / {items.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {renderThumbnails()}

      {/* Progress bar */}
      {renderProgressBar()}

      {/* Item info */}
      {currentItem && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentItem.title}
          </h3>
          {currentItem.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              {currentItem.description}
            </p>
          )}
          {currentItem.metadata && (
            <div className="flex space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              {currentItem.metadata.width && currentItem.metadata.height && (
                <span>{currentItem.metadata.width}x{currentItem.metadata.height}</span>
              )}
              {currentItem.metadata.fps && (
                <span>{currentItem.metadata.fps}fps</span>
              )}
              {currentItem.duration && (
                <span>{Math.round(currentItem.duration)}s</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;
