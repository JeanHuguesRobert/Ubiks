import { useState } from 'react';
import { SocialPlatformSettings } from '../types/Persona';
import { AlignJustify, ArrowUpFromDot, Clock, Film, Tag, Image } from 'lucide-react';

interface Props {
  platforms: SocialPlatformSettings[];
  onChange: (platforms: SocialPlatformSettings[]) => void;
}

interface AdvancedPlatformSettings {
  useHashtags: boolean;
  hashtagCount: number;
  includeMedia: boolean;
  mediaPosition: 'start' | 'end';
  schedulingPreference: 'optimal' | 'consistent' | 'manual';
  bestTimeToPost: string;
  characterLimit?: number;
}

const PlatformSettings: React.FC<Props> = ({ platforms, onChange }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatformSettings | null>(
    platforms.find(p => p.enabled) || null
  );
  
  const [advancedSettings, setAdvancedSettings] = useState<Record<string, AdvancedPlatformSettings>>({
    twitter: {
      useHashtags: true,
      hashtagCount: 2,
      includeMedia: true,
      mediaPosition: 'end',
      schedulingPreference: 'optimal',
      bestTimeToPost: '12:00',
      characterLimit: 280
    },
    linkedin: {
      useHashtags: true,
      hashtagCount: 3,
      includeMedia: true,
      mediaPosition: 'start',
      schedulingPreference: 'consistent',
      bestTimeToPost: '10:00',
      characterLimit: 3000
    },
    facebook: {
      useHashtags: false,
      hashtagCount: 0,
      includeMedia: true,
      mediaPosition: 'start',
      schedulingPreference: 'optimal',
      bestTimeToPost: '15:00'
    },
    instagram: {
      useHashtags: true,
      hashtagCount: 5,
      includeMedia: true,
      mediaPosition: 'start',
      schedulingPreference: 'optimal',
      bestTimeToPost: '18:00'
    }
  });

  const handleTogglePlatform = (platformId: string) => {
    const updatedPlatforms: SocialPlatformSettings[] = platforms.map(platform => 
      platform.platformId === platformId 
        ? { ...platform, enabled: !platform.enabled }
        : platform
    );
    onChange(updatedPlatforms);
    
    // Update selected platform if needed
    if (selectedPlatform?.platformId === platformId) {
      const updated = updatedPlatforms.find(p => p.platformId === platformId);
      setSelectedPlatform(updated || null);
    } else if (!selectedPlatform) {
      const enabled = updatedPlatforms.find(p => p.enabled);
      setSelectedPlatform(enabled || null);
    }
  };
  
  const updatePlatformSetting = (platformId: string, key: string, value: any) => {
    const platform = platforms.find(p => p.platformId === platformId);
    if (!platform) return;
    
    const updatedPlatform = { ...platform, [key]: value };
    const updatedPlatforms = platforms.map(p => 
      p.platformId === platformId ? updatedPlatform : p
    );
    
    onChange(updatedPlatforms);
    
    if (selectedPlatform?.platformId === platformId) {
      setSelectedPlatform(updatedPlatform);
    }
  };
  
  const updateAdvancedSetting = (platformId: string, setting: string, value: any) => {
    setAdvancedSettings(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        [setting]: value
      }
    }));
  };

  const handlePlatformChange = (updatedPlatform: SocialPlatformSettings) => {
    const updatedPlatforms = platforms.map(p => 
      p.platformId === updatedPlatform.platformId ? updatedPlatform : p
    );
    onChange(updatedPlatforms);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Platform Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure how your content will adapt to each platform's requirements and audience expectations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Platforms</h4>
          <div className="space-y-3">
            {platforms.map(platform => (
              <div 
                key={platform.platformId}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPlatform?.platformId === platform.platformId
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedPlatform(platform)}
              >
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${selectedPlatform?.platformId === platform.platformId ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {platform.platformName}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={platform.enabled}
                    onChange={() => handleTogglePlatform(platform.platformId)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          {selectedPlatform ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-medium text-gray-900">{selectedPlatform.platformName} Settings</h4>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={selectedPlatform.enabled}
                    onChange={() => handleTogglePlatform(selectedPlatform.platformId)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {selectedPlatform.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
              
              {!selectedPlatform.enabled ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Enable this platform to configure its settings.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Character limit */}
                  {selectedPlatform.maxLength && (
                    <div className="flex items-start">
                      <AlignJustify className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Character Limit
                        </label>
                        <div className="mt-1 flex items-center">
                          <input
                            type="number"
                            min="1"
                            max="10000"
                            className="w-24 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                            value={selectedPlatform.maxLength}
                            onChange={(e) => updatePlatformSetting(
                              selectedPlatform.platformId, 
                              'maxLength', 
                              parseInt(e.target.value)
                            )}
                          />
                          <span className="ml-2 text-sm text-gray-500">characters</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Content exceeding this limit will be automatically truncated or split into multiple posts.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Hashtags */}
                  <div className="flex items-start border-t border-gray-200 pt-5">
                    <Tag className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Hashtags
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={advancedSettings[selectedPlatform.platformId]?.useHashtags}
                            onChange={(e) => updateAdvancedSetting(
                              selectedPlatform.platformId,
                              'useHashtags',
                              e.target.checked
                            )}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                      
                      {advancedSettings[selectedPlatform.platformId]?.useHashtags && (
                        <div className="mt-2">
                          <label className="block text-sm text-gray-500 mb-1">Maximum number of hashtags</label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            className="w-20 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                            value={advancedSettings[selectedPlatform.platformId]?.hashtagCount}
                            onChange={(e) => updateAdvancedSetting(
                              selectedPlatform.platformId,
                              'hashtagCount',
                              parseInt(e.target.value)
                            )}
                          />
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Automatically add relevant hashtags to improve discoverability.
                      </p>
                    </div>
                  </div>
                  
                  {/* Media settings */}
                  {selectedPlatform.supportsImages && (
                    <div className="flex items-start border-t border-gray-200 pt-5">
                      <Image className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            Media
                          </label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={advancedSettings[selectedPlatform.platformId]?.includeMedia}
                              onChange={(e) => updateAdvancedSetting(
                                selectedPlatform.platformId,
                                'includeMedia',
                                e.target.checked
                              )}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                        
                        {advancedSettings[selectedPlatform.platformId]?.includeMedia && (
                          <div className="mt-2">
                            <label className="block text-sm text-gray-500 mb-1">Media position</label>
                            <select
                              className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                              value={advancedSettings[selectedPlatform.platformId]?.mediaPosition}
                              onChange={(e) => updateAdvancedSetting(
                                selectedPlatform.platformId,
                                'mediaPosition',
                                e.target.value
                              )}
                            >
                              <option value="start">Before text content</option>
                              <option value="end">After text content</option>
                            </select>
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Include images and videos with your posts when available.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Scheduling */}
                  <div className="flex items-start border-t border-gray-200 pt-5">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Posting Schedule
                      </label>
                      <div className="mt-2">
                        <select
                          className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                          value={advancedSettings[selectedPlatform.platformId]?.schedulingPreference}
                          onChange={(e) => updateAdvancedSetting(
                            selectedPlatform.platformId,
                            'schedulingPreference',
                            e.target.value
                          )}
                        >
                          <option value="optimal">Post at optimal times for engagement</option>
                          <option value="consistent">Post at consistent times each day</option>
                          <option value="manual">Manual scheduling only</option>
                        </select>
                      </div>
                      
                      {advancedSettings[selectedPlatform.platformId]?.schedulingPreference === 'consistent' && (
                        <div className="mt-2">
                          <label className="block text-sm text-gray-500 mb-1">Preferred time</label>
                          <input
                            type="time"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                            value={advancedSettings[selectedPlatform.platformId]?.bestTimeToPost}
                            onChange={(e) => updateAdvancedSetting(
                              selectedPlatform.platformId,
                              'bestTimeToPost',
                              e.target.value
                            )}
                          />
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Configure when your content will be published to maximize engagement.
                      </p>
                    </div>
                  </div>
                  
                  {/* Platform-specific optimization */}
                  <div className="flex items-start border-t border-gray-200 pt-5">
                    <ArrowUpFromDot className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Content Optimization Level
                      </label>
                      <div className="mt-2">
                        <div className="w-full flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Minimal</span>
                          <input 
                            type="range" 
                            min="1" 
                            max="5" 
                            className="flex-1" 
                            defaultValue="3"
                          />
                          <span className="text-xs text-gray-500">Maximum</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        How much the AI should optimize your content specifically for {selectedPlatform.platformName}'s audience and algorithm.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Select a platform to configure its settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
