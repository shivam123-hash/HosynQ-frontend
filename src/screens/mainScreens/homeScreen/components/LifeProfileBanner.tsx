import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../../../units/Colors';

export interface LifeProfileBannerProps {
  progressPercent?: number;
  completedSections?: number;
  totalSections?: number;
  onContinue?: () => void;
}

const LifeProfileBanner: React.FC<LifeProfileBannerProps> = ({
  progressPercent = 35,
  completedSections = 2,
  totalSections = 6,
  onContinue,
}) => {
  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <Text style={styles.tagText}>LIFE PROFILE</Text>
        <Text style={styles.percentText}>{progressPercent}%</Text>
      </View>

      {/* Main Copy */}
      <Text style={styles.title}>Complete your profile</Text>
      <Text style={styles.subtitle}>
        Unlock personalised reminders and family insights.
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Footer Meta & Continue Link */}
      <View style={styles.footerRow}>
        <Text style={styles.metaText}>
          {completedSections} of {totalSections} sections done
        </Text>
        <TouchableOpacity
          onPress={onContinue}
          activeOpacity={0.7}
          style={styles.continueTouch}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(LifeProfileBanner);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13233A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#1F3249',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  continueTouch: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  continueText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
