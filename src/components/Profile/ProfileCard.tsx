
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import ProfileForm from './ProfileForm';

interface ProfileCardProps {
  profileData: {
    first_name: string;
    last_name: string;
  } | null;
  isLoading: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profileData, isLoading }) => {
  return (
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
  );
};

export default ProfileCard;
