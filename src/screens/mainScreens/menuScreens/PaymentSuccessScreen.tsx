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

export interface PaymentSuccessScreenProps {
  onDone?: () => void;
  onViewReceipt?: () => void;
  trialDays?: number;
  familyName?: string;
  planName?: string;
  chargedTodayText?: string;
  firstPaymentText?: string;
  receiptNumber?: string;
}

export const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({
  onDone,
  onViewReceipt,
  trialDays = 14,
  familyName = 'The Sharma Family',
  planName = 'HosynQ Premium · Annual',
  chargedTodayText = '₹0',
  firstPaymentText = '₹2500 on 26 Nov 2026',
  receiptNumber = 'HSQ-INV-0001',
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
          {/* Concentric Double-Circle Hero Badge with Checkmark */}
          <View style={styles.heroOuterRing}>
            <View style={styles.heroInnerCircle}>
              <View style={styles.heroCheckBadge}>
                <Ionicons name="checkmark" size={19} color="#6FDAA6" />
              </View>
            </View>
          </View>

          {/* Title and Subtitle */}
          <Text style={styles.title}>You're on Premium</Text>
          <Text style={styles.subtitle}>
            Your [{trialDays}]-day trial has started. Everyone in {familyName} has Premium now.
          </Text>

          {/* Receipt Breakdown Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plan</Text>
              <Text style={styles.detailValue}>{planName}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Charged today</Text>
              <Text style={styles.detailValue}>{chargedTodayText}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>First payment</Text>
              <Text style={styles.detailValue}>{firstPaymentText}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Receipt</Text>
              <Text style={styles.detailValue}>
                {receiptNumber} · sent to your email
              </Text>
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
          onPress={onDone}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <Text style={styles.primaryBtnText}>Done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onViewReceipt}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View receipt"
        >
          <Text style={styles.secondaryBtnText}>View receipt</Text>
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
    borderColor: '#2F6B52',
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
    borderColor: '#6FDAA6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCheckBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#6FDAA6',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 16,
  },
  detailRow: {
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 13,
    color: '#8A97AB',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
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
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0923A',
  },
});
