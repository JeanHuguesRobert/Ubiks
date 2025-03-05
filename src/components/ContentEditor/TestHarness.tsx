import React, { useState } from 'react';
import { AIService } from '../../services/AIService';
import { testContent } from '../../data/testContent';
import { SocialPlatform } from '../../types/SocialAccount';
import { PlatformPreview } from './PlatformPreview';

export const TestHarness: React.FC = () => {
  const [results, setResults] = useState<Record<string, Record<SocialPlatform, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const platforms: SocialPlatform[] = ['twitter', 'linkedin', 'facebook', 'instagram'];

  const runTest = async () => {
    setIsLoading(true);
    setError(null);
    
    const aiService = new AIService({
      provider: 'mistral',
      apiKey: import.meta.env.VITE_MISTRAL_API_KEY || ''
    });

    try {
      const testResults: Record<string, Record<SocialPlatform, string>> = {};

      for (const [key, content] of Object.entries(testContent)) {
        testResults[key] = {
          twitter: '',
          linkedin: '',
          facebook: '',
          instagram: ''
        };
        for (const platform of platforms) {
          const adapted = await aiService.adaptContent(content.text, platform);
          testResults[key][platform] = adapted;
        }
      }

      setResults(testResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Content Adaptation Test Harness</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400"
          onClick={runTest}
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Run Tests'}
        </button>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {Object.entries(results).map(([key, platformResults]) => (
        <div key={key} className="mb-8">
          <h3 className="text-lg font-semibold mb-2 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Original:</h4>
            <div className="prose max-w-none">
              {testContent[key as keyof typeof testContent].text}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(platformResults).map(([platform, content]) => (
              <PlatformPreview
                key={platform}
                platform={platform as SocialPlatform}
                content={content}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};