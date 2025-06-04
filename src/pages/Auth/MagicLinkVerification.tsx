
import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';

const MagicLinkVerificationContent = () => {
  console.log('🚀 NATIVE SUPABASE - MagicLinkVerification component rendering...');
  console.log('🔗 Route /auth/magic-link successfully loaded!');
  console.log('🌐 Current URL:', window.location.href);
  console.log('🌐 Full search params:', window.location.search);
  console.log('🌐 Hash fragment:', window.location.hash);
  console.log('📍 Timestamp:', new Date().toISOString());
  
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasProcessedAuth, setHasProcessedAuth] = useState(false);

  // Extract URL parameters for debugging
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  // Log all URL parameters for debugging
  console.log('🔍 NATIVE FLOW URL ANALYSIS:', {
    currentUrl: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    origin: window.location.origin,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: window.location.port
  });

  console.log('🔍 EXTRACTED PARAMETERS:', {
    token: token ? `${token.substring(0, 30)}... (${token.length} chars)` : 'null',
    type,
    accessToken: accessToken ? `${accessToken.substring(0, 30)}... (${accessToken.length} chars)` : 'null',
    refreshToken: refreshToken ? `${refreshToken.substring(0, 30)}... (${refreshToken.length} chars)` : 'null',
    error: errorParam,
    errorDescription,
    allParams: Object.fromEntries(searchParams.entries()),
    searchParamsString: searchParams.toString()
  });

  console.log('🔍 COMPONENT STATE:', {
    verificationState,
    hasUser: !!user,
    hasProcessedAuth,
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    console.log('🔍 Native flow useEffect triggered...');
    
    // Check for errors first
    if (errorParam) {
      console.error('❌ URL contains error parameter:', errorParam, errorDescription);
      setVerificationState('error');
      setErrorMessage(`Authentication error: ${errorDescription || errorParam}`);
      return;
    }

    if (hasProcessedAuth) {
      console.log('🚫 Already processed auth, skipping...');
      return;
    }

    // Handle Supabase's native magic link flow using auth state changes
    console.log('🔐 Setting up Supabase auth state listener for native flow...');
    
    const handleAuthFlow = async () => {
      try {
        setHasProcessedAuth(true);
        
        // Check if we have URL fragments that need to be processed by Supabase
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        
        console.log('🔍 Hash parameters:', {
          hasHashAccessToken: !!hashAccessToken,
          hasHashRefreshToken: !!hashRefreshToken,
          hashString: window.location.hash
        });

        // If we have tokens in URL params, try to set session
        if (accessToken && refreshToken) {
          console.log('🔑 Found tokens in URL params, setting session...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('❌ Error setting session from URL params:', sessionError);
            throw sessionError;
          }

          console.log('✅ Session set from URL params');
          setVerificationState('success');
          toast.success('Successfully signed in!');
          
          setTimeout(() => {
            window.location.href = '/dashboard/payments';
          }, 1500);
          return;
        }

        // If we have hash tokens, let Supabase handle them
        if (hashAccessToken && hashRefreshToken) {
          console.log('🔑 Found tokens in hash, letting Supabase handle...');
          // Supabase will automatically process these via onAuthStateChange
          return;
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔄 Auth state change event:', event, 'Session:', !!session);
            
            if (event === 'SIGNED_IN' && session) {
              console.log('✅ User successfully signed in via magic link');
              setVerificationState('success');
              toast.success('Successfully signed in!');
              
              setTimeout(() => {
                window.location.href = '/dashboard/payments';
              }, 1500);
            } else if (event === 'TOKEN_REFRESHED' && session) {
              console.log('🔄 Token refreshed, user is authenticated');
              setVerificationState('success');
            }
          }
        );

        // Check current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          throw error;
        }

        if (session) {
          console.log('✅ Already have active session');
          setVerificationState('success');
          toast.success('Already signed in!');
          
          setTimeout(() => {
            window.location.href = '/dashboard/payments';
          }, 1500);
        } else {
          // No session found, show instructions
          console.log('ℹ️ No active session, waiting for auth state change...');
          setTimeout(() => {
            if (verificationState === 'loading') {
              setVerificationState('error');
              setErrorMessage('No authentication tokens found. Please check your email and click the magic link.');
            }
          }, 5000); // Wait 5 seconds for auth state change
        }

        return () => {
          subscription.unsubscribe();
        };

      } catch (error: any) {
        console.error('❌ Error in native auth flow:', error);
        setVerificationState('error');
        setErrorMessage(error.message || 'Failed to process magic link authentication');
      }
    };

    handleAuthFlow();
    
  }, [accessToken, refreshToken, errorParam, errorDescription, hasProcessedAuth, verificationState]);

  // If user is authenticated and verification was successful, redirect
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
            <h2 className="text-xl font-semibold">Processing your magic link...</h2>
            <p className="text-gray-600">Please wait while we sign you in using Supabase's native authentication.</p>
            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded">
              <strong>Debug Info:</strong> Native Supabase flow processing<br/>
              <strong>Timestamp:</strong> {new Date().toISOString()}<br/>
              <strong>Environment:</strong> Production<br/>
              <strong>Flow:</strong> Pure Supabase Authentication
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
            <h2 className="text-xl font-semibold text-green-700">Successfully signed in!</h2>
            <p className="text-gray-600">Redirecting you to your dashboard...</p>
            <div className="text-xs text-gray-400 bg-green-50 p-2 rounded border border-green-200">
              Authentication completed at {new Date().toISOString()}
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <XCircle className="h-8 w-8 mx-auto text-red-600" />
            <h2 className="text-xl font-semibold text-red-700">Magic Link Processing Issue</h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <h3 className="font-medium text-yellow-800 mb-2">What to try:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Check your email for the Supabase magic link</li>
                <li>• Click the link in the original email from Supabase</li>
                <li>• Make sure you're opening the link in the same browser</li>
                <li>• Try requesting a new magic link if this one expired</li>
                <li>• Check spam/junk folder for the authentication email</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-medium text-blue-800 mb-2">Debug Information:</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>URL:</strong> {window.location.href}</div>
                <div><strong>Has access_token:</strong> {accessToken ? 'Yes' : 'No'}</div>
                <div><strong>Has refresh_token:</strong> {refreshToken ? 'Yes' : 'No'}</div>
                <div><strong>Error param:</strong> {errorParam || 'None'}</div>
                <div><strong>Flow:</strong> Native Supabase Authentication</div>
                <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
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

  console.log('🎨 Final render of Native Supabase MagicLinkVerification component');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              🔐 Magic Link Authentication
            </CardTitle>
            <CardDescription className="text-center">
              Processing your secure Supabase authentication
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
  console.log('🚀 Native Supabase MagicLinkVerification wrapper component rendering...');
  console.log('🔗 Magic link route is working correctly with native flow!');
  
  return (
    <ErrorBoundary>
      <MagicLinkVerificationContent />
    </ErrorBoundary>
  );
};

export default MagicLinkVerification;
