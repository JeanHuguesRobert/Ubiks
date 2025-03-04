import { useState, useEffect } from 'react';
import { SocialAccount, SocialPlatform, platformConfigs } from '../../types/SocialAccount';
import { useSocialAccounts } from '../../contexts/SocialAccountContext';
import { usePersona } from '../../contexts/PersonaContext';
import { Check, Info, Save } from 'lucide-react';

interface PlatformSettingsFormProps {
  account: SocialAccount;
}

const PlatformSettingsForm = ({ account }: PlatformSettingsFormProps) => {
  const { updateAccountSettings } = useSocialAccounts();
  const { personas } = usePersona();
  const [settings, setSettings] = useState({ ...account.settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [availablePages, setAvailablePages] = useState<{ value: string; label: string }[]>([]);
  
  const platformConfig = platformConfigs[account.platform];

  // For Facebook, we would fetch pages the user manages
  useEffect(() => {
    if (account.platform === 'facebook') {
      // Simulate fetching pages
      setAvailablePages([
        { value: 'page1', label: 'Ubikial Demo Page' },
        { value: 'page2', label: 'Test Business Page' }
      ]);
    }
  }, [account.platform]);

  // Update platform-specific fields in the settings form
  const updatePlatformConfig = () => {
    if (account.platform === 'facebook') {
      // Add available pages to the config
      const pageIdField = platformConfig.settingsFields.find(field => field.key === 'pageId');
      if (pageIdField) {
        pageIdField.options = [{ value: '', label: 'Personal Profile' }, ...availablePages];
      }
    }
  };

  updatePlatformConfig();

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await updateAccountSettings(account.id, settings);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to update account settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        {platformConfig.name} Settings
      </h3>

      <div className="border rounded-md p-4 bg-gray-50">
        <div className="flex items-center">
          <img
            src={account.profileImage || 'https://via.placeholder.com/40'}
            alt={account.profileName}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="font-medium">{account.profileName}</p>
            <p className="text-xs text-gray-500">Connected on {new Date(account.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-4">General Settings</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Persona
            </label>
            <select
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={settings.defaultPersonaId || ''}
              onChange={(e) => handleSettingChange('defaultPersonaId', e.target.value || null)}
            >
              <option value="">No default persona</option>
              {personas.map(persona => (
                <option key={persona.id} value={persona.id}>
                  {persona.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select a default persona to use when posting to this account
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Auto-Post</p>
              <p className="text-xs text-gray-500">
                Automatically post to this account when creating content
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.autoPostEnabled}
                onChange={(e) => handleSettingChange('autoPostEnabled', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-4">Platform-Specific Settings</h4>
        
        <div className="space-y-4">
          {platformConfig.settingsFields.map(field => (
            <div key={field.key}>
              {field.type === 'toggle' && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{field.label}</p>
                    {field.description && (
                      <p className="text-xs text-gray-500">{field.description}</p>
                    )}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings[field.key] || false}
                      onChange={(e) => handleSettingChange(field.key, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              )}

              {field.type === 'number' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    className="w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={settings[field.key] || 0}
                    onChange={(e) => handleSettingChange(field.key, parseInt(e.target.value))}
                    min={0}
                    max={30}
                  />
                  {field.description && (
                    <p className="mt-1 text-xs text-gray-500">{field.description}</p>
                  )}
                </div>
              )}

              {field.type === 'select' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={settings[field.key] || ''}
                    onChange={(e) => handleSettingChange(field.key, e.target.value)}
                  >
                    {field.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {field.description && (
                    <p className="mt-1 text-xs text-gray-500">{field.description}</p>
                  )}
                </div>
              )}

              {field.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={settings[field.key] || ''}
                    onChange={(e) => handleSettingChange(field.key, e.target.value)}
                  />
                  {field.description && (
                    <p className="mt-1 text-xs text-gray-500">{field.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {account.platform === 'twitter' && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-sm text-blue-700">
              Twitter requires additional permissions for posting media. If you plan to upload images or videos with your tweets, please reconnect your account with the appropriate permissions.
            </p>
          </div>
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PlatformSettingsForm;
