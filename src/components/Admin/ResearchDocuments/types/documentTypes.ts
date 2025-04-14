
export interface ResearchDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  pdfUrl: string;
  publishDate: string;
  authors?: string;
  type?: 'pdf' | 'video';
  videoUrl?: string;
}

export interface DocumentFormValues {
  title: string;
  description: string;
  category: string;
  publishDate: string;
  authors?: string;
}
