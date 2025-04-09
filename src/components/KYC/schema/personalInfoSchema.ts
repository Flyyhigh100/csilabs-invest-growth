
import * as z from 'zod';

// List of countries for the dropdown
export const countries = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan" },
];

// Schema for personal information form validation
// Using snake_case to match backend/database field names
export const personalInfoSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  date_of_birth: z.string().min(1, { message: "Date of birth is required" }),
  nationality: z.string().min(1, { message: "Nationality is required" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  postal_code: z.string().min(3, { message: "Postal code must be at least 3 characters" }),
  country: z.string().min(2, { message: "Country is required" }),
});

export type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
