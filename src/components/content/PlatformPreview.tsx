import React from 'react';
import { ContentDraft } from '../../types/Content';
import { Persona } from '../../types/Persona';
import { SocialPlatform, platformConfigs } from '../../types/SocialAccount';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import CharacterCounter from './CharacterCounter';

interface PlatformPreviewProps {
  content: ContentDraft;
  contentText: string;
  platform: SocialPlatform;
  persona?: Persona;
}

const PlatformPreview = ({ content, contentText, platform, persona }: PlatformPreviewProps) => {
  // Get platform-specific configuration
  const platformConfig = platformConfigs[platform];
  
  // Apply character limits and formatting based on platform
  const getFormattedText = (): string => {
    let text = contentText || '';
    
    // Apply character limit with ellipsis if needed
    if (platform === 'twitter' && text.length > 280) {
      return text.substring(0, 277) + '...';
    }
    
    if (platform === 'linkedin' && text.length > 3000) {
      return text.substring(0, 2997) + '...';
    }
    
    return text;
  };
  
  // Format hashtags based on platform
  const formatHashtags = (text: string): string => {
    if (!content.platformSettings[platform].useHashtags) {
      // Remove hashtags if disabled for this platform
      return text.replace(/#\w+/g, (match) => match.substring(1));
    }
    
    // Hashtag formatting could be customized by platform
    return text;
  };
  
  // Format URLs based on platform
  const formatUrls = (text: string): string => {
    // URL formatting could be customized by platform
    return text;
  };
  
  // Format mentions based on platform
  const formatMentions = (text: string): string => {
    // Mention formatting could be customized by platform
    return text;
  };
  
  // Apply all formatting
  const formatContent = (text: string): string => {
    let formatted = text;
    formatted = formatHashtags(formatted);
    formatted = formatUrls(formatted);
    formatted = formatMentions(formatted);
    return formatted;
  };
  
  const displayText = formatContent(getFormattedText());
  
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
  
  // Format date for preview
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Preview header */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center">
          {getPlatformIcon()}
          <span className="ml-2 font-medium">{platformConfig.name} Preview</span>
        </div>
        <div className="text-xs text-gray-500">
          {persona ? `as ${persona.name}` : 'Default Style'}
        </div>
      </div>
      
      {/* Preview content */}
      <div className="p-4">
        <div className="flex items-start mb-3">
          <div className="rounded-full bg-gray-200 h-10 w-10 flex items-center justify-center text-gray-500 overflow-hidden">
            {persona?.avatarUrl ? (
              <img src={persona.avatarUrl} alt={persona.name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-medium">{persona?.name.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="ml-3">
            <div className="font-medium">{persona?.name || 'Your Name'}</div>
            <div className="text-xs text-gray-500">{formatDate(new Date())}</div>
          </div>
        </div>
        
        <div className="mb-3 whitespace-pre-wrap">{displayText}</div>
        
        {content.images.length > 0 && (
          <div className={`grid ${content.images.length > 1 ? 'grid-cols-2 gap-2' : 'grid-cols-1'}`}>
            {content.images.slice(0, platform === 'instagram' ? 10 : 4).map(image => (
              <div key={image.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Character counter */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <CharacterCounter 
            text={contentText} 
            platform={platform} 
          />
        </div>
      </div>
    </div>
  );
};

export default PlatformPreview;
