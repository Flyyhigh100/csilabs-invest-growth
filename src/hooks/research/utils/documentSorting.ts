
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';

/**
 * Sort documents by publish date (most recent first)
 */
export const sortDocumentsByDate = (documents: ResearchDocument[]): ResearchDocument[] => {
  return documents.sort((a, b) => {
    // Try to parse dates in various formats for better comparison
    const dateA = new Date(a.publishDate);
    const dateB = new Date(b.publishDate);
    
    // Check if dates are valid, if not use string comparison
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      return a.publishDate.localeCompare(b.publishDate);
    }
    
    return dateB.getTime() - dateA.getTime();
  });
};
