
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Define the schema for wallet address validation - only ERC-20 addresses
const walletFormSchema = z.object({
  walletAddress: z
    .string()
    .min(42, { message: "ERC-20 wallet address must be 42 characters long" })
    .max(42, { message: "ERC-20 wallet address must be 42 characters long" })
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Please enter a valid ERC-20 wallet address (starting with 0x)",
    }),
});

type WalletFormValues = z.infer<typeof walletFormSchema>;

const WalletAddressForm = ({ existingWalletAddress, onWalletUpdated }: { 
  existingWalletAddress?: string;
  onWalletUpdated?: () => void;
}) => {
  const { user } = useAuth();
  
  // Initialize the form with default values
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      walletAddress: existingWalletAddress || "",
    },
  });

  const onSubmit = async (data: WalletFormValues) => {
    if (!user) {
      toast.error("You must be logged in to update your wallet address");
      return;
    }

    try {
      // Update the wallet address in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          wallet_address: data.walletAddress,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success("Wallet address saved successfully");
      
      if (onWalletUpdated) {
        onWalletUpdated();
      }
    } catch (error) {
      console.error("Error saving wallet address:", error);
      toast.error("Failed to save wallet address");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Polygon Wallet Address
        </CardTitle>
        <CardDescription>
          Enter the ERC-20 wallet address where you want to receive your CSi tokens on the Polygon network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ERC-20 Wallet Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your ERC-20 wallet address (0x...)" {...field} />
                  </FormControl>
                  <FormDescription>
                    This address will be used to send your purchased CSi tokens on the Polygon network
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {existingWalletAddress ? "Update Wallet Address" : "Save Wallet Address"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
        <p>
          Make sure to enter a valid ERC-20 wallet address that supports the Polygon network. Transactions sent to incorrect addresses cannot be recovered.
        </p>
      </CardFooter>
    </Card>
  );
};

export default WalletAddressForm;
