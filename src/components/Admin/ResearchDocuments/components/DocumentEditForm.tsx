
import React from 'react';
import { 
  Form,
  FormField,
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { ResearchDocument } from '../types/documentTypes';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface DocumentEditFormProps {
  document: ResearchDocument;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (data: Partial<ResearchDocument>) => void;
}

const DocumentEditForm: React.FC<DocumentEditFormProps> = ({ 
  document, 
  isSaving,
  onCancel,
  onSave
}) => {
  const form = useForm<ResearchDocument>({
    defaultValues: {
      title: document?.title || '',
      description: document?.description || '',
      category: document?.category || '',
      publishDate: document?.publishDate || '',
      authors: document?.authors || ''
    }
  });

  // Reset form when document changes
  React.useEffect(() => {
    if (document) {
      console.log("Resetting form with document:", document);
      form.reset({
        title: document.title || '',
        description: document.description || '',
        category: document.category || '',
        publishDate: document.publishDate || '',
        authors: document.authors || ''
      });
    }
  }, [document, form]);

  const handleSubmit = (data: ResearchDocument) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Document title" {...field} />
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
                <Input placeholder="Document category" {...field} />
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
                  <Input placeholder="Document authors" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default DocumentEditForm;
