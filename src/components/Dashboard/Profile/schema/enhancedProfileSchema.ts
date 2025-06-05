
import * as z from 'zod';

export const enhancedProfileFormSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  phone_number: z.string().min(10, { message: "Please enter a valid phone number" }).optional().or(z.literal("")),
  street_address: z.string().min(3, { message: "Street address is required" }).optional().or(z.literal("")),
  city: z.string().min(2, { message: "City is required" }).optional().or(z.literal("")),
  state_province: z.string().min(2, { message: "State/Province is required" }).optional().or(z.literal("")),
  postal_code: z.string().min(4, { message: "Postal/ZIP code is required" }).optional().or(z.literal("")),
});

export type EnhancedProfileFormValues = z.infer<typeof enhancedProfileFormSchema>;
