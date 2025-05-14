
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';

// Default/fallback documents in case storage loading fails
export const useFallbackDocuments = (): ResearchDocument[] => {
  return [
    {
      id: "doc-1",
      title: "Cannabinoids as Antioxidants and Neuroprotectants",
      description: "US Patent #6,630,507 details cannabinoids as potent antioxidants with neuroprotective properties, potentially useful for treating oxidative stress-related diseases.",
      category: "Harvard Letter",
      pdfUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/US-PatentTrademarkOffice-Patent6630507.pdf",
      publishDate: "October 7, 2003",
      authors: "Hampson et al., US Department of Health and Human Services"
    },
    {
      id: "doc-2",
      title: "Cannabis and Cannabinoid Research in Cancer",
      description: "Comprehensive research on the effects of cannabinoids on various cancer cell types and mechanisms of action.",
      category: "Report 1",
      pdfUrl: "/sample.pdf",
      publishDate: "March 15, 2022",
      authors: "CSi Labs Research Team"
    }
  ];
};
