
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { DocumentFormValues } from '../types/documentTypes';

interface DocumentMetadataFormProps {
  form: UseFormReturn<DocumentFormValues>;
  disabled: boolean;
}

const DocumentMetadataForm: React.FC<DocumentMetadataFormProps> = ({ form, disabled }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Document Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter document title" {...field} disabled={disabled} />
            </FormControl>
            <FormDescription>
              This will be displayed as the main title of the document card
            </FormDescription>
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
                placeholder="Enter a brief description of the document" 
                className="resize-none min-h-[100px]" 
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormDescription>
              A concise summary of the document's content
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Clinical Research, Patents" {...field} disabled={disabled} />
              </FormControl>
              <FormDescription>
                Documents are grouped by category
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="publishDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Publication Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="authors"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Authors (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="e.g. CSi Labs Research Team" {...field} disabled={disabled} />
            </FormControl>
            <FormDescription>
              Names of individuals or organizations that authored the document
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default DocumentMetadataForm;
