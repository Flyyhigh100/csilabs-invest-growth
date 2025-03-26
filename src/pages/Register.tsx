
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RegistrationForm from '@/components/RegistrationForm';
import FadeInSection from '@/components/FadeInSection';
import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

const Register: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-transition min-h-screen">
      <Navbar />

      <div className="pt-28 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
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
              <div className="space-y-8">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                    <Shield className="h-6 w-6 text-cbis-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Secure Process</h3>
                    <p className="text-gray-600">
                      Our registration and KYC verification process is secure and compliant with regulatory requirements, protecting your personal information.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-cbis-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Simple Steps</h3>
                    <p className="text-gray-600">
                      The token purchase process is straightforward: Register, complete KYC verification, make your purchase, and receive tokens in your wallet.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-amber-50 rounded-lg flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Geographic Restrictions</h3>
                    <p className="text-gray-600">
                      Due to regulatory requirements, residents of certain territories may be restricted from participating in the token sale. Please ensure you are eligible before registering.
                    </p>
                  </div>
                </div>
                
                <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <h3 className="text-lg font-semibold mb-3 text-cbis-dark">What Happens After Registration?</h3>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex gap-2">
                      <span className="font-bold text-cbis-blue">1.</span>
                      <span>You'll receive an email with instructions to complete KYC verification through WorldKYC.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-cbis-blue">2.</span>
                      <span>Once verified, you'll gain access to the token purchase dashboard.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-cbis-blue">3.</span>
                      <span>Select your payment method (credit card or cryptocurrency) and complete your purchase.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-cbis-blue">4.</span>
                      <span>After verification by our team, tokens will be distributed to your provided wallet address.</span>
                    </li>
                  </ol>
                </div>
              </div>
            </FadeInSection>
            
            <FadeInSection direction="right" delay={200}>
              <RegistrationForm />
            </FadeInSection>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
