
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import FadeInSection from '@/components/FadeInSection';
import RegisterForm from '@/components/Auth/RegisterForm';
import RegistrationSuccess from '@/components/Auth/RegistrationSuccess';
import RegistrationBenefits from '@/components/Auth/RegistrationBenefits';

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
      <div className="pt-28 pb-20 container-custom">
        <FadeInSection>
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-cbis-dark">
              Register for the <span className="bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">CSi Labs Token Sale</span>
            </h1>
            <p className="text-gray-600">
              Complete the registration form below to begin your investment journey. After registration, you'll need to complete KYC verification before purchasing tokens.
            </p>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <FadeInSection direction="left" delay={100}>
            <RegistrationBenefits />
          </FadeInSection>
          
          <FadeInSection direction="right" delay={200}>
            <RegisterForm onSuccess={() => setRegistrationComplete(true)} />
          </FadeInSection>
        </div>
      </div>
    </div>
  );
};

export default Register;
