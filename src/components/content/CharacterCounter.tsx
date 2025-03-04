import React from 'react';
import { SocialPlatform, platformConfigs } from '../../types/SocialAccount';
import { Squircle, Check } from 'lucide-react';

interface CharacterCounterProps {
  text: string;
  platform: SocialPlatform;
  showWarnings?: boolean;
  className?: string;
  compact?: boolean;
}

const CharacterCounter = ({ 
  text, 
  platform, 
  showWarnings = true,
  className = '',
  compact = false
}: CharacterCounterProps) => {
  // Get the character count
  const count = text.length;
  
  // Get platform-specific maximum length
  const getMaxLength = (): number | null => {
    switch (platform) {
      case 'twitter':
        return 280;
      case 'linkedin':
        return 3000;
      case 'instagram':
        return 2200;
      case 'facebook':
        return 63206; // Facebook has a very high limit
      default:
        return null;
    }
  };
  
  const maxLength = getMaxLength();
  
  // Calculate percentage of max length used
  const getPercentage = (): number => {
    if (!maxLength) return 0;
    return Math.min((count / maxLength) * 100, 100);
  };
  
  const percentage = getPercentage();
  
  // Determine status based on character count
  const getStatus = (): 'ok' | 'warning' | 'error' => {
    if (!maxLength) return 'ok';
    
    if (count > maxLength) {
      return 'error';
    } else if (count > maxLength * 0.9) {
      return 'warning';
    } else {
      return 'ok';
    }
  };
  
  const status = getStatus();
  
  // Get color based on status
  const getStatusColor = (): string => {
    switch (status) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const color = getStatusColor();
  
  // Get progress bar color
  const getProgressColor = (): string => {
    switch (status) {
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };
  
  if (compact) {
    return (
      <div className={`flex items-center text-xs ${className}`}>
        <span className={color}>
          {count}{maxLength ? `/${maxLength}` : ''}
        </span>
        {status === 'error' && showWarnings && (
          <Squircle className="ml-1 h-3 w-3 text-red-500" />
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <span className={`text-xs font-medium ${color}`}>
            {count}{maxLength ? `/${maxLength}` : ''} characters
          </span>
          
          {status === 'error' && showWarnings && (
            <span className="ml-1 text-xs text-red-600">
              ({count - (maxLength || 0)} over limit)
            </span>
          )}
        </div>
        
        {/* Status indicator */}
        {maxLength && (
          <div className="flex items-center">
            {status === 'ok' && (
              <span className="flex items-center text-xs text-green-600">
                <Check className="mr-1 h-3 w-3" />
                OK
              </span>
            )}
            {status === 'warning' && showWarnings && (
              <span className="text-xs text-orange-500">
                Approaching limit
              </span>
            )}
            {status === 'error' && showWarnings && (
              <span className="text-xs text-red-600">
                Over limit
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      {maxLength && (
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default CharacterCounter;
