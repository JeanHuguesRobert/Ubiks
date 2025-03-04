import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Persona, PersonaFormData } from '../types/Persona';
import { useAuth } from './AuthContext';
import { createStorageAdapter, StorageAdapter } from '../services/StorageAdapter';
import { githubService, GitHubAuthError, GitHubApiError } from '../services/GitHubService';

interface PersonaContextType {
  personas: Persona[];
  loading: boolean;
  error: string | null;
  isGitHubConnected: boolean;
  createPersona: (personaData: PersonaFormData) => Promise<Persona>;
  updatePersona: (id: string, personaData: PersonaFormData) => Promise<Persona>;
  deletePersona: (id: string) => Promise<void>;
  getPersona: (id: string) => Persona | undefined;
  connectGitHub: (token: string) => Promise<void>;
  disconnectGitHub: () => void;
  syncWithGitHub: () => Promise<void>;
  clearError: () => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export const usePersona = () => {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
};

interface PersonaProviderProps {
  children: ReactNode;
}

export const PersonaProvider = ({ children }: PersonaProviderProps) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageAdapter, setStorageAdapter] = useState<StorageAdapter | null>(null);
  const { user } = useAuth();

  // Initialize storage adapter when user changes
  useEffect(() => {
    if (user) {
      const adapter = createStorageAdapter(user.id, true);
      setStorageAdapter(adapter);
    } else {
      setStorageAdapter(null);
      setPersonas([]);
    }
  }, [user]);

  // Load personas from storage
  useEffect(() => {
    if (storageAdapter && user) {
      setLoading(true);
      storageAdapter.getPersonas()
        .then(loadedPersonas => {
          setPersonas(loadedPersonas);
        })
        .catch(err => {
          console.error('Failed to load personas:', err);
          setError('Failed to load your personas. Please try refreshing the page.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPersonas([]);
      setLoading(false);
    }
  }, [storageAdapter, user]);

  const clearError = () => {
    setError(null);
  };

  const createPersona = async (personaData: PersonaFormData): Promise<Persona> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to create a persona');
      }
      
      if (!storageAdapter) {
        throw new Error('Storage not initialized');
      }
      
      // Create a new persona with an ID and timestamps
      const newPersona: Persona = {
        id: `persona-${Date.now()}`,
        ...personaData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id
      };
      
      // Save using the storage adapter
      const savedPersona = await storageAdapter.savePersona(newPersona);
      
      // Update the local state
      setPersonas(prevPersonas => [...prevPersonas, savedPersona]);
      
      return savedPersona;
    } catch (err) {
      let errorMessage = 'Failed to create persona';
      
      if (err instanceof GitHubAuthError) {
        errorMessage = `GitHub authentication error: ${err.message}`;
      } else if (err instanceof GitHubApiError) {
        errorMessage = `GitHub error (${err.status}): ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePersona = async (id: string, personaData: PersonaFormData): Promise<Persona> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to update a persona');
      }
      
      if (!storageAdapter) {
        throw new Error('Storage not initialized');
      }
      
      // Find the persona to update
      const personaIndex = personas.findIndex(p => p.id === id);
      
      if (personaIndex === -1) {
        throw new Error('Persona not found');
      }
      
      // Create updated persona with new timestamps
      const updatedPersona: Persona = {
        ...personas[personaIndex],
        ...personaData,
        updatedAt: new Date().toISOString()
      };
      
      // Update using the storage adapter
      const savedPersona = await storageAdapter.updatePersona(updatedPersona);
      
      // Update the local state
      const updatedPersonas = [...personas];
      updatedPersonas[personaIndex] = savedPersona;
      setPersonas(updatedPersonas);
      
      return savedPersona;
    } catch (err) {
      let errorMessage = 'Failed to update persona';
      
      if (err instanceof GitHubAuthError) {
        errorMessage = `GitHub authentication error: ${err.message}`;
      } else if (err instanceof GitHubApiError) {
        errorMessage = `GitHub error (${err.status}): ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deletePersona = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to delete a persona');
      }
      
      if (!storageAdapter) {
        throw new Error('Storage not initialized');
      }
      
      // Delete using the storage adapter
      await storageAdapter.deletePersona(id);
      
      // Update the local state
      const filteredPersonas = personas.filter(p => p.id !== id);
      setPersonas(filteredPersonas);
    } catch (err) {
      let errorMessage = 'Failed to delete persona';
      
      if (err instanceof GitHubAuthError) {
        errorMessage = `GitHub authentication error: ${err.message}`;
      } else if (err instanceof GitHubApiError) {
        errorMessage = `GitHub error (${err.status}): ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPersona = (id: string): Persona | undefined => {
    return personas.find(p => p.id === id);
  };

  const connectGitHub = async (token: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await githubService.authenticate(token);
      
      if (!user) {
        throw new Error('You must be logged in to connect GitHub');
      }
      
      // Create a new adapter with GitHub preference
      const adapter = createStorageAdapter(user.id, true);
      setStorageAdapter(adapter);
      
      // Sync could be done here but we'll make it explicit instead
    } catch (err) {
      let errorMessage = 'Failed to connect to GitHub';
      
      if (err instanceof GitHubAuthError) {
        errorMessage = `GitHub authentication error: ${err.message}`;
      } else if (err instanceof GitHubApiError) {
        errorMessage = `GitHub API error: ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const disconnectGitHub = (): void => {
    githubService.logout();
    
    if (user) {
      // Create a new adapter without GitHub
      const adapter = createStorageAdapter(user.id, false);
      setStorageAdapter(adapter);
    }
  };

  const syncWithGitHub = async (): Promise<void> => {
    if (!githubService.isAuthenticated) {
      throw new Error('Not connected to GitHub');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to sync with GitHub');
      }
      
      // We need a GitHub adapter for this operation
      const adapter = createStorageAdapter(user.id, true);
      
      // Check if it's actually a GitHub adapter
      if ('syncWithGitHub' in adapter) {
        await (adapter as any).syncWithGitHub();
        
        // Reload personas
        const refreshedPersonas = await adapter.getPersonas();
        setPersonas(refreshedPersonas);
      } else {
        throw new Error('GitHub storage not available');
      }
    } catch (err) {
      let errorMessage = 'Failed to sync with GitHub';
      
      if (err instanceof GitHubAuthError) {
        errorMessage = `GitHub authentication error: ${err.message}`;
      } else if (err instanceof GitHubApiError) {
        errorMessage = `GitHub API error: ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    personas,
    loading,
    error,
    isGitHubConnected: githubService.isAuthenticated,
    createPersona,
    updatePersona,
    deletePersona,
    getPersona,
    connectGitHub,
    disconnectGitHub,
    syncWithGitHub,
    clearError
  };

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
};
