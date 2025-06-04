
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
  console.log('🌐 Current URL:', window.location.href);
  console.log('🌐 Full search params:', window.location.search);
  
  const [searchParams] = useSearchParams();
  const { verifyMagicLink, isLoading } = useMagicLinkAuth();
  const { user } = useAuth();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false);

  // Extract all possible token parameters and log them
  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'email';
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  // Log all URL parameters for debugging
  console.log('🔍 All URL parameters:', {
    token: token ? `${token.substring(0, 20)}...` : 'null',
    type,
    accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
    refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null',
    error: errorParam,
    errorDescription,
    allParams: Object.fromEntries(searchParams.entries()),
    verificationState,
    isLoading,
    hasUser: !!user,
    hasAttemptedVerification,
    userAgent: navigator.userAgent
  });

  useEffect(() => {
    console.log('🔍 useEffect triggered - analyzing URL parameters...');
    console.log('🔍 Raw URL search:', window.location.search);
    console.log('🔍 Hash fragment:', window.location.hash);
    
    // Check for errors first
    if (errorParam) {
      console.error('❌ URL contains error parameter:', errorParam, errorDescription);
      setVerificationState('error');
      setErrorMessage(`Authentication error: ${errorDescription || errorParam}`);
      return;
    }

    // Check if we have tokens directly in URL (Supabase format)
    if (accessToken && refreshToken) {
      console.log('✅ Found access and refresh tokens in URL, setting session directly...');
      
      const handleDirectTokens = async () => {
        try {
          setVerificationState('loading');
          setHasAttemptedVerification(true);
          
          // Import supabase client directly to set session
          const { supabase } = await import('@/integrations/supabase/client');
          
          console.log('🔑 Setting session with tokens from URL...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('❌ Error setting session with URL tokens:', sessionError);
            throw sessionError;
          }

          console.log('✅ Session set successfully with URL tokens');
          setVerificationState('success');
          
          // Wait for auth state to update, then redirect
          setTimeout(() => {
            console.log('🔄 Redirecting to dashboard...');
            window.location.href = '/dashboard/payments';
          }, 1500);
          
        } catch (error: any) {
          console.error('❌ Failed to process URL tokens:', error);
          setVerificationState('error');
          setErrorMessage('Failed to process authentication tokens: ' + error.message);
        }
      };

      handleDirectTokens();
      return;
    }

    // If we have a token parameter, try our custom verification
    if (token) {
      console.log('🔍 Found token parameter, attempting custom verification...');
      
      if (hasAttemptedVerification) {
        console.log('🚫 Verification already attempted for this token, skipping...');
        return;
      }

      const verifyToken = async () => {
        try {
          console.log('🚀 Starting custom magic link verification process...');
          setVerificationState('loading');
          setHasAttemptedVerification(true);
          
          await verifyMagicLink(token);
          
          console.log('✅ Custom magic link verification completed successfully');
          setVerificationState('success');
          
          setTimeout(() => {
            console.log('🔄 Redirecting to dashboard...');
            window.location.href = '/dashboard/payments';
          }, 1500);
        } catch (error: any) {
          console.error('❌ Custom magic link verification failed:', error);
          setVerificationState('error');
          
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
      return;
    }

    // If no tokens found, show error
    console.error('❌ No authentication tokens found in URL');
    setVerificationState('error');
    setErrorMessage('Invalid magic link - no authentication tokens provided');
    
  }, [token, accessToken, refreshToken, verifyMagicLink, hasAttemptedVerification, errorParam, errorDescription]);

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
            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
              Debug: Checking {token ? 'custom token' : accessToken ? 'URL tokens' : 'no tokens found'}
            </div>
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
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-medium text-blue-800 mb-2">Debug Information:</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <div>URL: {window.location.href}</div>
                <div>Has token param: {token ? 'Yes' : 'No'}</div>
                <div>Has access_token: {accessToken ? 'Yes' : 'No'}</div>
                <div>Has refresh_token: {refreshToken ? 'Yes' : 'No'}</div>
                <div>Error param: {errorParam || 'None'}</div>
                <div>User Agent: {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'}</div>
              </div>
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
