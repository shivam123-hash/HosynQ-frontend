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

export interface PlansTrialScreenProps {
  onBack?: () => void;
  onStartFreeTrial?: () => void;
  onSelectPlan?: (cycle: 'monthly' | 'annual') => void;
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

export const PlansTrialScreen: React.FC<PlansTrialScreenProps> = ({
  onBack,
  onStartFreeTrial,
  onSelectPlan,
}) => {
  const insets = useSafeAreaInsets();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const premiumFeatures = [
    'Daily, weekly and monthly AI brief',
    'Scan bills and circulars',
    'Family Vault with renewal reminders',
    'Place reminders in Compass',
  ];

  const freeFeatures = [
    'Tasks, lists and calendar',
    'Family chat and Pulse',
  ];

  const handleCycleSelect = (cycle: 'monthly' | 'annual') => {
    setBillingCycle(cycle);
    onSelectPlan?.(cycle);
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

        <Text style={styles.topBarTitle}>Plans</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Billing Cycle Toggle */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              billingCycle === 'monthly' && styles.segmentBtnActive,
            ]}
            onPress={() => handleCycleSelect('monthly')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Monthly plan"
          >
            <Text
              style={[
                styles.segmentText,
                billingCycle === 'monthly' && styles.segmentTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              billingCycle === 'annual' && styles.segmentBtnActive,
            ]}
            onPress={() => handleCycleSelect('annual')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Annual plan Save 20%"
          >
            <Text
              style={[
                styles.segmentText,
                billingCycle === 'annual' && styles.segmentTextActive,
              ]}
            >
              Annual • Save 20%
            </Text>
          </TouchableOpacity>
        </View>

        {/* Premium Plan Card */}
        <View style={styles.premiumCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.planBadge}>
              <CrownIcon size={16} color="#F0923A" />
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedBadgeText}>Recommended</Text>
            </View>
          </View>

          <Text style={styles.premiumPrice}>
            {billingCycle === 'annual' ? '₹2500 a year' : '₹299 a month'}
          </Text>
          <Text style={styles.premiumSubtitle}>
            {billingCycle === 'annual'
              ? 'About ₹208 a month · Whole family'
              : 'Billed monthly · Whole family'}
          </Text>

          <View style={styles.featuresList}>
            {premiumFeatures.map((feat, i) => (
              <View key={i} style={styles.featureItem}>
                <Feather
                  name="check"
                  size={16}
                  color="#6FD9A6"
                  style={styles.featureCheckIcon}
                />
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Free Plan Card */}
        <View style={styles.freeCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.freeBadgeText}>FREE</Text>
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          </View>

          <Text style={styles.freePrice}>₹0</Text>

          <View style={styles.featuresList}>
            {freeFeatures.map((feat, i) => (
              <View key={i} style={styles.featureItem}>
                <Feather
                  name="check"
                  size={16}
                  color="#6E7B8E"
                  style={styles.featureCheckIcon}
                />
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <Text style={styles.bottomCaption}>
          Free for 14 days, then {billingCycle === 'annual' ? '₹2500 a year' : '₹299 a month'}. Cancel any time.
        </Text>
        <TouchableOpacity
          style={styles.trialBtn}
          onPress={onStartFreeTrial}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Start 14-day free trial"
        >
          <Text style={styles.trialBtnText}>Start 14-day free trial</Text>
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
    fontWeight: '700',
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
  segmentedContainer: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#3A4555',
    backgroundColor: 'transparent',
    padding: 4,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#F0923A',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C8D1DC',
  },
  segmentTextActive: {
    color: '#0A1320',
    fontWeight: '700',
  },
  premiumCard: {
    backgroundColor: '#1A2B47',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F0923A',
    padding: 20,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F0923A',
    letterSpacing: 1.2,
  },
  recommendedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F0923A',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F0923A',
  },
  premiumPrice: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    marginBottom: 18,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureCheckIcon: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 20,
  },
  freeCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 20,
    marginBottom: 24,
  },
  freeBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A97AB',
    letterSpacing: 1.2,
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2B394E',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  freePrice: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
  },
  bottomCaption: {
    fontSize: 12,
    color: '#8A97AB',
    textAlign: 'center',
    marginBottom: 10,
  },
  trialBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
