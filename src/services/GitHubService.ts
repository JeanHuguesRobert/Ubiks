import { Octokit } from 'octokit';
import { Persona } from '../types/Persona';

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

class GitHubService {
  private octokit: Octokit | null = null;
  private token: string | null = null;
  private username: string | null = null;
  private _isAuthenticated = false;

  constructor() {
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
        auth: token
      });
      
      // Verify token by getting user data
      const { data } = await this.octokit.rest.users.getAuthenticated();
      this.username = data.login;
      this.token = token;
      this._isAuthenticated = true;
      
      // Store credentials
      localStorage.setItem('github_config', JSON.stringify({
        token,
        username: this.username
      }));
      
      return;
    } catch (error) {
      this.octokit = null;
      this.token = null;
      this.username = null;
      this._isAuthenticated = false;
      
      localStorage.removeItem('github_config');
      
      if (error instanceof Error) {
        throw new GitHubAuthError(`GitHub authentication failed: ${error.message}`);
      }
      throw new GitHubAuthError('GitHub authentication failed');
    }
  }

  logout(): void {
    this.octokit = null;
    this.token = null;
    this.username = null;
    this._isAuthenticated = false;
    
    localStorage.removeItem('github_config');
  }

  async createPersonaRepository(persona: Persona): Promise<string> {
    if (!this.octokit || !this.username) {
      throw new GitHubAuthError('Not authenticated with GitHub');
    }

    try {
      // Create a repository name from persona name (making it URL safe)
      const repoName = `persona-${persona.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      
      // Create repository
      const { data: repo } = await this.octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: `Repository for Ubikial persona: ${persona.name}`,
        private: true,
        auto_init: true
      });

      // Create a metadata file with persona data
      const content = Buffer.from(JSON.stringify(persona, null, 2)).toString('base64');
      
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.username,
        repo: repoName,
        path: 'persona.json',
        message: 'Initial persona configuration',
        content,
        committer: {
          name: 'Ubikial App',
          email: 'app@ubikial.com'
        }
      });

      return repo.html_url;
    } catch (error) {
      if (error instanceof Error) {
        const status = (error as any).status || 500;
        throw new GitHubApiError(`Failed to create repository: ${error.message}`, status);
      }
      throw new GitHubApiError('Failed to create repository', 500);
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
      const content = Buffer.from(JSON.stringify(persona, null, 2)).toString('base64');
      
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
      // Get all repos that start with 'persona-'
      const { data: repos } = await this.octokit.rest.repos.listForAuthenticatedUser({
        type: 'owner',
        sort: 'updated',
        per_page: 100
      });

      const personaRepos = repos.filter(repo => repo.name.startsWith('persona-'));
      const personas: Persona[] = [];

      // Get persona data from each repo
      for (const repo of personaRepos) {
        try {
          const { data: file } = await this.octokit.rest.repos.getContent({
            owner: this.username,
            repo: repo.name,
            path: 'persona.json'
          });

          if ('content' in file && 'encoding' in file) {
            const content = Buffer.from(file.content, file.encoding as BufferEncoding).toString();
            const persona = JSON.parse(content) as Persona;
            persona.githubRepo = repo.name;
            persona.githubUrl = repo.html_url;
            personas.push(persona);
          }
        } catch (err) {
          console.error(`Failed to get persona data from ${repo.name}:`, err);
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
}

// Export a singleton instance
export const githubService = new GitHubService();
