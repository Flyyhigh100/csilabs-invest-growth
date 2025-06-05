
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

interface SharedPhoneInputProps {
  form: UseFormReturn<any>;
  fieldName?: string;
  required?: boolean;
}

const SharedPhoneInput: React.FC<SharedPhoneInputProps> = ({ 
  form, 
  fieldName = 'phoneNumber',
  required = false 
}) => {
  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Phone Number {required && '*'}</FormLabel>
          <FormControl>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="(555) 123-4567" 
                className="pl-10" 
                {...field}
                value={field.value || ''}
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

export default SharedPhoneInput;
