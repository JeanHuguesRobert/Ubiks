import React, { useState, useEffect } from 'react';
import { ContentDraft } from '../../types/Content';
import { Persona } from '../../types/Persona';
import { SocialPlatform, platformConfigs } from '../../types/SocialAccount';
import { useAI } from '../../contexts/AIContext';
import AdaptationPreview from './AdaptationPreview';
import { ArrowDown, Wand } from 'lucide-react';

interface ContentAdaptationProps {
  content: ContentDraft;
  personas: Persona[];
  onUpdateAdaptedContent: (platform: SocialPlatform, content: string) => void;
}

interface AdaptationStatus {
  [platform: string]: {
    isLoading: boolean;
    isAdapted: boolean;
    error?: string;
  };
}

const ContentAdaptation = ({ 
  content,
  personas,
  onUpdateAdaptedContent
}: ContentAdaptationProps) => {
  const { completePrompt, fillPromptTemplate, isAIAvailable } = useAI();
  const [adaptationStatus, setAdaptationStatus] = useState<AdaptationStatus>({});
  const [adaptedContent, setAdaptedContent] = useState<Record<SocialPlatform, string>>({} as Record<SocialPlatform, string>);
  
  // Get enabled platforms
  const enabledPlatforms = Object.entries(content.platformSettings)
    .filter(([_, settings]) => settings.enabled)
    .map(([platform]) => platform as SocialPlatform);
  
  // Get persona for a platform
  const getPersonaForPlatform = (platform: SocialPlatform): Persona | null => {
    const personaId = content.selectedPersonaIds[platform];
    if (!personaId) return null;
    return personas.find(p => p.id === personaId) || null;
  };
  
  // Handle requesting adaptation for a specific platform
  const handleRequestAdaptation = async (platform: SocialPlatform) => {
    if (!content.text || !isAIAvailable) return;
    
    // Update status to loading
    setAdaptationStatus(prev => ({
      ...prev,
      [platform]: {
        isLoading: true,
        isAdapted: false
      }
    }));
    
    try {
      // Get persona for platform
      const persona = getPersonaForPlatform(platform);
      
      // Get platform-specific character limit
      const characterLimit = 
        platform === 'twitter' ? 280 : 
        platform === 'linkedin' ? 3000 : 
        platform === 'instagram' ? 2200 : 
        'None';
      
      // Fill the prompt template
      const prompt = await fillPromptTemplate('platform-adapt-template', {
        platform: platformConfigs[platform].name,
        content: content.text,
        style: persona?.style || 'conversational',
        tone: persona?.tone || 'casual',
        characterLimit: characterLimit.toString()
      });
      
      // Call the AI API
      const response = await completePrompt({
        prompt,
        options: {
          provider: 'openai', // Use the default provider
          model: 'gpt-3.5-turbo', // Use a default model
          temperature: 0.7
        }
      });
      
      // Update the adapted content
      const adaptedText = response.text.trim();
      setAdaptedContent(prev => ({
        ...prev,
        [platform]: adaptedText
      }));
      
      // Update status to adapted
      setAdaptationStatus(prev => ({
        ...prev,
        [platform]: {
          isLoading: false,
          isAdapted: true
        }
      }));
      
      // Update parent component
      onUpdateAdaptedContent(platform, adaptedText);
      
    } catch (error) {
      console.error(`Error adapting content for ${platform}:`, error);
      
      // Update status with error
      setAdaptationStatus(prev => ({
        ...prev,
        [platform]: {
          isLoading: false,
          isAdapted: false,
          error: error instanceof Error ? error.message : 'Failed to adapt content'
        }
      }));
    }
  };
  
  // Handle changes to adapted content (from manual edits)
  const handleAdaptedContentChange = (platform: SocialPlatform, newContent: string) => {
    setAdaptedContent(prev => ({
      ...prev,
      [platform]: newContent
    }));
    
    // Update parent component
    onUpdateAdaptedContent(platform, newContent);
  };
  
  // Handle adapting all platforms
  const handleAdaptAll = async () => {
    if (!content.text || !isAIAvailable || enabledPlatforms.length === 0) return;
    
    // Process each enabled platform in sequence
    for (const platform of enabledPlatforms) {
      await handleRequestAdaptation(platform);
    }
  };
  
  // Reset adapted content when original content changes
  useEffect(() => {
    // Optionally clear adaptations when original content changes significantly
    // This is a UX decision - whether to keep or clear adaptations
  }, [content.text]);

  if (enabledPlatforms.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">No platforms selected for content adaptation</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Content Adaptation</h3>
          <p className="text-sm text-gray-500">
            Optimize your content for each platform using AI
          </p>
        </div>
        
        <button
          onClick={handleAdaptAll}
          disabled={!isAIAvailable || !content.text}
          className="flex items-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand className="h-4 w-4 mr-1.5" />
          Adapt All Platforms
        </button>
      </div>
      
      {/* Original content preview */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Original Content</h4>
        <div className="text-gray-800 whitespace-pre-wrap">
          {content.text || <span className="text-gray-400 italic">No content yet</span>}
        </div>
      </div>
      
      {/* Arrow divider */}
      <div className="flex justify-center mb-6">
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {/* Adaptation previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enabledPlatforms.map(platform => (
          <AdaptationPreview
            key={platform}
            platform={platform}
            originalContent={content.text}
            persona={getPersonaForPlatform(platform)}
            adaptedContent={adaptedContent[platform]}
            onAdaptedContentChange={handleAdaptedContentChange}
            isLoading={adaptationStatus[platform]?.isLoading}
            onRequestAdaptation={handleRequestAdaptation}
          />
        ))}
      </div>
    </div>
  );
};

export default ContentAdaptation;
