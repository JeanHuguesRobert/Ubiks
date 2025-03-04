import React, { useState, useEffect } from 'react';
import { ContentDraft } from '../../types/Content';
import { loadDraftsFromLocalStorage, deleteDraftFromLocalStorage } from '../../utils/contentUtils';
import { Link } from 'react-router-dom';
import { Clock, Pencil, FileText, Trash2 } from 'lucide-react';

interface DraftsListProps {
  userId: string;
  onSelectDraft?: (draftId: string) => void;
  mode?: 'full' | 'compact';
}

const DraftsList = ({ userId, onSelectDraft, mode = 'full' }: DraftsListProps) => {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrafts();
  }, [userId]);

  const loadDrafts = () => {
    setLoading(true);
    const userDrafts = loadDraftsFromLocalStorage(userId);
    setDrafts(userDrafts);
    setLoading(false);
  };

  const handleDeleteDraft = (e: React.MouseEvent, draftId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this draft?')) {
      deleteDraftFromLocalStorage(draftId);
      setDrafts(drafts.filter(draft => draft.id !== draftId));
    }
  };
  
  const handleDraftClick = (draftId: string) => {
    if (onSelectDraft) {
      onSelectDraft(draftId);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };
  
  const getPreviewText = (draft: ContentDraft) => {
    return draft.text.length > 100 
      ? `${draft.text.substring(0, 100)}...` 
      : draft.text || 'No content';
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading drafts...</p>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="p-4 text-center">
        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No drafts found</p>
        <Link to="/content/new" className="mt-3 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          Create new content
        </Link>
      </div>
    );
  }

  if (mode === 'compact') {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h3 className="font-medium text-gray-700">Recent Drafts</h3>
        </div>
        <ul className="divide-y divide-gray-100">
          {drafts.slice(0, 5).map(draft => (
            <li key={draft.id} onClick={() => handleDraftClick(draft.id)} className="hover:bg-gray-50 cursor-pointer">
              <Link to={`/content/edit/${draft.id}`} className="block p-4">
                <div className="flex justify-between">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {draft.text ? getPreviewText(draft) : 'Untitled draft'}
                  </p>
                  <div className="flex items-center ml-4">
                    <Clock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {formatDate(draft.updatedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-center">
          <Link to="/content" className="text-sm text-indigo-600 hover:text-indigo-800">
            View all drafts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Your Content Drafts</h2>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {drafts.map(draft => (
          <div 
            key={draft.id} 
            className="border border-gray-200 rounded-lg hover:shadow-md transition"
          >
            <Link to={`/content/edit/${draft.id}`} className="block p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-gray-900 truncate">
                    {draft.text 
                      ? (draft.text.substring(0, 30) || 'Untitled draft') 
                      : 'Untitled draft'
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {getPreviewText(draft)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteDraft(e, draft.id)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={14} className="mr-1" />
                  {formatDate(draft.updatedAt)}
                </div>
                
                <div className="flex items-center text-xs">
                  {draft.images.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs mr-2">
                      {draft.images.length} {draft.images.length === 1 ? 'image' : 'images'}
                    </span>
                  )}
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs flex items-center">
                    <Pencil size={12} className="mr-1" /> Pencil
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftsList;
