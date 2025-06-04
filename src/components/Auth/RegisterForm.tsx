
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema, RegisterFormValues } from './schema/registerSchema';
import RegisterFormContainer from './FormContainers/RegisterFormContainer';
import SecureInput from '@/components/Security/SecureInput';
import SecureForm from '@/components/Security/SecureForm';
import PasswordInput from './FormInputs/PasswordInput';
import PhoneInput from './FormInputs/PhoneInput';
import AddressInputGroup from './FormInputs/AddressInputGroup';

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: ""
      },
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (sanitizedValues: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await signUp({
        email: sanitizedValues.email,
        password: sanitizedValues.password,
        metadata: {
          firstName: sanitizedValues.firstName,
          lastName: sanitizedValues.lastName,
          phoneNumber: sanitizedValues.phoneNumber,
          address: sanitizedValues.address
        }
      });
      onSuccess();
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <SecureForm onSubmit={onSubmit} className="space-y-4">
        <RegisterFormContainer 
          onSubmit={() => {}} // SecureForm handles submission
          isLoading={isLoading}
        >
          <div className="grid grid-cols-2 gap-4">
            <SecureInput
              label="First Name"
              value={form.watch('firstName')}
              onChange={(value) => form.setValue('firstName', value)}
              placeholder="John"
              maxLength={50}
              required
            />
            <SecureInput
              label="Last Name"
              value={form.watch('lastName')}
              onChange={(value) => form.setValue('lastName', value)}
              placeholder="Doe"
              maxLength={50}
              required
            />
          </div>
          
          <SecureInput
            label="Email"
            value={form.watch('email')}
            onChange={(value) => form.setValue('email', value)}
            type="email"
            placeholder="name@example.com"
            required
          />
          
          <PhoneInput form={form} />
          
          <AddressInputGroup form={form} />
          
          <PasswordInput
            form={form}
            name="password"
            label="Password"
          />
          
          <PasswordInput
            form={form}
            name="confirmPassword"
            label="Confirm Password"
          />
        </RegisterFormContainer>
      </SecureForm>
    </Form>
  );
};

export default RegisterForm;
