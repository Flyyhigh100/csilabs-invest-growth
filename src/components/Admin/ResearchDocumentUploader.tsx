
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DocumentUploadForm from './DocumentUploadForm';
import DocumentsList from './DocumentsList';

interface ResearchDocument {
  id: string;
  name: string;
  created_at: string;
  size: number;
  url: string;
}

const ResearchDocumentUploader: React.FC = () => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('research')
        .list();

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      if (data) {
        // Filter out any folders, only include files
        const files = data.filter(item => !item.id.endsWith('/') && item.name.endsWith('.pdf'));
        
        // Get the public URLs for each file
        const docsWithUrls = await Promise.all(files.map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from('research')
            .getPublicUrl(file.name);
            
          return {
            id: file.id,
            name: file.name,
            created_at: file.created_at,
            size: file.metadata?.size || 0,
            url: urlData?.publicUrl || '',
          };
        }));
        
        setDocuments(docsWithUrls);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
