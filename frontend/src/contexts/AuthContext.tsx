import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/api/auth';
import { User, AuthContextType } from '@/types/user';
import Loading from '@/components/Loading';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthData = () => {
    console.log('AuthContext - Clearing auth data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isValidToken = (token: string): boolean => {
    if (!token) return false;
    
    // Basic JWT format check (should have 3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('AuthContext - Invalid token format');
      return false;
    }

    try {
      // Try to decode the payload (middle part) to check if it's valid base64
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log('AuthContext - Token is expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('AuthContext - Token payload is not valid JSON');
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('AuthContext - Initializing auth...');
        // Check for stored auth data on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          // Validate token format before using it
          if (!isValidToken(storedToken)) {
            console.log('AuthContext - Invalid token found, clearing auth data');
            clearAuthData();
            setIsLoading(false);
            return;
          }

          try {
            const parsedUser = JSON.parse(storedUser);
            
            // Validate user object structure
            if (!parsedUser._id || !parsedUser.role) {
              console.log('AuthContext - Invalid user data structure');
              clearAuthData();
              setIsLoading(false);
              return;
            }

            setToken(storedToken);
            setUser(parsedUser);
            console.log('AuthContext - Auth initialized from localStorage:', parsedUser);
          } catch (parseError) {
            console.error('AuthContext - Error parsing stored user data:', parseError);
            clearAuthData();
          }
        } else {
          console.log('AuthContext - No stored auth data found');
        }
      } catch (error) {
        console.error('AuthContext - Error initializing auth:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
        console.log('AuthContext - Auth initialization complete');
      }
    };

    initializeAuth();
  }, []);

  const login = (authToken: string, userData: User) => {
    try {
      console.log('AuthContext - Logging in user:', userData);
      
      // Validate token before storing
      if (!isValidToken(authToken)) {
        console.error('AuthContext - Attempted to login with invalid token');
        throw new Error('Invalid authentication token');
      }

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      console.log('AuthContext - User logged in successfully');
    } catch (error) {
      console.error('AuthContext - Error during login:', error);
      clearAuthData();
      throw error;
    }
  };

  const logout = () => {
    try {
      console.log('AuthContext - Logging out user');
      clearAuthData();
      console.log('AuthContext - User logged out successfully');
    } catch (error) {
      console.error('AuthContext - Error during logout:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('AuthContext - User updated:', updatedUser);
      } catch (error) {
        console.error('AuthContext - Error updating user:', error);
      }
    } else {
      console.warn('AuthContext - Cannot update user: no user logged in');
    }
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading message="Initializing..." size="lg" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
