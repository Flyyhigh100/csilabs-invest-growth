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
  revenueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  revenueCard: {
    width: '32%',
    marginRight: '2%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  cardLabel: {
    fontSize: 9,
    color: '#0369a1',
    marginBottom: 3,
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0c4a6e',
  },
  cardChange: {
    fontSize: 8,
    color: '#059669',
    marginTop: 2,
  },
  tokenCard: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  tokenLabel: {
    fontSize: 9,
    color: '#d97706',
    marginBottom: 3,
    fontWeight: 'bold',
  },
  tokenValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
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
  highlight: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginBottom: 15,
  },
  highlightText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: 'bold',
  },
});

interface ShareholderPDFTemplateProps {
  data: {
    generatedAt: string;
    summary: {
      totalRevenue: number;
      monthlyGrowth: number;
      quarterlyRevenue: number;
      yearlyRevenue: number;
      totalTokensDistributed: number;
      averageTokenPrice: number;
      marketCap: number;
    };
    revenueBreakdown: {
      cryptoPayments: number;
      creditCardPayments: number;
      bankTransfers: number;
    };
    tokenDistribution: {
      circulatingSupply: number;
      totalSupply: number;
      distributionPercentage: number;
    };
  };
}

const ShareholderPDFTemplate: React.FC<ShareholderPDFTemplateProps> = ({ data }) => {
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
            <Text style={styles.title}>Shareholder Financial Report</Text>
            <Text style={styles.subtitle}>CSI Token Platform - Financial Analysis & Token Distribution</Text>
            <Text style={styles.date}>Generated on {formatDate(data.generatedAt)}</Text>
          </View>
        </View>

        {/* Executive Summary Highlight */}
        <View style={styles.highlight}>
          <Text style={styles.highlightText}>
            Revenue Growth: +{data.summary.monthlyGrowth}% this month | 
            Tokens Distributed: {formatTokens(data.summary.totalTokensDistributed)} | 
            Market Cap: {formatCurrency(data.summary.marketCap)}
          </Text>
        </View>

        {/* Revenue Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Analysis</Text>
          <View style={styles.revenueGrid}>
            <View style={styles.revenueCard}>
              <Text style={styles.cardLabel}>Total Revenue</Text>
              <Text style={styles.cardValue}>{formatCurrency(data.summary.totalRevenue)}</Text>
              <Text style={styles.cardChange}>All-time cumulative</Text>
            </View>
            <View style={styles.revenueCard}>
              <Text style={styles.cardLabel}>Quarterly Revenue</Text>
              <Text style={styles.cardValue}>{formatCurrency(data.summary.quarterlyRevenue)}</Text>
              <Text style={styles.cardChange}>Current quarter</Text>
            </View>
            <View style={styles.revenueCard}>
              <Text style={styles.cardLabel}>Monthly Growth</Text>
              <Text style={styles.cardValue}>+{data.summary.monthlyGrowth}%</Text>
              <Text style={styles.cardChange}>Month-over-month</Text>
            </View>
          </View>
        </View>

        {/* Payment Method Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue by Payment Method</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Payment Method</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Revenue</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Percentage</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Cryptocurrency</Text>
              <Text style={styles.tableCell}>{formatCurrency(data.revenueBreakdown.cryptoPayments)}</Text>
              <Text style={styles.tableCell}>
                {((data.revenueBreakdown.cryptoPayments / data.summary.totalRevenue) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Credit/Debit Cards</Text>
              <Text style={styles.tableCell}>{formatCurrency(data.revenueBreakdown.creditCardPayments)}</Text>
              <Text style={styles.tableCell}>
                {((data.revenueBreakdown.creditCardPayments / data.summary.totalRevenue) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Bank Transfers</Text>
              <Text style={styles.tableCell}>{formatCurrency(data.revenueBreakdown.bankTransfers)}</Text>
              <Text style={styles.tableCell}>
                {((data.revenueBreakdown.bankTransfers / data.summary.totalRevenue) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Token Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token Distribution Analysis</Text>
          <View style={styles.revenueGrid}>
            <View style={styles.tokenCard}>
              <Text style={styles.tokenLabel}>Circulating Supply</Text>
              <Text style={styles.tokenValue}>{formatTokens(data.tokenDistribution.circulatingSupply)}</Text>
            </View>
            <View style={styles.tokenCard}>
              <Text style={styles.tokenLabel}>Total Supply</Text>
              <Text style={styles.tokenValue}>{formatTokens(data.tokenDistribution.totalSupply)}</Text>
            </View>
            <View style={styles.tokenCard}>
              <Text style={styles.tokenLabel}>Distribution Rate</Text>
              <Text style={styles.tokenValue}>{data.tokenDistribution.distributionPercentage.toFixed(1)}%</Text>
            </View>
            <View style={styles.tokenCard}>
              <Text style={styles.tokenLabel}>Average Token Price</Text>
              <Text style={styles.tokenValue}>{formatCurrency(data.summary.averageTokenPrice)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          CSI Token Platform Shareholder Report - Confidential Financial Document
        </Text>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default ShareholderPDFTemplate;