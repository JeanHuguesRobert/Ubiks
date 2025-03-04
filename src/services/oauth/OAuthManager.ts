import { SocialPlatform } from '../../types/SocialAccount';
import { tokenEncryptionService } from '../TokenEncryptionService';

// OAuth configuration for each platform
export const OAUTH_CONFIG = {
  twitter: {
    clientId: 'twitter-client-id',
    redirectUri: `${window.location.origin}/oauth/callback/twitter`,
    authEndpoint: 'https://twitter.com/i/oauth2/authorize',
    tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
    // Core scopes: reading user profile, reading and writing tweets
    coreScopes: ['tweet.read', 'users.read'],
    // Optional scopes: for more advanced features
    optionalScopes: {
      writing: ['tweet.write'],
      offline: ['offline.access'],
      media: ['media.upload', 'media.read']
    },
    responseType: 'code',
    // Human-readable descriptions of permissions
    scopeDescriptions: {
      'tweet.read': 'View your tweets',
      'tweet.write': 'Post tweets on your behalf',
      'users.read': 'See your profile information',
      'offline.access': 'Use your access indefinitely',
      'media.upload': 'Upload images and videos',
      'media.read': 'View your media'
    }
  },
  linkedin: {
    clientId: 'linkedin-client-id',
    redirectUri: `${window.location.origin}/oauth/callback/linkedin`,
    authEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
    // Core scopes: reading profile information
    coreScopes: ['r_liteprofile', 'r_emailaddress'],
    // Optional scopes: for more advanced features
    optionalScopes: {
      writing: ['w_member_social'],
      offline: [],
      media: []
    },
    responseType: 'code',
    // Human-readable descriptions of permissions
    scopeDescriptions: {
      'r_liteprofile': 'View your basic profile details',
      'r_emailaddress': 'View your email address',
      'w_member_social': 'Post content on your behalf'
    }
  },
  facebook: {
    clientId: 'facebook-client-id',
    redirectUri: `${window.location.origin}/oauth/callback/facebook`,
    authEndpoint: 'https://www.facebook.com/v16.0/dialog/oauth',
    tokenEndpoint: 'https://graph.facebook.com/v16.0/oauth/access_token',
    // Core scopes: reading profile information
    coreScopes: ['public_profile', 'email'],
    // Optional scopes: for more advanced features
    optionalScopes: {
      writing: ['pages_manage_posts', 'publish_to_groups'],
      pages: ['pages_read_engagement', 'pages_show_list'],
      media: []
    },
    responseType: 'code',
    // Human-readable descriptions of permissions
    scopeDescriptions: {
      'public_profile': 'View your public profile information',
      'email': 'View your email address',
      'pages_manage_posts': 'Manage and create posts on your Pages',
      'publish_to_groups': 'Publish content to groups you manage',
      'pages_read_engagement': 'View analytics for your Pages',
      'pages_show_list': 'View the list of Pages you manage'
    }
  },
  instagram: {
    clientId: 'instagram-client-id',
    redirectUri: `${window.location.origin}/oauth/callback/instagram`,
    authEndpoint: 'https://api.instagram.com/oauth/authorize',
    tokenEndpoint: 'https://api.instagram.com/oauth/access_token',
    // Core scopes: basic profile access
    coreScopes: ['user_profile'],
    // Optional scopes: for more advanced features
    optionalScopes: {
      writing: ['user_media'],
      media: [],
      offline: []
    },
    responseType: 'code',
    // Human-readable descriptions of permissions
    scopeDescriptions: {
      'user_profile': 'View your profile information',
      'user_media': 'Access your photos and videos'
    }
  }
};

// Store temporary OAuth session data
interface OAuthSession {
  state: string;
  codeVerifier?: string; // For PKCE
  platform: SocialPlatform;
  requestedScopes: string[];
  redirectUri: string;
  timestamp: number;
}

/**
 * Gets the requested scopes based on user preferences
 */
export function getRequestedScopes(
  platform: SocialPlatform, 
  options: { includeWriting?: boolean; includeMedia?: boolean; includeOffline?: boolean } = {}
): string[] {
  const config = OAUTH_CONFIG[platform];
  const scopes = [...config.coreScopes];
  
  // Add optional scopes based on user preferences
  if (options.includeWriting && config.optionalScopes.writing) {
    scopes.push(...config.optionalScopes.writing);
  }
  
  if (options.includeMedia && config.optionalScopes.media) {
    scopes.push(...config.optionalScopes.media);
  }
  
  if (options.includeOffline && config.optionalScopes.offline) {
    scopes.push(...config.optionalScopes.offline);
  }
  
  // Add any platform-specific optional scopes
  if (options.includeWriting && platform === 'facebook' && config.optionalScopes.pages) {
    scopes.push(...config.optionalScopes.pages);
  }
  
  return scopes;
}

/**
 * Gets human-readable descriptions for the requested scopes
 */
export function getScopeDescriptions(platform: SocialPlatform, scopes: string[]): { scope: string; description: string }[] {
  const config = OAUTH_CONFIG[platform];
  
  return scopes.map(scope => ({
    scope,
    description: config.scopeDescriptions[scope] || scope
  }));
}

/**
 * Generates a URL for OAuth authentication with proper scopes
 */
