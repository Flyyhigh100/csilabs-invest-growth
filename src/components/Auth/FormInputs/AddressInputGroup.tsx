
import React, { useState, useEffect } from 'react';
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
import SecureInput from '@/components/Security/SecureInput';

interface AddressInputGroupProps {
  form: UseFormReturn<RegisterFormValues>;
}

const AddressInputGroup: React.FC<AddressInputGroupProps> = ({ form }) => {
  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: ''
  });

  // Update form values when secure inputs change
  useEffect(() => {
    form.setValue('address.street', addressData.street);
    form.setValue('address.city', addressData.city);
    form.setValue('address.state', addressData.state);
    form.setValue('address.postalCode', addressData.postalCode);
  }, [addressData, form]);

  return (
    <div className="space-y-4">
      <SecureInput
        label="Street Address"
        value={addressData.street}
        onChange={(value) => setAddressData(prev => ({ ...prev, street: value }))}
        placeholder="123 Main St"
        maxLength={200}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <SecureInput
          label="City"
          value={addressData.city}
          onChange={(value) => setAddressData(prev => ({ ...prev, city: value }))}
          placeholder="City"
          maxLength={100}
          required
        />

        <SecureInput
          label="State/Province"
          value={addressData.state}
          onChange={(value) => setAddressData(prev => ({ ...prev, state: value }))}
          placeholder="State"
          maxLength={100}
          required
        />
      </div>

      <SecureInput
        label="Postal/ZIP Code"
        value={addressData.postalCode}
        onChange={(value) => setAddressData(prev => ({ ...prev, postalCode: value }))}
        placeholder="ZIP/Postal Code"
        maxLength={20}
        required
      />

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="address.street" value={addressData.street} />
      <input type="hidden" name="address.city" value={addressData.city} />
      <input type="hidden" name="address.state" value={addressData.state} />
      <input type="hidden" name="address.postalCode" value={addressData.postalCode} />
    </div>
  );
};

export default AddressInputGroup;
