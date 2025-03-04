import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePersona } from '../contexts/PersonaContext';
import DashboardLayout from '../components/DashboardLayout';
import { CircleAlert, ExternalLink, Github, Pencil, Plus, RefreshCw, Settings, Trash2, User } from 'lucide-react';
import DeletePersonaModal from '../components/DeletePersonaModal';
import GitHubConnectionModal from '../components/GitHubConnectionModal';
import { Persona } from '../types/Persona';

const Personas = () => {
  const { personas, loading, error, isGitHubConnected, syncWithGitHub } = usePersona();
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleDeleteClick = (persona: Persona) => {
    setPersonaToDelete(persona);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPersonaToDelete(null);
  };

  const handleSyncWithGitHub = async () => {
    if (!isGitHubConnected) {
      setIsGitHubModalOpen(true);
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      await syncWithGitHub();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to sync with GitHub');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Personas</h1>
          <p className="text-gray-600 mt-1">Manage your social media personalities</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSyncWithGitHub}
            disabled={isSyncing}
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
          >
            {isSyncing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2" />
                Syncing...
              </>
            ) : (
              <>
                {isGitHubConnected ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" /> Sync with GitHub
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" /> Connect GitHub
                  </>
                )}
              </>
            )}
          </button>
          <Link 
            to="/personas/create"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Persona
          </Link>
        </div>
      </div>

      {syncError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
          <CircleAlert className="h-5 w-5 mr-2" />
          <p>{syncError}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
          <CircleAlert className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : personas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-50 mb-4">
            <User className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No personas yet</h3>
          <p className="text-gray-500 mb-6">Create your first persona to get started with cross-posting</p>
          <Link
            to="/personas/create"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Your First Persona
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <div key={persona.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold mr-3">
                      {persona.avatarUrl ? (
                        <img src={persona.avatarUrl} alt={persona.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        persona.name.charAt(0)
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{persona.name}</h3>
                  </div>
                  <div className="flex space-x-1">
                    <Link
                      to={`/personas/settings/${persona.id}`}
                      className="p-1 text-gray-400 hover:text-indigo-600"
                      title="Persona settings"
                    >
                      <Settings size={16} />
                    </Link>
                    <Link
                      to={`/personas/edit/${persona.id}`}
                      className="p-1 text-gray-400 hover:text-indigo-600"
                      title="Edit persona"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(persona)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete persona"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {persona.description || "No description provided"}
                </p>
                
                <div className="mt-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium mr-2">Tone:</span>
                    <span className="capitalize">{persona.tone}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span className="font-medium mr-2">Style:</span>
                    <span className="capitalize">{persona.style}</span>
                  </div>
                </div>
                
                {persona.githubRepo && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-600">
                      <Github size={14} className="mr-1" />
                      <span className="font-medium mr-1">GitHub:</span>
                      <a 
                        href={persona.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline flex items-center"
                      >
                        {persona.githubRepo} <ExternalLink size={12} className="ml-1" />
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Connected platforms:</p>
                  <div className="flex flex-wrap gap-2">
                    {persona.platforms
                      .filter(platform => platform.enabled)
                      .map(platform => (
                        <span 
                          key={platform.platformId} 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {platform.platformName}
                        </span>
                      ))}
                    {persona.platforms.filter(platform => platform.enabled).length === 0 && (
                      <span className="text-xs text-gray-400">No platforms connected</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <Link
                    to={`/personas/edit/${persona.id}`}
                    className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Edit Persona
                  </Link>
                  <Link
                    to={`/personas/settings/${persona.id}`}
                    className="inline-flex justify-center items-center px-4 py-2 border border-indigo-500 shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <DeletePersonaModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        persona={personaToDelete}
      />

      <GitHubConnectionModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />
    </DashboardLayout>
  );
};

export default Personas;
