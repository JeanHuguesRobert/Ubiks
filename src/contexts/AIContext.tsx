import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AIService, AIServiceConfig } from '../services/AIService';
import { AIResponse as AIResponseType, AIConfig } from '../types/AI';

interface AIResponse {
  text: string;
  tokens?: number;
  model?: string;
}

interface AIProvider {
  id: string;
  name: string;
  description: string;
  url: string;
  defaultModel: string;
  models: string[];
}

interface AIContextType {
  service: AIService | null;
  isConfigured: boolean;
  isLoading: boolean;
  isAIAvailable: boolean;
  error: string | null;
  configure: (config: AIServiceConfig) => void;
  clearError: () => void;
  completePrompt: (params: {
    prompt: string;
    options?: {
      provider?: string;
      model?: string;
      temperature?: number;
    };
  }) => Promise<AIResponse>;
  fillPromptTemplate: (template: string, values: Record<string, string>) => Promise<AIResponse>;
  getAvailableProviders: () => AIProvider[];
  addCredentials: (provider: string, apiKey: string) => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIContextProvider');
  }
  return context;
};

interface AIContextProviderProps {
  children: ReactNode;
}

export const AIContextProvider: React.FC<AIContextProviderProps> = ({ children }) => {
  const [service, setService] = useState<AIService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configure = (config: AIServiceConfig) => {
    try {
      const aiService = new AIService(config);
      setService(aiService);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to configure AI service');
      setService(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const completePrompt = async ({
    prompt,
    options = {}
  }: {
    prompt: string;
    options?: {
      provider?: string;
      model?: string;
      temperature?: number;
    };
  }): Promise<AIResponse> => {
    if (!service) throw new Error('AI service not configured');
    setIsLoading(true);
    try {
      const result = await service.adaptContent(prompt, 'twitter', options);
      return { text: result };
    } finally {
      setIsLoading(false);
    }
  };

  const fillPromptTemplate = async (template: string, values: Record<string, string>): Promise<AIResponse> => {
    if (!service) throw new Error('AI service not configured');
    let filledPrompt = template;
    Object.entries(values).forEach(([key, value]) => {
      filledPrompt = filledPrompt.replace(`{${key}}`, value);
    });
    return completePrompt({ prompt: filledPrompt });
  };

  const getAvailableProviders = (): AIProvider[] => {
    return [
      {
        id: 'mistral',
        name: 'Mistral AI',
        description: 'Advanced language models with strong multilingual capabilities',
        url: 'https://mistral.ai',
        defaultModel: 'mistral-tiny',
        models: ['mistral-tiny', 'mistral-small', 'mistral-medium']
      },
      {
        id: 'openai',
        name: 'OpenAI',
        description: 'Industry-leading language models and APIs',
        url: 'https://openai.com',
        defaultModel: 'gpt-3.5-turbo',
        models: ['gpt-3.5-turbo', 'gpt-4']
      }
    ];
  };

  const addCredentials = async (provider: string, apiKey: string): Promise<void> => {
    try {
      if (!['openai', 'anthropic', 'mistral', 'custom'].includes(provider)) {
        throw new Error('Invalid provider');
      }
      const config: AIServiceConfig = {
        provider: provider as 'openai' | 'anthropic' | 'mistral' | 'custom',
        apiKey,
        endpoint: provider === 'mistral' ? 'https://api.mistral.ai/v1' : undefined
      };
      
      // Test the credentials before saving
      const testService = new AIService(config);
      await testService.testConnection();
      
      // If test succeeds, update the service
      configure(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify API key');
      throw err;
    }
  };

  const value = {
    service,
    isConfigured: !!service,
    isLoading,
    isAIAvailable: !!service && !error,
    error,
    configure,
    clearError,
    completePrompt,
    fillPromptTemplate,
    getAvailableProviders,
    addCredentials
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};
