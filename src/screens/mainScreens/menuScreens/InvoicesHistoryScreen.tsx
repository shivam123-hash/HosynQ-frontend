import React, { useState } from 'react';
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
import Ionicons from '@react-native-vector-icons/ionicons';

export interface InvoiceItem {
  id: string;
  invoiceNumber?: string;
  title: string;
  dateText: string;
  amountText?: string;
  status?: 'paid' | 'failed' | 'event';
}

export interface InvoicesHistoryScreenProps {
  onBack?: () => void;
  onSelectInvoice?: (invoiceId: string) => void;
  onBillingDetails?: () => void;
}

export const InvoicesHistoryScreen: React.FC<InvoicesHistoryScreenProps> = ({
  onBack,
  onSelectInvoice,
  onBillingDetails,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025'>('2026');

  const invoices2026: InvoiceItem[] = [
    {
      id: 'failed-1',
      title: 'Payment failed',
      dateText: 'Fri, 30 Oct 2026 · Retry pending',
      status: 'failed',
    },
    {
      id: 'HSQ-INV-0012',
      invoiceNumber: 'HSQ-INV-0012',
      title: 'HSQ-INV-0012',
      dateText: 'Premium Monthly · 30 Sep 2026',
      amountText: '₹299',
      status: 'paid',
    },
    {
      id: 'HSQ-INV-0011',
      invoiceNumber: 'HSQ-INV-0011',
      title: 'HSQ-INV-0011',
      dateText: 'Premium Monthly · 30 Aug 2026',
      amountText: '₹299',
      status: 'paid',
    },
    {
      id: 'HSQ-INV-0010',
      invoiceNumber: 'HSQ-INV-0010',
      title: 'HSQ-INV-0010',
      dateText: 'Premium Monthly · 30 Jul 2026',
      amountText: '₹299',
      status: 'paid',
    },
    {
      id: 'trial-start',
      title: 'Free trial started',
      dateText: '30 Jun 2026',
      amountText: '₹0',
      status: 'event',
    },
  ];

  const invoices = selectedYear === '2026' ? invoices2026 : [];

  const renderIconBox = (item: InvoiceItem) => {
    if (item.status === 'failed') {
      return (
        <View style={styles.iconBoxFailed}>
          <Feather name="alert-circle" size={20} color="#F06A6A" />
        </View>
      );
    }
    if (item.status === 'event') {
      return (
        <View style={styles.iconBox}>
          <Ionicons name="sparkles-outline" size={18} color="#3A4556" />
        </View>
      );
    }
    return (
      <View style={styles.iconBox}>
        <Ionicons name="receipt-outline" size={20} color="#3A4556" />
      </View>
    );
  };

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
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Invoices and history</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      {/* Year Filter Chips */}
      <View style={styles.yearChips}>
        <TouchableOpacity
          style={[
            styles.yearChip,
            selectedYear === '2026' ? styles.yearChipActive : styles.yearChipInactive,
          ]}
          onPress={() => setSelectedYear('2026')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Year 2026"
        >
          <Text
            style={[
              styles.yearChipText,
              selectedYear === '2026' ? styles.yearChipTextActive : styles.yearChipTextInactive,
            ]}
          >
            2026
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.yearChip,
            selectedYear === '2025' ? styles.yearChipActive : styles.yearChipInactive,
          ]}
          onPress={() => setSelectedYear('2025')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Year 2025"
        >
          <Text
            style={[
              styles.yearChipText,
              selectedYear === '2025' ? styles.yearChipTextActive : styles.yearChipTextInactive,
            ]}
          >
            2025
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Invoice List Card */}
        <View style={styles.card}>
          {invoices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No invoices for {selectedYear}</Text>
            </View>
          ) : (
            invoices.map((item, index) => {
              const isClickable = item.status === 'paid' || item.status === 'failed';
              return (
                <React.Fragment key={item.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={styles.invoiceRow}
                    disabled={!isClickable}
                    onPress={() => isClickable && onSelectInvoice?.(item.id)}
                    activeOpacity={0.7}
                    accessibilityRole={isClickable ? 'button' : 'none'}
                    accessibilityLabel={item.title}
                  >
                    {renderIconBox(item)}

                    <View style={styles.invoiceCenter}>
                      <Text style={styles.invoiceTitle}>{item.title}</Text>
                      <Text style={styles.invoiceDate}>{item.dateText}</Text>
                    </View>

                    <View style={styles.invoiceRight}>
                      {item.status === 'failed' && (
                        <View style={styles.failedBadge}>
                          <Text style={styles.failedBadgeText}>Failed</Text>
                        </View>
                      )}
                      {item.amountText && (
                        <Text style={styles.invoiceAmount}>{item.amountText}</Text>
                      )}
                      {isClickable && (
                        <Feather
                          name="chevron-right"
                          size={18}
                          color="#8A97AB"
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })
          )}
        </View>

        {/* Billing Details Entry Card */}
        <TouchableOpacity
          style={styles.billingDetailsCard}
          onPress={onBillingDetails}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Billing details Name and GSTIN on invoices"
        >
          <View style={styles.iconBox}>
            <Ionicons name="id-card-outline" size={20} color="#3A4556" />
          </View>
          <View style={styles.billingDetailsCenter}>
            <Text style={styles.billingDetailsTitle}>Billing details</Text>
            <Text style={styles.billingDetailsSubtitle}>
              Name and GSTIN on invoices
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color="#8A97AB" />
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 12,
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
  },
  topBarRightPlaceholder: {
    width: 44,
  },
  yearChips: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
    gap: 10,
  },
  yearChip: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearChipActive: {
    backgroundColor: '#F0913A',
  },
  yearChipInactive: {
    backgroundColor: '#0B1A2F',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  yearChipText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
  yearChipTextActive: {
    color: '#0B1A2F',
  },
  yearChipTextInactive: {
    color: '#8A97AB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: 'transparent',
  },
  iconBoxFailed: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F06A6A',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  invoiceCenter: {
    flex: 1,
  },
  invoiceTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 13,
    color: '#8A97AB',
  },
  invoiceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  failedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#F06A6A',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  failedBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F06A6A',
  },
  invoiceAmount: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1A293E',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8A97AB',
  },
  billingDetailsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
  },
  billingDetailsCenter: {
    flex: 1,
  },
  billingDetailsTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  billingDetailsSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
});
