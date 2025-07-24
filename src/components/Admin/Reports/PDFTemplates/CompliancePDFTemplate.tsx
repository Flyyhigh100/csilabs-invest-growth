import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuBWYAZ9hiA.woff2',
      fontWeight: 'bold',
    },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  complianceCard: {
    backgroundColor: '#f9fafb',
    padding: 15,
    marginBottom: 10,
    borderRadius: 4,
    border: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: 2,
    borderBottomColor: '#d1d5db',
    paddingVertical: 10,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
    paddingHorizontal: 5,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

interface CompliancePDFTemplateProps {
  data: {
    summary?: {
      totalUsers?: number;
      kycApprovalRate?: number;
      pendingKyc?: number;
      complianceScore?: number;
    };
    kycData?: Array<{
      name: string;
      status: string;
      submittedAt: string;
      reviewedAt?: string;
    }>;
    generatedAt?: string;
  };
}

const CompliancePDFTemplate: React.FC<CompliancePDFTemplateProps> = ({ data }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return '0%';
    return `${value.toFixed(1)}%`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>KYC & Compliance Report</Text>
          <Text style={styles.subtitle}>
            Comprehensive compliance overview and KYC verification status
          </Text>
          <Text style={styles.subtitle}>
            Generated on: {formatDate(data.generatedAt)}
          </Text>
        </View>

        {/* Compliance Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance Overview</Text>
          
          <View style={styles.complianceCard}>
            <Text style={styles.cardTitle}>Total Users: {data.summary?.totalUsers || 0}</Text>
            <Text style={styles.cardText}>
              Number of registered users requiring KYC verification
            </Text>
          </View>

          <View style={styles.complianceCard}>
            <Text style={styles.cardTitle}>KYC Approval Rate: {formatPercentage(data.summary?.kycApprovalRate)}</Text>
            <Text style={styles.cardText}>
              Percentage of completed and approved KYC verifications
            </Text>
          </View>

          <View style={styles.complianceCard}>
            <Text style={styles.cardTitle}>Pending Reviews: {data.summary?.pendingKyc || 0}</Text>
            <Text style={styles.cardText}>
              KYC submissions awaiting admin review and approval
            </Text>
          </View>

          <View style={styles.complianceCard}>
            <Text style={styles.cardTitle}>Compliance Score: {data.summary?.complianceScore || 85}/100</Text>
            <Text style={styles.cardText}>
              Overall platform compliance rating based on regulatory requirements
            </Text>
          </View>
        </View>

        {/* KYC Status Table */}
        {data.kycData && data.kycData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent KYC Verifications</Text>
            
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCellHeader}>User</Text>
                <Text style={styles.tableCellHeader}>Status</Text>
                <Text style={styles.tableCellHeader}>Submitted</Text>
                <Text style={styles.tableCellHeader}>Reviewed</Text>
              </View>
              
              {data.kycData.slice(0, 10).map((kyc, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{kyc.name}</Text>
                  <Text style={styles.tableCell}>{kyc.status.toUpperCase()}</Text>
                  <Text style={styles.tableCell}>{formatDate(kyc.submittedAt)}</Text>
                  <Text style={styles.tableCell}>{formatDate(kyc.reviewedAt)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          CSI Token Platform - Confidential Compliance Report - Page 1
        </Text>
      </Page>
    </Document>
  );
};

export default CompliancePDFTemplate;