
import React from 'react';
import { LucideIcon } from 'lucide-react';
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

interface IconInputProps {
  form: UseFormReturn<RegisterFormValues>;
  name: keyof RegisterFormValues;
  label: string;
  placeholder?: string;
  icon: LucideIcon;
}

const IconInput: React.FC<IconInputProps> = ({
  form,
  name,
  label,
  placeholder = "",
  icon: Icon
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Icon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input 
                placeholder={placeholder} 
                className="pl-10" 
                {...field} 
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default IconInput;
