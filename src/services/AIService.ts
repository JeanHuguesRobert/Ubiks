import { SocialPlatform } from '../types/SocialAccount';

interface MistralResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface AIServiceConfig {
  apiKey: string;
  provider: 'openai' | 'anthropic' | 'mistral' | 'custom';
  endpoint?: string;
}

export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    if (import.meta.env.DEV && config.apiKey) {
      console.warn(
        'WARNING: Ensure your API keys are properly secured and not exposed in client-side code.',
        'Consider moving AI calls to a backend service in production.'
      );
    }
  }

  private buildPrompt(content: string, platform: SocialPlatform): string {
    const platformGuides = {
      twitter: 'Max 280 characters, hashtags common, informal tone acceptable, thread-friendly',
      linkedin: 'Professional tone, industry hashtags, longer form allowed, focus on business value',
      facebook: 'Casual but clean tone, moderate hashtag use, engagement-focused',
      instagram: 'Visual-first platform, heavy hashtag use, casual tone, emotional connection'
    };

    return `As a multilingual social media expert, adapt this content for ${platform}.
Detect the language and maintain it in the adaptation.

Platform Guidelines: ${platformGuides[platform]}

Original Content: ${content}

Requirements:
1. Keep the original language
2. Match ${platform}'s voice and style
3. Stay within character limits
4. Optimize for engagement
5. Add relevant hashtags in the same language
6. Preserve cultural context and references

Respond with ONLY the adapted content, no explanations.`;
  }

  private async callMistral(prompt: string): Promise<string> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-tiny',
        messages: [
          {
            role: 'system',
            content: 'You are a social media content adaptation expert.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`);
    }

    const data: MistralResponse = await response.json();
    return data.choices[0].message.content;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        throw new Error('No API key provided');
      }

      // Test the connection based on provider
      switch (this.config.provider) {
        case 'mistral':
          await this.callMistral('Test connection');
          break;
        case 'openai':
          // Add OpenAI test endpoint call
          break;
        case 'anthropic':
          // Add Anthropic test endpoint call
          break;
        case 'custom':
          // Add custom provider test
          break;
        default:
          throw new Error('Unsupported provider');
      }

      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw new Error(`Failed to verify API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async adaptContent(
    content: string, 
    platform: SocialPlatform,
    options: {
      provider?: string;
      model?: string;
      temperature?: number;
    } = {}
  ): Promise<string> {
    if (!this.config.apiKey) {
      console.warn('No AI API key provided, returning original content');
      return content;
    }

    const prompt = this.buildPrompt(content, platform);
    
    try {
      return await this.callMistral(prompt);
    } catch (error) {
      console.error('AI adaptation failed:', error);
      return content;
    }
  }

}