
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
    <Card className="shadow-lg border-cbis-blue/10 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-cbis-blue to-cbis-teal"></div>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-xl text-cbis-blue">
          <Wallet className="h-5 w-5 text-cbis-teal" />
          Polygon Wallet Address
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0 ml-1">
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                  <span className="sr-only">What is a wallet address?</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-4">
                <div className="space-y-2">
                  <p className="font-semibold">What is a Polygon Wallet Address?</p>
                  <p className="text-sm">A Polygon wallet address is where your CSi tokens will be stored on the Polygon blockchain. It looks like a long string that starts with "0x".</p>
                  <p className="text-sm font-medium">You can get one by creating a wallet with MetaMask or other crypto wallet providers.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription className="text-gray-600">
          Add your wallet address to receive CSi tokens on the Polygon network after purchase
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50/50 p-4 border border-blue-100">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Why do I need to provide a wallet address?</h4>
                <p className="text-sm text-blue-700">
                  Your wallet address is required to receive CSi tokens after purchase. Think of it like your bank account number for receiving cryptocurrency.
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="walletAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cbis-dark font-medium">ERC-20 Wallet Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your ERC-20 wallet address (0x...)" 
                        {...field} 
                        className="font-mono placeholder:font-sans border-2 focus:border-cbis-blue/60 focus:ring-1 focus:ring-cbis-blue/30"
                      />
                    </FormControl>
                    <div className="flex justify-between items-center mt-2">
                      <FormDescription className="text-gray-500">
                        This address will be used to send your CSi tokens
                      </FormDescription>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowExample(!showExample)}
                        className="text-xs text-cbis-blue hover:text-cbis-blue/80"
                      >
                        {showExample ? "Hide Example" : "Show Example"}
                      </Button>
                    </div>
                    {showExample && (
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono text-gray-600">Example: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
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
            </div>
            
            <Button 
              type="submit"
              className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 transition-all text-white"
            >
              {existingWalletAddress ? "Update Wallet Address" : "Save Wallet Address"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <Separator />

      <CardFooter className="bg-gray-50 px-6 py-4">
        <div className="text-sm text-gray-500 space-y-2 w-full">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p>Make sure to enter your own wallet address that supports the Polygon network.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p>Double-check your address before saving. Transactions sent to incorrect addresses cannot be recovered.</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WalletAddressForm;
