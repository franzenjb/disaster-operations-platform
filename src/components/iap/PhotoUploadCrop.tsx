/**
 * Photo Upload and Crop Component
 * Handles image upload, preview, and cropping functionality
 */

import React, { useState, useRef, useCallback } from 'react';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

interface PhotoUploadCropProps {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  aspectRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function PhotoUploadCrop({
  imageUrl,
  onImageChange,
  aspectRatio = 16/9,
  maxWidth = 1920,
  maxHeight = 1080
}: PhotoUploadCropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image size must be less than 10MB');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Calculate dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        // Scale down if needed
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }
        
        // Apply aspect ratio cropping if specified
        if (aspectRatio) {
          const currentRatio = width / height;
          if (currentRatio > aspectRatio) {
            // Image is too wide
            const newWidth = height * aspectRatio;
            const xOffset = (width - newWidth) / 2;
            canvas.width = newWidth;
            canvas.height = height;
            ctx.drawImage(img, xOffset, 0, newWidth, height, 0, 0, newWidth, height);
          } else if (currentRatio < aspectRatio) {
            // Image is too tall
            const newHeight = width / aspectRatio;
            const yOffset = (height - newHeight) / 2;
            canvas.width = width;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, yOffset, width, newHeight, 0, 0, width, newHeight);
          } else {
            // Perfect ratio
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
          }
        } else {
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        // Convert to data URL with compression
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onImageChange(dataUrl);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        setError('Failed to load image');
        setIsLoading(false);
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };
    
    reader.readAsDataURL(file);
  }, [aspectRatio, maxWidth, maxHeight, onImageChange]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);
  
  const handleRemoveImage = useCallback(() => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageChange]);
  
  return (
    <div className="photo-upload-crop">
      {imageUrl ? (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img 
              src={imageUrl} 
              alt="Uploaded" 
              className="w-full h-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white">Processing image...</div>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Replace Photo
            </button>
            <button
              onClick={handleRemoveImage}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative rounded-lg border-2 border-dashed p-8
            ${isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}
            transition-colors duration-200
          `}
        >
          <div className="text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-cross-red rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Choose Photo
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              or drag and drop an image here
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileInputChange}
          />
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}