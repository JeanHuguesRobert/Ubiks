import React, { useState } from 'react';
import { ContentDraft } from '../../types/Content';
import { Persona } from '../../types/Persona';
import { SocialPlatform } from '../../types/SocialAccount';
import PlatformPreview from './PlatformPreview';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ContentPreviewsProps {
  content: ContentDraft;
  platforms: SocialPlatform[];
  personas: Persona[];
  defaultPersonaIds?: Record<SocialPlatform, string | null>;
  adaptedContent?: Record<string, string>;
}

const defaultValues: Record<SocialPlatform, string | null> = {
  twitter: null,
  linkedin: null,
  facebook: null,
  instagram: null
};

const ContentPreviews = ({ 
  content, 
  platforms, 
  personas,
  defaultPersonaIds = defaultValues,
  adaptedContent = {}
}: ContentPreviewsProps) => {
  const [expandedPlatform, setExpandedPlatform] = useState<SocialPlatform | null>(
    platforms.length > 0 ? platforms[0] : null
  );
  
  // Get persona for a platform
  const getPersonaForPlatform = (platform: SocialPlatform): Persona | undefined => {
    const personaId = defaultPersonaIds[platform];
    if (!personaId) return undefined;
    return personas.find(p => p.id === personaId);
  };
  
  // Toggle preview expansion
  const togglePlatform = (platform: SocialPlatform) => {
    if (expandedPlatform === platform) {
      setExpandedPlatform(null);
    } else {
      setExpandedPlatform(platform);
    }
  };
  
  // Get adapted content for a platform, or fall back to original content
  const getContentForPlatform = (platform: SocialPlatform): string => {
    return adaptedContent[platform] || content.text;
  };
  
  if (platforms.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
        No platforms selected for preview
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!adaptedContent || Object.keys(adaptedContent).length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-700">
            <span className="font-medium">Tip:</span> Go to the "Adapt" tab to optimize your content for each platform using AI.
          </p>
        </div>
      ) : null}
      
      {/* Platform selector for small screens */}
      <div className="md:hidden">
        <select
          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          value={expandedPlatform || ''}
          onChange={(e) => setExpandedPlatform(e.target.value as SocialPlatform)}
        >
          {platforms.map(platform => (
            <option key={platform} value={platform}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </option>
          ))}
        </select>
        
        {expandedPlatform && (
          <div className="mt-3">
            <PlatformPreview
              content={content}
              contentText={getContentForPlatform(expandedPlatform)}
              platform={expandedPlatform}
              persona={getPersonaForPlatform(expandedPlatform)}
            />
          </div>
        )}
      </div>
      
      {/* All platform previews for larger screens */}
      <div className="hidden md:grid md:grid-cols-2 gap-4">
        {platforms.map(platform => (
          <PlatformPreview
            key={platform}
            content={content}
            contentText={getContentForPlatform(platform)}
            platform={platform}
            persona={getPersonaForPlatform(platform)}
          />
        ))}
      </div>
    </div>
  );
};

export default ContentPreviews;
