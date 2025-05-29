
import React from 'react';
import { Shield, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

const RegistrationBenefits: React.FC = () => {
  return <div className="space-y-8">
      <div className="flex gap-4 items-start">
        <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
          <Shield className="h-6 w-6 text-cbis-blue" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Supporting Cancer Research</h3>
          <p className="text-gray-600">
            Your contribution directly supports groundbreaking cancer research and treatment development through our foundation 
            (currently applying for 501(c)(3) status).
          </p>
        </div>
      </div>
      
      <div className="flex gap-4 items-start">
        <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
          <Sparkles className="h-6 w-6 text-cbis-blue" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-cbis-dark">1-Million Strong Killing Cancers Fight Club Member</h3>
          <p className="text-gray-600">
            When you purchase our Cancer Killing MEME coins you receive Membership Privileges for FREE! Get exclusive 
            updates on our progress and be part of the movement making a real difference.
          </p>
        </div>
      </div>
      
      <div className="flex gap-4 items-start">
        <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
          <CheckCircle2 className="h-6 w-6 text-cbis-blue" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Simple Steps - As Easy as 1,2,3</h3>
          <p className="text-gray-600">
            The contribution process is straightforward: Register, complete KYC verification if required, make your contribution, and join our mission to fight cancer.
          </p>
        </div>
      </div>
      
      <div className="flex gap-4 items-start">
        <div className="p-3 bg-amber-50 rounded-lg flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Potential Tax Benefits</h3>
          <p className="text-gray-600">
            We are currently applying for 501(c)(3) status. Once approved, contributions may become tax-deductible. 
            Please consult your tax advisor for details based on your specific situation.
          </p>
        </div>
      </div>
      
      <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-cbis-dark">What Happens After Registration?</h3>
        <ol className="space-y-3 text-gray-700">
          <li className="flex gap-2">
            <div className="flex-shrink-0 bg-cbis-blue text-white rounded-full h-6 w-6 flex items-center justify-center font-bold">1</div>
            <span>You'll receive an email confirmation with instructions to verify your account.</span>
          </li>
          <li className="flex gap-2">
            <div className="flex-shrink-0 bg-cbis-blue text-white rounded-full h-6 w-6 flex items-center justify-center font-bold">2</div>
            <span>Complete KYC verification if required for larger contributions.</span>
          </li>
          <li className="flex gap-2">
            <div className="flex-shrink-0 bg-cbis-blue text-white rounded-full h-6 w-6 flex items-center justify-center font-bold">3</div>
            <span>Access your dashboard to make contributions.</span>
          </li>
          <li className="flex gap-2">
            <div className="flex-shrink-0 bg-cbis-blue text-white rounded-full h-6 w-6 flex items-center justify-center font-bold">+</div>
            <span>Receive updates on how your contribution is helping advance cancer research.</span>
          </li>
        </ol>
      </div>
    </div>;
};

export default RegistrationBenefits;
