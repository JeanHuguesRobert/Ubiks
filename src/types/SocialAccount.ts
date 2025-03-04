export type SocialPlatform = 'twitter' | 'linkedin' | 'facebook' | 'instagram';

export type AccountStatus = 'active' | 'pending' | 'expired' | 'revoked' | 'reconnecting';

export interface SocialAccountSettings {
  defaultPersonaId: string | null;
  autoPostEnabled: boolean;
  [key: string]: any; // For platform-specific settings
}

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  profileId: string;
  profileName: string;
  profileImage?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  status?: AccountStatus;
  lastVerified?: string;
  profileData: any;
  connected: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  settings: SocialAccountSettings;
}

export interface PlatformConfig {
  name: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
  authType: 'oauth' | 'oauth2';
  apiVersion: string;
  scopes: string[];
  settingsFields: {
    key: string;
    label: string;
    type: 'toggle' | 'select' | 'number' | 'text';
    description?: string;
    options?: { value: string; label: string }[];
  }[];
}

export const platformConfigs: Record<SocialPlatform, PlatformConfig> = {
  twitter: {
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    description: 'Connect to Twitter to post tweets and threads',
    features: ['Tweets', 'Threads', 'Media upload', 'Scheduled posts'],
    authType: 'oauth2',
    apiVersion: '2',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    settingsFields: [
      {
        key: 'includeHashtags',
        label: 'Include hashtags',
        type: 'toggle',
        description: 'Automatically add relevant hashtags to your tweets'
      },
      {
        key: 'maxHashtags',
        label: 'Maximum hashtags',
        type: 'number',
        description: 'Maximum number of hashtags to include'
      },
      {
        key: 'threadEnabled',
        label: 'Thread support',
        type: 'toggle',
        description: 'Split long content into multiple tweets as a thread'
      }
    ]
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0077B5',
    description: 'Connect to LinkedIn to post updates and articles',
    features: ['Posts', 'Articles', 'Media upload'],
    authType: 'oauth2',
    apiVersion: 'v2',
    scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
    settingsFields: [
      {
        key: 'includeHashtags',
        label: 'Include hashtags',
        type: 'toggle',
        description: 'Automatically add relevant hashtags to your posts'
      },
      {
        key: 'maxHashtags',
        label: 'Maximum hashtags',
        type: 'number',
        description: 'Maximum number of hashtags to include'
      },
      {
        key: 'includeLink',
        label: 'Include link preview',
        type: 'toggle',
        description: 'Display link previews in your posts when available'
      }
    ]
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    description: 'Connect to Facebook to post updates to your profile or pages',
    features: ['Posts', 'Page management', 'Media upload'],
    authType: 'oauth2',
    apiVersion: 'v16.0',
    scopes: ['public_profile', 'email', 'pages_manage_posts'],
    settingsFields: [
      {
        key: 'pageId',
        label: 'Post to Page',
        type: 'select',
        description: 'Select which page to post to (leave empty for personal profile)',
        options: [] // Will be populated dynamically based on connected pages
      },
      {
        key: 'includeHashtags',
        label: 'Include hashtags',
        type: 'toggle',
        description: 'Automatically add relevant hashtags to your posts'
      },
      {
        key: 'preferImages',
        label: 'Prefer images',
        type: 'toggle',
        description: 'Prioritize image content when available'
      }
    ]
  },
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    description: 'Connect to Instagram to post photos and stories',
    features: ['Posts', 'Stories', 'Carousels'],
    authType: 'oauth2',
    apiVersion: 'v16.0',
    scopes: ['instagram_basic', 'instagram_content_publish'],
    settingsFields: [
      {
        key: 'includeHashtags',
        label: 'Include hashtags',
        type: 'toggle',
        description: 'Automatically add relevant hashtags to your posts'
      },
      {
        key: 'maxHashtags',
        label: 'Maximum hashtags',
        type: 'number',
        description: 'Maximum number of hashtags to include'
      },
      {
        key: 'preferCarousel',
        label: 'Prefer carousel',
        type: 'toggle',
        description: 'Create carousel posts when multiple images are available'
      }
    ]
  }
};
