
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Home, CheckCircle, Mail } from 'lucide-react';

const RegistrationSuccess: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Registration Successful!
          </CardTitle>
          <CardDescription className="text-center">
            Welcome to the CSi Labs community. We're excited to have you join us in the fight against cancer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium">Verify Your Email</h3>
            </div>
            <p className="text-sm text-gray-600">
              Please check your inbox to verify your email address. Once verified, you can log in and access your account.
            </p>
          </div>
          <div className="text-center text-sm text-gray-600">
            <p>Thank you for supporting our cancer research initiatives.</p>
            <p className="mt-1">Your contribution makes a real difference in the fight against cancer.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 pt-4">
          <Button asChild>
            <Link to="/login">Go to Login</Link>
          </Button>
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;
