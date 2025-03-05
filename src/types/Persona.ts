import { SocialPlatform } from './SocialAccount';

export interface SocialPlatformSettings {
  platformId: SocialPlatform;
  platformName: string;
  enabled: boolean;
  maxLength?: number;
  supportsTags: boolean;
  supportsImages: boolean;
  supportsVideos: boolean;
}

export interface Persona {
  id: string;
  name: string;
  description?: string;
  githubRepo?: string;
  githubUrl?: string;
  avatarUrl?: string;  // Make avatarUrl optional
  updatedAt: string;
  createdAt: string;
  tone?: string;
  style?: string;
  voice?: string;
  userId?: string;
  platforms: SocialPlatformSettings[];  // Ensure this is always an array
}

export interface PersonaFormData {
  name: string;
  description?: string;
  tone?: string;
  style?: string;
  voice?: string;
  avatarUrl?: string;
  platforms: SocialPlatformSettings[];  // Ensure this is an array
}

export const defaultPlatforms: SocialPlatformSettings[] = [
  {
    platformId: 'twitter',
    platformName: 'Twitter',
    enabled: true,
    maxLength: 280,
    supportsTags: true,
    supportsImages: true,
    supportsVideos: true
  },
  {
    platformId: 'linkedin',
    platformName: 'LinkedIn',
    enabled: false,
    maxLength: 3000,
    supportsTags: true,
    supportsImages: true,
    supportsVideos: true
  },
  {
    platformId: 'facebook',
    platformName: 'Facebook',
    enabled: false,
    supportsTags: true,
    supportsImages: true,
    supportsVideos: true
  },
  {
    platformId: 'instagram',
    platformName: 'Instagram',
    enabled: false,
    supportsTags: true,
    supportsImages: true,
    supportsVideos: true
  }
];

export const emptyPersonaForm: PersonaFormData = {
  name: '',
  description: '',
  tone: 'casual',
  style: 'conversational',
  voice: 'first-person',
  platforms: defaultPlatforms  // Use the array-based default platforms
};

export const personaTones = [
  { value: 'casual', label: 'Casual' },
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'witty', label: 'Witty' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'authoritative', label: 'Authoritative' }
];

export const personaStyles = [
  { value: 'conversational', label: 'Conversational' },
  { value: 'informative', label: 'Informative' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'educational', label: 'Educational' },
  { value: 'promotional', label: 'Promotional' }
];

export const personaVoices = [
  { value: 'first-person', label: 'First Person (I, we)' },
  { value: 'second-person', label: 'Second Person (you)' },
  { value: 'third-person', label: 'Third Person (they, it)' },
  { value: 'brand-voice', label: 'Brand Voice' }
];
