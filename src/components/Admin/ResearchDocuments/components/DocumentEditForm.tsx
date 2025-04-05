
import React from 'react';
import { Form } from '@/components/ui/form';
import { ResearchDocument } from '../types/documentTypes';
import { useDocumentEditForm } from '../hooks/form/useDocumentEditForm';
import DocumentFormFields from './DocumentFormFields';
import DocumentFormActions from './DocumentFormActions';

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
  const { form, handleSubmit } = useDocumentEditForm(document, onSave);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <DocumentFormFields form={form} disabled={isSaving} />
        <DocumentFormActions isSaving={isSaving} onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default DocumentEditForm;
