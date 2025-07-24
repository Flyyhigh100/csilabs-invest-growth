import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import ExecutivePDFTemplate from '@/components/Admin/Reports/PDFTemplates/ExecutivePDFTemplate';
import ShareholderPDFTemplate from '@/components/Admin/Reports/PDFTemplates/ShareholderPDFTemplate';
import CompliancePDFTemplate from '@/components/Admin/Reports/PDFTemplates/CompliancePDFTemplate';

export interface PDFGenerationOptions {
  templateId: string;
  data: any;
  filename?: string;
}

export const generatePDF = async (options: PDFGenerationOptions): Promise<void> => {
  const { templateId, data, filename } = options;
  
  let PDFComponent;
  let defaultFilename = 'report.pdf';

  switch (templateId) {
    case 'ceo-dashboard':
    case 'board-presentation':
    case 'executive-summary':
      PDFComponent = ExecutivePDFTemplate;
      defaultFilename = `executive-summary-${new Date().toISOString().split('T')[0]}.pdf`;
      break;
      
    case 'revenue-analysis':
    case 'token-distribution':
      PDFComponent = ShareholderPDFTemplate;
      defaultFilename = `shareholder-report-${new Date().toISOString().split('T')[0]}.pdf`;
      break;
      
    case 'client-analytics':
    case 'transaction-report':
      PDFComponent = ExecutivePDFTemplate;
      defaultFilename = `operational-report-${new Date().toISOString().split('T')[0]}.pdf`;
      break;
      
    case 'kyc-compliance':
      PDFComponent = CompliancePDFTemplate;
      defaultFilename = `compliance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      break;
      
    default:
      throw new Error(`Unknown template ID: ${templateId}`);
  }

  try {
    // Generate the PDF blob
    const blob = await pdf(PDFComponent({ data })).toBlob();
    
    // Download the PDF
    saveAs(blob, filename || defaultFilename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Provide more specific error information
    if (error instanceof Error) {
      throw new Error(`Failed to generate PDF report: ${error.message}`);
    }
    throw new Error('Failed to generate PDF report due to unknown error');
  }
};

export const generateAndDownloadReport = async (
  templateId: string, 
  reportData: any
): Promise<void> => {
  await generatePDF({
    templateId,
    data: reportData,
  });
};

// Helper function to prepare data for different report types
export const prepareReportData = (templateId: string, rawData: any) => {
  const baseData = {
    generatedAt: new Date().toISOString(),
    ...rawData,
  };

  switch (templateId) {
    case 'revenue-analysis':
    case 'token-distribution':
      return {
        ...baseData,
        summary: {
          totalRevenue: rawData.summary?.totalRevenue || 0,
          monthlyGrowth: rawData.summary?.monthlyGrowth || 15.2,
          quarterlyRevenue: rawData.summary?.totalRevenue * 0.3 || 0,
          yearlyRevenue: rawData.summary?.totalRevenue || 0,
          totalTokensDistributed: rawData.summary?.totalTokensDistributed || 0,
          averageTokenPrice: rawData.summary?.averageTokenPrice || 0.50,
          marketCap: (rawData.summary?.totalTokensDistributed || 0) * (rawData.summary?.averageTokenPrice || 0.50),
        },
        revenueBreakdown: {
          cryptoPayments: (rawData.summary?.totalRevenue || 0) * 0.6,
          creditCardPayments: (rawData.summary?.totalRevenue || 0) * 0.3,
          bankTransfers: (rawData.summary?.totalRevenue || 0) * 0.1,
        },
        tokenDistribution: {
          circulatingSupply: rawData.summary?.totalTokensDistributed || 0,
          totalSupply: 1000000000, // 1B total supply
          distributionPercentage: ((rawData.summary?.totalTokensDistributed || 0) / 1000000000) * 100,
        },
      };
      
    case 'kyc-compliance':
      return {
        ...baseData,
        summary: {
          totalUsers: rawData.summary?.totalClients || 0,
          kycApprovalRate: rawData.summary?.kycApprovalRate || 0,
          pendingKyc: rawData.keyMetrics?.pendingKyc || 0,
          complianceScore: 85, // This would be calculated based on compliance metrics
        },
        kycData: rawData.topClients?.map((client: any) => ({
          name: `${client.first_name} ${client.last_name}`,
          status: client.kyc_status || 'pending',
          submittedAt: client.kyc_submitted_at,
          reviewedAt: client.kyc_reviewed_at,
        })) || [],
      };
      
    default:
      return baseData;
  }
};