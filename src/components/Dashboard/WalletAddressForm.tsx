
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Wallet, Copy, CheckCircle, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

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
  const [hideWalletAddress, setHideWalletAddress] = useState(true);
  const [editMode, setEditMode] = useState(!existingWalletAddress);
  
  // Initialize the form with default values
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      walletAddress: existingWalletAddress || "",
    },
  });

  // Reset form when existingWalletAddress changes
  useEffect(() => {
    if (existingWalletAddress) {
      form.reset({
        walletAddress: existingWalletAddress
      });
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  }, [existingWalletAddress, form]);

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
      setEditMode(false);
      
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

  const copyWalletAddress = () => {
    if (existingWalletAddress) {
      navigator.clipboard.writeText(existingWalletAddress);
      setCopied(true);
      toast.success("Wallet address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleHideAddress = () => {
    setHideWalletAddress(!hideWalletAddress);
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
      
      {existingWalletAddress && !editMode ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium text-gray-700 mb-2">Your Polygon Wallet Address</h3>
            <div className="flex items-center space-x-2">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex-grow font-mono relative">
                {hideWalletAddress ? 
                  <span>••••••••••••{existingWalletAddress.substring(existingWalletAddress.length - 8)}</span> : 
                  <span>{existingWalletAddress}</span>
                }
              </div>
              <Button
                type="button" 
                size="icon"
                variant="outline"
                onClick={toggleHideAddress}
                className="flex-shrink-0"
                title={hideWalletAddress ? "Show wallet address" : "Hide wallet address"}
              >
                {hideWalletAddress ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyWalletAddress}
                className="flex-shrink-0"
                title="Copy wallet address"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setEditMode(true)}
              variant="outline"
              className="mt-2"
            >
              Change Wallet Address
            </Button>
          </div>
        </div>
      ) : (
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
            
            <div className="flex justify-end gap-3 mt-6">
              {existingWalletAddress && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    form.reset({
                      walletAddress: existingWalletAddress
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 transition-all text-white px-5 py-2"
              >
                {existingWalletAddress ? "Update Wallet Address" : "Save Wallet Address"}
              </Button>
            </div>
          </form>
        </Form>
      )}
      
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600 space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p>Make sure to enter your own wallet address that supports the Polygon network.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="font-bold uppercase">
              DOUBLE-CHECK YOUR ADDRESS BEFORE SAVING. TRANSACTIONS SENT TO INCORRECT ADDRESSES CANNOT BE RECOVERED.{" "}
              <Link to="/legal/terms-and-conditions#wallet-control" className="text-blue-600 hover:underline">
                [DISCLAIMER]
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletAddressForm;
