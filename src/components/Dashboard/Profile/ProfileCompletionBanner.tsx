
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Info, CheckCircle } from 'lucide-react';

interface ProfileCompletionBannerProps {
  profileData: any;
}

const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({ profileData }) => {
  if (!profileData) return null;

  const requiredFields = [
    { field: 'first_name', label: 'First Name' },
    { field: 'last_name', label: 'Last Name' },
    { field: 'phone_number', label: 'Phone Number' },
    { field: 'street_address', label: 'Street Address' },
    { field: 'city', label: 'City' },
    { field: 'state_province', label: 'State/Province' },
    { field: 'postal_code', label: 'Postal Code' },
  ];

  const completedFields = requiredFields.filter(({ field }) => 
    profileData[field] && profileData[field].trim() !== ''
  );

  const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);
  const missingFields = requiredFields.filter(({ field }) => 
    !profileData[field] || profileData[field].trim() === ''
  );

  // Don't show banner if profile is complete
  if (completionPercentage === 100) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Profile Complete!</AlertTitle>
        <AlertDescription className="text-green-700">
          Your profile is complete with all required information.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">Complete Your Profile</AlertTitle>
      <AlertDescription className="text-blue-700 space-y-3">
        <p>
          Your profile is {completionPercentage}% complete. Please add the missing information below.
        </p>
        <Progress value={completionPercentage} className="w-full" />
        {missingFields.length > 0 && (
          <div>
            <p className="font-medium mb-1">Missing information:</p>
            <ul className="text-sm list-disc list-inside">
              {missingFields.map(({ label }) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ProfileCompletionBanner;
