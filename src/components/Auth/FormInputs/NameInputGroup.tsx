
import React from 'react';
import { User } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormValues } from '../schema/registerSchema';
import IconInput from './IconInput';

interface NameInputGroupProps {
  form: UseFormReturn<RegisterFormValues>;
}

const NameInputGroup: React.FC<NameInputGroupProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <IconInput
        form={form}
        name="firstName"
        label="First Name"
        placeholder="John"
        icon={User}
      />
      <IconInput
        form={form}
        name="lastName"
        label="Last Name"
        placeholder="Doe"
        icon={User}
      />
    </div>
  );
};

export default NameInputGroup;
