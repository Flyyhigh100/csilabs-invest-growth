
import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useMagicLinkAuth } from '@/hooks/auth/useMagicLinkAuth';
import { useAuth } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';

const MagicLinkVerificationContent = () => {
  console.log('🔍 MagicLinkVerification component rendering...');
  
  const [searchParams] = useSearchParams();
  const { verifyMagicLink, isLoading } = useMagicLinkAuth();
  const { user } = useAuth();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');
  
  console.log('🔍 Magic link verification state:', {
    token: token ? `${token.substring(0, 20)}...` : 'null',
    verificationState,
    isLoading,
    hasUser: !!user
  });

  useEffect(() => {
    console.log('🔍 useEffect triggered with token:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      console.error('❌ No token found in URL parameters');
      setVerificationState('error');
      setErrorMessage('Invalid magic link - no token provided');
      return;
    }

    const verifyToken = async () => {
      try {
        console.log('🚀 Starting magic link verification process...');
        setVerificationState('loading');
        
        await verifyMagicLink(token);
        
        console.log('✅ Magic link verification completed successfully');
        setVerificationState('success');
        
        // Wait a bit for auth state to update, then redirect
        setTimeout(() => {
          console.log('🔄 Redirecting to dashboard...');
          window.location.href = '/dashboard/payments';
        }, 1500);
      } catch (error: any) {
        console.error('❌ Magic link verification failed:', error);
        setVerificationState('error');
        setErrorMessage(error.message || 'Failed to verify magic link');
      }
    };

    verifyToken();
  }, [token, verifyMagicLink]);

  // If user is authenticated and verification was successful, show success state
  if (user && verificationState === 'success') {
    console.log('✅ User authenticated, redirecting...');
    return <Navigate to="/dashboard/payments" replace />;
  }

  const renderContent = () => {
    console.log('🎨 Rendering content for state:', verificationState);
    
    switch (verificationState) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-cbis-blue" />
            <h2 className="text-xl font-semibold">Verifying your magic link...</h2>
            <p className="text-gray-600">Please wait while we sign you in.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
            <h2 className="text-xl font-semibold text-green-700">Successfully signed in!</h2>
            <p className="text-gray-600">Redirecting you to your dashboard...</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <XCircle className="h-8 w-8 mx-auto text-red-600" />
            <h2 className="text-xl font-semibold text-red-700">Verification failed</h2>
            <p className="text-gray-600">{errorMessage}</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">This could happen if:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• The magic link has expired (links expire after 30 minutes)</li>
                <li>• The link has already been used</li>
                <li>• The link is invalid or corrupted</li>
                <li>• There was a server error during verification</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Button asChild>
                <a href="/login">Try signing in again</a>
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry verification
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-600">Loading...</p>
          </div>
        );
    }
  };

  console.log('🎨 Final render of MagicLinkVerification component');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Magic Link Verification
            </CardTitle>
            <CardDescription className="text-center">
              Processing your secure sign-in request
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MagicLinkVerification = () => {
  console.log('🚀 MagicLinkVerification wrapper component rendering...');
  
  return (
    <ErrorBoundary>
      <MagicLinkVerificationContent />
    </ErrorBoundary>
  );
};

export default MagicLinkVerification;
