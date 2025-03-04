import { useState } from 'react';
import { SocialPlatform, platformConfigs } from '../../types/SocialAccount';
import PermissionsExplainer from './PermissionsExplainer';
import { Check, ExternalLink, Lock, ShieldCheck, X } from 'lucide-react';

interface OAuthConsentScreenProps {
  platform: SocialPlatform;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const OAuthConsentScreen = ({ platform, isOpen, onClose, onConfirm }: OAuthConsentScreenProps) => {
  const [permissions, setPermissions] = useState({
    includeWriting: true,
    includeMedia: true,
    includeOffline: false
  });
  
  const config = platformConfigs[platform];

  if (!isOpen) return null;

  const handlePermissionsChange = (newPermissions: {
    includeWriting: boolean;
    includeMedia: boolean;
    includeOffline: boolean;
  }) => {
    setPermissions(newPermissions);
  };

  return (
    <div className="fixed z-20 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                <ShieldCheck className="h-6 w-6 text-indigo-600" />
              </div>

              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Connect to {config.name}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Ubikial needs your permission to connect with your {config.name} account.
                    Review and customize the permissions below before connecting.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <PermissionsExplainer
                platform={platform}
                includeWriting={permissions.includeWriting}
                includeMedia={permissions.includeMedia}
                includeOffline={permissions.includeOffline}
                onPermissionsChange={handlePermissionsChange}
              />
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Your login information is handled directly by {config.name} and is never stored by Ubikial. 
                    We only receive a secure token to access the services you choose to enable.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <Check className="mr-2 h-4 w-4" /> Connect {config.name}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
            
            <a
              href={`${config.name.toLowerCase()}.com/settings/applications`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full inline-flex justify-center rounded-md px-4 py-2 text-gray-500 text-base font-medium sm:mt-0 sm:w-auto sm:text-sm hover:text-gray-700"
            >
              <ExternalLink className="mr-1 h-4 w-4" /> {config.name} Apps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthConsentScreen;
