import { useState } from 'react';
import { SocialPlatform, platformConfigs } from '../../types/SocialAccount';
import { initiateOAuth } from '../../services/oauth/OAuthManager';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import OAuthConsentScreen from './OAuthConsentScreen';

interface AccountConnectButtonProps {
  platform: SocialPlatform;
  isConnected?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const AccountConnectButton = ({ 
  platform, 
  isConnected = false, 
  onClick,
  isLoading = false,
  variant = 'primary',
  size = 'md'
}: AccountConnectButtonProps) => {
  const [connecting, setConnecting] = useState(false);
  const [showConsentScreen, setShowConsentScreen] = useState(false);
  const config = platformConfigs[platform];
  
  // Platform icons
  const platformIcons = {
    twitter: Twitter,
    linkedin: Linkedin,
    facebook: Facebook,
    instagram: Instagram
  };
  
  const PlatformIcon = platformIcons[platform];
  
  const handleConnect = () => {
    if (onClick) {
      onClick();
      return;
    }
    
    // Show the consent screen to explain permissions
    setShowConsentScreen(true);
  };
  
  const handleCloseConsentScreen = () => {
    setShowConsentScreen(false);
  };
  
  const handleConfirmConnect = () => {
    setShowConsentScreen(false);
    setConnecting(true);
    
    // Start OAuth process
    try {
      initiateOAuth(platform, { includeWriting: true, includeMedia: true });
    } catch (err) {
      console.error('OAuth initialization error:', err);
      setConnecting(false);
    }
  };
  
  // Button variants
  const buttonStyles = {
    primary: `bg-[${config.color}] hover:brightness-110 text-white`,
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    outline: `border border-[${config.color}] text-[${config.color}] hover:bg-opacity-10 hover:bg-[${config.color}]`
  };
  
  // Button sizes
  const sizeStyles = {
    sm: 'py-1 px-3 text-xs',
    md: 'py-2 px-4 text-sm',
    lg: 'py-3 px-6 text-base'
  };
  
  return (
    <>
      <button
        onClick={handleConnect}
        disabled={isConnected || connecting || isLoading}
        className={`
          flex items-center justify-center rounded-md font-medium transition-all
          ${buttonStyles[variant]}
          ${sizeStyles[size]}
          ${(isConnected || connecting || isLoading) ? 'opacity-70 cursor-not-allowed' : ''}
        `}
        style={{ 
          backgroundColor: variant === 'primary' ? config.color : '',
          borderColor: variant === 'outline' ? config.color : '',
          color: variant === 'outline' ? config.color : variant === 'primary' ? 'white' : ''
        }}
      >
        {(connecting || isLoading) ? (
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
            <span>{connecting ? 'Connecting...' : 'Loading...'}</span>
          </div>
        ) : (
          <>
            <PlatformIcon className="mr-2 h-4 w-4" />
            {isConnected ? `Connected to ${config.name}` : `Connect ${config.name}`}
          </>
        )}
      </button>

      <OAuthConsentScreen
        platform={platform}
        isOpen={showConsentScreen}
        onClose={handleCloseConsentScreen}
        onConfirm={handleConfirmConnect}
      />
    </>
  );
};

export default AccountConnectButton;
