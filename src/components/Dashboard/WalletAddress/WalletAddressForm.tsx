
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { walletFormSchema, WalletFormValues } from './types';
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

interface WalletFormProps {
  defaultWalletAddress?: string;
  onSubmit: (data: WalletFormValues) => Promise<void>;
  onCancel?: () => void;
}

const WalletForm: React.FC<WalletFormProps> = ({ defaultWalletAddress = "", onSubmit, onCancel }) => {
  const [showExample, setShowExample] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Initialize the form with default values
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      walletAddress: defaultWalletAddress,
    },
  });

  const copyExample = () => {
    navigator.clipboard.writeText("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    setCopied(true);
    toast.success("Example address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (data: WalletFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 transition-all text-white px-5 py-2"
          >
            {defaultWalletAddress ? "Update Wallet Address" : "Save Wallet Address"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WalletForm;
