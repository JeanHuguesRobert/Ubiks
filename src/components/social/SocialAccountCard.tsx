import { useState } from 'react';
import { SocialAccount } from '../../types/SocialAccount';
import { CircleAlert, Ellipsis, Facebook, Instagram, Linkedin, RefreshCw, Settings, Trash2, Twitter } from 'lucide-react';
import { useSocialAccounts } from '../../contexts/SocialAccountContext';
import AccountStatusBadge from './AccountStatusBadge';

interface SocialAccountCardProps {
  account: SocialAccount;
  onOpenSettings: (account: SocialAccount) => void;
  onRequestReconnect?: (account: SocialAccount) => void;
}

const SocialAccountCard = ({ 
  account, 
  onOpenSettings, 
  onRequestReconnect 
}: SocialAccountCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { disconnectAccount, refreshAccountData } = useSocialAccounts();
  
  const getPlatformIcon = () => {
    switch (account.platform) {
      case 'twitter':
        return <Twitter className="text-[#1DA1F2]" />;
      case 'facebook':
        return <Facebook className="text-[#1877F2]" />;
      case 'linkedin':
        return <Linkedin className="text-[#0077B5]" />;
      case 'instagram':
        return <Instagram className="text-[#E4405F]" />;
      default:
        return null;
    }
  };
  
  const getPlatformColor = () => {
    switch (account.platform) {
      case 'twitter': return '#1DA1F2';
      case 'facebook': return '#1877F2';
      case 'linkedin': return '#0077B5';
      case 'instagram': return '#E4405F';
      default: return '#6B7280';
    }
  };
  
  const handleDisconnect = async () => {
    if (window.confirm(`Are you sure you want to disconnect your ${account.platform} account?`)) {
      setIsDisconnecting(true);
      try {
        await disconnectAccount(account.id);
      } catch (err) {
        console.error('Failed to disconnect account:', err);
      } finally {
        setIsDisconnecting(false);
      }
    }
  };
  
  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      await refreshAccountData(account.id);
    } catch (err) {
      console.error('Failed to refresh account data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleReconnect = () => {
    setShowMenu(false);
    if (onRequestReconnect) {
      onRequestReconnect(account);
    }
  };
  
  const needsReconnect = account.status === 'expired' || account.status === 'revoked';
  
  return (
    <div className={`border rounded-lg shadow-sm overflow-hidden bg-white ${
      needsReconnect ? 'border-red-200' : ''
    }`}>
      <div className="h-2" style={{ backgroundColor: getPlatformColor() }}></div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              {account.profileImage ? (
                <img 
                  src={account.profileImage} 
                  alt={account.profileName} 
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                getPlatformIcon()
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">{account.profileName}</p>
              <p className="text-xs text-gray-500 capitalize">{account.platform}</p>
            </div>
          </div>
          
          <div className="relative">
            <button
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Ellipsis className="h-5 w-5 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowMenu(false);
                      onOpenSettings(account);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                  
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Status
                      </>
                    )}
                  </button>
                  
                  {needsReconnect && (
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-orange-600 hover:bg-gray-100"
                      onClick={handleReconnect}
                    >
                      <CircleAlert className="h-4 w-4 mr-2" />
                      Reconnect
                    </button>
                  )}
                  
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      setShowMenu(false);
                      handleDisconnect();
                    }}
                    disabled={isDisconnecting}
                  >
                    {isDisconnecting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full mr-2" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-gray-500 flex items-center justify-between">
            <span>Connected {new Date(account.createdAt).toLocaleDateString()}</span>
            <AccountStatusBadge status={account.status || 'active'} />
          </div>
          
          {needsReconnect && (
            <button
              onClick={handleReconnect}
              className="mt-3 w-full py-2 px-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-md text-sm font-medium flex items-center justify-center hover:bg-orange-100"
            >
              <CircleAlert className="h-4 w-4 mr-2" />
              {account.status === 'expired' ? 'Token Expired' : 'Access Revoked'} - Reconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialAccountCard;
