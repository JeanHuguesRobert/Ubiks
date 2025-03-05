import React from 'react';
import { SocialPlatform } from '../../types/SocialAccount';
import { PLATFORM_CHARACTER_LIMITS } from '../../types/Content';

interface PlatformPreviewProps {
  platform: SocialPlatform;
  content: string;
  images?: string[];
  isLoading?: boolean;
}

export const PlatformPreview: React.FC<PlatformPreviewProps> = ({
  platform,
  content,
  images,
  isLoading
}) => {
  const charLimit = PLATFORM_CHARACTER_LIMITS[platform];
  const charCount = content.length;
  const isOverLimit = charLimit ? charCount > charLimit : false;

  const platformStyles = {
    twitter: 'bg-blue-50 border-blue-200',
    linkedin: 'bg-blue-50 border-blue-300',
    facebook: 'bg-indigo-50 border-indigo-200',
    instagram: 'bg-purple-50 border-purple-200'
  };

  return (
    <div className={`border rounded-lg p-4 shadow-sm ${platformStyles[platform]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold capitalize">{platform}</h3>
          {isLoading && (
            <span className="text-sm text-gray-500">Adapting...</span>
          )}
        </div>
        <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
          {charCount}/{charLimit || '∞'}
        </span>
      </div>
      
      <div className="prose max-w-none">
        {content}
      </div>

      {images && images.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {images.map((url, i) => (
            <img 
              key={i}
              src={url}
              alt=""
              className="w-20 h-20 object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
};