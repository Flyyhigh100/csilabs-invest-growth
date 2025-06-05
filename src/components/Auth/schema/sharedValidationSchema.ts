
import * as z from 'zod';

// Shared address schema
export const addressSchema = z.object({
  street: z.string().min(3, { message: "Street address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State/Province is required" }),
  postalCode: z.string().min(4, { message: "Postal/ZIP code is required" })
});

// Shared phone validation
export const phoneValidation = z.string().min(10, { message: "Please enter a valid phone number" });

// Shared name validations
export const firstNameValidation = z.string().min(2, { message: "First name must be at least 2 characters" });
export const lastNameValidation = z.string().min(2, { message: "Last name must be at least 2 characters" });
export const emailValidation = z.string().email({ message: "Please enter a valid email address" });

// Profile form schema - matches registration but with optional fields for flexibility
export const profileFormSchema = z.object({
  first_name: firstNameValidation,
  last_name: lastNameValidation,
  email: emailValidation.optional(),
  phone_number: phoneValidation.optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  wallet_address: z.string().optional(),
  solana_wallet_address: z.string().optional(),
  preferred_network: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
