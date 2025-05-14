
import React from 'react';
import { Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormValues } from '../schema/registerSchema';

interface PhoneInputProps {
  form: UseFormReturn<RegisterFormValues>;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="phoneNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Phone Number</FormLabel>
          <FormControl>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="(555) 123-4567" 
                className="pl-10" 
                {...field}
                onChange={(e) => {
                  // Allow only numbers, spaces, parentheses, and hyphens
                  const value = e.target.value.replace(/[^\d\s()-]/g, '');
                  field.onChange(value);
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PhoneInput;
