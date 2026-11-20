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
import { PaymentGatewayModal } from './PaymentGatewayModal';

export interface StartFreeTrialScreenProps {
  onBack?: () => void;
  onStartTrial?: () => void;
  onNotNow?: () => void;
  familyName?: string;
  trialDays?: number;
  planPrice?: string;
}

const CrownIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
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

export const StartFreeTrialScreen: React.FC<StartFreeTrialScreenProps> = ({
  onBack,
  onStartTrial,
  onNotNow,
  familyName = 'The Sharma Family',
  trialDays = 14,
  planPrice = '₹2500 a year',
}) => {
  const insets = useSafeAreaInsets();
  const [showGateway, setShowGateway] = useState(false);

  const handleStartTrialPress = () => {
    setShowGateway(true);
  };

  const handleSelectMethod = (_method: 'upi' | 'card' | 'netbanking') => {
    setShowGateway(false);
    onStartTrial?.();
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack || onNotNow}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Crown Badge */}
        <View style={styles.heroBadgeContainer}>
          <View style={styles.heroOuterRing}>
            <View style={styles.heroInnerCircle}>
              <CrownIcon size={30} color="#F0923A" />
            </View>
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>Try Premium free for {trialDays}{'\n'}days</Text>
        <Text style={styles.subtitle}>
          Everyone in {familyName} gets Premium.{'\n'}One free trial per family.
        </Text>

        {/* Steps Card */}
        <View style={styles.stepsCard}>
          {/* Step 1: Today */}
          <View style={styles.stepRow}>
            <View style={[styles.stepIconBox, styles.orangeIconBox]}>
              <Ionicons name="sparkles-outline" size={20} color="#F0923A" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Today</Text>
              <Text style={styles.stepSubtitle}>
                Full Premium for the whole family
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Step 2: Day 12 */}
          <View style={styles.stepRow}>
            <View style={[styles.stepIconBox, styles.purpleIconBox]}>
              <Feather name="bell" size={20} color="#A884F0" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Day {trialDays - 2}</Text>
              <Text style={styles.stepSubtitle}>
                We remind you before the trial ends
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Step 3: Day 14 */}
          <View style={styles.stepRow}>
            <View style={[styles.stepIconBox, styles.orangeIconBox]}>
              <CrownIcon size={18} color="#F0923A" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Day {trialDays}</Text>
              <Text style={styles.stepSubtitle}>
                Premium starts at {planPrice}. Cancel before then to pay nothing.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Area */}
      <View
        style={[
          styles.bottomSection,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <Text style={styles.captionText}>
          You'll set up AutoPay next. Nothing is charged today.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleStartTrialPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Start free trial"
        >
          <Text style={styles.primaryBtnText}>Start free trial</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onNotNow || onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Not now"
        >
          <Text style={styles.secondaryBtnText}>Not now</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Gateway Bottom Sheet */}
      <PaymentGatewayModal
        visible={showGateway}
        onClose={() => setShowGateway(false)}
        onSelectMethod={handleSelectMethod}
        planName="HosynQ Premium"
        priceText={`${planPrice} every year`}
        firstChargeDate="26 Nov 2026"
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
    paddingHorizontal: 20,
    paddingBottom: 4,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  heroBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  heroOuterRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: '#1F3352',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInnerCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    backgroundColor: '#122440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  stepsCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  stepIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  orangeIconBox: {
    borderColor: '#F0923A',
  },
  purpleIconBox: {
    borderColor: '#A884F0',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    lineHeight: 18,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A293E',
    backgroundColor: '#0B1A2F',
  },
  captionText: {
    fontSize: 13,
    color: '#8A97AB',
    textAlign: 'center',
    marginBottom: 14,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F0923A',
  },
});
