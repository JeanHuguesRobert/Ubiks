import React from 'react';
import { ContentDraft, PlatformPostSettings } from '../../types/Content';
import { SocialPlatform, platformConfigs } from '../../types/SocialAccount';
import { Persona } from '../../types/Persona';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

interface PlatformSelectorProps {
  content: ContentDraft;
  onPlatformToggle: (platform: SocialPlatform, enabled: boolean) => void;
  onPersonaSelect: (platform: SocialPlatform, personaId: string | null) => void;
  onSettingsChange: (platform: SocialPlatform, settings: PlatformPostSettings) => void;
  personas: Persona[];
}

const PlatformSelector = ({ 
  content,
  onPlatformToggle,
  onPersonaSelect,
  onSettingsChange,
  personas
}: PlatformSelectorProps) => {
  // Platform icons component mapping
  const platformIcons = {
    twitter: <Twitter className="text-[#1DA1F2]" />,
    linkedin: <Linkedin className="text-[#0077B5]" />,
    facebook: <Facebook className="text-[#1877F2]" />,
    instagram: <Instagram className="text-[#E4405F]" />
  };
  
  // Handle platform toggle
  const handleTogglePlatform = (platform: SocialPlatform) => {
    onPlatformToggle(platform, !content.platformSettings[platform].enabled);
  };
  
  // Handle persona selection
  const handlePersonaChange = (platform: SocialPlatform, e: React.ChangeEvent<HTMLSelectElement>) => {
    const personaId = e.target.value === '' ? null : e.target.value;
    onPersonaSelect(platform, personaId);
  };
  
  // Handle setting toggle
  const handleSettingToggle = (
    platform: SocialPlatform, 
    setting: keyof PlatformPostSettings,
    value: boolean
  ) => {
    const updatedSettings = {
      ...content.platformSettings[platform],
      [setting]: value
    };
    onSettingsChange(platform, updatedSettings);
  };

  // Get personas that are enabled for a specific platform
  const getPersonasForPlatform = (platform: SocialPlatform): Persona[] => {
    return personas.filter(persona => 
      persona.platforms.some(p => p.platformId === platform && p.enabled)
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Platforms</h3>
        <p className="text-sm text-gray-500">Select where to publish this content</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {Object.entries(platformConfigs).map(([key, config]) => {
          const platform = key as SocialPlatform;
          const platformSettings = content.platformSettings[platform];
          const platformPersonas = getPersonasForPlatform(platform);
          const selectedPersonaId = content.selectedPersonaIds[platform];
          
          return (
            <div key={platform} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {platformIcons[platform]}
                  <span className="ml-2 font-medium">{config.name}</span>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={platformSettings.enabled}
                    onChange={() => handleTogglePlatform(platform)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              {platformSettings.enabled && (
                <div className="mt-3 pl-6 space-y-3">
                  {/* Persona selection */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Post as</label>
                    <select
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={selectedPersonaId || ''}
                      onChange={(e) => handlePersonaChange(platform, e)}
                    >
                      <option value="">Default (your profile)</option>
                      {platformPersonas.map(persona => (
                        <option key={persona.id} value={persona.id}>
                          {persona.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Platform-specific settings */}
                  <div className="space-y-2">
                    {/* Hashtags toggle */}
                    {platform !== 'facebook' && (
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Use hashtags</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={platformSettings.useHashtags}
                            onChange={() => handleSettingToggle(
                              platform, 
                              'useHashtags', 
                              !platformSettings.useHashtags
                            )}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    )}
                    
                    {/* Image toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Include images</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={platformSettings.useImages}
                          onChange={() => handleSettingToggle(
                            platform, 
                            'useImages', 
                            !platformSettings.useImages
                          )}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    {/* Thread toggle for Twitter */}
                    {platform === 'twitter' && (
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Thread long content</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={platformSettings.threadEnabled || false}
                            onChange={() => handleSettingToggle(
                              platform, 
                              'threadEnabled', 
                              !platformSettings.threadEnabled
                            )}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformSelector;
