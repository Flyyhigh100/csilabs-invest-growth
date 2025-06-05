
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WalletSetupGuide from '@/components/Dashboard/Resources/WalletSetupGuide';
import CryptoPurchaseGuide from '@/components/Dashboard/Resources/CryptoPurchaseGuide';
import FAQSection from '@/components/Dashboard/Resources/FAQSection';
import ExternalLinks from '@/components/Dashboard/Resources/ExternalLinks';
import { BookOpen, Wallet, CreditCard, HelpCircle, ExternalLink } from 'lucide-react';

const Resources: React.FC = () => {
  return (
    <DashboardLayout title="Resources & Help">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Crypto Resources & Support
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about setting up crypto wallets, buying cryptocurrency, 
            and getting started with CSI token purchases. Find step-by-step guides and answers to common questions.
          </p>
        </div>

        <Tabs defaultValue="wallets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wallets" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Wallet Setup
            </TabsTrigger>
            <TabsTrigger value="buying" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Buy Crypto
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              External Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallets" className="space-y-6">
            <WalletSetupGuide />
          </TabsContent>

          <TabsContent value="buying" className="space-y-6">
            <CryptoPurchaseGuide />
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <FAQSection />
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <ExternalLinks />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Resources;
