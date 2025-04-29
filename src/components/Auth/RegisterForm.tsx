
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema, RegisterFormValues } from './schema/registerSchema';
import RegisterFormContainer from './FormContainers/RegisterFormContainer';
import IconInput from './FormInputs/IconInput';
import PasswordInput from './FormInputs/PasswordInput';
import NameInputGroup from './FormInputs/NameInputGroup';

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
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password, values.firstName, values.lastName);
      onSuccess();
    } catch (error) {
      console.error("Registration error:", error);
      // Error already handled in signUp function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <RegisterFormContainer 
        onSubmit={form.handleSubmit(onSubmit)} 
        isLoading={isLoading}
      >
        <NameInputGroup form={form} />
        
        <IconInput
          form={form}
          name="email"
          label="Email"
          placeholder="name@example.com"
          icon={Mail}
        />
        
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
    </Form>
  );
};

export default RegisterForm;
