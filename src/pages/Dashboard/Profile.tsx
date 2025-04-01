
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { useKycVerification } from '@/hooks/useKycVerification';
import { useProfileData } from '@/hooks/useProfileData';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import ProfileCard from '@/components/Profile/ProfileCard';

const Profile = () => {
  const { kycData } = useKycVerification();
  const { profileData, isLoading } = useProfileData();

  return (
    <DashboardLayout title="Profile">
      {/* KYC Status Banner */}
      <ProfileHeader />

      {/* Profile Form */}
      <ProfileCard profileData={profileData} isLoading={isLoading} />
    </DashboardLayout>
  );
};

export default Profile;
