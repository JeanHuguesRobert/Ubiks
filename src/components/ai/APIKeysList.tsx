import React, { useState } from 'react';
import { useAI } from '../../contexts/AIContext';
import { AICredentials, AI_PROVIDERS } from '../../types/AI';
import { Signal, Check, Key, Pencil, RefreshCw, Trash2 } from 'lucide-react';

const APIKeysList = () => {
  const { credentials, verifyCredentials, deleteCredentials, loading } = useAI();
  const [verifyingIds, setVerifyingIds] = useState<string[]>([]);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleVerify = async (id: string) => {
    setVerifyingIds(prev => [...prev, id]);
    try {
      await verifyCredentials(id);
    } finally {
      setVerifyingIds(prev => prev.filter(credId => credId !== id));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    
    setDeletingIds(prev => [...prev, id]);
    try {
      await deleteCredentials(id);
    } finally {
      setDeletingIds(prev => prev.filter(credId => credId !== id));
    }
  };

  const getProviderName = (providerId: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    return provider?.name || providerId;
  };

  const getStatusBadge = (status: AICredentials['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" /> Valid
          </span>
        );
      case 'invalid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Signal className="w-3 h-3 mr-1" /> Invalid
          </span>
        );
      case 'unverified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Signal className="w-3 h-3 mr-1" /> Unverified
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <Key className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No API Keys</h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't added any AI provider API keys yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200">
      <ul className="divide-y divide-gray-200">
        {credentials.map((cred) => (
          <li key={cred.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <h3 className="text-sm font-medium text-gray-900">{cred.name}</h3>
                  <span className="ml-2 text-xs text-gray-500">({getProviderName(cred.provider)})</span>
                </div>
                <div className="mt-1 flex items-center">
                  <span className="text-xs text-gray-500 mr-2">
                    Added {new Date(cred.createdAt).toLocaleDateString()}
                  </span>
                  {getStatusBadge(cred.status)}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleVerify(cred.id)}
                  disabled={verifyingIds.includes(cred.id)}
                  className="p-1 text-gray-400 hover:text-indigo-600 focus:outline-none disabled:opacity-50"
                  title="Verify API key"
                >
                  {verifyingIds.includes(cred.id) ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-5 w-5" />
                  )}
                </button>
                <button
                  className="p-1 text-gray-400 hover:text-indigo-600 focus:outline-none"
                  title="Edit API key"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(cred.id)}
                  disabled={deletingIds.includes(cred.id)}
                  className="p-1 text-gray-400 hover:text-red-600 focus:outline-none disabled:opacity-50"
                  title="Delete API key"
                >
                  {deletingIds.includes(cred.id) ? (
                    <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default APIKeysList;
