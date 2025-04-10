
import React, { createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSessionManagement } from '@/hooks/auth/useSessionManagement';
import { useAuthOperations } from '@/hooks/auth/useAuthOperations';
import { AuthContextType } from '@/hooks/auth/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  
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
