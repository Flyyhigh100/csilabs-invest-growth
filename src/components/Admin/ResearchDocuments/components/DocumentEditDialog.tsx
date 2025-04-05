
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

interface DocumentEditDialogProps {
  document: ResearchDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (docId: string, data: Partial<ResearchDocument>) => Promise<boolean>;
}

const DocumentEditDialog: React.FC<DocumentEditDialogProps> = ({ 
  document, 
  open,
  onOpenChange,
  onSave 
}) => {
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<ResearchDocument>({
    defaultValues: {
      title: document?.title || '',
      description: document?.description || '',
      category: document?.category || '',
      publishDate: document?.publishDate || '',
      authors: document?.authors || ''
    }
  });

  // Reset form when document changes or dialog opens
  React.useEffect(() => {
    if (document && open) {
      console.log("Resetting form with document:", document);
      form.reset({
        title: document.title || '',
        description: document.description || '',
        category: document.category || '',
        publishDate: document.publishDate || '',
        authors: document.authors || ''
      });
    }
  }, [document, form, open]);

  const handleSubmit = async (data: Partial<ResearchDocument>) => {
    if (!document) return;
    
    setIsSaving(true);
    console.log("Submitting form with data:", data);
    
    try {
      // Make sure we're sending all fields to avoid losing data
      const updatedData = {
        title: data.title || document.title,
        description: data.description || document.description,
        category: data.category || document.category,
        publishDate: data.publishDate || document.publishDate,
        authors: data.authors
      };
      
      const success = await onSave(document.id, updatedData);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Document Metadata</DialogTitle>
        </DialogHeader>
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
                      <Input {...field} />
                    </FormControl>
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
                onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  );
};

export default DocumentEditDialog;
