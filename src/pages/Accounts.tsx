import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useSocialAccounts } from '../contexts/SocialAccountContext';
import AccountConnectButton from '../components/social/AccountConnectButton';
import SocialAccountCard from '../components/social/SocialAccountCard';
import PlatformSettingsForm from '../components/social/PlatformSettingsForm';
import ReconnectAccountModal from '../components/social/ReconnectAccountModal';
import { 
  SocialAccount, 
  SocialPlatform, 
  platformConfigs, 
  AccountStatus 
} from '../types/SocialAccount';
import { CircleAlert, Plus, RefreshCw, ShieldAlert, X } from 'lucide-react';

const Accounts = () => {
  const { 
    accounts, 
    loading, 
    error, 
    monitorAccountStatus, 
    refreshAllAccounts 
  } = useSocialAccounts();
  
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReconnectModal, setShowReconnectModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusSummary, setStatusSummary] = useState<{
    active: number;
    expired: number;
    revoked: number;
  }>({ active: 0, expired: 0, revoked: 0 });

  const platforms: SocialPlatform[] = ['twitter', 'linkedin', 'facebook', 'instagram'];

  // Monitor account status on component mount
  useEffect(() => {
    if (accounts.length > 0) {
      monitorAccountStatus();
    }
  }, [accounts, monitorAccountStatus]);

  // Update status summary when accounts change
  useEffect(() => {
    const summary = accounts.reduce((acc, account) => {
      if (account.status === 'active') acc.active++;
      else if (account.status === 'expired') acc.expired++;
      else if (account.status === 'revoked') acc.revoked++;
      return acc;
    }, { active: 0, expired: 0, revoked: 0 });
    
    setStatusSummary(summary);
  }, [accounts]);

  const handleOpenSettings = (account: SocialAccount) => {
    setSelectedAccount(account);
    setShowSettingsModal(true);
  };

  const handleOpenReconnect = (account: SocialAccount) => {
    setSelectedAccount(account);
    setShowReconnectModal(true);
  };

  const accountsByPlatform = (platform: SocialPlatform) => {
    return accounts.filter(account => account.platform === platform);
  };

  const handleRefreshAllAccounts = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllAccounts();
    } catch (err) {
      console.error('Failed to refresh accounts:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const hasAnyConnectedAccounts = accounts.length > 0;
  const hasProblematicAccounts = statusSummary.expired + statusSummary.revoked > 0;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Accounts</h1>
          <p className="text-gray-600 mt-1">Connect and manage your social media accounts</p>
        </div>
        
        {hasAnyConnectedAccounts && (
          <button
            onClick={handleRefreshAllAccounts}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Status
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
          <CircleAlert className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Status Summary */}
      {hasAnyConnectedAccounts && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Account Status Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800 font-medium">Active</p>
                <p className="text-2xl font-bold text-green-600">{statusSummary.active}</p>
              </div>
              
              <div className={`p-3 rounded-lg ${statusSummary.expired > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                <p className={`text-sm font-medium ${statusSummary.expired > 0 ? 'text-orange-800' : 'text-gray-500'}`}>
                  Expired
                </p>
                <p className={`text-2xl font-bold ${statusSummary.expired > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                  {statusSummary.expired}
                </p>
              </div>
              
              <div className={`p-3 rounded-lg ${statusSummary.revoked > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                <p className={`text-sm font-medium ${statusSummary.revoked > 0 ? 'text-red-800' : 'text-gray-500'}`}>
                  Revoked
                </p>
                <p className={`text-2xl font-bold ${statusSummary.revoked > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {statusSummary.revoked}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Warning for problematic accounts */}
      {hasProblematicAccounts && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 flex items-center">
          <ShieldAlert className="h-5 w-5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">Attention Required</p>
            <p className="text-sm">
              {statusSummary.expired > 0 && `${statusSummary.expired} account(s) have expired tokens. `}
              {statusSummary.revoked > 0 && `${statusSummary.revoked} account(s) have revoked access. `}
              Please reconnect these accounts to continue posting.
            </p>
          </div>
        </div>
      )}

      {loading && !accounts.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Connection Options */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Connect New Account</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map(platform => (
                <div key={platform}>
                  <AccountConnectButton
                    platform={platform}
                    variant="primary"
                    isConnected={accountsByPlatform(platform).length > 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Connected Accounts */}
          {hasAnyConnectedAccounts && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {accounts.map(account => (
                  <SocialAccountCard
                    key={account.id}
                    account={account}
                    onOpenSettings={handleOpenSettings}
                    onRequestReconnect={handleOpenReconnect}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Platform Sections */}
          {platforms.map(platform => {
            const connectedAccounts = accountsByPlatform(platform);
            if (connectedAccounts.length === 0) return null;

            return (
              <div key={platform} className="border-t border-gray-200 pt-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-lg font-semibold capitalize">{platform} Accounts</h2>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {connectedAccounts.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {connectedAccounts.map(account => (
                    <SocialAccountCard
                      key={account.id}
                      account={account}
                      onOpenSettings={handleOpenSettings}
                      onRequestReconnect={handleOpenReconnect}
                    />
                  ))}
                  
                  {/* Add another account button */}
                  <div className="border rounded-lg shadow-sm bg-gray-50 p-4 flex flex-col items-center justify-center min-h-[180px]">
                    <AccountConnectButton
                      platform={platform}
                      variant="outline"
                    />
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Connect another {platformConfigs[platform].name} account
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* No accounts placeholder */}
          {!hasAnyConnectedAccounts && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
                <Plus className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts connected</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Connect your social media accounts to start cross-posting with different personas
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {platforms.map(platform => (
                  <AccountConnectButton
                    key={platform}
                    platform={platform}
                    variant="primary"
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Settings Modal */}
      {showSettingsModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Account Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <PlatformSettingsForm account={selectedAccount} />
            </div>
          </div>
        </div>
      )}
      
      {/* Reconnect Account Modal */}
      <ReconnectAccountModal
        isOpen={showReconnectModal}
        onClose={() => setShowReconnectModal(false)}
        account={selectedAccount}
      />
    </DashboardLayout>
  );
};

export default Accounts;
