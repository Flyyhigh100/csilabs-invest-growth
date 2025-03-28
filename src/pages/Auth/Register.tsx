
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Lock, Mail, User, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import FadeInSection from '@/components/FadeInSection';

const registerSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { signUp, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If registration is complete, show success message
  if (registrationComplete) {
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
          <CardFooter className="flex justify-center pt-4">
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password, values.firstName, values.lastName);
      setRegistrationComplete(true);
    } catch (error) {
      console.error("Registration error:", error);
      // Error already handled in signUp function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="pt-28 pb-20 container-custom">
        <FadeInSection>
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-cbis-dark">
              Register for the <span className="bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">CSi Labs Token Sale</span>
            </h1>
            <p className="text-gray-600">
              Complete the registration form below to begin your investment journey. After registration, you'll need to complete KYC verification before purchasing tokens.
            </p>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <FadeInSection direction="left" delay={100}>
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                  <Shield className="h-6 w-6 text-cbis-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Secure Process</h3>
                  <p className="text-gray-600">
                    Our registration and KYC verification process is secure and compliant with regulatory requirements, protecting your personal information.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-cbis-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Simple Steps</h3>
                  <p className="text-gray-600">
                    The token purchase process is straightforward: Register, complete KYC verification, make your purchase, and receive tokens in your wallet.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-amber-50 rounded-lg flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Geographic Restrictions</h3>
                  <p className="text-gray-600">
                    Due to regulatory requirements, residents of certain territories may be restricted from participating in the token sale. Please ensure you are eligible before registering.
                  </p>
                </div>
              </div>
              
              <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <h3 className="text-lg font-semibold mb-3 text-cbis-dark">What Happens After Registration?</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex gap-2">
                    <span className="font-bold text-cbis-blue">1.</span>
                    <span>You'll receive an email with instructions to complete KYC verification through WorldKYC.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-cbis-blue">2.</span>
                    <span>Once verified, you'll gain access to the token purchase dashboard.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-cbis-blue">3.</span>
                    <span>Select your payment method (credit card or cryptocurrency) and complete your purchase.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-cbis-blue">4.</span>
                    <span>After verification by our team, tokens will be distributed to your provided wallet address.</span>
                  </li>
                </ol>
              </div>
            </div>
          </FadeInSection>
          
          <FadeInSection direction="right" delay={200}>
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                  Create an Account
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your details to create a CSi Labs account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <Input 
                                  placeholder="John" 
                                  className="pl-10" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <Input 
                                  placeholder="Doe" 
                                  className="pl-10" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                placeholder="name@example.com" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="pl-10 pr-10" 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="pl-10 pr-10" 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-cbis-blue to-cbis-teal text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-cbis-blue font-medium hover:underline">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </FadeInSection>
        </div>
      </div>
    </div>
  );
};

export default Register;
