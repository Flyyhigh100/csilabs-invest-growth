
import React from 'react';
import { 
  FormField,
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ResearchDocument } from '../types/documentTypes';

interface DocumentFormFieldsProps {
  form: UseFormReturn<ResearchDocument>;
  disabled?: boolean;
}

const DocumentFormFields: React.FC<DocumentFormFieldsProps> = ({ 
  form, 
  disabled = false 
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Document title" {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Document description" 
                className="min-h-[100px]"
                {...field} 
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <Input placeholder="Document category" {...field} disabled={disabled} />
            </FormControl>
            <FormDescription>
              Multiple categories can be separated by commas
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="publishDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Publication Date</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="text" 
                  placeholder="e.g., 5/2/2018"
                  disabled={disabled}
                  onChange={(e) => {
                    console.log("Date changed to:", e.target.value);
                    field.onChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Format: MM/DD/YYYY or custom date format
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="authors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authors</FormLabel>
              <FormControl>
                <Input placeholder="Document authors" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default DocumentFormFields;
