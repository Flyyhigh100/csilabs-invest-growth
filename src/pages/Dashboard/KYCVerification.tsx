import React, { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { Upload, CheckCircle, Camera, AlertTriangle, Loader2 } from 'lucide-react';
import { useKycVerification, KycFormData } from '@/hooks/useKycVerification';
import { useAuth } from '@/contexts/AuthContext';

const personalInfoSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  date_of_birth: z.string().min(1, { message: "Date of birth is required" }),
  nationality: z.string().min(1, { message: "Nationality is required" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  postal_code: z.string().min(3, { message: "Postal code must be at least 3 characters" }),
  country: z.string().min(2, { message: "Country is required" }),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

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
  const { user } = useAuth();
  const {
    kycData,
    isLoading,
    error,
    savePersonalInfo,
    uploadDocument,
    submitVerification
  } = useKycVerification();
  
  const [activeTab, setActiveTab] = useState<string>("personal-info");
  const [uploadedIdFront, setUploadedIdFront] = useState<File | null>(null);
  const [uploadedIdBack, setUploadedIdBack] = useState<File | null>(null);
  const [uploadedSelfie, setUploadedSelfie] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (kycData) {
      if (kycData.status === 'pending' || kycData.status === 'approved' || kycData.status === 'rejected') {
        setActiveTab("verification-status");
      }
    }
  }, [kycData]);

  const personalInfoForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: "",
      nationality: "",
      address: "",
      city: "",
      postal_code: "",
      country: "",
    },
  });

  useEffect(() => {
    if (kycData) {
      personalInfoForm.reset({
        first_name: kycData.first_name || "",
        last_name: kycData.last_name || "",
        date_of_birth: kycData.date_of_birth || "",
        nationality: kycData.nationality || "",
        address: kycData.address || "",
        city: kycData.city || "",
        postal_code: kycData.postal_code || "",
        country: kycData.country || "",
      });
    }
  }, [kycData, personalInfoForm]);

  const handlePersonalInfoSubmit = async (values: PersonalInfoValues) => {
    await savePersonalInfo.mutateAsync(values as KycFormData);
    setActiveTab("document-verification");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'id_front' | 'id_back' | 'selfie') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'id_front') setUploadedIdFront(file);
      if (type === 'id_back') setUploadedIdBack(file);
      if (type === 'selfie') setUploadedSelfie(file);
      
      try {
        await uploadDocument.mutateAsync({ file, type });
        toast.success(`${type.replace('_', ' ')} uploaded successfully`);
      } catch (error) {
        console.error(`Error uploading ${type}:`, error);
      }
    }
  };

  const handleFinalSubmit = async () => {
    if (!kycData?.id_front_url || !kycData?.id_back_url || !kycData?.selfie_url) {
      toast.error("Please upload all required documents.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitVerification.mutateAsync();
      setActiveTab("verification-status");
    } catch (error) {
      toast.error("An error occurred while submitting your verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="KYC Verification">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
          <span className="ml-2 text-gray-600">Loading verification status...</span>
        </div>
      </DashboardLayout>
    );
  }

  const hasIdFront = !!kycData?.id_front_url;
  const hasIdBack = !!kycData?.id_back_url;
  const hasSelfie = !!kycData?.selfie_url;

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
              <TabsTrigger 
                value="personal-info" 
                disabled={kycData?.status !== 'not_started' && kycData?.status !== 'rejected'}
              >
                Personal Information
              </TabsTrigger>
              <TabsTrigger 
                value="document-verification" 
                disabled={(kycData?.status !== 'not_started' && kycData?.status !== 'rejected') || activeTab === "personal-info"}
              >
                Document Verification
              </TabsTrigger>
              <TabsTrigger 
                value="verification-status" 
                disabled={kycData?.status === 'not_started' && activeTab !== "verification-status"}
              >
                Verification Status
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal-info" className="py-4">
              <Form {...personalInfoForm}>
                <form onSubmit={personalInfoForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={personalInfoForm.control}
                      name="first_name"
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
                      name="last_name"
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
                      name="date_of_birth"
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
                      name="postal_code"
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
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={savePersonalInfo.isPending}
                  >
                    {savePersonalInfo.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save and Continue"
                    )}
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
                        {hasIdFront ? (
                          <div className="p-2 text-center">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">ID Front Uploaded</p>
                          </div>
                        ) : uploadDocument.isPending && uploadedIdFront ? (
                          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="relative">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          disabled={uploadDocument.isPending}
                          onClick={() => document.getElementById('front-id-upload')?.click()}
                        >
                          {hasIdFront ? "Replace" : "Upload"}
                        </Button>
                        <input
                          id="front-id-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'id_front')}
                        />
                      </div>
                    </div>
                    
                    {/* Back of ID */}
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm font-medium mb-2">Back of ID</h4>
                      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center mb-3">
                        {hasIdBack ? (
                          <div className="p-2 text-center">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">ID Back Uploaded</p>
                          </div>
                        ) : uploadDocument.isPending && uploadedIdBack ? (
                          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="relative">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          disabled={uploadDocument.isPending}
                          onClick={() => document.getElementById('back-id-upload')?.click()}
                        >
                          {hasIdBack ? "Replace" : "Upload"}
                        </Button>
                        <input
                          id="back-id-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'id_back')}
                        />
                      </div>
                    </div>
                    
                    {/* Selfie */}
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm font-medium mb-2">Selfie with ID</h4>
                      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center mb-3">
                        {hasSelfie ? (
                          <div className="p-2 text-center">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Selfie Uploaded</p>
                          </div>
                        ) : uploadDocument.isPending && uploadedSelfie ? (
                          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        ) : (
                          <Camera className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="relative">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          disabled={uploadDocument.isPending}
                          onClick={() => document.getElementById('selfie-upload')?.click()}
                        >
                          {hasSelfie ? "Replace" : "Upload"}
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
                    disabled={!hasIdFront || !hasIdBack || !hasSelfie || isSubmitting || submitVerification.isPending}
                    onClick={handleFinalSubmit}
                  >
                    {submitVerification.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Verification"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="verification-status" className="py-4">
              <div className="text-center py-8">
                {kycData?.status === 'pending' && (
                  <>
                    <div className="bg-amber-50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
                      <AlertTriangle className="h-10 w-10 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Verification in Progress</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      Your identity verification is currently being reviewed. This process usually takes 1-2 business days.
                      We'll notify you once the review is complete.
                    </p>
                  </>
                )}
                
                {kycData?.status === 'approved' && (
                  <>
                    <div className="bg-green-50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Verification Approved</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      Your identity has been successfully verified. You now have full access to all platform features.
                    </p>
                  </>
                )}
                
                {kycData?.status === 'rejected' && (
                  <>
                    <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
                      <AlertTriangle className="h-10 w-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Verification Rejected</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      Unfortunately, your verification was rejected. Reason: {kycData.rejection_reason || "Unspecified reason"}
                    </p>
                    <Button 
                      onClick={() => setActiveTab("personal-info")} 
                      className="mb-4"
                    >
                      Resubmit Verification
                    </Button>
                  </>
                )}
                
                {kycData?.status === 'not_started' && (
                  <>
                    <div className="bg-blue-50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
                      <Upload className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Verification Not Started</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      You haven't started the verification process yet. Complete the verification to unlock all platform features.
                    </p>
                    <Button 
                      onClick={() => setActiveTab("personal-info")} 
                      className="mb-4"
                    >
                      Start Verification
                    </Button>
                  </>
                )}
                
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
