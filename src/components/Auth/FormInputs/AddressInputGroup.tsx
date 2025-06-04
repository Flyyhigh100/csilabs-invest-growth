
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
import { RegisterFormValues } from '../schema/registerSchema';

interface AddressInputGroupProps {
  form: UseFormReturn<RegisterFormValues>;
}

const AddressInputGroup: React.FC<AddressInputGroupProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="address.street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
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
          name="address.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
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
          name="address.state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State/Province</FormLabel>
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
        name="address.postalCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Postal/ZIP Code</FormLabel>
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

export default AddressInputGroup;
