
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Home } from 'lucide-react';

const RegistrationSuccess: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Registration Successful!
          </CardTitle>
          <CardDescription className="text-center">
            Please check your email to verify your account. Once verified, you can log in with your credentials.
          </CardDescription>
        </CardHeader>
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
