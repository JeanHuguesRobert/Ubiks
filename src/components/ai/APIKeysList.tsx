import React, { useState } from 'react';
import { CheckCircle, Copy, EyeOff, Eye, XCircle } from 'lucide-react';
import { AIProvider } from '../../types/AI';

interface APIKey {
  provider: AIProvider;
  key: string;
  isValid: boolean;
  lastVerified?: string;
}

interface APIKeysListProps {
  apiKeys: APIKey[];
  onVerifyKey: (provider: AIProvider, key: string) => Promise<boolean>;
  onUpdateKey: (provider: AIProvider, key: string) => void;
  onRemoveKey: (provider: AIProvider) => void;
}

export const APIKeysList: React.FC<APIKeysListProps> = ({
  apiKeys,
  onVerifyKey,
  onUpdateKey,
  onRemoveKey
}) => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const handleVerifyKey = async (provider: AIProvider, key: string) => {
    setVerifying(prev => ({ ...prev, [provider]: true }));
    try {
      await onVerifyKey(provider, key);
    } finally {
      setVerifying(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {apiKeys.map(({ provider, key, isValid, lastVerified }) => (
        <div key={provider} className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">{provider}</span>
              {isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyKey(key)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Copy API key"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleKeyVisibility(provider)}
                className="p-1 hover:bg-gray-100 rounded"
                title={showKeys[provider] ? 'Hide API key' : 'Show API key'}
              >
                {showKeys[provider] ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type={showKeys[provider] ? 'text' : 'password'}
              value={key}
              onChange={(e) => onUpdateKey(provider, e.target.value)}
              className="flex-1 px-3 py-1 border rounded text-sm font-mono"
              placeholder={`Enter ${provider} API key`}
            />
            <button
              onClick={() => handleVerifyKey(provider, key)}
              disabled={verifying[provider] || !key}
              className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              {verifying[provider] ? 'Verifying...' : 'Verify'}
            </button>
            <button
              onClick={() => onRemoveKey(provider)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Remove
            </button>
          </div>
          {lastVerified && (
            <p className="mt-1 text-xs text-gray-500">
              Last verified: {new Date(lastVerified).toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
