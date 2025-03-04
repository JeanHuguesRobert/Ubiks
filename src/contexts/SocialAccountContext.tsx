import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { SocialAccount, SocialPlatform, AccountStatus } from '../types/SocialAccount';
import { tokenEncryptionService } from '../services/TokenEncryptionService';

interface SocialAccountContextType {
  accounts: SocialAccount[];
  loading: boolean;
  error: string | null;
  connectAccount: (platform: SocialPlatform, token: string, profileData: any) => Promise<SocialAccount>;
  disconnectAccount: (accountId: string) => Promise<void>;
  refreshAccountData: (accountId: string) => Promise<void>;
  refreshAllAccounts: () => Promise<void>;
  verifyAccount: (accountId: string) => Promise<boolean>;
  updateAccountSettings: (accountId: string, settings: any) => Promise<void>;
  getAccountsForPlatform: (platform: SocialPlatform) => SocialAccount[];
  monitorAccountStatus: () => void;
  isConnecting: boolean;
  clearError: () => void;
  getActiveAccounts: () => SocialAccount[];
  getProblemAccounts: () => SocialAccount[];
}

const SocialAccountContext = createContext<SocialAccountContextType | undefined>(undefined);

export const useSocialAccounts = () => {
  const context = useContext(SocialAccountContext);
  if (context === undefined) {
    throw new Error('useSocialAccounts must be used within a SocialAccountProvider');
  }
  return context;
};

interface SocialAccountProviderProps {
  children: ReactNode;
}

