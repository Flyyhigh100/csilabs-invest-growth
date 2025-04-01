
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResearchDocument {
  id: string;
  name: string;
  displayName?: string;
  created_at: string;
  size: number;
  url: string;
}

export const useResearchDocuments = () => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
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
            
          // Format the display name by removing timestamps and cleaning up the filename
          const nameWithoutExtension = file.name.replace('.pdf', '');
          
          // If the name contains a timestamp (like 1625184000-Document-Name.pdf)
          // Extract everything after the first dash, otherwise use the name as is
          let displayName = nameWithoutExtension;
          if (nameWithoutExtension.includes('-')) {
            displayName = nameWithoutExtension.split('-').slice(1).join('-');
          }
            
          return {
            id: file.id,
            name: file.name,
            displayName: displayName, // Add a cleaned-up display name
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
  }, []);

  // Filter documents based on search term and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      (doc.displayName && doc.displayName.startsWith(selectedCategory));
    
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from documents
  const categories = Array.from(
    new Set(
      documents
        .map(doc => {
          const categoryMatch = doc.displayName?.match(/^([^-]+)/);
          return categoryMatch ? categoryMatch[0].trim() : null;
        })
        .filter(Boolean) as string[]
    )
  );

  // Reset filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  // Load documents on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    filteredDocuments,
    isLoading,
    fetchDocuments,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    clearFilters
  };
};
