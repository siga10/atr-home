"use client";

import { useState, useEffect } from "react";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  variant?: "before" | "after";
  caption?: string;
}

interface MediaLightboxProps {
  media: MediaItem[];
  isOpen: boolean;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onSelectIndex: (index: number) => void;
}

export function MediaLightbox({ 
  media, 
  isOpen, 
  currentIndex, 
  onClose, 
  onNavigate, 
  onSelectIndex 
}: MediaLightboxProps) {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        onNavigate('next');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, onNavigate]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || media.length === 0) return null;

  const currentMedia = media[currentIndex];
  if (!currentMedia) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center transition-all hover:bg-opacity-70"
          title="Close (Esc)"
        >
          ×
        </button>

        {/* Previous Button */}
        {media.length > 1 && (
          <button
            onClick={() => onNavigate('prev')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-14 h-14 flex items-center justify-center transition-all hover:bg-opacity-70"
            title="Previous (←)"
          >
            ←
          </button>
        )}

        {/* Next Button */}
        {media.length > 1 && (
          <button
            onClick={() => onNavigate('next')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-14 h-14 flex items-center justify-center transition-all hover:bg-opacity-70"
            title="Next (→)"
          >
            →
          </button>
        )}

        {/* Media Display */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          {currentMedia.type === 'video' ? (
            <video 
              src={currentMedia.url} 
              controls 
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: '90vw', maxHeight: '80vh' }}
            />
          ) : (
            <img
              src={currentMedia.url}
              alt={currentMedia.caption || 'Media'}
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: '90vw', maxHeight: '80vh' }}
            />
          )}
        </div>

        {/* Media Info - only show counter */}
        <div className="absolute bottom-20 left-0 right-0 text-center text-white">
          <div className="bg-black bg-opacity-70 inline-block px-4 py-2 rounded-lg mx-4">
            <span className="text-sm text-gray-300">{currentIndex + 1} / {media.length}</span>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {media.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 max-w-4xl">
            <div className="flex space-x-2 bg-black bg-opacity-60 p-3 rounded-lg overflow-x-auto">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => onSelectIndex(index)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? 'border-white scale-110' 
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <div className="text-white text-xs">📹</div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.caption || 'Media'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Click outside to close */}
        <div 
          className="absolute inset-0 -z-10" 
          onClick={onClose}
        />
      </div>
    </div>
  );
}

interface MediaGalleryProps {
  media: MediaItem[];
  className?: string;
}

export function MediaGallery({ media, className = "" }: MediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Filter only images for lightbox navigation
  const images = media.filter(m => m.type === 'image');

  const openLightbox = (mediaItem: MediaItem) => {
    if (mediaItem.type === 'image') {
      const imageIndex = images.findIndex(m => m.id === mediaItem.id);
      if (imageIndex !== -1) {
        setCurrentMediaIndex(imageIndex);
        setLightboxOpen(true);
      }
    }
  };

  const navigateMedia = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMediaIndex((prev) => 
        prev > 0 ? prev - 1 : images.length - 1
      );
    } else {
      setCurrentMediaIndex((prev) => 
        prev < images.length - 1 ? prev + 1 : 0
      );
    }
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className={`grid gap-1 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 ${className}`}>
        {media.map((item) => (
          <div key={item.id} className="relative group aspect-square">
            <div className="w-full h-full bg-gray-100 overflow-hidden">
              {item.type === 'video' ? (
                <div className="w-full h-full bg-gray-900 text-white relative">
                  <video 
                    src={item.url} 
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-4 border-l-black border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <img 
                  src={item.url} 
                  alt={item.caption || 'Media'} 
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200" 
                  onClick={() => openLightbox(item)}
                />
              )}
              
              {/* Variant badge */}
              {item.variant && (
                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs text-white font-medium shadow-md ${
                  item.variant === 'before' ? 'bg-red-500' : 'bg-green-500'
                }`}>
                  {item.variant}
                </div>
              )}
              
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <MediaLightbox 
        media={images}
        isOpen={lightboxOpen}
        currentIndex={currentMediaIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={navigateMedia}
        onSelectIndex={setCurrentMediaIndex}
      />
    </>
  );
}
