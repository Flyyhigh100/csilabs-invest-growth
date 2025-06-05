
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfileData } from '@/hooks/useProfileData';
import { useAuth } from '@/contexts/AuthContext';
import KycStatusCard from '@/components/Dashboard/Profile/KycStatusCard';
import ProfileForm from '@/components/Dashboard/Profile/ProfileForm';
import TokenBalanceCard from '@/components/Dashboard/Profile/TokenBalanceCard';
import WalletInfoCard from '@/components/Dashboard/Profile/WalletInfoCard';

const Profile = () => {
  const { user } = useAuth();
  const { profileData, isLoading } = useProfileData();

  return (
    <DashboardLayout title="Profile">
      {/* KYC Status Banner */}
      <KycStatusCard />

      {/* Token Balance Card */}
      <TokenBalanceCard />
      
      {/* Wallet Information */}
      <WalletInfoCard />

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm 
            profileData={profileData} 
            isLoading={isLoading} 
            user={user}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Profile;
