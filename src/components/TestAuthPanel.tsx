import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

// This component is for testing authentication only
const TestAuthPanel = () => {
  const { user, logout, createTestAccount } = useAuth();
  const [testCredentials, setTestCredentials] = useState<{ email: string; password: string } | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  const handleCreateTestAccount = async () => {
    try {
      const credentials = await createTestAccount();
      setTestCredentials(credentials);
    } catch (err) {
      console.error('Error creating test account:', err);
    }
  };

  if (!showPanel) {
    return (
      <button 
        onClick={() => setShowPanel(true)}
        className="fixed bottom-5 right-5 bg-gray-800 text-white p-2 rounded-md text-xs opacity-50 hover:opacity-100"
      >
        Test Auth
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 bg-white shadow-lg rounded-lg p-4 border border-gray-200 text-sm w-80 z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">Auth Testing Panel</h3>
        <button 
          onClick={() => setShowPanel(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="mb-3">
        <p className="font-medium">Current Status:</p>
        <p className="text-xs mt-1">{user ? `Logged in as: ${user.email}` : 'Not logged in'}</p>
      </div>

      <div className="space-y-2">
        {user ? (
          <>
            <Link 
              to="/dashboard" 
              className="block w-full text-center py-1 px-3 bg-indigo-100 text-indigo-700 rounded-md text-xs"
            >
              Go to Dashboard
            </Link>
            <Link 
              to="/profile" 
              className="block w-full text-center py-1 px-3 bg-indigo-100 text-indigo-700 rounded-md text-xs"
            >
              Go to Profile
            </Link>
            <Link 
              to="/settings" 
              className="block w-full text-center py-1 px-3 bg-indigo-100 text-indigo-700 rounded-md text-xs"
            >
              Go to Settings
            </Link>
            <button 
              onClick={logout}
              className="w-full py-1 px-3 bg-red-100 text-red-700 rounded-md text-xs"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <div className="flex space-x-2">
              <Link 
                to="/login" 
                className="block flex-1 text-center py-1 px-3 bg-indigo-100 text-indigo-700 rounded-md text-xs"
              >
                Go to Login
              </Link>
              <Link 
                to="/signup" 
                className="block flex-1 text-center py-1 px-3 bg-indigo-100 text-indigo-700 rounded-md text-xs"
              >
                Go to Signup
              </Link>
            </div>
            <button 
              onClick={handleCreateTestAccount}
              className="w-full py-1 px-3 bg-blue-100 text-blue-700 rounded-md text-xs"
            >
              Create Test Account
            </button>
          </>
        )}
      </div>

      {testCredentials && (
        <div className="mt-3 p-2 bg-gray-50 rounded-md text-xs">
          <p className="font-medium mb-1">Test Credentials:</p>
          <p>Email: {testCredentials.email}</p>
          <p>Password: {testCredentials.password}</p>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        This panel is for testing purposes only
      </p>
    </div>
  );
};

export default TestAuthPanel;
