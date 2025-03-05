export type AIProvider = 'openai' | 'anthropic' | 'google' | 'azure-openai' | 'custom';

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  supportsStreaming: boolean;
  maxTokens: number;
  contextWindow: number;
  pricePer1kTokens?: number;
  hasVision?: boolean;
}

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  logoUrl: string;
  website: string;
  apiDocumentation: string;
  models: AIModelConfig[];
  apiEndpoint: string;
  testEndpoint?: string;
}

export interface AICredentials {
  id: string;
  provider: AIProvider;
  apiKey: string;
  apiEndpoint?: string;
  organizationId?: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastVerified?: string;
  status: 'active' | 'invalid' | 'unverified';
  userId: string;
}

export interface AIRequestOptions {
  provider: AIProvider;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
}

export interface AICompletionRequest {
  prompt: string;
  options: AIRequestOptions;
}

export interface AICompletionResponse {
  text: string;
  model: string;
  provider: AIProvider;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  finishReason?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  defaultModel: string;
  defaultProvider: AIProvider;
  taskType: 'tone-shift' | 'platform-adapt' | 'summarize' | 'hashtag-generation' | 'content-ideas' | 'custom';
  parameters: string[]; // List of parameter names to substitute in the template
  createdAt: string;
  updatedAt: string;
  userId: string;
  systemMessage?: string;
}

export const PREDEFINED_MODELS: Record<AIProvider, AIModelConfig[]> = {
  'openai': [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      supportsStreaming: true,
      maxTokens: 8192,
      contextWindow: 8192,
      pricePer1kTokens: 0.06
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      supportsStreaming: true,
      maxTokens: 4096,
      contextWindow: 128000,
      pricePer1kTokens: 0.01
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      supportsStreaming: true,
      maxTokens: 4096,
      contextWindow: 16385,
      pricePer1kTokens: 0.0015
    }
  ],
  'anthropic': [
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      supportsStreaming: true,
      maxTokens: 4096,
      contextWindow: 200000,
      pricePer1kTokens: 0.15,
      hasVision: true
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      supportsStreaming: true,
      maxTokens: 4096,
      contextWindow: 200000,
      pricePer1kTokens: 0.03,
      hasVision: true
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      supportsStreaming: true,
      maxTokens: 4096,
      contextWindow: 200000,
      pricePer1kTokens: 0.00025,
      hasVision: true
    }
  ],
  'google': [
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'google',
      supportsStreaming: true,
      maxTokens: 8192,
      contextWindow: 32768,
      pricePer1kTokens: 0.0025
    },
    {
      id: 'gemini-pro-vision',
      name: 'Gemini Pro Vision',
      provider: 'google',
      supportsStreaming: false,
      maxTokens: 4096,
      contextWindow: 16384,
      pricePer1kTokens: 0.0025,
      hasVision: true
    }
  ],
  'azure-openai': [
    {
      id: 'gpt-4',
      name: 'GPT-4 (Azure)',
      provider: 'azure-openai',
      supportsStreaming: true,
      maxTokens: 8192,
      contextWindow: 8192,
      pricePer1kTokens: 0.06
    },
    {
      id: 'gpt-35-turbo',
      name: 'GPT-3.5 Turbo (Azure)',
      provider: 'azure-openai',
      supportsStreaming: true,
      maxTokens: 4096,
      contextWindow: 16385,
      pricePer1kTokens: 0.0015
    }
  ],
  'custom': []
};

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tone-shift-template',
    name: 'Tone Shifter',
    description: 'Adapts content to match a specific tone',
    template: `Rewrite the following content to match a {{tone}} tone while preserving the key message:

Content: {{content}}

The rewritten content should sound {{tone}} but keep the same meaning and information.`,
    defaultModel: 'gpt-3.5-turbo',
    defaultProvider: 'openai',
    taskType: 'tone-shift',
    parameters: ['tone', 'content'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'system',
    systemMessage: 'You are an expert writer who can adapt content to different tones while preserving the original message.'
  },
  {
    id: 'platform-adapt-template',
    name: 'Platform Adapter',
    description: 'Adapts content to match a specific social platform',
    template: `Rewrite the following content to be optimized for {{platform}}, following its best practices and conventions:

Original content: {{content}}

Persona style: {{style}}
Tone: {{tone}}
Character limit: {{characterLimit}}

Make sure the adapted content follows {{platform}}'s conventions, appropriate hashtag usage, and effective formatting for maximum engagement.`,
    defaultModel: 'gpt-3.5-turbo',
    defaultProvider: 'openai',
    taskType: 'platform-adapt',
    parameters: ['platform', 'content', 'style', 'tone', 'characterLimit'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'system',
    systemMessage: 'You are a social media expert who knows how to optimize content for different platforms.'
  },
  {
    id: 'hashtag-generator-template',
    name: 'Hashtag Generator',
    description: 'Generates relevant hashtags for content',
    template: `Generate {{count}} relevant hashtags for the following content on {{platform}}:

Content: {{content}}

The hashtags should be popular, relevant to the content, and appropriate for {{platform}}.`,
    defaultModel: 'gpt-3.5-turbo',
    defaultProvider: 'openai',
    taskType: 'hashtag-generation',
    parameters: ['count', 'platform', 'content'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'system',
    systemMessage: 'You are a hashtag expert who knows the most effective and trending hashtags for different platforms.'
  }
];

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    website: 'https://openai.com',
    apiDocumentation: 'https://platform.openai.com/docs/api-reference',
    models: PREDEFINED_MODELS['openai'],
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    testEndpoint: 'https://api.openai.com/v1/models'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logoUrl: 'https://avatars.githubusercontent.com/u/123580429',
    website: 'https://www.anthropic.com',
    apiDocumentation: 'https://docs.anthropic.com/claude/reference',
    models: PREDEFINED_MODELS['anthropic'],
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    testEndpoint: 'https://api.anthropic.com/v1/models'
  },
  {
    id: 'google',
    name: 'Google AI',
    logoUrl: 'https://seeklogo.com/images/G/google-ai-logo-996E75DD46-seeklogo.com.png',
    website: 'https://ai.google.dev/',
    apiDocumentation: 'https://ai.google.dev/docs',
    models: PREDEFINED_MODELS['google'],
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
  },
  {
    id: 'azure-openai',
    name: 'Azure OpenAI',
    logoUrl: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/media/logo.svg',
    website: 'https://azure.microsoft.com/en-us/products/cognitive-services/openai-service',
    apiDocumentation: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/',
    models: PREDEFINED_MODELS['azure-openai'],
    apiEndpoint: 'https://{resource-name}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions?api-version={api-version}'
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995562.png',
    website: '',
    apiDocumentation: '',
    models: PREDEFINED_MODELS['custom'],
    apiEndpoint: ''
  }
];

export interface AIProviderDetails {
  id: string;
  name: string;
  description: string;
  url: string;
  defaultModel: string;
  models: string[];
}

export interface AIConfig {
  provider: string;
  apiKey: string;
  model?: string;
  endpoint?: string;
}

export interface AIResponse {
  text: string;
  tokens?: number;
  model?: string;
}
