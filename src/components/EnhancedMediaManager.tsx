"use client";

import { useState, useEffect } from "react";
import { ProjectService } from "@/lib/dataService";

type MediaVariant = "before" | "after" | undefined;
type MediaType = "image" | "video";

interface ProjectMedia {
  id: string;
  type: MediaType;
  url: string;
  variant?: MediaVariant;
  caption?: string;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "auto";
}

interface EnhancedMediaManagerProps {
  projectSlug: string;
  gallery: ProjectMedia[];
  onUpdate: (gallery: ProjectMedia[]) => void;
}

export function EnhancedMediaManager({ projectSlug, gallery, onUpdate }: EnhancedMediaManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOptions, setUploadOptions] = useState({
    variant: undefined as MediaVariant,
    caption: ""
  });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [allMedia, setAllMedia] = useState<ProjectMedia[]>([]);

  // Update all media list when gallery changes
  useEffect(() => {
    setAllMedia(gallery.filter(m => m.type === 'image')); // Only images for lightbox
  }, [gallery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        navigateMedia('prev');
      } else if (e.key === 'ArrowRight') {
        navigateMedia('next');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen, currentMediaIndex, allMedia.length]);

  const openLightbox = (media: ProjectMedia) => {
    const imageIndex = allMedia.findIndex(m => m.id === media.id);
    if (imageIndex !== -1) {
      setCurrentMediaIndex(imageIndex);
      setLightboxOpen(true);
    }
  };

  const navigateMedia = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMediaIndex((prev) => 
        prev > 0 ? prev - 1 : allMedia.length - 1
      );
    } else {
      setCurrentMediaIndex((prev) => 
        prev < allMedia.length - 1 ? prev + 1 : 0
      );
    }
  };

  const detectAspectRatio = (file: File): Promise<"16:9" | "9:16" | "1:1" | "auto"> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const ratio = img.width / img.height;
          if (Math.abs(ratio - 16/9) < 0.1) {
            resolve("16:9");
          } else if (Math.abs(ratio - 9/16) < 0.1) {
            resolve("9:16");
          } else if (Math.abs(ratio - 1) < 0.1) {
            resolve("1:1");
          } else {
            resolve("auto");
          }
          URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(file);
      } else {
        // For videos, we'll use auto for now
        resolve("auto");
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);

    try {
      const newMediaItems: ProjectMedia[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // File size check - 50MB for videos, 10MB for images
        const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          alert(`File "${file.name}" is too large. Please use files smaller than ${file.type.startsWith('video/') ? '50MB' : '10MB'}.`);
          continue;
        }

        // File type check
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          alert(`File "${file.name}" is not a valid image or video file.`);
          continue;
        }

        // Detect aspect ratio
        const aspectRatio = await detectAspectRatio(file);

        // Convert to base64
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const mediaItem: ProjectMedia = {
          id: `${Date.now()}-${i}`,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: fileData,
          variant: uploadOptions.variant,
          caption: uploadOptions.caption || file.name.replace(/\.[^/.]+$/, ""),
          aspectRatio
        };

        newMediaItems.push(mediaItem);
      }

      if (newMediaItems.length > 0) {
        const updatedGallery = [...gallery, ...newMediaItems];
        
        // Update database
        const success = await ProjectService.updateGallery(projectSlug, updatedGallery);
        
        if (success) {
          onUpdate(updatedGallery);
          
          // Show success notification
          showNotification('✓ Media uploaded successfully!', 'success');
          
          // Reset upload options
          setUploadOptions({ variant: undefined, caption: "" });
        } else {
          alert('Failed to upload media. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Error uploading media. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const updatedGallery = gallery.filter(m => m.id !== mediaId);
      
      // Find the project to get its ID
      const project = await ProjectService.getBySlug(projectSlug);
      if (!project || !project.id) {
        alert('Project not found');
        return;
      }
      
      const success = await ProjectService.updateGallery(project.id, updatedGallery);
      
      if (success) {
        onUpdate(updatedGallery);
        showNotification('✓ Media deleted successfully!', 'success');
      } else {
        alert('Failed to delete media. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Error deleting media. Please try again.');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  // Group media by aspect ratio for better display
  const groupedMedia = gallery.reduce((groups, media) => {
    const key = media.aspectRatio || 'auto';
    if (!groups[key]) groups[key] = [];
    groups[key].push(media);
    return groups;
  }, {} as Record<string, ProjectMedia[]>);

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3">📁 Add Media</h4>
        
        {/* Upload Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select 
              value={uploadOptions.variant || ""}
              onChange={(e) => setUploadOptions({
                ...uploadOptions,
                variant: e.target.value as MediaVariant || undefined
              })}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">General</option>
              <option value="before">Before</option>
              <option value="after">After</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption (optional)
            </label>
            <input
              type="text"
              value={uploadOptions.caption}
              onChange={(e) => setUploadOptions({
                ...uploadOptions,
                caption: e.target.value
              })}
              placeholder="Enter caption for all files"
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
        
        {/* File Input */}
        <div>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="w-full border rounded-md px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supports images (max 10MB) and videos (max 50MB). Multiple files allowed.
          </p>
        </div>
        
        {isUploading && (
          <div className="mt-3 text-sm text-blue-600">
            📤 Uploading files...
          </div>
        )}
      </div>

      {/* Media Gallery */}
      {gallery.length > 0 && (
        <div className="space-y-6">
          <h4 className="font-medium text-lg">🖼️ Media Gallery ({gallery.length} items)</h4>
          
          {/* Unified Gallery View */}
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {gallery.map((media) => (
              <div key={media.id} className="relative aspect-square border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                {media.type === 'video' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-600">
                    <div className="text-4xl mb-2">🎬</div>
                    <div className="text-sm font-medium">Video</div>
                  </div>
                ) : (
                  <img 
                    src={media.url} 
                    alt={media.caption || 'Media'} 
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200" 
                    onClick={() => openLightbox(media)}
                  />
                )}
                
                {/* Variant badge */}
                {media.variant && (
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs text-white font-medium shadow-lg ${
                    media.variant === 'before' ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    {media.variant}
                  </div>
                )}
                
                {/* Delete X button */}
                <button
                  onClick={() => handleDeleteMedia(media.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all text-sm font-bold shadow-lg"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {/* Gallery stats */}
          <div className="flex justify-between text-sm text-gray-500 pt-2 border-t">
            <div>
              Images: {gallery.filter(m => m.type === 'image').length} | 
              Videos: {gallery.filter(m => m.type === 'video').length}
            </div>
            <div>
              Before: {gallery.filter(m => m.variant === 'before').length} | 
              After: {gallery.filter(m => m.variant === 'after').length} | 
              General: {gallery.filter(m => !m.variant).length}
            </div>
          </div>
        </div>
      )}
      
      {gallery.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📷</div>
          <p>No media added yet</p>
          <p className="text-sm">Upload images and videos to get started</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && allMedia.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
              title="Close (Esc)"
            >
              ×
            </button>

            {/* Previous Button */}
            {allMedia.length > 1 && (
              <button
                onClick={() => navigateMedia('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
                title="Previous (←)"
              >
                ←
              </button>
            )}

            {/* Next Button */}
            {allMedia.length > 1 && (
              <button
                onClick={() => navigateMedia('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
                title="Next (→)"
              >
                →
              </button>
            )}

            {/* Image Display */}
            <div className="relative max-w-full max-h-full">
              <img
                src={allMedia[currentMediaIndex]?.url}
                alt={allMedia[currentMediaIndex]?.caption || 'Media'}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                <div className="flex justify-between items-center">
                  <div>
                    {allMedia[currentMediaIndex]?.caption && (
                      <p className="text-lg font-medium">{allMedia[currentMediaIndex].caption}</p>
                    )}
                    {allMedia[currentMediaIndex]?.variant && (
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium mt-1 ${
                        allMedia[currentMediaIndex].variant === 'before' ? 'bg-red-500' : 'bg-green-500'
                      }`}>
                        {allMedia[currentMediaIndex].variant}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    {currentMediaIndex + 1} / {allMedia.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {allMedia.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-2 bg-black bg-opacity-50 p-2 rounded-lg max-w-xs overflow-x-auto">
                  {allMedia.map((media, index) => (
                    <button
                      key={media.id}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`relative flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 ${
                        index === currentMediaIndex ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={media.url}
                        alt={media.caption || 'Media'}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
