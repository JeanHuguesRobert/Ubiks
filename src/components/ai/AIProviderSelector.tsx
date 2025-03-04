import React, { useState, useEffect } from 'react';
import { useAI } from '../../contexts/AIContext';
import { AIProvider, AI_PROVIDERS, AIModelConfig, PREDEFINED_MODELS } from '../../types/AI';
import { CircleAlert } from 'lucide-react';

interface AIProviderSelectorProps {
  selectedProvider: AIProvider | null;
  selectedModel: string | null;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
}

const AIProviderSelector = ({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange
}: AIProviderSelectorProps) => {
  const { getAvailableProviders, isAIAvailable } = useAI();
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);
  const [availableModels, setAvailableModels] = useState<AIModelConfig[]>([]);

  useEffect(() => {
    const providers = getAvailableProviders();
    setAvailableProviders(providers);
    
    // Select first provider if none is selected
    if (providers.length > 0 && !selectedProvider) {
      onProviderChange(providers[0]);
    }
  }, [getAvailableProviders, selectedProvider, onProviderChange]);

  useEffect(() => {
    if (selectedProvider) {
      const models = PREDEFINED_MODELS[selectedProvider] || [];
      setAvailableModels(models);
      
      // Select first model if none is selected or if current selection is invalid
      if (models.length > 0 && (!selectedModel || !models.some(m => m.id === selectedModel))) {
        onModelChange(models[0].id);
      }
    }
  }, [selectedProvider, selectedModel, onModelChange]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as AIProvider;
    onProviderChange(newProvider);
    
    // Automatically select the first model of the new provider
    const models = PREDEFINED_MODELS[newProvider] || [];
    if (models.length > 0) {
      onModelChange(models[0].id);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onModelChange(e.target.value);
  };

  if (!isAIAvailable) {
    return (
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
        <div className="flex">
          <div className="flex-shrink-0">
            <CircleAlert className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm">
              No AI providers configured. Please add API keys in Settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="ai-provider" className="block text-sm font-medium text-gray-700">
          AI Provider
        </label>
        <select
          id="ai-provider"
          value={selectedProvider || ''}
          onChange={handleProviderChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {availableProviders.length === 0 ? (
            <option value="" disabled>No providers available</option>
          ) : (
            availableProviders.map((provider) => {
              const providerInfo = AI_PROVIDERS.find(p => p.id === provider);
              return (
                <option key={provider} value={provider}>
                  {providerInfo?.name || provider}
                </option>
              );
            })
          )}
        </select>
      </div>
      
      <div>
        <label htmlFor="ai-model" className="block text-sm font-medium text-gray-700">
          AI Model
        </label>
        <select
          id="ai-model"
          value={selectedModel || ''}
          onChange={handleModelChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          disabled={!selectedProvider || availableModels.length === 0}
        >
          {availableModels.length === 0 ? (
            <option value="" disabled>No models available</option>
          ) : (
            availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};

export default AIProviderSelector;
