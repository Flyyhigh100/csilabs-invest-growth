
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Copy, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { createWalletFormSchema, WalletFormValues, NetworkType, getNetworkInfo } from './networkValidation';
import NetworkSelector from './NetworkSelector';
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
  defaultSolanaWalletAddress?: string;
  defaultNetwork?: NetworkType;
  onSubmit: (data: WalletFormValues) => Promise<void>;
  onCancel?: () => void;
}

const WalletForm: React.FC<WalletFormProps> = ({ 
  defaultWalletAddress = "", 
  defaultSolanaWalletAddress = "",
  defaultNetwork = 'polygon',
  onSubmit, 
  onCancel 
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(defaultNetwork);
  const [showExample, setShowExample] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [addressesMatch, setAddressesMatch] = useState(false);
  
  // Get the appropriate default address based on selected network
  const getDefaultAddress = () => {
    return selectedNetwork === 'polygon' ? defaultWalletAddress : defaultSolanaWalletAddress;
  };
  
  // Initialize the form with default values
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(createWalletFormSchema(selectedNetwork)),
    defaultValues: {
      walletAddress: getDefaultAddress(),
      walletAddressConfirmation: getDefaultAddress(),
      network: selectedNetwork,
    },
    mode: "onChange"
  });

  // Update form when network changes
  const handleNetworkChange = (network: NetworkType) => {
    setSelectedNetwork(network);
    const newDefaultAddress = network === 'polygon' ? defaultWalletAddress : defaultSolanaWalletAddress;
    
    // Reset form with new schema and default values
    form.setValue('network', network);
    form.setValue('walletAddress', newDefaultAddress);
    form.setValue('walletAddressConfirmation', newDefaultAddress);
    
    // Update form resolver for new network
    const newSchema = createWalletFormSchema(network);
    form.clearErrors();
    setAddressesMatch(false);
  };

  const copyExample = () => {
    const networkInfo = getNetworkInfo(selectedNetwork);
    navigator.clipboard.writeText(networkInfo.example);
    setCopied(true);
    toast.success("Example address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (data: WalletFormValues) => {
    await onSubmit(data);
  };

  // Check if addresses match on form values change
  React.useEffect(() => {
    const walletAddress = form.watch("walletAddress");
    const confirmation = form.watch("walletAddressConfirmation");
    
    if (walletAddress && confirmation && walletAddress === confirmation) {
      setAddressesMatch(true);
    } else {
      setAddressesMatch(false);
    }
  }, [form.watch("walletAddress"), form.watch("walletAddressConfirmation"), form]);

  const networkInfo = getNetworkInfo(selectedNetwork);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Network Selection */}
        <NetworkSelector 
          selectedNetwork={selectedNetwork}
          onNetworkChange={handleNetworkChange}
        />
        
        <FormField
          control={form.control}
          name="walletAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium text-base">
                Your {networkInfo.name} Wallet Address
              </FormLabel>
              <div className="mt-1.5">
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder={`Enter your ${networkInfo.name} wallet address`}
                      {...field} 
                      className="font-mono text-base placeholder:font-sans border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      type={showPassword ? "text" : "password"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <FormDescription className="text-gray-500 text-sm">
                  This address will receive your CSi tokens on {networkInfo.name}
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
                    <span className="text-xs font-mono text-gray-600 break-all">
                      Example: {networkInfo.example}
                    </span>
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
        
        <FormField
          control={form.control}
          name="walletAddressConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium text-base">
                Confirm Your {networkInfo.name} Wallet Address
              </FormLabel>
              <div className="mt-1.5">
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Re-enter your wallet address to confirm" 
                      {...field} 
                      className={`font-mono text-base placeholder:font-sans border ${
                        addressesMatch && field.value 
                          ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200" 
                          : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      }`}
                      type={showPassword ? "text" : "password"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    
                    {addressesMatch && field.value && (
                      <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </FormControl>
              </div>
              
              <div className="flex items-center mt-2">
                <FormDescription className="text-gray-500 text-sm">
                  {addressesMatch && field.value 
                    ? <span className="text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> 
                        Wallet addresses match
                      </span>
                    : "Re-enter your wallet address to confirm it's correct"
                  }
                </FormDescription>
              </div>
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
            disabled={!addressesMatch && form.formState.isSubmitted}
          >
            {getDefaultAddress() ? "Update Wallet Address" : "Save Wallet Address"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WalletForm;
