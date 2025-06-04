
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import SecureInput from '@/components/Security/SecureInput';
import WalletAddressValidator from '@/components/Security/WalletAddressValidator';
import { useCSRF } from '@/components/Security/CSRFProtection';
import { toast } from 'sonner';

interface SecureWalletAddressFormProps {
  onSave: (address: string, network: string) => Promise<void>;
  currentAddress?: string;
  currentNetwork?: string;
  isLoading?: boolean;
}

const SecureWalletAddressForm: React.FC<SecureWalletAddressFormProps> = ({
  onSave,
  currentAddress = '',
  currentNetwork = 'polygon',
  isLoading = false
}) => {
  const { withCSRF } = useCSRF();
  const [address, setAddress] = useState(currentAddress);
  const [network, setNetwork] = useState(currentNetwork);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const networks = [
    { value: 'ethereum', label: 'Ethereum (ETH)', icon: '⟠' },
    { value: 'polygon', label: 'Polygon (MATIC)', icon: '⬟' },
    { value: 'bsc', label: 'Binance Smart Chain (BNB)', icon: '🟡' },
    { value: 'bitcoin', label: 'Bitcoin (BTC)', icon: '₿' },
    { value: 'solana', label: 'Solana (SOL)', icon: '◎' }
  ];

  const handleAddressValidation = (isValid: boolean, error?: string) => {
    setIsAddressValid(isValid);
    setValidationError(error || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAddressValid) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    try {
      // Add CSRF protection
      await onSave(address, network);
      toast.success('Wallet address saved successfully');
    } catch (error) {
      console.error('Failed to save wallet address:', error);
      toast.error('Failed to save wallet address');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Secure Wallet Configuration
        </CardTitle>
        <CardDescription>
          Configure your wallet address for secure token distribution. All addresses are validated for security.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Blockchain Network
            </label>
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {networks.map((net) => (
                  <SelectItem key={net.value} value={net.value}>
                    <span className="flex items-center gap-2">
                      <span>{net.icon}</span>
                      {net.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <SecureInput
              label="Wallet Address"
              value={address}
              onChange={setAddress}
              placeholder={`Enter your ${network} wallet address`}
              required
              className={`${
                address && isAddressValid 
                  ? 'border-green-500 focus:border-green-500' 
                  : address && !isAddressValid 
                  ? 'border-red-500 focus:border-red-500' 
                  : ''
              }`}
            />
            
            <WalletAddressValidator
              address={address}
              network={network}
              onChange={handleAddressValidation}
            />
            
            {address && (
              <div className="flex items-center gap-2 text-sm">
                {isAddressValid ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Valid {network} address
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    {validationError}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-2">Security Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Double-check your wallet address before submitting</li>
                  <li>Only use wallet addresses you control</li>
                  <li>Never share your private keys or seed phrases</li>
                  <li>Ensure the selected network matches your wallet</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!isAddressValid || isLoading}
            className="w-full"
          >
            {isLoading ? 'Saving...' : 'Save Wallet Address'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecureWalletAddressForm;
