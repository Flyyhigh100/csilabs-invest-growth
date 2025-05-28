import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import FadeInSection from '@/components/FadeInSection';
import RegisterForm from '@/components/Auth/RegisterForm';
import RegistrationSuccess from '@/components/Auth/RegistrationSuccess';
import RegistrationBenefits from '@/components/Auth/RegistrationBenefits';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
const Register = () => {
  const {
    user
  } = useAuth();
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
  return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom pt-6">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/Newlogo.jpg" alt="CSI Labs" className="h-8 md:h-10 w-auto object-contain" />
          </Link>
          <Button variant="ghost" size="sm" asChild className="flex items-center gap-1">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      <div className="pt-12 pb-20 container-custom">
        <FadeInSection>
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-cbis-dark">
              1-Million Strong Killing Cancers Fight Club! Join the <span className="bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">FIGHT for Low-Cost Cancer Killing Drugs</span> Now!
            </h1>
            <p className="text-gray-600">When you Purchase our CSi Labs Cancer Killing MEME Coins you are Contributing to the "FIGHT Against Cancers" You will also receive a "Limited Time Free Membership & Perks" in the 1-Million Strong Killing Cancers Fight Club! Your contribution supports our 1-Million Strong Killing Cancers Foundation (applying for 501(c)(3) status) to revolutionize cancer research through innovative solutions and bring our Harvard Award Winning Low-cost Cancer Killing Drugs through the FDA so Doctors can write prescriptions Nationwide!</p>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <FadeInSection direction="up" delay={200}>
            <RegisterForm onSuccess={() => setRegistrationComplete(true)} />
          </FadeInSection>
          
          <FadeInSection direction="up" delay={300}>
            <RegistrationBenefits />
          </FadeInSection>
        </div>
      </div>
    </div>;
};
export default Register;