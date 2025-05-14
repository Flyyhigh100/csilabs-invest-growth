
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

// Make the component generic to work with any form values
interface IconInputProps<T extends Record<string, any>> {
  form: UseFormReturn<T>;
  name: string;
  label: string;
  placeholder?: string;
  icon: LucideIcon;
}

// Use generic type parameter
function IconInput<T extends Record<string, any>>({
  form,
  name,
  label,
  placeholder = "",
  icon: Icon
}: IconInputProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => {
        // Only pass string values to the input
        const inputValue = typeof field.value === 'string' ? field.value : '';
        
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="relative">
                <Icon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input 
                  placeholder={placeholder} 
                  className="pl-10" 
                  {...field}
                  value={inputValue} 
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export default IconInput;
