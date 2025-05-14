
export interface ResearchDocument {
  id: string;
  title: string;
  description?: string;
  category: string;
  pdfUrl: string;
  publishDate: string;
  authors?: string;
  filePath?: string;
}

export interface DocumentFormValues {
  title: string;
  description: string;
  category: string;
  publishDate: string;
  authors?: string;
}

export interface DatabaseDocument {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string;
  published_at: string;
  authors: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Utility function to convert between formats
export const convertDatabaseToResearchDocument = (doc: DatabaseDocument): ResearchDocument => {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description || undefined,
    category: doc.category,
    pdfUrl: doc.file_path,
    publishDate: new Date(doc.published_at).toISOString().split('T')[0],
    authors: doc.authors || undefined,
    filePath: doc.file_path
  };
};
