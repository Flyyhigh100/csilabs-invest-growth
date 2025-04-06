import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Wallet, Copy, CheckCircle, HelpCircle } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

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
  const [copied, setCopied] = useState(false);
  const [showExample, setShowExample] = useState(false);
  
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

  const copyExample = () => {
    navigator.clipboard.writeText("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    setCopied(true);
    toast.success("Example address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="mb-6 bg-blue-50/70 p-4 rounded-lg border border-blue-100">
        <div className="flex gap-3">
          <div className="mt-0.5">
            <Wallet className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Wallet Address Required</h3>
            <p className="text-sm text-gray-600">
              Your wallet address is required to receive CSi tokens after purchase. This is like your bank account number for cryptocurrency.
            </p>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="walletAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium text-base">Your Polygon Wallet Address</FormLabel>
                <div className="mt-1.5">
                  <FormControl>
                    <Input 
                      placeholder="Enter your Polygon wallet address (0x...)" 
                      {...field} 
                      className="font-mono text-base placeholder:font-sans border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </FormControl>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <FormDescription className="text-gray-500 text-sm">
                    This address will receive your CSi tokens
                  </FormDescription>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExample(!showExample)}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    {showExample ? "Hide Example" : "Show Example"}
                  </Button>
                </div>
                
                {showExample && (
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-gray-600 break-all">Example: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 ml-2 flex-shrink-0"
                        onClick={copyExample}
                      >
                        {copied ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <Copy className="h-4 w-4 text-gray-500" />
                        }
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">This is just an example. Please use your own wallet address.</p>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 transition-all text-white px-5 py-2"
            >
              {existingWalletAddress ? "Update Wallet Address" : "Save Wallet Address"}
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600 space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p>Make sure to enter your own wallet address that supports the Polygon network.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p>Double-check your address before saving. Transactions sent to incorrect addresses cannot be recovered.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletAddressForm;
