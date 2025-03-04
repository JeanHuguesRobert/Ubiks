import { useState } from 'react';
import { SocialAccount, SocialPlatform, platformConfigs } from '../../types/SocialAccount';
import { useSocialAccounts } from '../../contexts/SocialAccountContext';
import { initiateOAuth } from '../../services/oauth/OAuthManager';
import { CircleAlert, ShieldAlert, X } from 'lucide-react';
import AccountConnectButton from './AccountConnectButton';

interface ReconnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: SocialAccount | null;
}

const ReconnectAccountModal = ({ isOpen, onClose, account }: ReconnectAccountModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const { verifyAccount } = useSocialAccounts();

  if (!isOpen || !account) return null;

  const handleReconnect = async () => {
    try {
      setError(null);
      initiateOAuth(account.platform);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate reconnection');
    }
  };

  const handleVerify = async () => {
    try {
      setError(null);
      await verifyAccount(account.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify account');
    }
  };

  const platformConfig = platformConfigs[account.platform];
  const isExpired = account.status === 'expired';
  const isRevoked = account.status === 'revoked';

  return (
    <div className="fixed z-20 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                {isExpired ? (
                  <CircleAlert className="h-6 w-6 text-red-600" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                )}
              </div>

              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {isExpired 
                    ? 'Your Access Token Has Expired' 
                    : 'Account Access Revoked'
                  }
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {isExpired
                      ? `Your access to ${platformConfig.name} has expired. You need to reconnect your account to continue posting.`
                      : `Your access to ${platformConfig.name} has been revoked. This usually happens when you've changed permissions or disconnected the app from your ${platformConfig.name} settings.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-start">
                <CircleAlert className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row gap-2">
            <AccountConnectButton
              platform={account.platform}
              variant="primary"
              size="md"
              onClick={handleReconnect}
            />
            
            <button
              type="button"
              onClick={handleVerify}
              className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
            >
              Verify Connection
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReconnectAccountModal;
