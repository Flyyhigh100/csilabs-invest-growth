
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';
import { getBaseFilename, parseFileMetadata } from './utils/metadataUtils';
import { sortDocumentsByDate } from './utils/documentSorting';
import { useFallbackDocuments } from './useFallbackDocuments';

/**
 * Hook for refreshing documents in the background without showing loading states
 */
export const useBackgroundRefresh = (
  setDocuments: (docs: ResearchDocument[]) => void,
  saveToCache: (docs: ResearchDocument[]) => void
) => {
  const fallbackDocuments = useFallbackDocuments();

  const refreshInBackground = useCallback(async () => {
    try {
      const { data: files, error: filesError } = await supabase
        .storage
        .from('research_documents')
        .list('', {
          limit: 100 // Add a higher limit to ensure we get all files
        });
        
      if (filesError || !files || files.length === 0) {
        return; // Just return silently as this is a background refresh
      }

      // Process files as before but without loading states
      const documentsList = await Promise.all(files.map(async (file) => {
        const fileName = file.name;
        const { data: urlData } = supabase.storage.from('research_documents').getPublicUrl(fileName);
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
      }));
      
      // Make sure we always include the Harvard video document
      const videoDocuments = fallbackDocuments.filter(doc => doc.type === 'video');
      
      // Combine and sort
      const combinedDocs = [...documentsList, ...videoDocuments];
      const sortedDocs = sortDocumentsByDate(combinedDocs);
      
      saveToCache(sortedDocs);
      setDocuments(sortedDocs);
      console.log('Background refresh completed with', sortedDocs.length, 'documents');
    } catch (err) {
      console.error('Background refresh error:', err);
      // Don't set error state as this is a background operation
    }
  }, [setDocuments, saveToCache, fallbackDocuments]);

  return { refreshInBackground };
};
