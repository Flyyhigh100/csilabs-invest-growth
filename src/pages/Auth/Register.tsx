
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import FadeInSection from '@/components/FadeInSection';
import RegisterForm from '@/components/Auth/RegisterForm';
import RegistrationSuccess from '@/components/Auth/RegistrationSuccess';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Register = () => {
  const { user } = useAuth();
  const [registrationComplete, setRegistrationComplete] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If registration is complete, show success message
  if (registrationComplete) {
    return <RegistrationSuccess />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom pt-6">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild className="flex items-center gap-1">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      <div className="pt-16 pb-20 container-custom">
        <FadeInSection>
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-cbis-dark">
              Register for the <span className="bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">CSi Labs Token Contribution</span>
            </h1>
            <p className="text-gray-600">
              Complete the registration form below to begin your contribution journey.
            </p>
          </div>
        </FadeInSection>

        <div className="flex justify-center">
          <FadeInSection direction="up" delay={200}>
            <RegisterForm onSuccess={() => setRegistrationComplete(true)} />
          </FadeInSection>
        </div>
      </div>
    </div>
  );
};

export default Register;
