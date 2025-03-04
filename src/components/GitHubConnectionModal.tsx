import { useState } from 'react';
import { usePersona } from '../contexts/PersonaContext';
import { Squircle, Github, CircleX } from 'lucide-react';

interface GitHubConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GitHubConnectionModal = ({ isOpen, onClose }: GitHubConnectionModalProps) => {
  const [token, setToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connectGitHub, isGitHubConnected } = usePersona();

  if (!isOpen) return null;

  const handleConnect = async () => {
    if (!token.trim()) {
      setError('Token is required');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      await connectGitHub(token);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to GitHub');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                <Github className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {isGitHubConnected ? 'GitHub Connected' : 'Connect to GitHub'}
                </h3>
                <div className="mt-2">
                  {isGitHubConnected ? (
                    <p className="text-sm text-gray-500">
                      Your account is already connected to GitHub. You can disconnect in your settings.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 mb-4">
                        Connect your GitHub account to store your personas as repositories.
                        You'll need a personal access token with repo scope.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="github-token" className="block text-sm font-medium text-gray-700">
                            GitHub Personal Access Token
                          </label>
                          <input
                            type="password"
                            id="github-token"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="ghp_xxxxxxxxxxxxxxxx"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            <a 
                              href="https://github.com/settings/tokens/new" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-500"
                            >
                              Create a token
                            </a> with 'repo' scope permissions
                          </p>
                        </div>

                        {error && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                            <Squircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-700">{error}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {isGitHubConnected ? (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70"
                  onClick={handleConnect}
                  disabled={connecting || !token.trim()}
                >
                  {connecting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubConnectionModal;
