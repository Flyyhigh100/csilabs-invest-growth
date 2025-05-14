
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface RegisterFormContainerProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

const RegisterFormContainer: React.FC<RegisterFormContainerProps> = ({
  children,
  onSubmit,
  isLoading
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Join the CSi Labs Cancer Killing MEME Coin Contribution
        </CardTitle>
        <CardDescription className="text-center">
          Complete this form to create your CSi Labs account and join our community fighting cancer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <div className="text-sm text-muted-foreground mt-2">
            <p className="font-medium text-center">Your contribution matters</p>
            <p className="mt-1 text-xs text-center">
              By registering, you're supporting groundbreaking cancer research. 
              Contributions may be tax deductible through our 501(c)(3) foundation.
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cbis-blue to-cbis-teal text-white"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <Separator className="my-2" />
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-cbis-blue font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegisterFormContainer;
