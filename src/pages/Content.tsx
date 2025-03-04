import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { loadDraftsFromLocalStorage } from '../utils/contentUtils';
import { useAuth } from '../contexts/AuthContext';
import DraftsList from '../components/content/DraftsList';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Content = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Just to simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Create, manage, and schedule your social media content</p>
        </div>
        
        <Link
          to="/content/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Content
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <DraftsList userId={user.id} mode="full" />
      )}
    </DashboardLayout>
  );
};

export default Content;
