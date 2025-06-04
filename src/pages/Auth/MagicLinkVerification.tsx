
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
  console.log('🔗 Route /auth/magic-link successfully loaded!');
  
  const [searchParams] = useSearchParams();
  const { verifyMagicLink, isLoading } = useMagicLinkAuth();
  const { user } = useAuth();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false);

  // Extract token and type from URL parameters (Supabase format)
  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'email';
  
  console.log('🔍 Magic link verification state:', {
    token: token ? `${token.substring(0, 20)}...` : 'null',
    type,
    verificationState,
    isLoading,
    hasUser: !!user,
    hasAttemptedVerification,
    currentURL: window.location.href
  });

  useEffect(() => {
    console.log('🔍 useEffect triggered with token:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('🔍 Current page URL:', window.location.href);
    
    if (!token) {
      console.error('❌ No token found in URL parameters');
      setVerificationState('error');
      setErrorMessage('Invalid magic link - no token provided');
      return;
    }

    // Prevent multiple verification attempts with the same token
    if (hasAttemptedVerification) {
      console.log('🚫 Verification already attempted for this token, skipping...');
      return;
    }

    const verifyToken = async () => {
      try {
        console.log('🚀 Starting magic link verification process...');
        setVerificationState('loading');
        setHasAttemptedVerification(true);
        
        // Pass the token exactly as received from Supabase
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
        
        // Provide more specific error messages based on the error
        if (error.message.includes('expired')) {
          setErrorMessage('This magic link has expired. Magic links are only valid for 1 hour.');
        } else if (error.message.includes('already used') || error.message.includes('Invalid')) {
          setErrorMessage('This magic link has already been used or is no longer valid.');
        } else if (error.message.includes('not found')) {
          setErrorMessage('This magic link is not valid or has been removed from our system.');
        } else {
          setErrorMessage(error.message || 'Failed to verify magic link');
        }
      }
    };

    verifyToken();
  }, [token, verifyMagicLink, hasAttemptedVerification]);

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
            <h2 className="text-xl font-semibold text-red-700">Magic Link Error</h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <h3 className="font-medium text-yellow-800 mb-2">What can you do?</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Request a new magic link from the login page</li>
                <li>• Magic links expire after 1 hour for security</li>
                <li>• Each magic link can only be used once</li>
                <li>• Make sure you're using the most recent email</li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-2 mt-6">
              <Button asChild className="w-full">
                <a href="/login">Get a New Magic Link</a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/login">Sign In with Password</a>
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
  console.log('🔗 Magic link route is working correctly!');
  
  return (
    <ErrorBoundary>
      <MagicLinkVerificationContent />
    </ErrorBoundary>
  );
};

export default MagicLinkVerification;
