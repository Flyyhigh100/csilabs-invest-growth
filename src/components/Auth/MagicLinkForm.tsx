
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMagicLinkAuth } from '@/hooks/auth/useMagicLinkAuth';

const magicLinkSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;

interface MagicLinkFormProps {
  onBack: () => void;
}

const MagicLinkForm: React.FC<MagicLinkFormProps> = ({ onBack }) => {
  const { sendMagicLink, isLoading } = useMagicLinkAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: MagicLinkFormValues) => {
    try {
      setError(null);
      await sendMagicLink(values.email);
      setEmailSent(true);
    } catch (error: any) {
      console.error('Error sending magic link:', error);
      setError(error.message || 'Failed to send magic link. Please try again.');
    }
  };

  const handleResend = async () => {
    const email = form.getValues('email');
    if (email) {
      try {
        setError(null);
        await sendMagicLink(email);
      } catch (error: any) {
        console.error('Error resending magic link:', error);
        setError(error.message || 'Failed to resend magic link. Please try again.');
      }
    }
  };

  if (emailSent) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Check your email
          </CardTitle>
          <CardDescription className="text-center">
            We've sent a secure sign-in link to <strong>{form.getValues('email')}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> If you have a Hotmail or Outlook email address, 
                please check your spam/junk folder as Microsoft sometimes filters these emails.
              </AlertDescription>
            </Alert>
            
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>Click the link in your email to sign in securely.</p>
              <p>The link will expire in 30 minutes for your security.</p>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Sending..." : "Resend email"}
              </Button>
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex-1"
              >
                Use password instead
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Sign in with Magic Link
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email and we'll send you a secure sign-in link.
          <br />
          <span className="text-sm text-blue-600">Perfect for Hotmail and Outlook users!</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cbis-blue to-cbis-teal text-white"
              disabled={isLoading}
            >
              {isLoading ? "Sending magic link..." : "Send magic link"}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to password login
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MagicLinkForm;
