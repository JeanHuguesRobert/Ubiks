import { Persona, PersonaFormData } from '../types/Persona';
import { githubService, GitHubAuthError, GitHubApiError, CreatePersonaInput } from './GitHubService';

// Main storage adapter interface
export interface StorageAdapter {
  savePersona(persona: Persona): Promise<Persona>;
  updatePersona(persona: Persona): Promise<Persona>;
  deletePersona(personaId: string): Promise<void>;
  getPersonas(): Promise<Persona[]>;
  isOnline(): boolean;
}

// Local storage implementation
export class LocalStorageAdapter implements StorageAdapter {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async savePersona(persona: Persona): Promise<Persona> {
    try {
      const storedPersonas = localStorage.getItem(`ubikial_personas_${this.userId}`);
      const personas = storedPersonas ? JSON.parse(storedPersonas) as Persona[] : [];
      
      // Add new persona
      personas.push(persona);
      
      // Save back to localStorage
      localStorage.setItem(`ubikial_personas_${this.userId}`, JSON.stringify(personas));
      
      return persona;
    } catch (error) {
      throw new Error(`Failed to save persona to localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updatePersona(persona: Persona): Promise<Persona> {
    try {
      const storedPersonas = localStorage.getItem(`ubikial_personas_${this.userId}`);
      if (!storedPersonas) {
        throw new Error('No personas found in localStorage');
      }
      
      const personas = JSON.parse(storedPersonas) as Persona[];
      const index = personas.findIndex(p => p.id === persona.id);
      
      if (index === -1) {
        throw new Error(`Persona with id ${persona.id} not found`);
      }
      
      // Update persona
      personas[index] = persona;
      
      // Save back to localStorage
      localStorage.setItem(`ubikial_personas_${this.userId}`, JSON.stringify(personas));
      
      return persona;
    } catch (error) {
      throw new Error(`Failed to update persona in localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deletePersona(personaId: string): Promise<void> {
    try {
      const storedPersonas = localStorage.getItem(`ubikial_personas_${this.userId}`);
      if (!storedPersonas) {
        return; // No personas to delete
      }
      
      const personas = JSON.parse(storedPersonas) as Persona[];
      const filteredPersonas = personas.filter(p => p.id !== personaId);
      
      if (filteredPersonas.length === 0) {
        // Remove the item if no personas left
        localStorage.removeItem(`ubikial_personas_${this.userId}`);
      } else {
        // Save filtered list
        localStorage.setItem(`ubikial_personas_${this.userId}`, JSON.stringify(filteredPersonas));
      }
    } catch (error) {
      throw new Error(`Failed to delete persona from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPersonas(): Promise<Persona[]> {
    try {
      const storedPersonas = localStorage.getItem(`ubikial_personas_${this.userId}`);
      return storedPersonas ? JSON.parse(storedPersonas) as Persona[] : [];
    } catch (error) {
      throw new Error(`Failed to get personas from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isOnline(): boolean {
    return true; // LocalStorage is always "online"
  }
}

// GitHub storage implementation
export class GitHubStorageAdapter implements StorageAdapter {
  private userId: string;
  private localAdapter: LocalStorageAdapter;

  constructor(userId: string) {
    this.userId = userId;
    this.localAdapter = new LocalStorageAdapter(userId);
  }

  isOnline(): boolean {
    return githubService.isAuthenticated && navigator.onLine;
  }

  async savePersona(persona: Persona): Promise<Persona> {
    if (!persona.userId) {
      throw new Error('Cannot save persona without userId');
    }

    // Create a properly typed input for GitHub
    const createInput: CreatePersonaInput = {
      ...persona,
      userId: persona.userId // Now TypeScript knows this is defined
    };

    try {
      const repoUrl = await githubService.createPersonaRepository(createInput);
      return {
        ...persona,
        githubUrl: repoUrl
      };
    } catch (error) {
      console.error('Failed to save persona to GitHub:', error);
      return persona;
    }
  }

  async updatePersona(persona: Persona): Promise<Persona> {
    try {
      if (!this.isOnline()) {
        throw new Error('Not connected to GitHub');
      }

      if (!persona.githubRepo) {
        // If no GitHub repo exists yet, create one
        return this.savePersona(persona);
      }

      // Update GitHub repository
      await githubService.updatePersonaRepository(persona, persona.githubRepo);
      
      // Also update in localStorage
      await this.localAdapter.updatePersona(persona);
      
      return persona;
    } catch (error) {
      // Fallback to localStorage
      console.error('GitHub update failed, falling back to localStorage:', error);
      return this.localAdapter.updatePersona(persona);
    }
  }

  async deletePersona(personaId: string): Promise<void> {
    try {
      // Get persona first to get the repo name
      const personas = await this.getPersonas();
      const persona = personas.find(p => p.id === personaId);
      
      if (persona && persona.githubRepo && this.isOnline()) {
        // Delete from GitHub
        await githubService.deletePersonaRepository(persona.githubRepo);
      }
      
      // Always delete from localStorage too
      await this.localAdapter.deletePersona(personaId);
    } catch (error) {
      // If GitHub deletion fails, still try to delete from localStorage
      console.error('GitHub deletion failed:', error);
      await this.localAdapter.deletePersona(personaId);
    }
  }

  async getPersonas(): Promise<Persona[]> {
    try {
      if (!this.isOnline()) {
        throw new Error('Not connected to GitHub');
      }

      // Try to get from GitHub first
      const githubPersonas = await githubService.getPersonasFromGitHub();
      
      // If successful, sync with localStorage
      if (githubPersonas.length > 0) {
        localStorage.setItem(`ubikial_personas_${this.userId}`, JSON.stringify(githubPersonas));
        return githubPersonas;
      }
      
      // If GitHub has no personas, check localStorage
      return this.localAdapter.getPersonas();
    } catch (error) {
      // Fallback to localStorage
      console.error('Failed to get personas from GitHub, falling back to localStorage:', error);
      return this.localAdapter.getPersonas();
    }
  }

  async syncWithGitHub(): Promise<void> {
    if (!this.isOnline()) {
      throw new GitHubAuthError('Not connected to GitHub');
    }

    try {
      // Get personas from both sources
      const localPersonas = await this.localAdapter.getPersonas();
      const githubPersonas = await githubService.getPersonasFromGitHub();
      
      // Create map of GitHub personas by ID
      const githubPersonasMap = new Map<string, Persona>();
      githubPersonas.forEach(persona => {
        githubPersonasMap.set(persona.id, persona);
      });
      
      // For each local persona, check if it exists in GitHub
      for (const localPersona of localPersonas) {
        if (!githubPersonasMap.has(localPersona.id)) {
          // Local persona not in GitHub, create it
          await this.savePersona(localPersona);
        } else {
          // Compare updated dates to decide which is newer
          const githubPersona = githubPersonasMap.get(localPersona.id)!;
          const localDate = new Date(localPersona.updatedAt).getTime();
          const githubDate = new Date(githubPersona.updatedAt).getTime();
          
          if (localDate > githubDate) {
            // Local is newer, update GitHub
            await this.updatePersona(localPersona);
          } else if (githubDate > localDate) {
            // GitHub is newer, update local
            await this.localAdapter.updatePersona(githubPersona);
          }
          
          // Remove from map to mark as processed
          githubPersonasMap.delete(localPersona.id);
        }
      }
      
      // Any remaining GitHub personas need to be added locally
      for (const githubPersona of githubPersonasMap.values()) {
        await this.localAdapter.savePersona(githubPersona);
      }
    } catch (error) {
      throw new Error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Factory to create the appropriate adapter
export function createStorageAdapter(userId: string, preferGitHub: boolean = true): StorageAdapter {
  if (preferGitHub && githubService.isAuthenticated && navigator.onLine) {
    return new GitHubStorageAdapter(userId);
  }
  return new LocalStorageAdapter(userId);
}