export function generateAuthUrl(
  platform: SocialPlatform, 
  options: { 
    includeWriting?: boolean; 
    includeMedia?: boolean; 
    includeOffline?: boolean;
    usePKCE?: boolean;
  } = {}
): { url: string; state: string; codeVerifier?: string } {
  const config = OAUTH_CONFIG[platform];
  const state = generateRandomState();
  const requestedScopes = getRequestedScopes(platform, options);
  
  let codeVerifier: string | undefined;
  let codeChallenge: string | undefined;
  
  // If PKCE is enabled, generate code verifier and challenge
  if (options.usePKCE) {
    codeVerifier = generateCodeVerifier();
    codeChallenge = generateCodeChallenge(codeVerifier);
  }
  
  // Store session information securely
  storeOAuthSession(platform, {
    state,
    codeVerifier,
    platform,
    requestedScopes,
    redirectUri: config.redirectUri,
    timestamp: Date.now()
  });
  
  // Build URL parameters
  const params: Record<string, string> = {
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: config.responseType,
    scope: requestedScopes.join(' '),
    state: state
  };
  
  // Add PKCE parameters if needed
  if (codeVerifier && codeChallenge) {
    params.code_challenge = codeChallenge;
    params.code_challenge_method = 'S256';
  }
  
  const queryString = new URLSearchParams(params).toString();
  return { 
    url: `${config.authEndpoint}?${queryString}`,
    state,
    codeVerifier
  };
}

/**
 * Initiates the OAuth flow with proper permissions explanations
 */
export function initiateOAuth(
  platform: SocialPlatform, 
  options: { 
    includeWriting?: boolean; 
    includeMedia?: boolean; 
    includeOffline?: boolean 
  } = { includeWriting: true }
): void {
  const { url } = generateAuthUrl(platform, options);
  
  // Store the requested permissions for later verification
  localStorage.setItem(`oauth_permissions_${platform}`, JSON.stringify({
    includeWriting: options.includeWriting,
    includeMedia: options.includeMedia,
    includeOffline: options.includeOffline,
    timestamp: Date.now()
  }));
  
  window.location.href = url;
}

/**
 * Verifies the OAuth state parameter to prevent CSRF attacks
 */
export function verifyOAuthState(platform: SocialPlatform, state: string): boolean {
  const session = getOAuthSession(platform);
  if (!session || session.state !== state) {
    return false;
  }
  
  // Check if the session has expired (30 minutes)
  const expirationTime = 30 * 60 * 1000; // 30 minutes in milliseconds
  if (Date.now() - session.timestamp > expirationTime) {
    clearOAuthSession(platform);
    return false;
  }
  
  return true;
}

/**
 * Securely exchanges code for token with proper error handling
 */
export async function exchangeCodeForToken(
  platform: SocialPlatform, 
  code: string
): Promise<{ 
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}> {
  // Get the session data including code verifier if PKCE was used
  const session = getOAuthSession(platform);
  
  if (!session) {
    throw new Error('OAuth session not found. Authentication may have expired.');
  }
  
  // In a real implementation, this would make a fetch request to your backend
  // The backend would then exchange the code for a token using client_secret
  
  console.log(`Exchanging code for ${platform} token with scopes: ${session.requestedScopes.join(', ')}`);
  
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock token data
  const accessToken = `mock-${platform}-token-${Date.now()}`;
  const refreshToken = `mock-${platform}-refresh-token-${Date.now()}`;
  
  // Clear the session data
  clearOAuthSession(platform);
  
  return {
    // In a real app, these would be encrypted before storage
    accessToken: tokenEncryptionService.encryptToken(accessToken),
    refreshToken: tokenEncryptionService.encryptToken(refreshToken),
    expiresIn: 3600
  };
}

/**
 * Gets the requested permissions for a platform
 */
export function getRequestedPermissions(platform: SocialPlatform): { 
  includeWriting?: boolean; 
  includeMedia?: boolean; 
  includeOffline?: boolean;
  timestamp?: number;
} {
  const storedPermissions = localStorage.getItem(`oauth_permissions_${platform}`);
  if (!storedPermissions) {
    return { includeWriting: true };
  }
  
  try {
    return JSON.parse(storedPermissions);
  } catch {
    return { includeWriting: true };
  }
}

/**
 * Stores OAuth session data securely
 */
function storeOAuthSession(platform: SocialPlatform, session: OAuthSession): void {
  // In a real app, this would be stored more securely (e.g., encrypted in sessionStorage)
  const sessionData = JSON.stringify(session);
  localStorage.setItem(`oauth_session_${platform}`, sessionData);
}

/**
 * Retrieves stored OAuth session data
 */
function getOAuthSession(platform: SocialPlatform): OAuthSession | null {
  const sessionData = localStorage.getItem(`oauth_session_${platform}`);
  if (!sessionData) {
    return null;
  }
  
  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

/**
 * Clears OAuth session data
 */
function clearOAuthSession(platform: SocialPlatform): void {
  localStorage.removeItem(`oauth_session_${platform}`);
}

/**
 * Generates a random state parameter for OAuth security
 */
function generateRandomState(): string {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a code verifier for PKCE (RFC 7636)
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(64);
  window.crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generates a code challenge from a code verifier
 */
function generateCodeChallenge(codeVerifier: string): string {
  // In a real app, this would use the Crypto API to create a SHA-256 hash
  // For this demo, we'll just use a simple encoding
  return base64UrlEncode(new TextEncoder().encode(codeVerifier));
}

/**
 * Base64 URL encoding (RFC 4648)
 */
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
