import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePersona } from '../contexts/PersonaContext';
import { useSocialAccounts } from '../contexts/SocialAccountContext';
import { Plus, Settings, User, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const Dashboard = () => {
  const { user } = useAuth();
  const { personas } = usePersona();
  const { accounts } = useSocialAccounts();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{greeting}, {user?.name}</h1>
        <p className="text-gray-600 mt-2">Welcome to your Ubikial dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Zap className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold ml-3">Quick Stats</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Personas</span>
              <span className="text-gray-900 font-medium">{personas.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Connected Accounts</span>
              <span className="text-gray-900 font-medium">{accounts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Posts This Month</span>
              <span className="text-gray-900 font-medium">0</span>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <User className="text-indigo-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold ml-3">Your Profile</h2>
          </div>
          <p className="text-gray-600 mb-4">Manage your personal information and account settings.</p>
          <div className="space-y-3">
            <Link 
              to="/profile" 
              className="block w-full py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition text-center"
            >
              Edit Profile
            </Link>
            <Link 
              to="/settings" 
              className="block w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition text-center"
            >
              Account Settings
            </Link>
          </div>
        </div>

        {/* Personas Card */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <User className="text-purple-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold ml-3">Personas</h2>
          </div>
          <p className="text-gray-600 mb-4">Create and manage your social media personas</p>
          <Link
            to="/personas/create"
            className="w-full py-2 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition flex items-center justify-center"
          >
            <Plus size={16} className="mr-1" /> Create Persona
          </Link>
          {personas.length > 0 && (
            <Link
              to="/personas"
              className="w-full mt-2 py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition flex items-center justify-center"
            >
              View All Personas
            </Link>
          )}
        </div>
      </div>

      {/* Social Accounts */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Accounts</h2>
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              You have <span className="font-medium">{accounts.length}</span> connected social accounts.
            </p>
            <Link
              to="/accounts"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Manage Accounts
            </Link>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No social accounts connected yet</p>
              <Link
                to="/accounts"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
              >
                <Plus size={16} className="mr-1" /> Connect Accounts
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {accounts.map(account => (
                <div key={account.id} className="border rounded-lg p-4 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    {account.profileImage ? (
                      <img 
                        src={account.profileImage} 
                        alt={account.profileName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{account.profileName}</p>
                    <p className="text-xs text-gray-500 capitalize">{account.platform}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`inline-block rounded-full w-3 h-3 ${
                      account.status === 'active' ? 'bg-green-500' :
                      account.status === 'expired' ? 'bg-orange-500' :
                      account.status === 'revoked' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
