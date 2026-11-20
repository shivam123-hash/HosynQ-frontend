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

export interface ReactivatePlanScreenProps {
  onBack?: () => void;
  onReactivate?: (cycle: 'annual' | 'monthly') => void;
  onChangePaymentMethod?: () => void;
  savedPaymentMethod?: string;
}

export const ReactivatePlanScreen: React.FC<ReactivatePlanScreenProps> = ({
  onBack,
  onReactivate,
  onChangePaymentMethod,
  savedPaymentMethod = 'UPI AutoPay · priya@okbank',
}) => {
  const insets = useSafeAreaInsets();
  const [selectedCycle, setSelectedCycle] = useState<'annual' | 'monthly'>('annual');

  const getPrice = () => (selectedCycle === 'annual' ? '₹2500' : '₹299');

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

        <Text style={styles.topBarTitle}>Reactivate Premium</Text>

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
        <Text style={styles.headerSubtitle}>
          Pick up where you left off. Everything your family added is still here.
        </Text>

        {/* Plan Option 1: Annual */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedCycle === 'annual' ? styles.planCardSelected : styles.planCardUnselected,
          ]}
          onPress={() => setSelectedCycle('annual')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Premium Annual"
        >
          <View style={styles.planCardHeader}>
            <View style={styles.planTitleGroup}>
              <Text style={styles.planName}>Premium Annual</Text>
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueBadgeText}>Best value</Text>
              </View>
            </View>
            <View style={[styles.radioOuter, selectedCycle === 'annual' && styles.radioOuterSelected]}>
              {selectedCycle === 'annual' && <View style={styles.radioInner} />}
            </View>
          </View>
          <Text style={styles.planSubtitle}>Save 20% · ₹2500 a year</Text>
        </TouchableOpacity>

        {/* Plan Option 2: Monthly */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedCycle === 'monthly' ? styles.planCardSelected : styles.planCardUnselected,
          ]}
          onPress={() => setSelectedCycle('monthly')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Premium Monthly"
        >
          <View style={styles.planCardHeader}>
            <Text style={styles.planName}>Premium Monthly</Text>
            <View style={[styles.radioOuter, selectedCycle === 'monthly' && styles.radioOuterSelected]}>
              {selectedCycle === 'monthly' && <View style={styles.radioInner} />}
            </View>
          </View>
          <Text style={styles.planSubtitle}>₹299 a month</Text>
        </TouchableOpacity>

        {/* Payment Method Card */}
        <TouchableOpacity
          style={styles.paymentCard}
          onPress={onChangePaymentMethod}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Change payment method"
        >
          <Ionicons name="receipt-outline" size={22} color="#8A97AB" style={styles.paymentIcon} />
          <View style={styles.paymentCardContent}>
            <Text style={styles.paymentLabel}>Pay with</Text>
            <Text style={styles.paymentValue}>{savedPaymentMethod}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#8A97AB" />
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Text style={styles.bottomCaption}>
          Charged today. Renews every {selectedCycle === 'annual' ? 'year' : 'month'}. Cancel any time.
        </Text>
        <TouchableOpacity
          style={styles.reactivateBtn}
          onPress={() => onReactivate?.(selectedCycle)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Reactivate for ${getPrice()}`}
        >
          <Text style={styles.reactivateBtnText}>
            Reactivate for {getPrice()}
          </Text>
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
  headerSubtitle: {
    fontSize: 14,
    color: '#8A97AB',
    lineHeight: 20,
    marginBottom: 20,
  },
  planCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  planCardSelected: {
    backgroundColor: '#1A2B47',
    borderColor: '#F0913A',
    borderWidth: 2,
  },
  planCardUnselected: {
    backgroundColor: '#0B1A2F',
    borderColor: '#3A4556',
    borderWidth: 1,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bestValueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestValueBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F0913A',
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
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 18,
    marginTop: 4,
  },
  paymentIcon: {
    marginRight: 14,
  },
  paymentCardContent: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#8A97AB',
    marginBottom: 3,
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
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
    borderTopColor: '#1F3352',
  },
  bottomCaption: {
    fontSize: 12,
    color: '#8A97AB',
    textAlign: 'center',
    marginBottom: 12,
  },
  reactivateBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactivateBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

