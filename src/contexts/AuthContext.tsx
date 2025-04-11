
import React, { createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSessionManagement } from '@/hooks/auth/useSessionManagement';
import { useAuthOperations } from '@/hooks/auth/useAuthOperations';
import { AuthContextType } from '@/hooks/auth/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock navigate function for when we're outside of Router context (like in tests)
const mockNavigate = () => {
  console.warn('Navigation attempted outside Router context');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Safe access to router hooks with fallbacks for testing environments
  let navigate;
  let location;
  
  try {
    navigate = useNavigate();
    location = useLocation();
  } catch (error) {
    // Provide fallbacks when outside Router context
    console.warn('AuthProvider rendered outside Router context, navigation will be disabled');
    navigate = mockNavigate;
    location = { pathname: '/', search: '', hash: '', state: null, key: 'default' };
  }
  
  const { session, user, loading, refreshSession } = useSessionManagement();
  const { signIn, signUp, signOut, resetPassword } = useAuthOperations();

  // Context value combining session management and auth operations
  const contextValue: AuthContextType = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
