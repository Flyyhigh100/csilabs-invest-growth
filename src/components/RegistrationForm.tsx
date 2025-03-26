
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const RegistrationForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    agreeTerms: false,
    agreeRestrictions: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.country) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.agreeTerms || !formData.agreeRestrictions) {
      toast({
        title: "Error",
        description: "You must agree to the terms and geographic restrictions.",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Registration Pending",
        description: "Your registration has been submitted and is pending verification.",
      });
      
      // In a real implementation, you would redirect to a verification page or dashboard
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl max-w-md mx-auto">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john.doe@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country of Residence</Label>
          <Input
            id="country"
            name="country"
            placeholder="United States"
            value={formData.country}
            onChange={handleChange}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Note: Some geographic restrictions may apply due to local regulations.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="agreeTerms" 
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => 
                handleCheckboxChange('agreeTerms', checked as boolean)
              }
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="agreeTerms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the terms and conditions
              </label>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="agreeRestrictions" 
              checked={formData.agreeRestrictions}
              onCheckedChange={(checked) => 
                handleCheckboxChange('agreeRestrictions', checked as boolean)
              }
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="agreeRestrictions"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I confirm that I am not a resident of a restricted territory
              </label>
              <p className="text-xs text-gray-500">
                Due to regulatory requirements, residents of certain territories may be restricted from participating.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full mt-6 bg-gradient-to-r from-cbis-blue to-cbis-teal text-white" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Register for Token Sale"
        )}
      </Button>
      
      <p className="text-xs text-center text-gray-500 mt-4">
        After registration, you'll need to complete KYC verification through WorldKYC before purchasing tokens.
      </p>
    </form>
  );
};

export default RegistrationForm;
