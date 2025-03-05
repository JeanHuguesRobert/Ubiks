import { SocialPlatform } from "./SocialAccount";

export interface PlatformPostSettings {
  enabled: boolean;
  useHashtags: boolean;
  useImages: boolean;
  threadEnabled?: boolean;
  pageId?: string | null;
}

export interface ContentImage {
  id: string;
  url: string;
  file?: File;
  name: string;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadProgress?: number;
  uploadError?: string;
}

export interface ContentDraft {
  id: string;
  title?: string;
  text: string;
  html: string;
  images: ContentImage[];
  createdAt: string;
  updatedAt: string;
  lastSaved?: string;
  platformSettings: Record<SocialPlatform, PlatformPostSettings>;
  selectedPersonaIds: Record<SocialPlatform, string | null>;
  status: 'draft' | 'scheduled' | 'published';
  scheduledTime?: string;
  userId: string;
  adaptedContent?: Record<SocialPlatform, string>;
}

export interface PublishedContent extends ContentDraft {
  publishedAt: string;
  publishedPlatforms: SocialPlatform[];
  publishResults: Record<SocialPlatform, {
    success: boolean;
    postId?: string;
    postUrl?: string;
    error?: string;
  }>;
}

export interface ContentPost {
  id: string;
  title: string;
  content: string;
  mediaUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'preview' | 'scheduled' | 'published';
}

export interface PlatformAdaptation {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  adaptedContent: string;
  characterCount: number;
  mediaSupported: boolean;
  warnings?: string[];
}

export interface ContentState {
  currentDraft: ContentDraft | null;
  adaptations: Record<SocialPlatform, string>;
  previewPlatform: SocialPlatform | null;
  isDirty: boolean;
  isAdapting: boolean;
}

// Empty content draft with default values
export const createEmptyDraft = (userId: string): ContentDraft => {
  const id = `draft-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  
  return {
    id,
    text: '',
    html: '',
    images: [],
    createdAt: now,
    updatedAt: now,
    platformSettings: {
      twitter: {
        enabled: true,
        useHashtags: true,
        useImages: true,
        threadEnabled: true
      },
      linkedin: {
        enabled: false,
        useHashtags: true,
        useImages: true
      },
      facebook: {
        enabled: false,
        useHashtags: false,
        useImages: true,
        pageId: null
      },
      instagram: {
        enabled: false,
        useHashtags: true,
        useImages: true
      }
    },
    selectedPersonaIds: {
      twitter: null,
      linkedin: null,
      facebook: null,
      instagram: null
    },
    status: 'draft',
    userId,
    adaptedContent: {
      twitter: '',
      linkedin: '',
      facebook: '',
      instagram: ''
    }
  };
};

// Platform-specific character limits
export const PLATFORM_CHARACTER_LIMITS: Record<SocialPlatform, number | null> = {
  twitter: 280,
  linkedin: 3000,
  facebook: 63206, // Facebook has a very high limit
  instagram: 2200
};

// Helper to check if content exceeds platform limits
export const exceedsPlatformLimit = (text: string, platform: SocialPlatform): boolean => {
  const limit = PLATFORM_CHARACTER_LIMITS[platform];
  if (!limit) return false;
  return text.length > limit;
};

// Helper to truncate content to platform limits
export const truncateToPlatformLimit = (text: string, platform: SocialPlatform): string => {
  const limit = PLATFORM_CHARACTER_LIMITS[platform];
  if (!limit || text.length <= limit) return text;
  
  return text.substring(0, limit - 3) + '...';
};
