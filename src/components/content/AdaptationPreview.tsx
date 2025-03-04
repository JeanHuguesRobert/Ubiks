import React, { useState, useEffect } from 'react';
import { ContentDraft } from '../../types/Content';
import { Persona } from '../../types/Persona';
import { SocialPlatform, platformConfigs } from '../../types/SocialAccount';
import { Pencil, Facebook, Instagram, Linkedin, RefreshCw, RotateCcw, Twitter } from 'lucide-react';
import { useAI } from '../../contexts/AIContext';

interface AdaptationPreviewProps {
  originalContent: string;
  platform: SocialPlatform;
  persona: Persona | null;
  adaptedContent?: string;
  onAdaptedContentChange: (platform: SocialPlatform, content: string) => void;
  isLoading?: boolean;
  onRequestAdaptation: (platform: SocialPlatform) => void;
}

const AdaptationPreview = ({
  originalContent,
  platform,
  persona,
  adaptedContent,
  onAdaptedContentChange,
  isLoading = false,
  onRequestAdaptation
}: AdaptationPreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(adaptedContent || originalContent);
  const [characterCount, setCharacterCount] = useState(0);
  const { isAIAvailable } = useAI();
  
  // Platform-specific configuration
  const platformConfig = platformConfigs[platform];
  const maxLength = 
    platform === 'twitter' ? 280 : 
    platform === 'linkedin' ? 3000 : 
    platform === 'instagram' ? 2200 : 
    null;
  
  // Update character count when content changes
  useEffect(() => {
    if (adaptedContent) {
      setEditableContent(adaptedContent);
      setCharacterCount(adaptedContent.length);
    }
  }, [adaptedContent]);
  
  // Handle editing the adapted content
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      onAdaptedContentChange(platform, editableContent);
    }
    setIsEditing(!isEditing);
  };
  
  // Handle content changes in edit mode
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setEditableContent(content);
    setCharacterCount(content.length);
  };
  
  // Reset to AI adaptation
  const handleReset = () => {
    onRequestAdaptation(platform);
    setIsEditing(false);
  };
  
  // Get platform-specific icon
  const getPlatformIcon = () => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="text-[#1DA1F2]" />;
      case 'linkedin':
        return <Linkedin className="text-[#0077B5]" />;
      case 'facebook':
        return <Facebook className="text-[#1877F2]" />;
      case 'instagram':
        return <Instagram className="text-[#E4405F]" />;
      default:
        return null;
    }
  };
  
  // Determine character count style based on platform limits
  const getCharacterCountStyle = () => {
    if (!maxLength) return 'text-gray-500';
    
    const percentage = (characterCount / maxLength) * 100;
    if (percentage >= 100) return 'text-red-600 font-medium';
    if (percentage >= 90) return 'text-orange-500';
    return 'text-gray-500';
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Preview header */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center">
          {getPlatformIcon()}
          <span className="ml-2 font-medium">{platformConfig.name} Adaptation</span>
          {persona && (
            <span className="ml-2 text-xs text-gray-500">
              as {persona.name}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEditToggle}
            className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
            title={isEditing ? "Save edits" : "Pencil adaptation"}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={handleReset}
            disabled={isLoading || !isAIAvailable}
            className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
            title="Reset to AI adaptation"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
      
      {/* Content area */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <RefreshCw className="animate-spin h-6 w-6 text-indigo-600 mb-2" />
            <p className="text-gray-500 text-sm">Adapting content...</p>
          </div>
        ) : (
          <>
            {isEditing ? (
              <textarea
                value={editableContent}
                onChange={handleContentChange}
                className="w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={`Pencil ${platformConfig.name} adaptation...`}
              />
            ) : (
              <div className="whitespace-pre-wrap">
                {adaptedContent || (
                  <span className="text-gray-500 italic">
                    {isAIAvailable ? 
                      `Click the refresh button to generate ${platformConfig.name} adaptation` : 
                      `AI adaptation not available. Configure API keys in settings to enable this feature.`
                    }
                  </span>
                )}
              </div>
            )}
            
            {/* Character count and limit indicator */}
            {(adaptedContent || isEditing) && maxLength && (
              <div className="mt-2 flex justify-between items-center text-xs">
                <div className={getCharacterCountStyle()}>
                  {characterCount} / {maxLength} characters
                  {characterCount > maxLength && (
                    <span className="ml-1 font-medium">
                      ({characterCount - maxLength} over limit)
                    </span>
                  )}
                </div>
                
                {/* Visual progress bar */}
                <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      characterCount > maxLength ? 'bg-red-500' : 
                      characterCount > maxLength * 0.9 ? 'bg-orange-500' : 
                      'bg-green-500'
                    }`} 
                    style={{ width: `${Math.min((characterCount / maxLength) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* No AI configuration warning */}
            {!isAIAvailable && !adaptedContent && !isEditing && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                <p className="text-sm text-yellow-700">
                  To enable AI content adaptation, please add API keys in Settings.
                </p>
              </div>
            )}
            
            {/* Adaptation action button */}
            {!isEditing && isAIAvailable && (
              <button
                onClick={() => onRequestAdaptation(platform)}
                disabled={isLoading}
                className="mt-4 flex items-center text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:text-indigo-400"
              >
                <RefreshCw size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                {adaptedContent ? 'Regenerate adaptation' : 'Generate adaptation'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdaptationPreview;
