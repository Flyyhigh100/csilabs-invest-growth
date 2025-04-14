import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';

export const useFallbackDocuments = () => {
  // This hook provides fallback documents in case the API fails or returns empty
  const fallbackDocuments: ResearchDocument[] = [
    {
      id: 'youtube-video-cannabinoid-cancer',
      title: 'Cannabinoid-Based Cancer Treatment Research',
      description: 'Harvard Medical School Recipient of the Global Health Catalyst Industry Leader Award, Raymond Dabney and CSi Labs discuss how cannabinoids have proven to be effective against cancer. This research video shows the collaborative work between institutions to advance cannabinoid-based treatments.',
      category: 'Video Research',
      pdfUrl: '',
      publishDate: '2023-12-15',
      authors: 'Raymond Dabney, CSi Labs Research Team',
      type: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=x3q2uQ7J7f4',
      thumbnailUrl: '/lovable-uploads/c2afcd29-21b1-48cc-890b-a9a2b8155289.png'
    },
    {
      id: "doc-1",
      title: "Cannabinoids as Antioxidants and Neuroprotectants",
      description: "US Patent #6,630,507 details cannabinoids as potent antioxidants with neuroprotective properties, potentially useful for treating oxidative stress-related diseases.",
      category: "Patents",
      pdfUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/US-PatentTrademarkOffice-Patent6630507.pdf",
      publishDate: "October 7, 2003",
      authors: "Hampson et al., US Department of Health and Human Services"
    },
    {
      id: "doc-2",
      title: "Cannabis and Cannabinoid Research in Cancer",
      description: "Comprehensive research on the effects of cannabinoids on various cancer cell types and mechanisms of action.",
      category: "Clinical Research",
      pdfUrl: "/sample.pdf",
      publishDate: "March 15, 2022",
      authors: "CSi Labs Research Team"
    }
  ];

  return fallbackDocuments;
};
