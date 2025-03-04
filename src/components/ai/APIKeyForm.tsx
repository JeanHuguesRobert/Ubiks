import React, { useState } from 'react';
import { useAI } from '../../contexts/AIContext';
import { AIProvider, AI_PROVIDERS } from '../../types/AI';
import { CircleAlert, Check, CircleX, Key, Lock } from 'lucide-react';

interface APIKeyFormProps {
  onSuccess?: () => void;
}

const APIKeyForm = ({ onSuccess }: APIKeyFormProps) => {
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const { addCredentials, error, clearError } = useAI();
  
  const selectedProviderConfig = AI_PROVIDERS.find(p => p.id === provider);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    
    if (!name.trim()) {
      setFormError('Please provide a name for this API key');
      return;
    }
    
    if (!apiKey.trim()) {
      setFormError('API key is required');
      return;
    }
    
    setIsSubmitting(true);
    setVerifying(true);
    
    try {
      const credentials = await addCredentials({
        provider,
        apiKey,
        apiEndpoint: provider === 'azure-openai' || provider === 'custom' ? apiEndpoint : undefined,
        organizationId: provider === 'openai' ? organizationId : undefined,
        name
      });
      
      setVerified(credentials.status === 'active');
      
      if (credentials.status === 'active' && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add API key');
    } finally {
      setIsSubmitting(false);
      setVerifying(false);
    }
  };

  const needsEndpoint = provider === 'azure-openai' || provider === 'custom';
  const needsOrgId = provider === 'openai';

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Add New AI Provider API Key</h2>
      
      {(error || formError) && (
        <div className="mb-4 p-3 bg-red-50 rounded-md text-red-700 flex items-center">
          <CircleAlert className="h-5 w-5 mr-2" />
          <span>{error || formError}</span>
        </div>
      )}
      
      {verified && (
        <div className="mb-4 p-3 bg-green-50 rounded-md text-green-700 flex items-center">
          <Check className="h-5 w-5 mr-2" />
          <span>API key successfully verified and added!</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="My OpenAI Key"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">A friendly name to identify this API key</p>
          </div>
          
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
              AI Provider
            </label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            >
              {AI_PROVIDERS.map((providerOption) => (
                <option key={providerOption.id} value={providerOption.id}>
                  {providerOption.name}
                </option>
              ))}
            </select>
            {selectedProviderConfig && (
              <div className="mt-1 flex items-center">
                <a 
                  href={selectedProviderConfig.apiDocumentation} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  View API Documentation
                </a>
              </div>
            )}
          </div>
          
          <div className="relative">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type={showApiKey ? "text" : "password"}
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={`${selectedProviderConfig?.name} API Key`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 mt-6 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <CircleX className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Your API key will be stored securely</p>
          </div>
          
          {needsEndpoint && (
            <div>
              <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-700">
                API Endpoint URL
              </label>
              <input
                type="text"
                id="apiEndpoint"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={provider === 'azure-openai' 
                  ? "https://your-resource.openai.azure.com" 
                  : "https://api.example.com/v1"
                }
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                {provider === 'azure-openai' 
                  ? "Your Azure OpenAI Service endpoint" 
                  : "The base URL for your custom AI provider"
                }
              </p>
            </div>
          )}
          
          {needsOrgId && (
            <div>
              <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700">
                Organization ID (optional)
              </label>
              <input
                type="text"
                id="organizationId"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="org-..."
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">Required for OpenAI organization accounts</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
            >
              {verifying ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Verifying...
                </>
              ) : isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Add API Key
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default APIKeyForm;
