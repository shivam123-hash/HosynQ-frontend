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

export type ConsentFilter = 'all' | 'active' | 'withdrawn';

export interface ConsentItem {
  id: string;
  title: string;
  subtitle: string;
  status: 'active' | 'withdrawn';
  canWithdraw?: boolean;
}

const INITIAL_CONSENTS: ConsentItem[] = [
  {
    id: '1',
    title: 'Terms and Privacy Notice v1.2',
    subtitle: 'Accepted 30 Oct 2026, 9:14 AM',
    status: 'active',
    canWithdraw: false,
  },
  {
    id: '2',
    title: 'Location sharing',
    subtitle: 'Given 12 Oct 2026',
    status: 'active',
    canWithdraw: true,
  },
  {
    id: '3',
    title: 'Aarav’s health and ID details',
    subtitle: 'Given as his parent · 28 Oct 2026',
    status: 'active',
    canWithdraw: true,
  },
  {
    id: '4',
    title: 'HosynQ reads your documents',
    subtitle: 'Given 12 Oct 2026',
    status: 'active',
    canWithdraw: true,
  },
  {
    id: '5',
    title: 'Offers and updates',
    subtitle: 'Withdrawn 20 Oct 2026',
    status: 'withdrawn',
    canWithdraw: false,
  },
];

export interface ConsentLedgerScreenProps {
  onBack?: () => void;
  onWithdrawConsent?: (consent: ConsentItem) => void;
  onDownloadLedger?: () => void;
}

export const ConsentLedgerScreen: React.FC<ConsentLedgerScreenProps> = ({
  onBack,
  onWithdrawConsent,
  onDownloadLedger,
}) => {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<ConsentFilter>('all');
  const [consents, setConsents] = useState<ConsentItem[]>(INITIAL_CONSENTS);

  const filteredConsents = consents.filter((c) => {
    if (filter === 'active') return c.status === 'active';
    if (filter === 'withdrawn') return c.status === 'withdrawn';
    return true;
  });

  const handleWithdraw = (item: ConsentItem) => {
    setConsents((prev) =>
      prev.map((c) =>
        c.id === item.id
          ? {
              ...c,
              status: 'withdrawn',
              canWithdraw: false,
              subtitle: `Withdrawn today`,
            }
          : c
      )
    );
    onWithdrawConsent?.(item);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Consent ledger</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerSubtitle}>
          A record of every consent you’ve given. Withdraw any of them here.
        </Text>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'all' && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'active' && styles.filterChipActive]}
            onPress={() => setFilter('active')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'active' && styles.filterChipTextActive,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'withdrawn' && styles.filterChipActive]}
            onPress={() => setFilter('withdrawn')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'withdrawn' && styles.filterChipTextActive,
              ]}
            >
              Withdrawn
            </Text>
          </TouchableOpacity>
        </View>

        {/* Consents List Card */}
        <View style={styles.card}>
          {filteredConsents.map((item, idx) => {
            return (
              <React.Fragment key={item.id}>
                {idx > 0 && <View style={styles.divider} />}
                <View style={styles.row}>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                  </View>

                  {item.canWithdraw ? (
                    <TouchableOpacity
                      onPress={() => handleWithdraw(item)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Withdraw ${item.title}`}
                    >
                      <Text style={styles.withdrawBtnText}>Withdraw</Text>
                    </TouchableOpacity>
                  ) : item.status === 'active' ? (
                    <View style={styles.badgeActive}>
                      <Text style={styles.badgeActiveText}>Active</Text>
                    </View>
                  ) : (
                    <View style={styles.badgeWithdrawn}>
                      <Text style={styles.badgeWithdrawnText}>Withdrawn</Text>
                    </View>
                  )}
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Bottom Download Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={onDownloadLedger}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Download ledger"
        >
          <Feather name="download" size={18} color="#F0923A" style={{ marginRight: 8 }} />
          <Text style={styles.downloadBtnText}>Download ledger</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8A97AB',
    lineHeight: 20,
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3A4555',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#F0923A',
    borderColor: '#F0923A',
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#C8D1DC',
  },
  filterChipTextActive: {
    color: '#0A1320',
    fontFamily: 'Roboto-Bold',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowInfo: {
    flex: 1,
    marginRight: 14,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  withdrawBtnText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#F0923A',
  },
  badgeActive: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#6FD9A6',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActiveText: {
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
    color: '#6FD9A6',
  },
  badgeWithdrawn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3A4555',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWithdrawnText: {
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
    color: '#C8D1DC',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginLeft: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1D314E',
  },
  downloadBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3A4555',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
});
