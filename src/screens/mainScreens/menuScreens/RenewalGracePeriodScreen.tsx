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
import Ionicons from '@react-native-vector-icons/ionicons';

export interface RenewalGracePeriodScreenProps {
  onBack?: () => void;
  onRetryPayment?: () => void;
  onChangePaymentMethod?: () => void;
  deadlineDate?: string;
  planName?: string;
  priceText?: string;
  daysLeft?: number;
  lastAttemptDate?: string;
  paymentMethod?: string;
  failureReason?: string;
}

export const RenewalGracePeriodScreen: React.FC<RenewalGracePeriodScreenProps> = ({
  onBack,
  onRetryPayment,
  onChangePaymentMethod,
  deadlineDate = 'Fri, 6 Nov',
  planName = 'HOSYNQ PREMIUM',
  priceText = '₹[price] a month',
  daysLeft = 7,
  lastAttemptDate = 'Fri, 30 Oct',
  paymentMethod = 'UPI · priya@okbank',
  failureReason = 'Not enough balance',
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

        <Text style={styles.topBarTitle}>Subscription</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <View style={styles.warningHeaderRow}>
            <View style={styles.warningTitleGroup}>
              <Feather
                name="alert-circle"
                size={18}
                color="#F06A6A"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.warningTitle}>Renewal didn't go through</Text>
            </View>
            <TouchableOpacity
              onPress={onRetryPayment}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Retry"
            >
              <Text style={styles.retryLinkText}>Retry</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.warningSubtitle}>
            Update your payment by {deadlineDate} to keep Premium. This banner also shows on Home.
          </Text>
        </View>

        {/* Plan Due Card */}
        <View style={styles.planCard}>
          <View style={styles.planHeaderRow}>
            <View style={styles.planBadgeGroup}>
              <Ionicons
                name="sparkles"
                size={14}
                color="#F0913A"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.planBadgeText}>{planName}</Text>
            </View>
            <View style={styles.dueBadge}>
              <Text style={styles.dueBadgeText}>Payment due</Text>
            </View>
          </View>

          <Text style={styles.priceText}>{priceText}</Text>
          <Text style={styles.gracePeriodText}>
            Grace period · {daysLeft} days left · Everything still works
          </Text>
        </View>

        {/* Attempt Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tried on</Text>
            <Text style={styles.detailValue}>
              {lastAttemptDate} · {paymentMethod}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.reasonRow}>
            <View style={styles.reasonLeft}>
              <Text style={styles.reasonLabel}>Reason</Text>
              <Text style={styles.reasonValue}>{failureReason}</Text>
            </View>
            <Feather name="alert-circle" size={18} color="#F0913A" />
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
          style={styles.retryBtn}
          onPress={onRetryPayment}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Retry payment"
        >
          <Text style={styles.retryBtnText}>Retry payment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changeMethodBtn}
          onPress={onChangePaymentMethod}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Change payment method"
        >
          <Text style={styles.changeMethodBtnText}>Change payment method</Text>
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
  topBarRightPlaceholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  warningBanner: {
    backgroundColor: '#251824',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(240, 106, 106, 0.4)',
    padding: 16,
    marginBottom: 16,
  },
  warningHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  warningTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#F06A6A',
  },
  retryLinkText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#F0913A',
  },
  warningSubtitle: {
    fontSize: 13,
    color: '#C8D1DC',
    lineHeight: 18,
  },
  planCard: {
    backgroundColor: '#1A2B47',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F0913A',
    padding: 18,
    marginBottom: 16,
  },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#F0913A',
    letterSpacing: 1.1,
  },
  dueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#F06A6A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueBadgeText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: '#F06A6A',
  },
  priceText: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  gracePeriodText: {
    fontSize: 13,
    color: '#8A97AB',
  },
  detailsCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailRow: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  reasonRow: {
    backgroundColor: '#2A2418',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasonLeft: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 12,
    color: '#F6C08E',
    marginBottom: 4,
  },
  reasonValue: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0913A',
  },
  bottomContainer: {
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  retryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  retryBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  changeMethodBtn: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#3A4556',
    backgroundColor: '#122440',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  changeMethodBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
});
