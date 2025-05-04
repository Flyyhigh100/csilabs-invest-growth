
import React from 'react';
import { Helmet } from "react-helmet";
import Hero from "@/components/Hero";
import TokenDetails from "@/components/TokenDetails";
import InvestmentModel from "@/components/InvestmentModel";
import ResearchHighlights from "@/components/ResearchHighlights";
import UpdateCredentialsButton from '@/components/Admin/CoinPayments/UpdateCredentialsButton';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if the current user is an admin
    async function checkAdminStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user exists in the admins table
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (data && !error) {
          setIsAdmin(true);
        }
      }
    }
    
    checkAdminStatus();
  }, []);

  return (
    <>
      <Helmet>
        <title>CSi Token Platform</title>
        <meta name="description" content="Blockchain-based carbon sequestration initiative token platform" />
      </Helmet>
      
      {isAdmin && (
        <div className="container mx-auto py-4 px-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="space-y-2 max-w-xl">
                  <h3 className="text-lg font-medium text-blue-700">Admin Quick Actions</h3>
                  <p className="text-sm text-slate-600">
                    Use these shortcuts to manage your CoinPayments integration
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <UpdateCredentialsButton />
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/admin/test-tools')}
                  >
                    Test Tools
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Hero />
      <TokenDetails />
      <InvestmentModel />
      <ResearchHighlights />
    </>
  );
};

export default Index;
