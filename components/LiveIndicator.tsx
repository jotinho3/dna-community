"use client";

import React from 'react';
import { Video, Radio } from 'lucide-react';

interface LiveIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const LiveIndicator: React.FC<LiveIndicatorProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`
      inline-flex items-center space-x-2 
      bg-gradient-to-r from-red-500 to-red-600 
      text-white font-semibold rounded-full
      animate-pulse shadow-lg
      ${sizeClasses[size]} ${className}
    `}>
      {/* Pulsing dot animation */}
      <div className="relative flex items-center">
        <div className={`
          ${iconSizes[size]} bg-white rounded-full 
          animate-ping absolute opacity-75
        `}></div>
        <div className={`
          ${iconSizes[size]} bg-white rounded-full 
          relative
        `}></div>
      </div>
      
      {showText && <span>LIVE</span>}
      
      {/* Radio wave animation */}
      <div className="relative">
        <Radio className={`${iconSizes[size]} animate-pulse`} />
        <div className="absolute inset-0 animate-ping opacity-60">
          <Radio className={iconSizes[size]} />
        </div>
      </div>
    </div>
  );
};

export default LiveIndicator;