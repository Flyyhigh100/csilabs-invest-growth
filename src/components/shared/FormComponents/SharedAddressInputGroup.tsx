
import React from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';

interface SharedAddressInputGroupProps {
  form: UseFormReturn<any>;
  fieldPrefix?: string;
  required?: boolean;
}

const SharedAddressInputGroup: React.FC<SharedAddressInputGroupProps> = ({ 
  form, 
  fieldPrefix = 'address',
  required = false 
}) => {
  const getFieldName = (field: string): string => {
    if (fieldPrefix === 'address') {
      return `address.${field}`;
    }
    return fieldPrefix === '' ? field : `${fieldPrefix}.${field}`;
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={fieldPrefix === 'address' ? 'address.street' : fieldPrefix === '' ? 'street_address' : 'street'}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address {required && '*'}</FormLabel>
            <FormControl>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input 
                  placeholder="123 Main St" 
                  className="pl-10" 
                  {...field} 
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={fieldPrefix === 'address' ? 'address.city' : fieldPrefix === '' ? 'city' : 'city'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City {required && '*'}</FormLabel>
              <FormControl>
                <Input 
                  placeholder="City" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={fieldPrefix === 'address' ? 'address.state' : fieldPrefix === '' ? 'state_province' : 'state'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State/Province {required && '*'}</FormLabel>
              <FormControl>
                <Input 
                  placeholder="State" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={fieldPrefix === 'address' ? 'address.postalCode' : fieldPrefix === '' ? 'postal_code' : 'postalCode'}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Postal/ZIP Code {required && '*'}</FormLabel>
            <FormControl>
              <Input 
                placeholder="ZIP/Postal Code" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SharedAddressInputGroup;
