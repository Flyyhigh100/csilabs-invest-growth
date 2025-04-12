
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfileData } from '@/hooks/useProfileData';
import KycStatusCard from '@/components/Dashboard/Profile/KycStatusCard';
import ProfileForm from '@/components/Dashboard/Profile/ProfileForm';

const Profile = () => {
  const { profileData, isLoading } = useProfileData();

  return (
    <DashboardLayout title="Profile">
      {/* KYC Status Banner */}
      <KycStatusCard />

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profileData={profileData} isLoading={isLoading} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Profile;
