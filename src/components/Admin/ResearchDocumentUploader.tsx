
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DocumentUploadForm from './DocumentUploadForm';
import DocumentsList from './DocumentsList';
import { useResearchDocuments } from '@/hooks/useResearchDocuments';

const ResearchDocumentUploader: React.FC = () => {
  const { 
    documents, 
    isLoading,
    fetchDocuments 
  } = useResearchDocuments();

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="space-y-6">
      <DocumentUploadForm onUploadSuccess={fetchDocuments} />
      <DocumentsList 
        documents={documents}
        isLoading={isLoading}
        onDelete={fetchDocuments}
      />
    </div>
  );
};

export default ResearchDocumentUploader;
