
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DatabaseDocument, ResearchDocument, convertDatabaseToResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';
import { useDocumentCache } from './useDocumentCache';

export const useDocumentRefresh = (
  setDocuments: React.Dispatch<React.SetStateAction<ResearchDocument[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<Error | null>>
) => {
  const { clearCache } = useDocumentCache();

  const refreshDocuments = useCallback(async () => {
    console.log('Refreshing documents from database');
    setIsLoading(true);
    
    try {
      // Clear cache first to ensure we get fresh data
      clearCache();
      
      // Fetch documents directly from the database
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) {
        console.error('Error refreshing documents:', error);
        setError(new Error(error.message));
        toast.error('Failed to refresh documents');
        return false;
      }
      
      if (!data || data.length === 0) {
        console.log('No documents found during refresh');
        setDocuments([]);
        setError(null);
        return true;
      }
      
      const refreshedDocuments = data.map((doc: DatabaseDocument) => 
        convertDatabaseToResearchDocument(doc)
      );
      
      console.log(`Refreshed ${refreshedDocuments.length} documents from database`);
      setDocuments(refreshedDocuments);
      setError(null);
      
      toast.success(`Successfully loaded ${refreshedDocuments.length} documents`);
      return true;
    } catch (err) {
      console.error('Exception during document refresh:', err);
      setError(err instanceof Error ? err : new Error('Error during document refresh'));
      toast.error('Error loading documents');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setDocuments, setIsLoading, setError, clearCache]);

  return { refreshDocuments };
};
