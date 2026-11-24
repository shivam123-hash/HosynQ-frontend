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
import Colors from '../../../units/Colors';

export interface TrialNotAvailableModalProps {
  onBack?: () => void;
  onSeePlans?: () => void;
  onStayOnFree?: () => void;
  familyName?: string;
  previousTrialDate?: string;
  planPricingText?: string;
}

const CrownIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = Colors.primary,
}) => {
  const s = size / 18;
  const stroke = Math.max(1.4, 1.5 * s);

  const pts: [number, number, number, number, string][] = [
    [2.5 * s, 12 * s, 1.5 * s, 4.5 * s, 'l-outer'],
    [1.5 * s, 4.5 * s, 6 * s, 7.5 * s, 'l-inner'],
    [6 * s, 7.5 * s, 9 * s, 1.5 * s, 'c-left'],
    [9 * s, 1.5 * s, 12 * s, 7.5 * s, 'c-right'],
    [12 * s, 7.5 * s, 16.5 * s, 4.5 * s, 'r-inner'],
    [16.5 * s, 4.5 * s, 15.5 * s, 12 * s, 'r-outer'],
    [2 * s, 12 * s, 16 * s, 12 * s, 'base'],
  ];

  return (
    <View style={{ width: 18 * s, height: 14 * s, position: 'relative' }}>
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

export const TrialNotAvailableModal: React.FC<TrialNotAvailableModalProps> = ({
  onBack,
  onSeePlans,
  onStayOnFree,
  familyName = 'The Sharma Family',
  previousTrialDate = 'Aug 2026',
  planPricingText = '₹2500 a year, or ₹299 a month',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack || onStayOnFree}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Plans</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Double-Circle Alert Badge */}
        <View style={styles.heroBadgeContainer}>
          <View style={styles.heroOuterRing}>
            <View style={styles.heroInnerCircle}>
              <View style={styles.heroAlertBadge}>
                <View style={styles.exclamationBar} />
                <View style={styles.exclamationDot} />
              </View>
            </View>
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>Your family has used its{'\n'}free trial</Text>
        <Text style={styles.subtitle}>
          {familyName} tried Premium in {previousTrialDate}. You can still go Premium any time.
        </Text>

        {/* Plan Snippet Card */}
        <View style={styles.planCard}>
          <View style={styles.planIconBox}>
            <CrownIcon size={18} color="#F0923A" />
          </View>
          <View style={styles.planCardContent}>
            <Text style={styles.planCardTitle}>HosynQ Premium</Text>
            <Text style={styles.planCardSubtitle}>{planPricingText}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomSection,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onSeePlans}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="See Premium plans"
        >
          <Text style={styles.primaryBtnText}>See Premium plans</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onStayOnFree || onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Stay on Free"
        >
          <Text style={styles.secondaryBtnText}>Stay on Free</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  topBarTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
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
    borderColor: Colors.borderBold,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInnerCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 1.5,
    borderColor: Colors.handleMuted,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAlertBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 1,
  },
  exclamationBar: {
    width: 2.5,
    height: 11,
    borderRadius: 1.25,
    backgroundColor: Colors.primary,
    marginBottom: 2.5,
  },
  exclamationDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  planCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  planCardContent: {
    flex: 1,
  },
  planCardTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 3,
  },
  planCardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondaryMuted,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1A293E',
    backgroundColor: Colors.background,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.primary,
  },
});
