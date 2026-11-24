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
import { WhatChangesOnFreeModal } from './WhatChangesOnFreeModal';

export interface UpgradeDowngradeScreenProps {
  onBack?: () => void;
  onConfirmPlanChange?: (plan: 'annual' | 'monthly' | 'free') => void;
  currentPlan?: 'monthly' | 'annual' | 'free';
  annualPriceText?: string;
  monthlyPriceText?: string;
}

const CrownIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = '#8A97AB',
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

export const UpgradeDowngradeScreen: React.FC<UpgradeDowngradeScreenProps> = ({
  onBack,
  onConfirmPlanChange,
  currentPlan = 'monthly',
  annualPriceText = 'Save 20% · ₹2500 a year',
  monthlyPriceText = '₹299 a month',
}) => {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly' | 'free'>('annual');
  const [showWhatChangesModal, setShowWhatChangesModal] = useState(false);

  const getButtonTitle = () => {
    if (selectedPlan === 'annual') return 'Switch to Annual';
    if (selectedPlan === 'free') return 'Switch to Free';
    return 'Keep Current Plan';
  };

  const handleConfirmPress = () => {
    if (selectedPlan === 'free') {
      setShowWhatChangesModal(true);
    } else {
      onConfirmPlanChange?.(selectedPlan);
    }
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

        <Text style={styles.topBarTitle}>Change plan</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Current Plan Banner */}
        <View style={styles.currentPlanBanner}>
          <CrownIcon size={18} color="#8A97AB" />
          <Text style={styles.currentPlanBannerText}>
            You’re on Premium {currentPlan === 'monthly' ? 'Monthly' : currentPlan === 'annual' ? 'Annual' : 'Free'}.
          </Text>
        </View>

        {/* Plan 1: Premium Annual */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'annual' ? styles.planCardSelected : styles.planCardUnselected,
          ]}
          onPress={() => setSelectedPlan('annual')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Premium Annual plan"
        >
          <View style={styles.planCardHeader}>
            <View style={styles.planCardTitleRow}>
              <Text style={styles.planName}>Premium Annual</Text>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedBadgeText}>Recommended</Text>
              </View>
            </View>
            <View style={[styles.radioOuter, selectedPlan === 'annual' && styles.radioOuterSelected]}>
              {selectedPlan === 'annual' && <View style={styles.radioInner} />}
            </View>
          </View>
          <Text style={styles.planSubtitle}>{annualPriceText}</Text>
        </TouchableOpacity>

        {/* Plan 2: Premium Monthly */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'monthly' ? styles.planCardSelected : styles.planCardUnselected,
          ]}
          onPress={() => setSelectedPlan('monthly')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Premium Monthly plan"
        >
          <View style={styles.planCardHeader}>
            <View style={styles.planCardTitleRow}>
              <Text style={styles.planName}>Premium Monthly</Text>
              {currentPlan === 'monthly' && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </View>
            <View style={[styles.radioOuter, selectedPlan === 'monthly' && styles.radioOuterSelected]}>
              {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
            </View>
          </View>
          <Text style={styles.planSubtitle}>{monthlyPriceText}</Text>
        </TouchableOpacity>

        {/* Plan 3: Free */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'free' ? styles.planCardSelected : styles.planCardUnselected,
          ]}
          onPress={() => setSelectedPlan('free')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Free plan"
        >
          <View style={styles.planCardHeader}>
            <View style={styles.planCardTitleRow}>
              <Text style={styles.planName}>Free</Text>
              {currentPlan === 'free' && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </View>
            <View style={[styles.radioOuter, selectedPlan === 'free' && styles.radioOuterSelected]}>
              {selectedPlan === 'free' && <View style={styles.radioInner} />}
            </View>
          </View>
          <Text style={styles.planSubtitle}>
            Tasks, lists, calendar, chat and Pulse
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          Switching to Annual charges the difference today. Switching to Free starts at the end of this month.
        </Text>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirmPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={getButtonTitle()}
        >
          <Text style={styles.confirmBtnText}>{getButtonTitle()}</Text>
        </TouchableOpacity>
      </View>

      {/* What Changes on Free Modal Dialog */}
      <WhatChangesOnFreeModal
        visible={showWhatChangesModal}
        onClose={() => setShowWhatChangesModal(false)}
        onKeepPremium={() => setShowWhatChangesModal(false)}
        onConfirmSwitchToFree={() => {
          setShowWhatChangesModal(false);
          onConfirmPlanChange?.('free');
        }}
      />
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
  currentPlanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  currentPlanBannerText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  planCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  planCardSelected: {
    backgroundColor: '#1A2B47',
    borderWidth: 2,
    borderColor: '#F0913A',
  },
  planCardUnselected: {
    backgroundColor: '#0B1A2F',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planName: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  recommendedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0913A',
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#344051',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#C8D1DC',
  },
  planSubtitle: {
    fontSize: 14,
    color: '#8A97AB',
    marginTop: 2,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#F0913A',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F0913A',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#8A97AB',
    lineHeight: 20,
    marginTop: 14,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1A293E',
  },
  confirmBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
});
