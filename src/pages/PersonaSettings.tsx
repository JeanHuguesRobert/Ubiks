import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { usePersona } from '../contexts/PersonaContext';
import { ArrowLeft, CircleAlert, MessageSquare, Palette, Save, Settings, Share2 } from 'lucide-react';
import ToneStyleSettings from '../components/ToneStyleSettings';
import PlatformSettings from '../components/PlatformSettings';
import { Persona, SocialPlatformSettings } from '../types/Persona';
import { SocialPlatform } from '../types/Platform.ts';

const PersonaSettings = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>('tone');
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { getPersona, updatePersona } = usePersona();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const foundPersona = getPersona(id);
      if (foundPersona) {
        setPersona(foundPersona);
      } else {
        setError('Persona not found');
      }
      setIsLoading(false);
    }
  }, [id, getPersona]);

  const handleSaveSettings = async () => {
    if (!persona) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await updatePersona(persona.id, {
        name: persona.name,
        description: persona.description || '',
        tone: persona.tone || 'casual',
        style: persona.style || 'conversational',
        voice: persona.voice || 'first-person',
        platforms: persona.platforms // Already using array
      });
      
      setSuccessMessage('Settings saved successfully');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePersonaField = (field: string, value: any) => {
    if (!persona) return;
    setPersona({
      ...persona,
      [field]: value
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!persona) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Persona Not Found</h1>
          <p className="text-gray-600 mb-6">The persona you are trying to configure does not exist.</p>
          <Link
            to="/personas"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back to Personas
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Persona Settings</h1>
          <p className="text-gray-600 mt-1">Configure settings for {persona.name}</p>
        </div>
        
        <div className="flex space-x-2">
          <Link
            to="/personas"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Saving...
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
          <CircleAlert className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center">
          <div className="rounded-full bg-green-100 p-1">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="ml-2">{successMessage}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('tone')}
              className={`relative inline-flex items-center px-4 py-4 text-sm font-medium ${
                activeTab === 'tone'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Palette className="h-5 w-5 mr-2" />
              Tone & Style
            </button>
            <button
              onClick={() => setActiveTab('platforms')}
              className={`relative inline-flex items-center px-4 py-4 text-sm font-medium ${
                activeTab === 'platforms'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Share2 className="h-5 w-5 mr-2" />
              Platforms
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`relative inline-flex items-center px-4 py-4 text-sm font-medium ${
                activeTab === 'advanced'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Advanced
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'tone' && (
            <ToneStyleSettings 
              persona={persona} 
              onChange={(field, value) => updatePersonaField(field, value)} 
            />
          )}

          {activeTab === 'platforms' && (
            <PlatformSettings 
              platforms={persona.platforms} 
              onChange={(platforms) => updatePersonaField('platforms', platforms)} 
            />
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>
                <p className="mt-1 text-sm text-gray-500">Configure advanced options for this persona.</p>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700">Content Adaptation Level</label>
                <p className="text-sm text-gray-500 mb-2">How much the AI should adapt your content for this persona</p>
                <div className="w-full flex items-center">
                  <span className="text-xs text-gray-500 w-16">Minimal</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    className="flex-1 mx-4" 
                    value="3" 
                  />
                  <span className="text-xs text-gray-500 w-16 text-right">Complete</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
                    defaultChecked={true}
                  />
                  <span className="ml-2 text-sm text-gray-700">Learn from my edits to improve adaptation</span>
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  Allow the system to learn from your manual edits to better adapt content for this persona
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
                    defaultChecked={false}
                  />
                  <span className="ml-2 text-sm text-gray-700">Require approval before posting</span>
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  Always require manual approval before publishing content with this persona
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PersonaSettings;
