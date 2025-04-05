import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ResearchDocument } from '../../types/documentTypes';

export const useDocumentEditForm = (
  document: ResearchDocument,
  onSave: (data: Partial<ResearchDocument>) => void
) => {
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
  useEffect(() => {
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
    // Ensure data is properly formatted before saving
    const formattedData = {
      ...data,
      // Keep other fields intact
    };
    
    onSave(formattedData);
  };

  return {
    form,
    handleSubmit
  };
};
