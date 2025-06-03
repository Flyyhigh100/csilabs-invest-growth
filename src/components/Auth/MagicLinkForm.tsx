
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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

  const form = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: MagicLinkFormValues) => {
    try {
      await sendMagicLink(values.email);
      setEmailSent(true);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleResend = async () => {
    const email = form.getValues('email');
    if (email) {
      try {
        await sendMagicLink(email);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  if (emailSent) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Check your email
          </CardTitle>
          <CardDescription className="text-center">
            We've sent a magic link to {form.getValues('email')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>Click the link in your email to sign in.</p>
              <p>The link will expire in 30 minutes.</p>
            </div>
            
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
          Enter your email and we'll send you a secure sign-in link
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
