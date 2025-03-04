import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Squircle, Bell, Key, LogOut, Shield } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = () => {
    // In a real app, you would call an API to delete the account
    alert('Account deletion would happen here in a real app.');
    logout();
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and security</p>
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Bell className="text-indigo-600 mr-3" size={20} />
            <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 font-medium">Email Notifications</p>
                <p className="text-gray-500 text-sm">Receive emails about your account activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 font-medium">Marketing Emails</p>
                <p className="text-gray-500 text-sm">Receive updates about new features and promotions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={marketingEmails}
                  onChange={() => setMarketingEmails(!marketingEmails)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Shield className="text-indigo-600 mr-3" size={20} />
            <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 font-medium">Two-Factor Authentication</p>
                <p className="text-gray-500 text-sm">Add an extra layer of security to your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={twoFactorEnabled}
                  onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <button className="flex items-center text-indigo-600 hover:text-indigo-800 mt-2">
              <Key size={16} className="mr-2" />
              Change Password
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Squircle className="text-red-600 mr-3" size={20} />
            <h2 className="text-lg font-medium text-gray-900">Danger Zone</h2>
          </div>
          
          <div>
            <p className="text-gray-700 mb-4">These actions are permanent and cannot be undone.</p>
            
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center"
              >
                <LogOut size={16} className="mr-2" />
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-red-600">Are you sure you want to delete your account? This action cannot be undone.</p>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Yes, Delete Account
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
