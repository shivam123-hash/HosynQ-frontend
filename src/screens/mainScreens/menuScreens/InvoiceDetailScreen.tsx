import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface InvoiceDetailScreenProps {
  onBack?: () => void;
  onShare?: () => void;
  onDownloadPdf?: () => void;
  onEmailCopy?: () => void;
  invoiceNumber?: string;
  billedCompany?: string;
  invoiceDate?: string;
  planName?: string;
  baseAmount?: string;
  gstAmount?: string;
  totalAmount?: string;
  billedToName?: string;
  paymentMethod?: string;
  transactionId?: string;
  billingPeriod?: string;
}

export const InvoiceDetailScreen: React.FC<InvoiceDetailScreenProps> = ({
  onBack,
  onShare,
  onDownloadPdf,
  onEmailCopy,
  invoiceNumber = 'HSQ-INV-0012',
  billedCompany = 'ROOV Platforms',
  invoiceDate = '30 Sep 2026',
  planName = 'HosynQ Premium · Monthly',
  baseAmount = '₹253.39',
  gstAmount = '₹45.61',
  totalAmount = '₹299.00',
  billedToName = 'Priya Sharma · The Sharma Family',
  paymentMethod = 'UPI AutoPay · priya@okbank',
  transactionId = 'pay_••••8421',
  billingPeriod = '30 Sep to 29 Oct 2026',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Invoice</Text>

        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onShare || onDownloadPdf}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Share invoice"
        >
          <Feather name="upload" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Breakdown Card */}
        <View style={styles.card}>
          <View style={styles.invoiceHeaderRow}>
            <View>
              <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
              <Text style={styles.companySubtext}>
                {billedCompany} · {invoiceDate}
              </Text>
            </View>
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>Paid</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.tableRow}>
            <Text style={styles.itemTitle}>{planName}</Text>
            <Text style={styles.itemValue}>{baseAmount}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.itemTitle}>GST (18%)</Text>
            <Text style={styles.itemValue}>{gstAmount}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total paid</Text>
            <Text style={styles.totalValue}>{totalAmount}</Text>
          </View>
        </View>

        {/* Card 2: Billed Metadata */}
        <View style={styles.card}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Billed to</Text>
            <Text style={styles.metaValue}>{billedToName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Paid with</Text>
            <Text style={styles.metaValue}>{paymentMethod}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Transaction ID</Text>
            <Text style={styles.metaValue}>{transactionId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Billing period</Text>
            <Text style={styles.metaValue}>{billingPeriod}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Area */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={onDownloadPdf}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Download PDF"
        >
          <Feather name="download" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.downloadBtnText}>Download PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emailBtn}
          onPress={onEmailCopy}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Email me a copy"
        >
          <Text style={styles.emailBtnText}>Email me a copy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#0B1A2F',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#233348',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  topBarTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  invoiceNumber: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  companySubtext: {
    fontSize: 13,
    color: '#8A97AB',
  },
  paidBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#58AC8C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#58AC8C',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginVertical: 12,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemTitle: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  itemValue: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  metaRow: {
    paddingVertical: 10,
  },
  metaLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  bottomContainer: {
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  downloadBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0913A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  emailBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
    paddingBottom: 4,
  },
  emailBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0913A',
  },
});
