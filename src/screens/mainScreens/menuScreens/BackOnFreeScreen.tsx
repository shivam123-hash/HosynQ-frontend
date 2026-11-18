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

export interface BackOnFreeScreenProps {
  onBack?: () => void;
  onReactivate?: () => void;
  pausedDate?: string;
}

export const BackOnFreeScreen: React.FC<BackOnFreeScreenProps> = ({
  onBack,
  onReactivate,
  pausedDate = 'Fri, 6 Nov',
}) => {
  const insets = useSafeAreaInsets();

  const pausedFeatures = [
    {
      title: 'AI brief and suggestions',
      icon: 'sparkles-outline',
    },
    {
      title: 'Scanning bills and circulars',
      icon: 'scan-outline',
    },
    {
      title: 'Vault renewal reminders',
      icon: 'notifications-outline',
    },
    {
      title: 'Place reminders in Compass',
      icon: 'compass-outline',
    },
  ];

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
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
            <View style={styles.freeBadgeGroup}>
              <Ionicons
                name="sparkles-outline"
                size={14}
                color="#8A97AB"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
            <View style={styles.pausedBadge}>
              <Text style={styles.pausedBadgeText}>Premium paused</Text>
            </View>
          </View>

          <Text style={styles.statusTitle}>You're back on Free</Text>
          <Text style={styles.statusSubtitle}>
            Premium paused on {pausedDate} because the payment didn't go through. Your data is safe.
          </Text>
        </View>

        {/* Section: PAUSED UNTIL YOU REACTIVATE */}
        <Text style={styles.sectionHeading}>PAUSED UNTIL YOU REACTIVATE</Text>

        <View style={styles.featuresCard}>
          {pausedFeatures.map((feat, index) => (
            <React.Fragment key={index}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.featureRow}>
                <View style={styles.iconBox}>
                  <Ionicons name={feat.icon as any} size={18} color="#3A4556" />
                </View>
                <Text style={styles.featureText}>{feat.title}</Text>
                <Feather name="lock" size={16} color="#8A97AB" />
              </View>
            </React.Fragment>
          ))}
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
          style={styles.reactivateBtn}
          onPress={onReactivate}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Reactivate Premium"
        >
          <Ionicons
            name="sparkles"
            size={16}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.reactivateBtnText}>Reactivate Premium</Text>
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
  statusCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 18,
    marginBottom: 20,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  freeBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A97AB',
    letterSpacing: 1.1,
  },
  pausedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  pausedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CCD7E6',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  featuresCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: 'transparent',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1A293E',
  },
  bottomContainer: {
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  reactivateBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0913A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactivateBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