export const SocialAccountProvider = ({ children }: SocialAccountProviderProps) => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load accounts from localStorage when the component mounts or user changes
  useEffect(() => {
    if (user) {
      loadAccounts();
    } else {
      setAccounts([]);
      setLoading(false);
    }
  }, [user]);

  // Set up periodic account status monitoring
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (accounts.length > 0) {
        monitorAccountStatus();
      }
    }, 60 * 60 * 1000); // Check once per hour
    
    return () => clearInterval(intervalId);
  }, [accounts]);

  const loadAccounts = () => {
    setLoading(true);
    try {
      if (!user) return;
      
      const storedAccounts = localStorage.getItem(`ubikial_social_accounts_${user.id}`);
      if (storedAccounts) {
        const parsedAccounts: SocialAccount[] = JSON.parse(storedAccounts);
        
        // Decrypt tokens that were previously encrypted
        const decryptedAccounts = parsedAccounts.map(account => {
          // Check if tokens are encrypted and decrypt them
          const accessToken = tokenEncryptionService.isEncrypted(account.accessToken) 
            ? tokenEncryptionService.decryptToken(account.accessToken)
            : account.accessToken;
            
          const refreshToken = account.refreshToken && tokenEncryptionService.isEncrypted(account.refreshToken)
            ? tokenEncryptionService.decryptToken(account.refreshToken)
            : account.refreshToken;
            
          return {
            ...account,
            accessToken,
            refreshToken
          };
        });
        
        setAccounts(decryptedAccounts);
      }
    } catch (err) {
      console.error('Failed to load social accounts:', err);
      setError('Failed to load your connected accounts');
    } finally {
      setLoading(false);
    }
  };

  const saveAccounts = (updatedAccounts: SocialAccount[]) => {
    if (!user) return;
    
    try {
      // Encrypt tokens before saving to localStorage
      const encryptedAccounts = updatedAccounts.map(account => {
        // Encrypt tokens if they aren't already
        const accessToken = !tokenEncryptionService.isEncrypted(account.accessToken)
          ? tokenEncryptionService.encryptToken(account.accessToken)
          : account.accessToken;
          
        const refreshToken = account.refreshToken && !tokenEncryptionService.isEncrypted(account.refreshToken)
          ? tokenEncryptionService.encryptToken(account.refreshToken)
          : account.refreshToken;
          
        return {
          ...account,
          accessToken,
          refreshToken
        };
      });
      
      localStorage.setItem(`ubikial_social_accounts_${user.id}`, JSON.stringify(encryptedAccounts));
    } catch (err) {
      console.error('Failed to save social accounts:', err);
      throw new Error('Failed to save account data');
    }
  };

  const connectAccount = async (
    platform: SocialPlatform,
    token: string,
    profileData: any
  ): Promise<SocialAccount> => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('You must be logged in to connect a social account');
      }

      // Detect if token is already encrypted and decrypt if needed for comparison
      const decryptedToken = tokenEncryptionService.isEncrypted(token) 
        ? tokenEncryptionService.decryptToken(token)
        : token;

      // Check if account already exists
      const existingAccount = accounts.find(
        account => account.platform === platform && account.profileId === profileData.id
      );

      if (existingAccount) {
        // Update existing account with new token
        const updatedAccount = {
          ...existingAccount,
          accessToken: decryptedToken, // Store decrypted token in memory
          profileData,
          status: 'active' as AccountStatus,
          updatedAt: new Date().toISOString()
        };

        const updatedAccounts = accounts.map(acc => 
          acc.id === updatedAccount.id ? updatedAccount : acc
        );

        setAccounts(updatedAccounts);
        saveAccounts(updatedAccounts); // Will encrypt tokens
        return updatedAccount;
      }

      // Create new account
      const newAccount: SocialAccount = {
        id: `${platform}-${Date.now()}`,
        platform,
        profileId: profileData.id,
        profileName: profileData.name || profileData.username || 'Unknown',
        profileImage: profileData.profile_image_url || profileData.picture?.data?.url || '',
        accessToken: decryptedToken, // Store decrypted token in memory
        refreshToken: token.includes('refresh') ? decryptedToken.split('_')[1] : undefined,
        connected: true,
        status: 'active',
        tokenExpiresAt: token.includes('refresh') 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          : undefined,
        lastVerified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id,
        settings: {
          defaultPersonaId: null,
          autoPostEnabled: false,
          // Default platform-specific settings
          ...(platform === 'twitter' && { 
            includeHashtags: true, 
            maxHashtags: 3,
            threadEnabled: true
          }),
          ...(platform === 'linkedin' && { 
            includeHashtags: true, 
            maxHashtags: 5,
            includeLink: true
          }),
          ...(platform === 'facebook' && { 
            includeHashtags: false,
            preferImages: true,
            pageId: null
          }),
          ...(platform === 'instagram' && { 
            includeHashtags: true,
            maxHashtags: 10,
            preferCarousel: true
          })
        }
      };

      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      saveAccounts(updatedAccounts); // Will encrypt tokens
      return newAccount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect account';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectAccount = async (accountId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('You must be logged in to disconnect a social account');
      }

      // Find the account
      const accountToDisconnect = accounts.find(acc => acc.id === accountId);
      if (!accountToDisconnect) {
        throw new Error('Account not found');
      }

      // In a real app, you would make API calls to revoke tokens
      // For this implementation, we'll just remove from local storage

      const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
      setAccounts(updatedAccounts);
      saveAccounts(updatedAccounts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect account';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshAccountData = async (accountId: string): Promise<void> => {
    setError(null);

    try {
      if (!user) {
        throw new Error('You must be logged in to refresh account data');
      }

      // Find the account
      const accountIndex = accounts.findIndex(acc => acc.id === accountId);
      if (accountIndex === -1) {
        throw new Error('Account not found');
      }

      // In a real app, you would make API calls to refresh the account data
      // For this demo, we'll simulate verifying the account status

      const account = accounts[accountIndex];
      
      // Simulate API verification
      const isValid = await verifyAccount(accountId);
      
      const refreshedAccount = {
        ...account,
        status: isValid ? 'active' as AccountStatus : 'expired' as AccountStatus,
        lastVerified: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedAccounts = [...accounts];
      updatedAccounts[accountIndex] = refreshedAccount;
      setAccounts(updatedAccounts);
      saveAccounts(updatedAccounts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh account data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshAllAccounts = async (): Promise<void> => {
    setError(null);

    try {
      if (!user) {
        throw new Error('You must be logged in to refresh accounts');
      }

      if (accounts.length === 0) {
        return;
      }

      // Process accounts in series to avoid race conditions
      const updatedAccounts = [...accounts];
      
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        try {
          // In a real app, you'd call the appropriate API to verify the token
          // For this demo, we'll simulate verification with a fake probability
          const r = Math.random();
          const isValid = r > 0.3; // 70% chance of being valid
          
          updatedAccounts[i] = {
            ...account,
            status: isValid ? 'active' as AccountStatus : (r > 0.15 ? 'expired' as AccountStatus : 'revoked' as AccountStatus),
            lastVerified: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        } catch (err) {
          console.error(`Failed to refresh account ${account.id}:`, err);
          // Continue with other accounts
        }
      }
      
      setAccounts(updatedAccounts);
      saveAccounts(updatedAccounts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh accounts';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const verifyAccount = async (accountId: string): Promise<boolean> => {
    try {
      const accountIndex = accounts.findIndex(acc => acc.id === accountId);
      if (accountIndex === -1) {
        throw new Error('Account not found');
      }

      const account = accounts[accountIndex];
      
      // In a real app, you would make API calls to verify the token
      // For this demo, we'll simulate verification
      
      // If there's an explicit status indicating the token is invalid, assume it's invalid
      if (account.status === 'revoked') {
        return false;
      }
      
      // If token has expiry date and it's in the past, it's expired
      if (account.tokenExpiresAt) {
        const expiryDate = new Date(account.tokenExpiresAt);
        if (expiryDate < new Date()) {
          // Update the account status
          const updatedAccounts = [...accounts];
          updatedAccounts[accountIndex] = {
            ...account,
            status: 'expired',
            lastVerified: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setAccounts(updatedAccounts);
          saveAccounts(updatedAccounts);
          return false;
        }
      }
      
      // For demo purposes, simulate a successful verification
      const updatedAccounts = [...accounts];
      updatedAccounts[accountIndex] = {
        ...account,
        status: 'active',
        lastVerified: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setAccounts(updatedAccounts);
      saveAccounts(updatedAccounts);
      
      return true;
    } catch (err) {
      console.error('Verification error:', err);
      return false;
    }
  };

  const monitorAccountStatus = () => {
    try {
      if (accounts.length === 0) return;
      
      // Check for tokens that might be expired
      const now = new Date();
      const updatedAccounts = accounts.map(account => {
        // If token has an expiry date, check if it's expired
        if (account.tokenExpiresAt) {
          const expiryDate = new Date(account.tokenExpiresAt);
          if (expiryDate < now && account.status !== 'expired' && account.status !== 'revoked') {
            return {
              ...account,
              status: 'expired' as AccountStatus,
              updatedAt: now.toISOString()
            };
          }
        }
        
        // If we haven't verified the account in the last 24 hours, mark it for verification
        if (account.lastVerified) {
          const lastVerified = new Date(account.lastVerified);
          const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          
          if (lastVerified < oneDayAgo) {
            // In a real app, you would queue this account for verification
            // For now, we'll just log it
            console.log(`Account ${account.id} needs verification`);
          }
        }
        
        return account;
      });
      
      // Only update if something changed
      if (JSON.stringify(updatedAccounts) !== JSON.stringify(accounts)) {
        setAccounts(updatedAccounts);
        saveAccounts(updatedAccounts);
      }
    } catch (err) {
      console.error('Error monitoring account status:', err);
    }
  };

  const updateAccountSettings = async (accountId: string, settings: any): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('You must be logged in to update account settings');
      }

      // Find the account
      const accountIndex = accounts.findIndex(acc => acc.id === accountId);
      if (accountIndex === -1) {
        throw new Error('Account not found');
      }

      // Update the account settings
      const updatedAccount = {
        ...accounts[accountIndex],
        settings: {
          ...accounts[accountIndex].settings,
          ...settings
        },
        updatedAt: new Date().toISOString()
      };

      const updatedAccounts = [...accounts];
      updatedAccounts[accountIndex] = updatedAccount;
      setAccounts(updatedAccounts);
      saveAccounts(updatedAccounts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update account settings';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAccountsForPlatform = (platform: SocialPlatform): SocialAccount[] => {
    return accounts.filter(account => account.platform === platform);
  };

  const getActiveAccounts = (): SocialAccount[] => {
    return accounts.filter(account => account.status === 'active');
  };

  const getProblemAccounts = (): SocialAccount[] => {
    return accounts.filter(account => account.status === 'expired' || account.status === 'revoked');
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    accounts,
    loading,
    error,
    connectAccount,
    disconnectAccount,
    refreshAccountData,
    refreshAllAccounts,
    verifyAccount,
    updateAccountSettings,
    getAccountsForPlatform,
    monitorAccountStatus,
    isConnecting,
    clearError,
    getActiveAccounts,
    getProblemAccounts
  };

  return <SocialAccountContext.Provider value={value}>{children}</SocialAccountContext.Provider>;
};
