
import React from 'react';

interface WalletAddressValidatorProps {
  address: string;
  network: string;
  onChange: (isValid: boolean, error?: string) => void;
}

export const WalletAddressValidator: React.FC<WalletAddressValidatorProps> = ({
  address,
  network,
  onChange
}) => {
  React.useEffect(() => {
    const validateAddress = () => {
      if (!address.trim()) {
        onChange(false, 'Wallet address is required');
        return;
      }

      const validationRules: Record<string, RegExp> = {
        ethereum: /^0x[a-fA-F0-9]{40}$/,
        polygon: /^0x[a-fA-F0-9]{40}$/,
        bsc: /^0x[a-fA-F0-9]{40}$/,
        bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
        solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
        cardano: /^addr1[a-z0-9]{98}$/
      };

      const rule = validationRules[network.toLowerCase()];
      if (!rule) {
        onChange(false, 'Unsupported network');
        return;
      }

      if (!rule.test(address)) {
        onChange(false, `Invalid ${network} wallet address format`);
        return;
      }

      // Additional security checks
      if (address.toLowerCase() === '0x0000000000000000000000000000000000000000') {
        onChange(false, 'Zero address not allowed');
        return;
      }

      onChange(true);
    };

    validateAddress();
  }, [address, network, onChange]);

  return null;
};

export default WalletAddressValidator;
