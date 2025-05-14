
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';

// Default/fallback documents in case storage loading fails
export const useFallbackDocuments = (): ResearchDocument[] => {
  return [
    {
      id: "doc-1",
      title: "Harvard Global Health Catalyst Summit Invitation and Industry Leader Award",
      description: "Official invitation letter from Harvard Medical School's Global Health Catalyst to Raymond C. Dabney, President & CEO of Cannabis Science Inc., to serve as keynote speaker at the 2018 Harvard Global Health Catalyst Summit. The letter announces Mr. Dabney's selection for the prestigious 2018 Harvard GHC Industry Leader Award in recognition of his groundbreaking collaborations with African institutions to develop cannabinoid-based cancer treatments. The summit focused on building high-impact USA-Africa collaborations to address cancer and other non-communicable diseases.",
      category: "Harvard Letter",
      pdfUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/US-PatentTrademarkOffice-Patent6630507.pdf",
      publishDate: "May 2, 2018",
      authors: "Prof. Wilfred Ngwa, MS, PhD, Chair of Organizing Committee, Director of Global Health Catalyst, Dana Farber/Harvard Cancer Center"
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
};
