import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for authentication
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  createTestAccount: () => Promise<{email: string, password: string}>;
  clearError: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('ubikial_token');
    const storedUser = localStorage.getItem('ubikial_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user data:', err);
        localStorage.removeItem('ubikial_token');
        localStorage.removeItem('ubikial_user');
      }
    }
    
    setLoading(false);
  }, []);

  // Clear any authentication errors
  const clearError = () => {
    setError(null);
  };

  // Simulated login function 
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock users database in localStorage
      const usersDB = localStorage.getItem('ubikial_users_db');
      const users = usersDB ? JSON.parse(usersDB) : [];
      
      const foundUser = users.find((u: any) => u.email === email);
      
      if (!foundUser) {
        throw new Error('No account found with this email');
      }
      
      if (foundUser.password !== password) {
        throw new Error('Incorrect password');
      }
      
      // Create a mock JWT token (in a real app, this would come from the server)
      const mockToken = `mock-jwt-token-${Date.now()}`;
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Store in localStorage
      localStorage.setItem('ubikial_token', mockToken);
      localStorage.setItem('ubikial_user', JSON.stringify(userWithoutPassword));
      
      setToken(mockToken);
      setUser(userWithoutPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Simulated signup function
  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!name || !email || !password) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      if (!email.includes('@') || !email.includes('.')) {
        throw new Error('Please enter a valid email address');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock users database in localStorage
      const usersDB = localStorage.getItem('ubikial_users_db');
      const users = usersDB ? JSON.parse(usersDB) : [];
      
      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password, // In a real app, this would be hashed
        createdAt: new Date().toISOString()
      };
      
      // Add to users database
      users.push(newUser);
      localStorage.setItem('ubikial_users_db', JSON.stringify(users));
      
      // Create a mock JWT token
      const mockToken = `mock-jwt-token-${Date.now()}`;
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Store in localStorage
      localStorage.setItem('ubikial_token', mockToken);
      localStorage.setItem('ubikial_user', JSON.stringify(userWithoutPassword));
      
      setToken(mockToken);
      setUser(userWithoutPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('ubikial_token');
    localStorage.removeItem('ubikial_user');
    setToken(null);
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (userData: Partial<User>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      // Update user in mock database
      const usersDB = localStorage.getItem('ubikial_users_db');
      if (usersDB) {
        const users = JSON.parse(usersDB);
        const userIndex = users.findIndex((u: any) => u.id === user.id);
        
        if (userIndex >= 0) {
          // Keep the password field from the existing record
          const password = users[userIndex].password;
          
          // Update the user data
          users[userIndex] = {
            ...users[userIndex],
            ...userData,
            password // Keep the existing password
          };
          
          localStorage.setItem('ubikial_users_db', JSON.stringify(users));
        }
      }
      
      // Update current user
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('ubikial_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Create a test account for testing purposes
  const createTestAccount = async () => {
    setLoading(true);
    
    try {
      // Generate random credentials
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = `password${Date.now().toString().slice(-4)}`;
      const testName = `Test User ${Date.now().toString().slice(-4)}`;
      
      // Create user in mock database
      const usersDB = localStorage.getItem('ubikial_users_db');
      const users = usersDB ? JSON.parse(usersDB) : [];
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        name: testName,
        email: testEmail,
        password: testPassword,
        createdAt: new Date().toISOString()
      };
      
      // Add to users database
      users.push(newUser);
      localStorage.setItem('ubikial_users_db', JSON.stringify(users));
      
      return { email: testEmail, password: testPassword };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    createTestAccount,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
