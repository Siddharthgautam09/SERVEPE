
import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  width?: number;
  height?: number;
  onError?: () => void;
  onLoad?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  width,
  height,
  onError,
  onLoad,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [src]);

  const handleImageError = () => {
    console.warn(`Failed to load image: ${src}`);
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Show fallback if no src provided or if image failed to load
  if (!src || imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${fallbackClassName} ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-400">
          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-xs">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse ${className}`}
          style={{ width, height }}
        >
          <div className="text-gray-400">
            <ImageIcon className="w-6 h-6 animate-spin" />
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        width={width}
        height={height}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

export default ImageWithFallback;
