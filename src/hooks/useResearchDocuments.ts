
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResearchDocument {
  id: string;
  name: string;
  displayName: string;
  created_at: string;
  size: number;
  url: string;
}

export const useResearchDocuments = () => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<ResearchDocument | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
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
            
          // Create a more user-friendly display name by removing timestamp prefix
          const displayName = file.name.split('-').slice(1).join('-').replace('.pdf', '');
          
          return {
            id: file.id,
            name: file.name,
            displayName: displayName || 'Research Document',
            created_at: file.created_at,
            size: file.metadata?.size || 0,
            url: urlData?.publicUrl || '',
          };
        }));
        
        setDocuments(docsWithUrls);
        
        // If we have documents and none is selected, select the first one
        if (docsWithUrls.length > 0 && !selectedDocument) {
          setSelectedDocument(docsWithUrls[0]);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter documents based on search term and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? doc.displayName.toLowerCase().startsWith(selectedCategory.toLowerCase()) : true;
    return matchesSearch && matchesCategory;
  });

  // Extract categories from document names
  const extractCategories = () => {
    const categories = new Set<string>();
    documents.forEach(doc => {
      const nameParts = doc.displayName.split('-');
      if (nameParts.length > 1) {
        categories.add(nameParts[0].trim());
      } else {
        categories.add('General');
      }
    });
    return Array.from(categories);
  };

  const categories = extractCategories();

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  return {
    documents,
    filteredDocuments,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDocument,
    setSelectedDocument,
    categories,
    clearFilters
  };
};
