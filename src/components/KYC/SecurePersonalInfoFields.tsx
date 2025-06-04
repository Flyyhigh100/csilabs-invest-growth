
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PersonalInfoValues, countries } from './schema/personalInfoSchema';
import SecureInput from '@/components/Security/SecureInput';

interface SecurePersonalInfoFieldsProps {
  defaultValues: PersonalInfoValues;
}

const SecurePersonalInfoFields: React.FC<SecurePersonalInfoFieldsProps> = ({ defaultValues }) => {
  const [formData, setFormData] = useState(defaultValues);

  useEffect(() => {
    setFormData(defaultValues);
  }, [defaultValues]);

  const validCountries = countries.filter(country => country.value && country.value.trim() !== '');

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SecureInput
          label="First Name"
          value={formData.first_name}
          onChange={(value) => setFormData(prev => ({ ...prev, first_name: value }))}
          placeholder="John"
          maxLength={50}
          required
        />
        <SecureInput
          label="Last Name"
          value={formData.last_name}
          onChange={(value) => setFormData(prev => ({ ...prev, last_name: value }))}
          placeholder="Doe"
          maxLength={50}
          required
        />
        
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth *</Label>
          <SecureInput
            label=""
            value={formData.date_of_birth}
            onChange={(value) => setFormData(prev => ({ ...prev, date_of_birth: value }))}
            type="text"
            placeholder="YYYY-MM-DD"
            maxLength={10}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality *</Label>
          <Select 
            value={formData.nationality} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select nationality" />
            </SelectTrigger>
            <SelectContent>
              {validCountries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <SecureInput
        label="Address"
        value={formData.address}
        onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
        placeholder="123 Main St"
        maxLength={200}
        required
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SecureInput
          label="City"
          value={formData.city}
          onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
          placeholder="New York"
          maxLength={100}
          required
        />
        <SecureInput
          label="Postal Code"
          value={formData.postal_code}
          onChange={(value) => setFormData(prev => ({ ...prev, postal_code: value }))}
          placeholder="10001"
          maxLength={20}
          required
        />
        
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Select 
            value={formData.country} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {validCountries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="first_name" value={formData.first_name} />
      <input type="hidden" name="last_name" value={formData.last_name} />
      <input type="hidden" name="date_of_birth" value={formData.date_of_birth} />
      <input type="hidden" name="nationality" value={formData.nationality} />
      <input type="hidden" name="address" value={formData.address} />
      <input type="hidden" name="city" value={formData.city} />
      <input type="hidden" name="postal_code" value={formData.postal_code} />
      <input type="hidden" name="country" value={formData.country} />
    </>
  );
};

export default SecurePersonalInfoFields;
