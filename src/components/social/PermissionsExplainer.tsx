import { useState } from 'react';
import { SocialPlatform, platformConfigs } from '../../types/SocialAccount';
import { getScopeDescriptions, getRequestedScopes } from '../../services/oauth/OAuthManager';
import { Squircle, CircleCheck, ChevronDown, ChevronUp, Circle, Info, Lock, Shield } from 'lucide-react';

interface PermissionsExplainerProps {
  platform: SocialPlatform;
  includeWriting?: boolean;
  includeMedia?: boolean;
  includeOffline?: boolean;
  onPermissionsChange?: (permissions: {
    includeWriting: boolean;
    includeMedia: boolean;
    includeOffline: boolean;
  }) => void;
  minimal?: boolean;
}

const PermissionsExplainer = ({
  platform,
  includeWriting = true,
  includeMedia = false,
  includeOffline = false,
  onPermissionsChange,
  minimal = false
}: PermissionsExplainerProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [permissions, setPermissions] = useState({
    includeWriting,
    includeMedia,
    includeOffline
  });
  
  const config = platformConfigs[platform];
  const requestedScopes = getRequestedScopes(platform, permissions);
  const scopeDescriptions = getScopeDescriptions(platform, requestedScopes);
  
  const handlePermissionChange = (key: 'includeWriting' | 'includeMedia' | 'includeOffline') => {
    const newPermissions = {
      ...permissions,
      [key]: !permissions[key]
    };
    
    setPermissions(newPermissions);
    
    if (onPermissionsChange) {
      onPermissionsChange(newPermissions);
    }
  };
  
  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  // Group permissions by category
  const essentialPermissions = scopeDescriptions.filter(
    ({ scope }) => 
      OAUTH_CONFIG[platform].coreScopes.includes(scope)
  );
  
  const writingPermissions = scopeDescriptions.filter(
    ({ scope }) => 
      OAUTH_CONFIG[platform].optionalScopes.writing?.includes(scope)
  );
  
  const mediaPermissions = scopeDescriptions.filter(
    ({ scope }) => 
      OAUTH_CONFIG[platform].optionalScopes.media?.includes(scope)
  );
  
  const offlinePermissions = scopeDescriptions.filter(
    ({ scope }) => 
      OAUTH_CONFIG[platform].optionalScopes.offline?.includes(scope)
  );
  
  const otherPermissions = scopeDescriptions.filter(
    ({ scope }) => 
      !OAUTH_CONFIG[platform].coreScopes.includes(scope) &&
      !OAUTH_CONFIG[platform].optionalScopes.writing?.includes(scope) &&
      !OAUTH_CONFIG[platform].optionalScopes.media?.includes(scope) &&
      !OAUTH_CONFIG[platform].optionalScopes.offline?.includes(scope)
  );
  
  if (minimal) {
    return (
      <div className="text-sm">
        <button
          onClick={handleToggleDetails}
          className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {showDetails ? (
            <>
              <ChevronUp size={16} className="mr-1" />
              Hide permissions
            </>
          ) : (
            <>
              <ChevronDown size={16} className="mr-1" />
              View permissions ({scopeDescriptions.length})
            </>
          )}
        </button>
        
        {showDetails && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700">
            <ul className="space-y-1">
              {scopeDescriptions.map(({ scope, description }) => (
                <li key={scope} className="flex items-start">
                  <Circle className="h-2 w-2 mt-1.5 mr-2 text-indigo-600" />
                  <span>{description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-indigo-50 p-4 flex items-start border-b border-gray-200">
        <Shield className="h-5 w-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-indigo-900">
            {config.name} Permissions
          </h3>
          <p className="text-sm text-indigo-700 mt-1">
            Ubikial requests these permissions to connect with your {config.name} account.
            You can customize which permissions to grant.
          </p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {/* Essential permissions - always required */}
          <div>
            <div className="flex items-center text-gray-900 font-medium mb-2">
              <CircleCheck className="h-4 w-4 text-green-500 mr-2" />
              Required Permissions
            </div>
            <div className="ml-6 text-sm text-gray-600 space-y-1">
              {essentialPermissions.map(({ scope, description }) => (
                <div key={scope} className="flex items-start">
                  <Circle className="h-2 w-2 mt-1.5 mr-2 text-gray-400" />
                  <span>{description}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Writing permissions - optional */}
          {writingPermissions.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <label className="flex items-center text-gray-900 mb-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={permissions.includeWriting}
                  onChange={() => handlePermissionChange('includeWriting')}
                />
                <span className="ml-2 font-medium">Post on your behalf</span>
              </label>
              {permissions.includeWriting && (
                <div className="ml-6 text-sm text-gray-600 space-y-1">
                  {writingPermissions.map(({ scope, description }) => (
                    <div key={scope} className="flex items-start">
                      <Circle className="h-2 w-2 mt-1.5 mr-2 text-gray-400" />
                      <span>{description}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 ml-6 mt-1">
                {permissions.includeWriting
                  ? "Ubikial will be able to create posts on your account."
                  : "Without this permission, you'll need to manually post content."}
              </p>
            </div>
          )}
          
          {/* Media permissions - optional */}
          {mediaPermissions.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <label className="flex items-center text-gray-900 mb-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={permissions.includeMedia}
                  onChange={() => handlePermissionChange('includeMedia')}
                />
                <span className="ml-2 font-medium">Upload media</span>
              </label>
              {permissions.includeMedia && (
                <div className="ml-6 text-sm text-gray-600 space-y-1">
                  {mediaPermissions.map(({ scope, description }) => (
                    <div key={scope} className="flex items-start">
                      <Circle className="h-2 w-2 mt-1.5 mr-2 text-gray-400" />
                      <span>{description}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 ml-6 mt-1">
                {permissions.includeMedia
                  ? "Ubikial will be able to upload images and videos to your account."
                  : "Without this permission, you won't be able to include media in your posts."}
              </p>
            </div>
          )}
          
          {/* Offline permissions - optional */}
          {offlinePermissions.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <label className="flex items-center text-gray-900 mb-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={permissions.includeOffline}
                  onChange={() => handlePermissionChange('includeOffline')}
                />
                <span className="ml-2 font-medium">Offline access</span>
              </label>
              {permissions.includeOffline && (
                <div className="ml-6 text-sm text-gray-600 space-y-1">
                  {offlinePermissions.map(({ scope, description }) => (
                    <div key={scope} className="flex items-start">
                      <Circle className="h-2 w-2 mt-1.5 mr-2 text-gray-400" />
                      <span>{description}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 ml-6 mt-1">
                {permissions.includeOffline
                  ? "Ubikial will be able to refresh its access to your account without prompting you again."
                  : "Without this permission, you'll need to reconnect periodically."}
              </p>
            </div>
          )}
          
          {/* Other permissions - platform specific */}
          {otherPermissions.length > 0 && permissions.includeWriting && (
            <div className="border-t border-gray-100 pt-3">
              <div className="text-gray-900 font-medium mb-2">Additional Permissions</div>
              <div className="ml-6 text-sm text-gray-600 space-y-1">
                {otherPermissions.map(({ scope, description }) => (
                  <div key={scope} className="flex items-start">
                    <Circle className="h-2 w-2 mt-1.5 mr-2 text-gray-400" />
                    <span>{description}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                These permissions are required for additional features on {config.name}.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-gray-600">
          <p>You can change these permissions later in your account settings.</p>
          <p className="mt-1 flex items-center">
            <Lock className="h-4 w-4 mr-1 text-green-600" />
            <span className="text-green-700">Ubikial stores tokens securely and never shares your data.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// OAuth config reference - imported from OAuthManager
interface OAuthConfigType {
  [key: string]: {
    coreScopes: string[];
    optionalScopes: {
      writing?: string[];
      offline?: string[];
      media?: string[];
      pages?: string[];
    };
  };
}

const OAUTH_CONFIG: OAuthConfigType = {
  twitter: {
    coreScopes: ['tweet.read', 'users.read'],
    optionalScopes: {
      writing: ['tweet.write'],
      offline: ['offline.access'],
      media: ['media.upload', 'media.read']
    }
  },
  linkedin: {
    coreScopes: ['r_liteprofile', 'r_emailaddress'],
    optionalScopes: {
      writing: ['w_member_social'],
      offline: [],
      media: []
    }
  },
  facebook: {
    coreScopes: ['public_profile', 'email'],
    optionalScopes: {
      writing: ['pages_manage_posts', 'publish_to_groups'],
      offline: [],
      media: [],
      pages: ['pages_read_engagement', 'pages_show_list']
    }
  },
  instagram: {
    coreScopes: ['user_profile'],
    optionalScopes: {
      writing: ['user_media'],
      offline: [],
      media: []
    }
  }
};

export default PermissionsExplainer;
