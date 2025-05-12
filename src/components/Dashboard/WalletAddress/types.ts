
import { z } from "zod";

// Define the schema for wallet address validation
export const walletFormSchema = z.object({
  walletAddress: z
    .string()
    .min(42, { message: "ERC-20 wallet address must be 42 characters long" })
    .max(42, { message: "ERC-20 wallet address must be 42 characters long" })
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Please enter a valid ERC-20 wallet address (starting with 0x)",
    }),
  walletAddressConfirmation: z
    .string()
    .min(42, { message: "Confirmation address must be 42 characters long" })
    .max(42, { message: "Confirmation address must be 42 characters long" })
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Please enter a valid ERC-20 wallet address (starting with 0x)",
    }),
}).refine(data => data.walletAddress === data.walletAddressConfirmation, {
  message: "Wallet addresses must match",
  path: ["walletAddressConfirmation"]
});

export type WalletFormValues = z.infer<typeof walletFormSchema>;

export interface WalletAddressFormProps {
  existingWalletAddress?: string;
  onWalletUpdated?: () => void;
}
