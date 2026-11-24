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

export interface DeleteAccountScreenProps {
  onBack?: () => void;
  onTransferOwnership?: () => void;
  onContinue?: () => void;
  onKeepAccount?: () => void;
  isOwner?: boolean;
  gracePeriodDays?: number;
}

const CrownIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = '#F6C08E',
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

export const DeleteAccountScreen: React.FC<DeleteAccountScreenProps> = ({
  onBack,
  onTransferOwnership,
  onContinue,
  onKeepAccount,
  isOwner = true,
  gracePeriodDays = 30,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Main Inner Content */}
      <View style={styles.innerContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.topBarTitle}>Delete account</Text>

          <View style={styles.circlePlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Heading */}
          <Text style={styles.heading}>Delete your account?</Text>
          <Text style={styles.subheading}>
            This deletes your HosynQ account. Your family keeps using HosynQ without you.
          </Text>

          {/* Owner Alert Card */}
          {isOwner && (
            <View style={styles.ownerCard}>
              <View style={styles.ownerHeader}>
                <View style={styles.ownerTitleRow}>
                  <CrownIcon size={16} color="#F6C08E" />
                  <Text style={styles.ownerTitle}>You’re the Owner</Text>
                </View>

                <TouchableOpacity
                  onPress={onTransferOwnership}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Transfer ownership"
                >
                  <Text style={styles.transferText}>Transfer</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.ownerSubtitle}>
                Make someone else Owner first, or delete the whole family.
              </Text>
            </View>
          )}

          {/* Section Label: WHAT HAPPENS */}
          <Text style={styles.sectionLabel}>WHAT HAPPENS</Text>

          {/* What Happens Card */}
          <View style={styles.consequencesCard}>
            <View style={styles.consequenceRow}>
              <Feather name="x" size={18} color="#F06A6A" style={styles.consequenceIcon} />
              <Text style={styles.consequenceText}>
                Your profile and Life Profile are deleted
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.consequenceRow}>
              <Feather name="x" size={18} color="#F06A6A" style={styles.consequenceIcon} />
              <Text style={styles.consequenceText}>Just Us chats are deleted</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.consequenceRow}>
              <Feather name="check" size={18} color="#6FD9A6" style={styles.consequenceIcon} />
              <Text style={styles.consequenceText}>
                Things you added to shared lists stay with the family
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.consequenceRow}>
              <Feather name="check" size={18} color="#6FD9A6" style={styles.consequenceIcon} />
              <Text style={styles.consequenceText}>
                You have {gracePeriodDays} days to change your mind
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Fixed Bottom Action Container */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keepAccountButton}
          onPress={onKeepAccount || onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Keep my account"
        >
          <Text style={styles.keepAccountText}>Keep my account</Text>
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
  innerContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0B1A2F',
    borderWidth: 1.5,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePlaceholder: {
    width: 44,
    height: 44,
  },
  topBarTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 26,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: '#8A97AB',
    lineHeight: 22,
    marginBottom: 20,
  },
  ownerCard: {
    backgroundColor: '#1A2236',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#5A4128',
    padding: 16,
  },
  ownerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ownerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#F6C08E',
  },
  transferText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#F6C08E',
  },
  ownerSubtitle: {
    fontSize: 13,
    color: '#E6EBF2',
    lineHeight: 18,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
  },
  consequencesCard: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  consequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  consequenceIcon: {
    marginRight: 14,
  },
  consequenceText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: 'Roboto-Medium',
    flex: 1,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    backgroundColor: '#0B1A2F',
  },
  continueButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F06A6A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  keepAccountButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  keepAccountText: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0913A',
  },
});
