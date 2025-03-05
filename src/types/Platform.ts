export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin';

export interface SocialPlatformSettings {
  platform: SocialPlatform;
  enabled: boolean;
  username?: string;
  profileUrl?: string;
  settings?: Record<string, any>;
}
