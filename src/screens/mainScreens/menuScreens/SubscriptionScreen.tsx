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

export interface SubscriptionScreenProps {
  onBack?: () => void;
  onChangePlan?: () => void;
  onPaymentMethod?: () => void;
  onInvoicesHistory?: () => void;
  onCancelSubscription?: () => void;
  planName?: string;
  billingCycle?: string;
  price?: string;
  renewalDate?: string;
  paymentMethodText?: string;
}

const CrownIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 17,
  color = '#F0923A',
}) => {
  const s = size / 18;
  const stroke = Math.max(1.4, 1.5 * s);

  const pts: [number, number, number, number, string][] = [
    // Left outer edge
    [2.5 * s, 12 * s, 1.5 * s, 4.5 * s, 'l-outer'],
    // Left peak down to left valley
    [1.5 * s, 4.5 * s, 6 * s, 7.5 * s, 'l-inner'],
    // Left valley up to center peak
    [6 * s, 7.5 * s, 9 * s, 1.5 * s, 'c-left'],
    // Center peak down to right valley
    [9 * s, 1.5 * s, 12 * s, 7.5 * s, 'c-right'],
    // Right valley up to right peak
    [12 * s, 7.5 * s, 16.5 * s, 4.5 * s, 'r-inner'],
    // Right peak down to right outer base
    [16.5 * s, 4.5 * s, 15.5 * s, 12 * s, 'r-outer'],
    // Base horizontal bar
    [2 * s, 12 * s, 16 * s, 12 * s, 'base'],
  ];

  return (
    <View
      style={{
        width: 18 * s,
        height: 14 * s,
        marginRight: 8,
        position: 'relative',
      }}
    >
      {pts.map(([x1, y1, x2, y2, key]) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={key}
            style={{
              position: 'absolute',
              left: (x1 + x2) / 2 - len / 2,
              top: (y1 + y2) / 2 - stroke / 2,
              width: len,
              height: stroke,
              backgroundColor: color,
              borderRadius: stroke / 2,
              transform: [{ rotate: `${deg}deg` }],
            }}
          />
        );
      })}
    </View>
  );
};

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  onBack,
  onChangePlan,
  onPaymentMethod,
  onInvoicesHistory,
  onCancelSubscription,
  planName = 'HOSYNQ PREMIUM',
  billingCycle = 'Annual',
  price = '₹2500 a year',
  renewalDate = 'Tue, 12 Oct 2027',
  paymentMethodText = 'UPI AutoPay',
}) => {
  const insets = useSafeAreaInsets();

  const features = [
    'Daily, weekly and monthly AI brief',
    'Scan bills and circulars',
    'Family Vault with renewal reminders',
    'Place reminders in Compass',
    'Up to [10] family members',
  ];

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

        <Text style={styles.topBarTitle}>Subscription</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Card (Highlighted with orange border) */}
        <View style={styles.planCard}>
          <View style={styles.planHeaderRow}>
            <View style={styles.planBadge}>
              <CrownIcon size={16} color="#F0923A" />
              <Text style={styles.planBadgeText}>{planName}</Text>
            </View>
            <View style={styles.cycleBadge}>
              <Text style={styles.cycleBadgeText}>{billingCycle}</Text>
            </View>
          </View>

          <Text style={styles.priceText}>{price}</Text>
          <Text style={styles.renewsText}>
            Renews {renewalDate} · {paymentMethodText}
          </Text>

          <View style={styles.planActionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onChangePlan}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Change plan"
            >
              <Text style={styles.actionBtnText}>Change plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onPaymentMethod}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Payment method"
            >
              <Text style={styles.actionBtnText}>Payment method</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: WHAT YOUR FAMILY GETS */}
        <Text style={styles.sectionHeading}>WHAT YOUR FAMILY GETS</Text>

        {/* Features Card */}
        <View style={styles.featuresCard}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Feather
                name="check"
                size={16}
                color="#6FD9A6"
                style={{ marginRight: 14 }}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Combined Navigation Card (Invoices & Cancel Subscription) */}
        <View style={styles.navCard}>
          {/* Row 1: Invoices and history */}
          <TouchableOpacity
            style={styles.navRow}
            onPress={onInvoicesHistory}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Invoices and history"
          >
            <View style={styles.navIconBox}>
              <Feather name="file-text" size={18} color="#3A4555" />
            </View>
            <Text style={styles.navRowTitle}>Invoices and history</Text>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 2: Cancel subscription */}
          <TouchableOpacity
            style={styles.navRow}
            onPress={onCancelSubscription}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Cancel subscription"
          >
            <View style={[styles.navIconBox, styles.cancelIconBox]}>
              <Feather name="x" size={18} color="#F06A6A" />
            </View>
            <Text style={[styles.navRowTitle, styles.cancelRowTitle]}>
              Cancel subscription
            </Text>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  planCard: {
    backgroundColor: '#1A2B47',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F0923A',
    padding: 20,
    marginBottom: 24,
  },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#F0923A',
    letterSpacing: 1.2,
  },
  cycleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F0923A',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#F0923A',
  },
  priceText: {
    fontSize: 28,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  renewsText: {
    fontSize: 13,
    color: '#8A97AB',
    marginBottom: 18,
  },
  planActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#3A4555',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  featuresCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 20,
  },
  navCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  navIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#3A4555',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cancelIconBox: {
    borderColor: '#F06A6A',
  },
  navRowTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  cancelRowTitle: {
    color: '#F06A6A',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
});
