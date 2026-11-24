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

export interface PaymentFailedScreenProps {
  onTryAgain?: () => void;
  onUseAnotherMethod?: () => void;
  onNotNow?: () => void;
  reason?: string;
  paymentMethod?: string;
}

export const PaymentFailedScreen: React.FC<PaymentFailedScreenProps> = ({
  onTryAgain,
  onUseAnotherMethod,
  onNotNow,
  reason = 'AutoPay limit is lower than the plan price',
  paymentMethod = 'UPI · priya@okbank',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 20) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerSection}>
          {/* Double Concentric Rings Hero Badge with Alert Icon */}
          <View style={styles.heroOuterRing}>
            <View style={styles.heroInnerCircle}>
              <View style={styles.heroAlertBadge}>
                <View style={styles.exclamationBar} />
                <View style={styles.exclamationDot} />
              </View>
            </View>
          </View>

          {/* Title and Subtitle */}
          <Text style={styles.title}>Payment didn't go through</Text>
          <Text style={styles.subtitle}>
            Your bank didn't approve the AutoPay request. No money was taken.
          </Text>

          {/* Error Details Card */}
          <View style={styles.detailsCard}>
            {/* Top Reason Section (Warm Amber Fill) */}
            <View style={styles.reasonSection}>
              <Text style={styles.detailLabel}>Reason</Text>
              <View style={styles.reasonContentRow}>
                <Text style={styles.reasonValue}>{reason}</Text>
                <Feather
                  name="alert-circle"
                  size={20}
                  color="#F7C08E"
                  style={styles.reasonIcon}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Bottom Tried Section (Dark Navy Fill) */}
            <View style={styles.triedSection}>
              <Text style={styles.detailLabel}>Tried</Text>
              <Text style={styles.triedValue}>{paymentMethod}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View
        style={[
          styles.bottomSection,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onTryAgain}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={styles.primaryBtnText}>Try again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={onUseAnotherMethod}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Use another method"
        >
          <Text style={styles.outlineBtnText}>Use another method</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={onNotNow}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Not now"
        >
          <Text style={styles.linkBtnText}>Not now</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  centerSection: {
    alignItems: 'center',
  },
  heroOuterRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: '#4A2A33',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
    alignSelf: 'center',
  },
  heroInnerCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#122440',
    borderWidth: 2,
    borderColor: '#6B3A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAlertBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#F06A6A',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 1,
  },
  exclamationBar: {
    width: 2.5,
    height: 11,
    borderRadius: 1.25,
    backgroundColor: '#F06A6A',
    marginBottom: 2.5,
  },
  exclamationDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#F06A6A',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  detailsCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 24,
  },
  reasonSection: {
    backgroundColor: '#2A2418',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  reasonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasonValue: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#F7C08E',
    lineHeight: 22,
    paddingRight: 12,
  },
  reasonIcon: {
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  triedSection: {
    backgroundColor: '#122440',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#8A97AB',
    marginBottom: 6,
  },
  triedValue: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A293E',
    backgroundColor: '#0B1A2F',
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
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  outlineBtn: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  outlineBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  linkBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  linkBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0923A',
  },
});
