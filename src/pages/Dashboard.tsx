
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FadeInSection from '@/components/FadeInSection';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // In the real implementation, this would be populated with actual user data
  // For now, we'll create a placeholder
  const placeholderData = {
    kycStatus: 'pending', // 'pending', 'verified', 'rejected'
    purchases: [
      {
        id: 'TRX-1234',
        date: '2023-08-15',
        amount: '5000',
        status: 'pending', // 'pending', 'verified', 'completed'
        paymentMethod: 'Credit Card'
      }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </div>
        );
      case 'verified':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </div>
        );
      case 'completed':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-transition min-h-screen">
      <Navbar />

      <div className="pt-28 pb-20 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="container-custom">
          <FadeInSection>
            <div className="mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-cbis-dark">
                Your CSi Labs Dashboard
              </h1>
              <p className="text-gray-600 max-w-3xl">
                Track your KYC verification status, token purchases, and distribution status. This dashboard provides a comprehensive overview of your investment in CSi Labs.
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-8">
              <FadeInSection delay={100}>
                <div className="glass-card p-6 rounded-xl">
                  <h2 className="text-xl font-semibold mb-4 text-cbis-dark">KYC Verification Status</h2>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 mb-1">Your verification status:</p>
                        <div className="flex items-center">
                          {getStatusBadge(placeholderData.kycStatus)}
                          {placeholderData.kycStatus === 'pending' && (
                            <span className="ml-2 text-sm text-gray-500">Awaiting review</span>
                          )}
                        </div>
                      </div>
                      {placeholderData.kycStatus === 'pending' && (
                        <Button variant="outline" className="text-cbis-blue border-cbis-blue hover:bg-cbis-blue/5">
                          Check Status
                        </Button>
                      )}
                      {placeholderData.kycStatus === 'rejected' && (
                        <Button className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white">
                          Resubmit KYC
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {placeholderData.kycStatus === 'pending' && (
                    <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-700">
                          Your KYC verification is still pending. You'll receive an email once it's complete. You cannot purchase tokens until your KYC verification is approved.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </FadeInSection>

              <FadeInSection delay={200}>
                <div className="glass-card p-6 rounded-xl">
                  <h2 className="text-xl font-semibold mb-4 text-cbis-dark">Your Purchases</h2>
                  
                  {placeholderData.purchases.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transaction ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount (CSL)
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payment Method
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {placeholderData.purchases.map((purchase) => (
                            <tr key={purchase.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cbis-blue">
                                {purchase.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {purchase.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {purchase.amount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {purchase.paymentMethod}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(purchase.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">You haven't made any purchases yet.</p>
                      {placeholderData.kycStatus === 'verified' && (
                        <Button className="mt-4 bg-gradient-to-r from-cbis-blue to-cbis-teal text-white">
                          Buy Tokens
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </FadeInSection>
            </div>
            
            <div className="md:col-span-4 space-y-8">
              <FadeInSection delay={300}>
                <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-cbis-blue to-cbis-teal text-white">
                  <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Button variant="secondary" className="w-full bg-white text-cbis-blue hover:bg-opacity-90">
                      Buy Tokens
                    </Button>
                    <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                      Update Profile
                    </Button>
                    <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </FadeInSection>
              
              <FadeInSection delay={400}>
                <div className="glass-card p-6 rounded-xl">
                  <h2 className="text-xl font-semibold mb-4 text-cbis-dark">Token Information</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Your Balance:</span>
                      <span className="font-medium">0 CSL</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-medium">5,000 CSL</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Token Price:</span>
                      <span className="font-medium">$0.05 USD</span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded-lg text-sm text-blue-700">
                    <p>Tokens will be distributed manually by our team after purchase verification. You will receive an email notification once your tokens have been sent.</p>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
