import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { verifyOAuthState, exchangeCodeForToken } from '../services/oauth/OAuthManager';
import { useSocialAccounts } from '../contexts/SocialAccountContext';
import { SocialPlatform } from '../types/SocialAccount';
import queryString from 'query-string';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

// Platform-specific API calls to get profile information
async function fetchTwitterProfile(token: string) {
  // In a real app, you would make API calls to Twitter
  // For this demo, we'll return mock data
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id: 'twitter-user-123',
    name: 'Twitter User',
    username: 'twitteruser',
    profile_image_url: 'https://via.placeholder.com/150?text=T'
  };
}

async function fetchLinkedinProfile(token: string) {
  // Mock LinkedIn API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id: 'linkedin-user-123',
    name: 'LinkedIn User',
    email: 'linkedin@example.com',
    picture: {
      data: {
        url: 'https://via.placeholder.com/150?text=L'
      }
    }
  };
}

async function fetchFacebookProfile(token: string) {
  // Mock Facebook API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id: 'facebook-user-123',
    name: 'Facebook User',
    email: 'facebook@example.com',
    picture: {
      data: {
        url: 'https://via.placeholder.com/150?text=F'
      }
    }
  };
}

async function fetchInstagramProfile(token: string) {
  // Mock Instagram API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id: 'instagram-user-123',
    username: 'instagramuser',
    name: 'Instagram User',
    profile_picture: 'https://via.placeholder.com/150?text=I'
  };
}

const OAuthCallback = () => {
  const { platform } = useParams<{ platform: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { connectAccount, error } = useSocialAccounts();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        if (!platform || !['twitter', 'linkedin', 'facebook', 'instagram'].includes(platform)) {
          throw new Error('Invalid platform');
        }

        const socialPlatform = platform as SocialPlatform;
        const params = queryString.parse(location.search);
        
        if (params.error) {
          throw new Error(`Authentication error: ${params.error}`);
        }

        if (!params.code || !params.state) {
          throw new Error('Missing required parameters');
        }

        // Verify state to prevent CSRF attacks
        if (!verifyOAuthState(socialPlatform, params.state as string)) {
          throw new Error('Invalid state parameter');
        }

        // Exchange code for token
        const tokenData = await exchangeCodeForToken(socialPlatform, params.code as string);

        // Get user profile based on platform
        let profileData;
        switch (socialPlatform) {
          case 'twitter':
            profileData = await fetchTwitterProfile(tokenData.accessToken);
            break;
          case 'linkedin':
            profileData = await fetchLinkedinProfile(tokenData.accessToken);
            break;
          case 'facebook':
            profileData = await fetchFacebookProfile(tokenData.accessToken);
            break;
          case 'instagram':
            profileData = await fetchInstagramProfile(tokenData.accessToken);
            break;
          default:
            throw new Error('Unsupported platform');
        }

        // Connect the account
        await connectAccount(socialPlatform, tokenData.accessToken, profileData);
        
        setStatus('success');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/accounts');
        }, 2000);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');
      }
    }

    handleCallback();
  }, [platform, location.search, connectAccount, navigate]);

  const getPlatformIcon = () => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="h-12 w-12 text-[#1DA1F2]" />;
      case 'facebook':
        return <Facebook className="h-12 w-12 text-[#1877F2]" />;
      case 'linkedin':
        return <Linkedin className="h-12 w-12 text-[#0077B5]" />;
      case 'instagram':
        return <Instagram className="h-12 w-12 text-[#E4405F]" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <div className="text-center">
          {getPlatformIcon()}
          
          <h1 className="mt-4 text-xl font-bold text-gray-900 capitalize">
            {platform} Integration
          </h1>
          
          {status === 'loading' && (
            <div className="mt-6">
              <div className="mx-auto h-8 w-8 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Connecting your account...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mt-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="mt-4 text-gray-600">Successfully connected your {platform} account!</p>
              <p className="mt-2 text-sm text-gray-500">Redirecting you back to the accounts page...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="mt-4 text-gray-600">Failed to connect your {platform} account</p>
              <p className="mt-2 text-sm text-red-600">{errorMessage || error}</p>
              
              <button
                onClick={() => navigate('/accounts')}
                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Accounts
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
