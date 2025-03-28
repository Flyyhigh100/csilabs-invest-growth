
import React, { useState } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, Camera, AlertTriangle } from 'lucide-react';

// Define the form schema for personal information
const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  nationality: z.string().min(1, { message: "Nationality is required" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  postalCode: z.string().min(3, { message: "Postal code must be at least 3 characters" }),
  country: z.string().min(2, { message: "Country is required" }),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

// Mock list of countries for the select input
const countries = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan" },
];

const KYCVerification = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal-info");
  const [uploadedIdFront, setUploadedIdFront] = useState<File | null>(null);
  const [uploadedIdBack, setUploadedIdBack] = useState<File | null>(null);
  const [uploadedSelfie, setUploadedSelfie] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const personalInfoForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });

  const handlePersonalInfoSubmit = (values: PersonalInfoValues) => {
    // In a real app, send this data to your backend
    console.log("Personal info submitted:", values);
    
    toast({
      title: "Information Saved",
      description: "Your personal information has been saved successfully.",
    });
    
    // Move to the next tab
    setActiveTab("document-verification");
  };

  const handleDocumentUpload = (type: 'idFront' | 'idBack' | 'selfie', file: File) => {
    if (type === 'idFront') setUploadedIdFront(file);
    if (type === 'idBack') setUploadedIdBack(file);
    if (type === 'selfie') setUploadedSelfie(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'idFront' | 'idBack' | 'selfie') => {
    if (e.target.files && e.target.files[0]) {
      handleDocumentUpload(type, e.target.files[0]);
    }
  };

  const handleFinalSubmit = async () => {
    if (!uploadedIdFront || !uploadedIdBack || !uploadedSelfie) {
      toast({
        title: "Missing Documents",
        description: "Please upload all required documents.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, send all data to your backend
      console.log("Documents uploaded:", {
        idFront: uploadedIdFront,
        idBack: uploadedIdBack,
        selfie: uploadedSelfie,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Verification Submitted",
        description: "Your KYC verification has been submitted successfully. We'll review your information and update you soon.",
      });

      // Move to the final tab
      setActiveTab("verification-status");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting your verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="KYC Verification">
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification</CardTitle>
          <CardDescription>
            Complete the verification process to unlock full platform access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal-info">Personal Information</TabsTrigger>
              <TabsTrigger value="document-verification" disabled={activeTab === "personal-info"}>
                Document Verification
              </TabsTrigger>
              <TabsTrigger value="verification-status" disabled={activeTab !== "verification-status"}>
                Verification Status
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal-info" className="py-4">
              <Form {...personalInfoForm}>
                <form onSubmit={personalInfoForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={personalInfoForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalInfoForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalInfoForm.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalInfoForm.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select nationality" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country.value} value={country.value}>
                                  {country.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={personalInfoForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={personalInfoForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalInfoForm.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalInfoForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country.value} value={country.value}>
                                  {country.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Save and Continue
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="document-verification" className="py-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">ID Verification</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Please upload clear images of your ID document (both sides) and a selfie.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Front of ID */}
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm font-medium mb-2">Front of ID</h4>
                      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center mb-3">
                        {uploadedIdFront ? (
                          <div className="p-2 text-center">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 truncate">{uploadedIdFront.name}</p>
                          </div>
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="relative">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => document.getElementById('front-id-upload')?.click()}
                        >
                          {uploadedIdFront ? "Replace" : "Upload"}
                        </Button>
                        <input
                          id="front-id-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'idFront')}
                        />
                      </div>
                    </div>
                    
                    {/* Back of ID */}
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm font-medium mb-2">Back of ID</h4>
                      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center mb-3">
                        {uploadedIdBack ? (
                          <div className="p-2 text-center">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 truncate">{uploadedIdBack.name}</p>
                          </div>
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="relative">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => document.getElementById('back-id-upload')?.click()}
                        >
                          {uploadedIdBack ? "Replace" : "Upload"}
                        </Button>
                        <input
                          id="back-id-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'idBack')}
                        />
                      </div>
                    </div>
                    
                    {/* Selfie */}
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm font-medium mb-2">Selfie with ID</h4>
                      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center mb-3">
                        {uploadedSelfie ? (
                          <div className="p-2 text-center">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 truncate">{uploadedSelfie.name}</p>
                          </div>
                        ) : (
                          <Camera className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="relative">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => document.getElementById('selfie-upload')?.click()}
                        >
                          {uploadedSelfie ? "Replace" : "Upload"}
                        </Button>
                        <input
                          id="selfie-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'selfie')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab("personal-info")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button"
                    disabled={!uploadedIdFront || !uploadedIdBack || !uploadedSelfie || isSubmitting}
                    onClick={handleFinalSubmit}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Verification"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="verification-status" className="py-4">
              <div className="text-center py-8">
                <div className="bg-amber-50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
                  <AlertTriangle className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-medium mb-2">Verification in Progress</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Your identity verification is currently being reviewed. This process usually takes 1-2 business days.
                  We'll notify you once the review is complete.
                </p>
                <Button asChild variant="outline">
                  <a href="/dashboard">Return to Dashboard</a>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default KYCVerification;
