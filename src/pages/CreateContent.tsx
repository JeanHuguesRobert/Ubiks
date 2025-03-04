import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ContentEditor from '../components/content/ContentEditor';
import PlatformSelector from '../components/content/PlatformSelector';
import ContentPreviews from '../components/content/ContentPreviews';
import ContentAdaptation from '../components/content/ContentAdaptation';
import { useAuth } from '../contexts/AuthContext';
import { usePersona } from '../contexts/PersonaContext';
import { useSocialAccounts } from '../contexts/SocialAccountContext';
import { ContentDraft, PlatformPostSettings, createEmptyDraft } from '../types/Content';
import { saveDraftToLocalStorage } from '../utils/contentUtils';
import { SocialPlatform } from '../types/SocialAccount';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateContent = () => {
  const { user } = useAuth();
  const { personas } = usePersona();
  const { accounts, getActiveAccounts } = useSocialAccounts();
  const navigate = useNavigate();
  
  const [content, setContent] = useState<ContentDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [enabledPlatforms, setEnabledPlatforms] = useState<SocialPlatform[]>([]);
  const [activeTab, setActiveTab] = useState<'compose' | 'adapt' | 'preview'>('compose');
  const [adaptedContent, setAdaptedContent] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (user) {
      // Create empty draft
      const draft = createEmptyDraft(user.id);
      setContent(draft);
      
      // Set initial enabled platforms based on connected accounts
      const activeAccounts = getActiveAccounts();
      const connectedPlatforms = activeAccounts.map(account => account.platform);
      
      // Enable twitter by default if connected, otherwise first connected platform
      if (connectedPlatforms.includes('twitter')) {
        setEnabledPlatforms(['twitter']);
        updatePlatformEnabled('twitter', true, draft);
      } else if (connectedPlatforms.length > 0) {
        setEnabledPlatforms([connectedPlatforms[0]]);
        updatePlatformEnabled(connectedPlatforms[0], true, draft);
      }
    }
  }, [user, getActiveAccounts]);
  
  // Update enabled platforms list when content changes
  useEffect(() => {
    if (content) {
      const platforms = Object.entries(content.platformSettings)
        .filter(([_, settings]) => settings.enabled)
        .map(([platform]) => platform as SocialPlatform);
      
      setEnabledPlatforms(platforms);
    }
  }, [content]);
  
  if (!user || !content) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  const handleContentChange = (updatedContent: ContentDraft) => {
    setContent(updatedContent);
    // Save to localStorage with debounce (handled in ContentEditor)
  };
  
  const updatePlatformEnabled = (
    platform: SocialPlatform, 
    enabled: boolean,
    draft: ContentDraft = content
  ) => {
    const updatedSettings = {
      ...draft.platformSettings,
      [platform]: {
        ...draft.platformSettings[platform],
        enabled
      }
    };
    
    return {
      ...draft,
      platformSettings: updatedSettings
    };
  };
  
  const handlePlatformToggle = (platform: SocialPlatform, enabled: boolean) => {
    if (!content) return;
    
    const updatedContent = updatePlatformEnabled(platform, enabled);
    setContent(updatedContent);
    saveDraftToLocalStorage(updatedContent);
  };
  
  const handlePersonaSelect = (platform: SocialPlatform, personaId: string | null) => {
    if (!content) return;
    
    const updatedContent = {
      ...content,
      selectedPersonaIds: {
        ...content.selectedPersonaIds,
        [platform]: personaId
      }
    };
    
    setContent(updatedContent);
    saveDraftToLocalStorage(updatedContent);
  };
  
  const handleSettingsChange = (platform: SocialPlatform, settings: PlatformPostSettings) => {
    if (!content) return;
    
    const updatedContent = {
      ...content,
      platformSettings: {
        ...content.platformSettings,
        [platform]: settings
      }
    };
    
    setContent(updatedContent);
    saveDraftToLocalStorage(updatedContent);
  };
  
  const handleSaveDraft = () => {
    if (!content) return;
    
    setSaving(true);
    
    try {
      // Include adapted content in the save
      const updatedContent = {
        ...content,
        // We might store adaptations in the content object if needed
      };
      
      saveDraftToLocalStorage(updatedContent);
      setSavedMessage('Draft saved successfully');
      
      // Clear saved message after 3 seconds
      setTimeout(() => {
        setSavedMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdateAdaptedContent = (platform: SocialPlatform, newContent: string) => {
    setAdaptedContent(prev => ({
      ...prev,
      [platform]: newContent
    }));
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link
            to="/content"
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Content</h1>
            <p className="text-gray-600 mt-1">Write once, post everywhere with your unique personas</p>
          </div>
        </div>
        
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70"
        >
          {saving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> Save Draft
            </>
          )}
        </button>
      </div>
      
      {savedMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center">
          <div className="rounded-full bg-green-100 p-1 mr-2">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {savedMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'compose'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Compose
          </button>
          <button
            onClick={() => setActiveTab('adapt')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'adapt'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            disabled={!content.text}
          >
            Adapt
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            disabled={!content.text}
          >
            Preview
          </button>
        </nav>
      </div>

      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Content Editor</h2>
              <ContentEditor 
                content={content} 
                onChange={handleContentChange}
                autoSave={true}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Platform Selector */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <PlatformSelector
                content={content}
                onPlatformToggle={handlePlatformToggle}
                onPersonaSelect={handlePersonaSelect}
                onSettingsChange={handleSettingsChange}
                personas={personas}
              />
            </div>
            
            {/* Publishing Options - Will be implemented in future phases */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Publishing Options</h3>
              <p className="text-sm text-gray-500 mb-4">
                Choose when to publish your content
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="publish-now"
                    name="publish-time"
                    type="radio"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    defaultChecked
                  />
                  <label htmlFor="publish-now" className="ml-3 block text-sm font-medium text-gray-700">
                    Save as draft
                  </label>
                </div>
                
                <div className="flex items-center opacity-50 cursor-not-allowed">
                  <input
                    id="publish-scheduled"
                    name="publish-time"
                    type="radio"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    disabled
                  />
                  <label htmlFor="publish-scheduled" className="ml-3 block text-sm font-medium text-gray-500">
                    Schedule for later (coming soon)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'adapt' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <ContentAdaptation
            content={content}
            personas={personas}
            onUpdateAdaptedContent={handleUpdateAdaptedContent}
          />
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Content Previews</h2>
          <ContentPreviews
            content={content}
            platforms={enabledPlatforms}
            personas={personas}
            defaultPersonaIds={content.selectedPersonaIds}
            adaptedContent={adaptedContent}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default CreateContent;
