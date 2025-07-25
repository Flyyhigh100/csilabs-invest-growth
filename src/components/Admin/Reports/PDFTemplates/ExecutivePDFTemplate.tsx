import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Use built-in fonts for reliability

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  date: {
    fontSize: 10,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#374151',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  metricCard: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metricLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  metricChange: {
    fontSize: 8,
    color: '#059669',
    marginTop: 2,
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    paddingHorizontal: 5,
  },
  tableCellHeader: {
    fontWeight: 'bold',
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#9ca3af',
  },
});

interface ExecutivePDFTemplateProps {
  data: {
    generatedAt: string;
    summary: {
      totalClients: number;
      activeClients: number;
      totalRevenue: number;
      averageClientValue: number;
      vipClients: number;
      totalTokensDistributed: number;
      kycApprovalRate: number;
      monthlyGrowth: number;
      clientRetentionRate: number;
    };
    topClients: Array<{
      id: string;
      first_name: string;
      last_name: string;
      completed_value: number;
      total_transactions: number;
    }>;
    keyMetrics: {
      pendingTokens: number;
      pendingTransactions: number;
      averageTransactionSize: number;
      testDataPercentage: number;
    };
  };
}

const ExecutivePDFTemplate: React.FC<ExecutivePDFTemplateProps> = ({ data }) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatTokens = (tokens: number) => 
    new Intl.NumberFormat('en-US').format(tokens);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Executive Summary Report</Text>
            <Text style={styles.subtitle}>CSI Token Platform - Business Intelligence Dashboard</Text>
            <Text style={styles.date}>Generated on {formatDate(data.generatedAt)}</Text>
          </View>
        </View>

        {/* Key Performance Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Clients</Text>
              <Text style={styles.metricValue}>{data.summary.totalClients}</Text>
              <Text style={styles.metricChange}>{data.summary.activeClients} active</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Revenue</Text>
              <Text style={styles.metricValue}>{formatCurrency(data.summary.totalRevenue)}</Text>
              <Text style={styles.metricChange}>+{data.summary.monthlyGrowth}% this month</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>VIP Clients</Text>
              <Text style={styles.metricValue}>{data.summary.vipClients}</Text>
              <Text style={styles.metricChange}>{formatCurrency(data.summary.averageClientValue)} avg. value</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Tokens Distributed</Text>
              <Text style={styles.metricValue}>{formatTokens(data.summary.totalTokensDistributed)}</Text>
              <Text style={styles.metricChange}>{data.summary.kycApprovalRate.toFixed(1)}% KYC approved</Text>
            </View>
          </View>
        </View>

        {/* Business Health Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Health Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Client Retention Rate</Text>
              <Text style={styles.metricValue}>{data.summary.clientRetentionRate}%</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Average Transaction Size</Text>
              <Text style={styles.metricValue}>{formatCurrency(data.keyMetrics.averageTransactionSize)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Pending Transactions</Text>
              <Text style={styles.metricValue}>{data.keyMetrics.pendingTransactions}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Pending Token Delivery</Text>
              <Text style={styles.metricValue}>{formatTokens(data.keyMetrics.pendingTokens)}</Text>
            </View>
          </View>
        </View>

        {/* Top Clients Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 Clients by Investment</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Rank</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Client Name</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Total Investment</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Transactions</Text>
            </View>
            {data.topClients.map((client, index) => (
              <View key={client.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>#{index + 1}</Text>
                <Text style={styles.tableCell}>{client.first_name} {client.last_name}</Text>
                <Text style={styles.tableCell}>{formatCurrency(client.completed_value)}</Text>
                <Text style={styles.tableCell}>{client.total_transactions}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          CSI Token Platform Executive Report - Confidential Document
        </Text>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default ExecutivePDFTemplate;