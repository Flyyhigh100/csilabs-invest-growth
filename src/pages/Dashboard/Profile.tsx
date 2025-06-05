
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfileData } from '@/hooks/useProfileData';
import KycStatusCard from '@/components/Dashboard/Profile/KycStatusCard';
import TokenBalanceCard from '@/components/Dashboard/Profile/TokenBalanceCard';
import WalletInfoCard from '@/components/Dashboard/Profile/WalletInfoCard';
import EnhancedProfileForm from '@/components/Dashboard/Profile/EnhancedProfileForm';
import ProfileCompletionBanner from '@/components/Dashboard/Profile/ProfileCompletionBanner';

const Profile = () => {
  const { profileData, isLoading } = useProfileData();

  return (
    <DashboardLayout title="Profile">
      {/* Profile Completion Banner */}
      <ProfileCompletionBanner profileData={profileData} />

      {/* KYC Status Banner */}
      <KycStatusCard />

      {/* Token Balance Card */}
      <TokenBalanceCard />
      
      {/* Wallet Information */}
      <WalletInfoCard />

      {/* Enhanced Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information, contact details, and wallet addresses here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedProfileForm profileData={profileData} isLoading={isLoading} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Profile;
