import { githubService } from './GitHubService';
import { Persona, SocialPlatformSettings } from '../types/Persona';

const DEFAULT_PLATFORMS: SocialPlatformSettings[] = [
  {
    platformId: 'twitter',
    platformName: 'Twitter',
    enabled: false,
    supportsTags: true,
    supportsImages: true,
    supportsVideos: true
  },
  {
    platformId: 'linkedin',
    platformName: 'LinkedIn',
    enabled: false,
    supportsTags: true,
    supportsImages: true,
    supportsVideos: true
  },
  {
    platformId: 'facebook',
    platformName: 'Facebook',
    enabled: false,
    supportsTags: true,
    supportsImages: true,
    supportsVideos: true
  },
  {
    platformId: 'instagram',
    platformName: 'Instagram',
    enabled: false,
    supportsTags: true,
    supportsImages: true,
    supportsVideos: true
  }
];

export class PersonaService {
  private static instance: PersonaService;
  
  public static getInstance(): PersonaService {
    if (!PersonaService.instance) {
      PersonaService.instance = new PersonaService();
    }
    return PersonaService.instance;
  }

  private constructor() {}

  async syncPersonas(userId: string): Promise<void> {
    const localPersonas = await this.getLocalPersonas(userId);
    
    try {
      // Remove userId parameter as it's not needed
      const remotePersonas = await githubService.getPersonas();
      
      // Create a map of existing personas by ID
      const existingMap = new Map(localPersonas.map(p => [p.id, p]));
      const remoteMap = new Map(remotePersonas.map(p => [p.id, p]));
      
      // Update existing and add new
      const mergedPersonas = new Map<string, Persona>();
      
      // Merge remote into local, keeping most recent version
      remoteMap.forEach((remote, id) => {
        const local = existingMap.get(id);
        if (!local || new Date(remote.updatedAt) > new Date(local.updatedAt)) {
          mergedPersonas.set(id, remote);
        }
      });
      
      // Add local-only personas
      existingMap.forEach((local, id) => {
        if (!mergedPersonas.has(id)) {
          mergedPersonas.set(id, local);
        }
      });
      
      // Save merged result
      await localStorage.setItem(
        `personas_${userId}`,
        JSON.stringify(Array.from(mergedPersonas.values()))
      );
      
    } catch (error) {
      console.error('Sync failed:', error);
      throw new Error('Failed to sync personas');
    }
  }

  async deletePersona(userId: string, personaId: string): Promise<void> {
    try {
      // Get current personas
      const personas = await this.getLocalPersonas(userId);
      
      // Remove the persona
      const updatedPersonas = personas.filter(p => p.id !== personaId);
      
      // Update local storage first
      await localStorage.setItem(
        `personas_${userId}`,
        JSON.stringify(updatedPersonas)
      );
      
      // Then attempt GitHub deletion
      try {
        await githubService.deletePersona(userId, personaId);
      } catch (error) {
        console.warn('GitHub delete failed, but local delete succeeded:', error);
      }
      
    } catch (error) {
      console.error('Delete failed:', error);
      throw new Error('Failed to delete persona');
    }
  }

  async getPersona(userId: string, personaId: string): Promise<Persona | null> {
    try {
      const personas = await this.getLocalPersonas(userId);
      const persona = personas.find(p => p.id === personaId);
      
      if (!persona) {
        // Try GitHub as fallback
        return await githubService.getPersona(userId, personaId);
      }
      
      return persona;
    } catch (error) {
      console.error('Get persona failed:', error);
      return null;
    }
  }

  async createPersona(userId: string, persona: Partial<Persona>): Promise<Persona> {
    const newPersona: Persona = {
      id: `Ubik-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: persona.name || 'New Persona',
      description: persona.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      platforms: persona.platforms || DEFAULT_PLATFORMS,
      ...persona
    };

    // Save locally first
    const personas = await this.getLocalPersonas(userId);
    personas.push(newPersona);
    await localStorage.setItem(`personas_${userId}`, JSON.stringify(personas));

    // Then try GitHub
    try {
      if (githubService.isAuthenticated) {
        const repoUrl = await githubService.createPersonaRepository({ ...newPersona, userId });
        newPersona.githubUrl = repoUrl;
        await this.syncPersonas(userId);
      }
    } catch (error) {
      console.warn('GitHub sync failed, persona saved locally:', error);
    }

    return newPersona;
  }

  private async getLocalPersonas(userId: string): Promise<Persona[]> {
    try {
      const personas = localStorage.getItem(`personas_${userId}`);
      const parsed = personas ? JSON.parse(personas) : [];
      
      // Ensure each persona has valid platforms array
      return parsed.map((persona: any) => ({
        ...persona,
        platforms: Array.isArray(persona.platforms) ? persona.platforms : DEFAULT_PLATFORMS
      }));
    } catch (error) {
      console.error('Error loading personas:', error);
      return [];
    }
  }
}

// Export singleton instance
export const personaService = PersonaService.getInstance();