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

export interface CancelSubscriptionScreenProps {
  onBack?: () => void;
  onConfirmCancel?: (reason: string) => void;
  onKeepPremium?: () => void;
  expiryDate?: string;
}

export const CancelSubscriptionScreen: React.FC<CancelSubscriptionScreenProps> = ({
  onBack,
  onConfirmCancel,
  onKeepPremium,
  expiryDate = 'Tue, 12 Oct 2027',
}) => {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState<string>('Too expensive');

  const cancellationReasons = [
    'Too expensive',
    'Not using it enough',
    'Missing something I need',
    'Something else',
  ];

  const lostFeatures = [
    'AI brief and suggestions',
    'Scanning bills and circulars',
    'Vault renewal reminders',
    'Place reminders in Compass',
  ];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack || onKeepPremium}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Cancel subscription</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notice Card */}
        <View style={styles.noticeCard}>
          <Feather name="clock" size={20} color="#F6C08E" style={{ marginRight: 12 }} />
          <Text style={styles.noticeText}>
            Premium stays on until {expiryDate}. You won't be charged again.
          </Text>
        </View>

        {/* Section: WHY ARE YOU CANCELLING? */}
        <Text style={styles.sectionHeading}>
          WHY ARE YOU CANCELLING? (OPTIONAL)
        </Text>

        <View style={styles.reasonsContainer}>
          {cancellationReasons.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonCard,
                  isSelected ? styles.reasonCardSelected : styles.reasonCardUnselected,
                ]}
                onPress={() => setSelectedReason(reason)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={reason}
              >
                <Text style={styles.reasonText}>{reason}</Text>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section: AFTER DATE YOUR FAMILY LOSES */}
        <Text style={styles.sectionHeading}>
          AFTER {expiryDate.toUpperCase()} YOUR FAMILY LOSES
        </Text>

        <View style={styles.lossCard}>
          {lostFeatures.map((feat, index) => (
            <View key={index} style={styles.lossRow}>
              <Feather name="x" size={15} color="#F06A6A" style={styles.lossCrossIcon} />
              <Text style={styles.lossText}>{feat}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => onConfirmCancel?.(selectedReason)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Cancel subscription"
        >
          <Text style={styles.cancelBtnText}>Cancel subscription</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keepBtn}
          onPress={onKeepPremium || onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Keep Premium"
        >
          <Text style={styles.keepBtnText}>Keep Premium</Text>
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
    paddingBottom: 24,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2236',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#5A4128',
    padding: 16,
    marginBottom: 24,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: '#F6C08E',
    lineHeight: 20,
    fontFamily: 'Roboto-Medium',
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  reasonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 20,
  },
  reasonCardSelected: {
    backgroundColor: '#1A2B47',
    borderWidth: 2,
    borderColor: '#F0913A',
  },
  reasonCardUnselected: {
    backgroundColor: '#0B1A2F',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  reasonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B4960',
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
  lossCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 28,
  },
  lossRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  lossCrossIcon: {
    marginRight: 12,
  },
  lossText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Roboto-Medium',
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
  },
  cancelBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F06A6A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cancelBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  keepBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  keepBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#F0913A',
  },
});
