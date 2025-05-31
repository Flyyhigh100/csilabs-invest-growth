
import { z } from "zod";

export type NetworkType = 'polygon' | 'solana';

// Polygon wallet validation (existing)
const polygonAddressSchema = z
  .string()
  .min(42, { message: "Polygon address must be 42 characters long" })
  .max(42, { message: "Polygon address must be 42 characters long" })
  .regex(/^0x[a-fA-F0-9]{40}$/, {
    message: "Please enter a valid Polygon wallet address (starting with 0x)",
  });

// Solana wallet validation (new)
const solanaAddressSchema = z
  .string()
  .min(32, { message: "Solana address must be 32-44 characters long" })
  .max(44, { message: "Solana address must be 32-44 characters long" })
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, {
    message: "Please enter a valid Solana wallet address (Base58 format)",
  });

// Dynamic schema based on network
export const createWalletFormSchema = (network: NetworkType) => {
  const addressSchema = network === 'polygon' ? polygonAddressSchema : solanaAddressSchema;
  
  return z.object({
    walletAddress: addressSchema,
    walletAddressConfirmation: addressSchema,
    network: z.enum(['polygon', 'solana']),
  }).refine(data => data.walletAddress === data.walletAddressConfirmation, {
    message: "Wallet addresses must match",
    path: ["walletAddressConfirmation"]
  });
};

export type WalletFormValues = z.infer<ReturnType<typeof createWalletFormSchema>>;

export const getNetworkInfo = (network: NetworkType) => {
  const networkConfig = {
    polygon: {
      name: 'Polygon',
      example: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      description: 'Compatible with Ethereum wallets like MetaMask',
      prefix: '0x',
      length: '42 characters'
    },
    solana: {
      name: 'Solana',
      example: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      description: 'Use your Solana wallet address from Phantom or Solflare',
      prefix: 'No prefix',
      length: '32-44 characters (Base58)'
    }
  };
  
  return networkConfig[network];
};
