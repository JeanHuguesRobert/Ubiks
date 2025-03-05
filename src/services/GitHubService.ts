import { Octokit } from '@octokit/rest';
import { Persona } from '../types/Persona';
import { defaultPlatforms } from '../types/Persona';  // Add this import

// Add these utility functions at the top of the file
function base64Encode(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return btoa(String.fromCharCode(...data));
}

function base64Decode(str: string): string {
  const binString = atob(str);
  return new TextDecoder().decode(Uint8Array.from(binString, c => c.charCodeAt(0)));
}

export class GitHubAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubAuthError';
  }
}

export class GitHubApiError extends Error {
  public status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
  }
}

export interface GitHubConfig {
  token: string;
  username?: string;
}

export interface CreatePersonaInput extends Partial<Persona> {
  name: string;
  userId: string;
}

export class GitHubService {
  private static instance: GitHubService;
  
  public static getInstance(): GitHubService {
    if (!GitHubService.instance) {
      GitHubService.instance = new GitHubService();
    }
    return GitHubService.instance;
  }

  private octokit: Octokit | null = null;
  private username: string | null = null;
  private _isAuthenticated = false;

  private constructor() {
    // Try to initialize from stored credentials
    this.initFromStoredCredentials();
  }

  private initFromStoredCredentials() {
    try {
      const storedConfig = localStorage.getItem('github_config');
      if (storedConfig) {
        const config = JSON.parse(storedConfig) as GitHubConfig;
        if (config.token) {
          this.authenticate(config.token);
        }
      }
    } catch (error) {
      console.error('Failed to initialize GitHub from stored credentials:', error);
    }
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  async authenticate(token: string): Promise<void> {
    try {
      this.octokit = new Octokit({
        auth: token,
        retry: { enabled: false }
      });
      
      // Verify token by getting user data
      const { data } = await this.octokit.rest.users.getAuthenticated();
      this.username = data.login;
      this._isAuthenticated = true;
      
      // Store credentials
      localStorage.setItem('github_config', JSON.stringify({
        token,
        username: this.username
      }));
      
      // Force sync after successful authentication
      await this.validateConnection();
      
    } catch (error) {
      this.logout(); // Clean up on failure
      throw new GitHubAuthError(`GitHub authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async validateConnection(): Promise<void> {
    if (!this.octokit || !this.username) {
      throw new GitHubAuthError('Not authenticated with GitHub');
    }

    try {
      // Test API access
      await this.octokit.rest.users.getAuthenticated();
    } catch (error) {
      this.logout();
      throw new GitHubAuthError('GitHub connection validation failed');
    }
  }

  logout(): void {
    this.octokit = null;
    this.username = null;
    this._isAuthenticated = false;
    
    localStorage.removeItem('github_config');
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    retries = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError!;
  }

  async createPersonaRepository(persona: CreatePersonaInput): Promise<string> {
    if (!this.octokit || !this.username) {
      throw new GitHubAuthError('Not authenticated with GitHub');
    }

    try {
      // Create a repository name from persona name (making it URL safe)
      const repoName = `Ubik-${persona.name?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      let repo;

      try {
        // Try to create new repository
        const { data: newRepo } = await this.octokit.request('POST /user/repos', {
          name: repoName,
          description: `Repository for Ubikial persona: ${persona.name}`,
          private: false,
          auto_init: true,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
        repo = newRepo;
      } catch (error: any) {
        if (error.status === 422 && error.message?.includes('already exists')) {
          // Repository already exists, get its info instead
          const { data: existingRepo } = await this.octokit.request('GET /repos/{owner}/{repo}', {
            owner: this.username,
            repo: repoName,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });
          repo = existingRepo;
        } else {
          // Other error occurred
          throw error;
        }
      }

      // Always try to create/update persona.json, regardless of repo creation
      try {
        // Check if file exists first
        let existingSha;
        try {
          const { data: existingFile } = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: this.username,
            repo: repoName,
            path: 'persona.json',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });
          if ('sha' in existingFile) {
            existingSha = existingFile.sha;
          }
        } catch (error: any) {
          if (error.status !== 404) throw error;
          // File doesn't exist, that's fine
        }

        // Create/update the file
        const content = base64Encode(JSON.stringify(persona, null, 2));
        await this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: this.username,
          repo: repoName,
          path: 'persona.json',
          message: existingSha ? 'Update persona configuration' : 'Initial persona configuration',
          content,
          sha: existingSha, // Include SHA if file exists, omit if new file
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
      } catch (error) {
        console.error('Failed to create/update persona.json:', error);
        // Don't throw here - we want to return the repo URL even if file creation fails
      }

      return repo.html_url;
    } catch (error) {
      if (error instanceof Error) {
        const status = (error as any).status || 500;
        throw new GitHubApiError(`Failed to handle repository: ${error.message}`, status);
      }
      throw new GitHubApiError('Failed to handle repository', 500);
    }
  }

  async updatePersonaRepository(persona: Persona, repoName: string): Promise<void> {
    if (!this.octokit || !this.username) {
      throw new GitHubAuthError('Not authenticated with GitHub');
    }

    try {
      // Get the current file to get its SHA
      const { data: file } = await this.octokit.rest.repos.getContent({
        owner: this.username,
        repo: repoName,
        path: 'persona.json'
      });

      if (!('sha' in file)) {
        throw new Error('Could not get file SHA');
      }

      // Update the file with new persona data
      const content = base64Encode(JSON.stringify(persona, null, 2));
      
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.username,
        repo: repoName,
        path: 'persona.json',
        message: 'Update persona configuration',
        content,
        sha: file.sha,
        committer: {
          name: 'Ubikial App',
          email: 'app@ubikial.com'
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        const status = (error as any).status || 500;
        throw new GitHubApiError(`Failed to update repository: ${error.message}`, status);
      }
      throw new GitHubApiError('Failed to update repository', 500);
    }
  }

  async deletePersonaRepository(repoName: string): Promise<void> {
    if (!this.octokit || !this.username) {
      throw new GitHubAuthError('Not authenticated with GitHub');
    }

    try {
      await this.octokit.rest.repos.delete({
        owner: this.username,
        repo: repoName
      });
    } catch (error) {
      if (error instanceof Error) {
        const status = (error as any).status || 500;
        throw new GitHubApiError(`Failed to delete repository: ${error.message}`, status);
      }
      throw new GitHubApiError('Failed to delete repository', 500);
    }
  }

  async getPersonasFromGitHub(): Promise<Persona[]> {
    if (!this.octokit || !this.username) {
      throw new GitHubAuthError('Not authenticated with GitHub');
    }

    try {
      // Get all repos that start with 'Ubik-'
      const { data: repos } = await this.octokit.rest.repos.listForAuthenticatedUser({
        type: 'owner',
        sort: 'updated',
        per_page: 100
      });

      const personaRepos = repos.filter(repo => repo.name.startsWith('Ubik-'));
      const personas: Persona[] = [];

      // Get or create persona data for each repo
      for (const repo of personaRepos) {
        try {
          let persona: Persona;
          try {
            // Try to get existing persona.json
            const { data: file } = await this.octokit.rest.repos.getContent({
              owner: this.username!,
              repo: repo.name,
              path: 'persona.json'
            });

            if ('content' in file && 'encoding' in file) {
              const content = base64Decode(file.content);
              persona = JSON.parse(content);
            } else {
              throw new Error('Invalid file content');
            }
          } catch (error: any) {
            // If file doesn't exist or is invalid, create it from repo name
            const repoNameParts = repo.name.split('-');
            persona = {
              id: repo.name,
              name: repoNameParts.slice(1).join(' '),
              description: repo.description || '',
              createdAt: repo.created_at ?? new Date().toISOString(),
              updatedAt: repo.updated_at ?? new Date().toISOString(),
              platforms: defaultPlatforms  // Use defaultPlatforms instead of DEFAULT_PLATFORMS
            };

            // Write the new persona.json
            const content = base64Encode(JSON.stringify(persona, null, 2));
            await this.octokit.rest.repos.createOrUpdateFileContents({
              owner: this.username!,
              repo: repo.name,
              path: 'persona.json',
              message: 'Initialize persona.json',
              content,
              headers: {
                'X-GitHub-Api-Version': '2022-11-28'
              }
            });
          }

          // Add GitHub-specific fields
          persona.githubRepo = repo.name;
          persona.githubUrl = repo.html_url;
          personas.push(persona);
        } catch (err) {
          console.error(`Failed to process persona data for ${repo.name}:`, err);
          // Continue to next repo even if this one fails
        }
      }

      return personas;
    } catch (error) {
      if (error instanceof Error) {
        const status = (error as any).status || 500;
        throw new GitHubApiError(`Failed to fetch personas: ${error.message}`, status);
      }
      throw new GitHubApiError('Failed to fetch personas', 500);
    }
  }

  async getPersona(userId: string, personaId: string): Promise<Persona | null> {
    return this.retryOperation(async () => {
      if (!this.octokit) {
        throw new GitHubAuthError('Not authenticated with GitHub');
      }
      const response = await this.octokit.request('GET /gists/{gist_id}', {
        gist_id: `persona_${userId}_${personaId}`
      });
      
      if (response.status === 200 && response.data && response.data.files) {
        const content = JSON.parse(response.data.files['persona.json']?.content || '{}');
        return content;
      }
      
      return null;
    });
  }

  async getPersonas(): Promise<Persona[]> {
    return this.retryOperation(async () => {
      if (!this._isAuthenticated || !this.octokit) {
        throw new GitHubAuthError('Not authenticated with GitHub');
      }
      return this.getPersonasFromGitHub();
    });
  }

  async deletePersona(userId: string, personaId: string): Promise<void> {
    const repoName = `Ubik-${userId}-${personaId}`;
    return this.deletePersonaRepository(repoName);
  }
}

// Export only the service and error types
export const githubService = GitHubService.getInstance();
