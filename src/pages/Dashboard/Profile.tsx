
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfileData } from '@/hooks/useProfileData';
import { useAuth } from '@/contexts/AuthContext';
import KycStatusCard from '@/components/Dashboard/Profile/KycStatusCard';
import ProfileForm from '@/components/Dashboard/Profile/ProfileForm';
import TokenBalanceCard from '@/components/Dashboard/Profile/TokenBalanceCard';
import WalletInfoCard from '@/components/Dashboard/Profile/WalletInfoCard';
import LegacyAssetsCard from '@/components/Dashboard/Profile/LegacyAssetsCard';
import GrandTotalCard from '@/components/Dashboard/Profile/GrandTotalCard';
import ProfileNotesCard from '@/components/Dashboard/Profile/ProfileNotesCard';

const Profile = () => {
  const { user } = useAuth();
  const { profileData, isLoading } = useProfileData();

  return (
    <DashboardLayout title="Profile">
      {/* Profile Form */}
      <Card className="mb-6">
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

      {/* KYC Status */}
      <KycStatusCard />

      {/* Wallet Information */}
      <WalletInfoCard />

      {/* Token Balance Card */}
      <TokenBalanceCard />
      
      {/* Legacy Assets */}
      <LegacyAssetsCard />

      {/* Grand Total Holdings */}
      <GrandTotalCard />

      {/* Communication */}
      <ProfileNotesCard />
    </DashboardLayout>
  );
};

export default Profile;
