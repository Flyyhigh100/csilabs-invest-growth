
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';
import { getBaseFilename, parseFileMetadata } from './utils/metadataUtils';
import { sortDocumentsByDate } from './utils/documentSorting';
import { useFallbackDocuments } from './useFallbackDocuments';

/**
 * Hook for processing files into document objects
 */
export const useDocumentProcessor = () => {
  const fallbackDocuments = useFallbackDocuments();

  // Process storage files into document objects
  const processFiles = useCallback(async (files: any[]) => {
    // Get metadata for each file
    const filePromises = files.map(async (file) => {
      const fileName = file.name;
      
      // Get the public URL
      const { data: urlData } = supabase
        .storage
        .from('research_documents')
        .getPublicUrl(fileName);
        
      const baseFileName = getBaseFilename(fileName);
      const metadata = parseFileMetadata(fileName, baseFileName);
      
      return {
        id: `doc-${fileName}`,
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        pdfUrl: urlData.publicUrl,
        publishDate: metadata.publishDate,
        authors: metadata.authors,
        type: metadata.type as 'pdf' | 'video',
        videoUrl: metadata.videoUrl,
        thumbnailUrl: metadata.thumbnailUrl
      } as ResearchDocument;
    });

    const documentsList = await Promise.all(filePromises);
    
    // Make sure we always include the Harvard video document
    const videoDocuments = fallbackDocuments.filter(doc => doc.type === 'video');
    
    // Combine documents from storage with video documents from fallback
    const combinedDocs = [...documentsList, ...videoDocuments];
    
    // Sort all documents by date
    return sortDocumentsByDate(combinedDocs);
  }, [fallbackDocuments]);

  return { processFiles };
};
