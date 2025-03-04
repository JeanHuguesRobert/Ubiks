import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  AICredentials, 
  AIProvider, 
  AICompletionRequest, 
  AICompletionResponse, 
  PromptTemplate,
  DEFAULT_PROMPT_TEMPLATES
} from '../types/AI';
import { tokenEncryptionService } from '../services/TokenEncryptionService';

interface AIContextType {
  credentials: AICredentials[];
  templates: PromptTemplate[];
  loading: boolean;
  error: string | null;
  addCredentials: (credentials: Omit<AICredentials, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'status'>) => Promise<AICredentials>;
  updateCredentials: (id: string, credentialsData: Partial<AICredentials>) => Promise<AICredentials>;
  deleteCredentials: (id: string) => Promise<void>;
  verifyCredentials: (id: string) => Promise<boolean>;
  createTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<PromptTemplate>;
  updateTemplate: (id: string, templateData: Partial<PromptTemplate>) => Promise<PromptTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  getAvailableProviders: () => AIProvider[];
  getDefaultProvider: () => AIProvider | null;
  completePrompt: (request: AICompletionRequest) => Promise<AICompletionResponse>;
  fillPromptTemplate: (templateId: string, parameters: Record<string, string>) => Promise<string>;
  isAIAvailable: boolean;
  clearError: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider = ({ children }: AIProviderProps) => {
  const [credentials, setCredentials] = useState<AICredentials[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load credentials and templates from localStorage when the component mounts or user changes
  useEffect(() => {
    if (user) {
      loadCredentials();
      loadTemplates();
    } else {
      setCredentials([]);
      setTemplates([]);
      setLoading(false);
    }
  }, [user]);

  const loadCredentials = () => {
    setLoading(true);
    try {
      if (!user) return;
      
      const storedCredentials = localStorage.getItem(`ubikial_ai_credentials_${user.id}`);
      if (storedCredentials) {
        const parsedCredentials: AICredentials[] = JSON.parse(storedCredentials);
        
        // Decrypt API keys
        const decryptedCredentials = parsedCredentials.map(cred => ({
          ...cred,
          apiKey: tokenEncryptionService.isEncrypted(cred.apiKey) 
            ? tokenEncryptionService.decryptToken(cred.apiKey)
            : cred.apiKey
        }));
        
        setCredentials(decryptedCredentials);
      }
    } catch (err) {
      console.error('Failed to load AI credentials:', err);
      setError('Failed to load AI credentials');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = () => {
    setLoading(true);
    try {
      if (!user) return;
      
      const storedTemplates = localStorage.getItem(`ubikial_ai_templates_${user.id}`);
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      } else {
        // Initialize with default templates
        const userTemplates = DEFAULT_PROMPT_TEMPLATES.map(template => ({
          ...template,
          userId: user.id
        }));
        setTemplates(userTemplates);
        saveTemplates(userTemplates);
      }
    } catch (err) {
      console.error('Failed to load AI templates:', err);
      setError('Failed to load AI templates');
    } finally {
      setLoading(false);
    }
  };

  const saveCredentials = (updatedCredentials: AICredentials[]) => {
    if (!user) return;
    
    try {
      // Encrypt API keys before saving
      const encryptedCredentials = updatedCredentials.map(cred => ({
        ...cred,
        apiKey: tokenEncryptionService.isEncrypted(cred.apiKey) 
          ? cred.apiKey 
          : tokenEncryptionService.encryptToken(cred.apiKey)
      }));
      
      localStorage.setItem(`ubikial_ai_credentials_${user.id}`, JSON.stringify(encryptedCredentials));
    } catch (err) {
      console.error('Failed to save AI credentials:', err);
      throw new Error('Failed to save credentials');
    }
  };

  const saveTemplates = (updatedTemplates: PromptTemplate[]) => {
    if (!user) return;
    
    try {
      localStorage.setItem(`ubikial_ai_templates_${user.id}`, JSON.stringify(updatedTemplates));
    } catch (err) {
      console.error('Failed to save AI templates:', err);
      throw new Error('Failed to save templates');
    }
  };

  const addCredentials = async (credentialsData: Omit<AICredentials, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'status'>): Promise<AICredentials> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to add AI credentials');
      }
      
      // Create a new credentials object
      const newCredentials: AICredentials = {
        id: `cred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...credentialsData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id,
        status: 'unverified'
      };
      
      // Verify the credentials
      let status: 'active' | 'invalid' | 'unverified' = 'unverified';
      try {
        // This would call an API to verify the credentials in a real app
        await new Promise(resolve => setTimeout(resolve, 1000));
        status = 'active';
      } catch (verifyErr) {
        console.error('Failed to verify credentials:', verifyErr);
        status = 'invalid';
      }
      
      // Update status based on verification
      const finalCredentials = {
        ...newCredentials,
        status,
        lastVerified: new Date().toISOString()
      };
      
      // Update the state and save
      const updatedCredentials = [...credentials, finalCredentials];
      setCredentials(updatedCredentials);
      saveCredentials(updatedCredentials);
      
      return finalCredentials;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add credentials';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCredentials = async (id: string, credentialsData: Partial<AICredentials>): Promise<AICredentials> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to update AI credentials');
      }
      
      // Find the credential to update
      const credIndex = credentials.findIndex(c => c.id === id);
      
      if (credIndex === -1) {
        throw new Error('Credentials not found');
      }
      
      // Create updated credential
      const updatedCredential: AICredentials = {
        ...credentials[credIndex],
        ...credentialsData,
        updatedAt: new Date().toISOString()
      };
      
      // If the API key was changed, mark as unverified
      if (credentialsData.apiKey && credentialsData.apiKey !== credentials[credIndex].apiKey) {
        updatedCredential.status = 'unverified';
      }
      
      // Update the state and save
      const updatedCredentials = [...credentials];
      updatedCredentials[credIndex] = updatedCredential;
      setCredentials(updatedCredentials);
      saveCredentials(updatedCredentials);
      
      return updatedCredential;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update credentials';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteCredentials = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to delete AI credentials');
      }
      
      // Filter out the credential to delete
      const updatedCredentials = credentials.filter(c => c.id !== id);
      
      // Update the state and save
      setCredentials(updatedCredentials);
      saveCredentials(updatedCredentials);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete credentials';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyCredentials = async (id: string): Promise<boolean> => {
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to verify AI credentials');
      }
      
      // Find the credential to verify
      const credIndex = credentials.findIndex(c => c.id === id);
      
      if (credIndex === -1) {
        throw new Error('Credentials not found');
      }
      
      // In a real app, you would call the API to verify the credentials
      // For this demo, we'll simulate a successful verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the credential status
      const updatedCredential: AICredentials = {
        ...credentials[credIndex],
        status: 'active',
        lastVerified: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Update the state and save
      const updatedCredentials = [...credentials];
      updatedCredentials[credIndex] = updatedCredential;
      setCredentials(updatedCredentials);
      saveCredentials(updatedCredentials);
      
      return true;
    } catch (err) {
      // Update the credential status to invalid
      try {
        const credIndex = credentials.findIndex(c => c.id === id);
        if (credIndex !== -1) {
          const updatedCredential: AICredentials = {
            ...credentials[credIndex],
            status: 'invalid',
            lastVerified: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          const updatedCredentials = [...credentials];
          updatedCredentials[credIndex] = updatedCredential;
          setCredentials(updatedCredentials);
          saveCredentials(updatedCredentials);
        }
      } catch (updateErr) {
        console.error('Failed to update credential status:', updateErr);
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify credentials';
      setError(errorMessage);
      return false;
    }
  };

  const createTemplate = async (templateData: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<PromptTemplate> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to create a template');
      }
      
      // Create a new template
      const newTemplate: PromptTemplate = {
        id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...templateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id
      };
      
      // Update the state and save
      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);
      saveTemplates(updatedTemplates);
      
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<PromptTemplate>): Promise<PromptTemplate> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to update a template');
      }
      
      // Find the template to update
      const templateIndex = templates.findIndex(t => t.id === id);
      
      if (templateIndex === -1) {
        throw new Error('Template not found');
      }
      
      // Create updated template
      const updatedTemplate: PromptTemplate = {
        ...templates[templateIndex],
        ...templateData,
        updatedAt: new Date().toISOString()
      };
      
      // Update the state and save
      const updatedTemplates = [...templates];
      updatedTemplates[templateIndex] = updatedTemplate;
      setTemplates(updatedTemplates);
      saveTemplates(updatedTemplates);
      
      return updatedTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to delete a template');
      }
      
      // Don't allow deletion of default templates
      const templateToDelete = templates.find(t => t.id === id);
      if (templateToDelete && DEFAULT_PROMPT_TEMPLATES.some(t => t.id === templateToDelete.id)) {
        throw new Error('Cannot delete default template');
      }
      
      // Filter out the template to delete
      const updatedTemplates = templates.filter(t => t.id !== id);
      
      // Update the state and save
      setTemplates(updatedTemplates);
      saveTemplates(updatedTemplates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableProviders = (): AIProvider[] => {
    // Return a list of providers for which we have valid credentials
    return credentials
      .filter(cred => cred.status === 'active')
      .map(cred => cred.provider)
      .filter((value, index, self) => self.indexOf(value) === index) as AIProvider[];
  };

  const getDefaultProvider = (): AIProvider | null => {
    const availableProviders = getAvailableProviders();
    return availableProviders.length > 0 ? availableProviders[0] : null;
  };

  const completePrompt = async (request: AICompletionRequest): Promise<AICompletionResponse> => {
    setError(null);
    
    try {
      // Check if the user has credentials for the requested provider
      const providerCredentials = credentials.find(
        cred => cred.provider === request.options.provider && cred.status === 'active'
      );
      
      if (!providerCredentials) {
        throw new Error(`No valid credentials found for ${request.options.provider}`);
      }
      
      // In a real app, you would call the AI provider's API here
      // For this demo, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock response
      let response = '';
      if (request.prompt.includes('tone')) {
        response = `I've adapted your content to a new tone while keeping the original message intact. The content now has the requested tone but maintains the same core message and information you wanted to convey.`;
      } else if (request.prompt.includes('platform')) {
        response = `Here's your content optimized for the specified platform. I've adjusted the formatting, hashtag usage, and overall style to match platform best practices while maintaining your core message.`;
      } else if (request.prompt.includes('hashtag')) {
        response = `#ContentCreation #SocialMedia #DigitalMarketing #ContentStrategy #OnlinePresence`;
      } else {
        response = `I've processed your request and here's the result. This response addresses what you asked for while maintaining quality and relevance.`;
      }
      
      return {
        text: response,
        model: request.options.model,
        provider: request.options.provider,
        tokenUsage: {
          prompt: request.prompt.length / 4, // Rough approximation
          completion: response.length / 4,
          total: (request.prompt.length + response.length) / 4
        },
        finishReason: 'stop'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete prompt';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const fillPromptTemplate = async (templateId: string, parameters: Record<string, string>): Promise<string> => {
    try {
      // Find the template
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      // Fill the template with the provided parameters
      let filledTemplate = template.template;
      
      for (const [key, value] of Object.entries(parameters)) {
        filledTemplate = filledTemplate.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
      
      return filledTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fill template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const isAIAvailable = credentials.some(cred => cred.status === 'active');

  const clearError = () => {
    setError(null);
  };

  const value = {
    credentials,
    templates,
    loading,
    error,
    addCredentials,
    updateCredentials,
    deleteCredentials,
    verifyCredentials,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getAvailableProviders,
    getDefaultProvider,
    completePrompt,
    fillPromptTemplate,
    isAIAvailable,
    clearError
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};
