import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../../units/Colors';
import { FamilyMemberStatus, SmartSuggestion } from '../types';

export interface FamilyPulseSectionProps {
  members?: FamilyMemberStatus[];
  familyName?: string;
  memberCount?: number;
  suggestion: SmartSuggestion;
  onOpenPulse?: () => void;
  onFamilyPress?: () => void;
  onMemberPress?: (member?: FamilyMemberStatus) => void;
  onConfirmSuggestion?: () => void;
  onEditSuggestion?: () => void;
  onIgnoreSuggestion?: () => void;
}

const FamilyPulseSection: React.FC<FamilyPulseSectionProps> = ({
  members = [],
  familyName,
  memberCount,
  suggestion,
  onOpenPulse,
  onFamilyPress,
  onMemberPress,
  onConfirmSuggestion,
  onEditSuggestion,
  onIgnoreSuggestion,
}) => {
  const [suggestionState, setSuggestionState] = useState<'pending' | 'confirmed' | 'ignored'>(
    suggestion.state || 'pending'
  );

  const handleConfirm = () => {
    setSuggestionState('confirmed');
    onConfirmSuggestion?.();
  };

  const handleIgnore = () => {
    setSuggestionState('ignored');
    onIgnoreSuggestion?.();
  };

  const handleUndo = () => {
    setSuggestionState('pending');
  };

  const displayFamilyName = familyName?.trim() || 'The Sharma Family';
  const familyInitial = displayFamilyName.charAt(0).toUpperCase() || 'S';
  const count = memberCount ?? (members.length > 0 ? members.length : 2);
  const countText = `${count} ${count === 1 ? 'member' : 'members'}`;

  const handlePressFamily = () => {
    if (onFamilyPress) {
      onFamilyPress();
    } else if (onMemberPress) {
      onMemberPress(members[0]);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        {/* Section Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Family Pulse</Text>
          <TouchableOpacity
            onPress={onOpenPulse}
            activeOpacity={0.7}
            style={styles.openBtn}
          >
            <Text style={styles.openText}>Open</Text>
          </TouchableOpacity>
        </View>

        {/* Everyone is Safe Banner */}
        <View style={styles.safeBanner}>
          <Feather name="shield" size={16} color="#6FD9A6" />
          <Text style={styles.safeBannerText}>Everyone is safe</Text>
        </View>

        {/* Family Name Card / Box */}
        <TouchableOpacity
          onPress={handlePressFamily}
          activeOpacity={0.75}
          style={styles.familyBox}
          accessibilityRole="button"
          accessibilityLabel={`${displayFamilyName}, ${countText}`}
        >
          <View style={styles.familyBoxLeft}>
            <View style={styles.familyAvatarCircle}>
              <Text style={styles.familyAvatarText}>{familyInitial}</Text>
            </View>
            <View style={styles.familyInfo}>
              <Text style={styles.familyBoxName} numberOfLines={1}>
                {displayFamilyName}
              </Text>
              <Text style={styles.familyBoxMeta}>{countText} · Tap to view hub</Text>
            </View>
          </View>
          <View style={styles.familyBoxRight}>
            <Feather name="chevron-right" size={18} color="#8A97AB" />
          </View>
        </TouchableOpacity>

        {/* Metrics Row (Today & Weather) */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>TODAY</Text>
            <Text style={styles.metricValue} numberOfLines={1}>3 events, 7 tasks</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>WEATHER</Text>
            <Text style={styles.metricValue} numberOfLines={1}>27°C, clear</Text>
          </View>
        </View>

        {/* Birthday Alert Banner */}
        <View style={styles.birthdayBanner}>
          <Feather name="gift" size={16} color="#F6C08E" />
          <Text style={styles.birthdayText} numberOfLines={1}>Nani’s birthday is on Wednesday</Text>
        </View>

        {/* AI Smart Suggestion Card */}
        <View style={styles.suggestionCard}>
          {suggestionState === 'pending' ? (
            <>
              {/* Suggestion Text with Sparkle */}
              <View style={styles.suggestionContentRow}>
                <Text style={styles.sparkleIcon}>✦</Text>
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={handleConfirm}
                  activeOpacity={0.7}
                  style={styles.confirmBtn}
                >
                  <Text style={styles.confirmBtnText}>Confirm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onEditSuggestion}
                  activeOpacity={0.7}
                  style={styles.editBtn}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleIgnore}
                  activeOpacity={0.7}
                  style={styles.ignoreBtn}
                >
                  <Text style={styles.ignoreBtnText}>Ignore</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : suggestionState === 'confirmed' ? (
            <View style={styles.feedbackStateRow}>
              <View style={styles.feedbackLeft}>
                <Feather name="check-circle" size={16} color="#4CC38A" />
                <Text style={styles.feedbackSuccessText}>
                  Added: reminder sent to Rohan
                </Text>
              </View>
              <TouchableOpacity onPress={handleUndo} activeOpacity={0.7}>
                <Text style={styles.undoText}>Undo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.feedbackStateRow}>
              <View style={styles.feedbackLeft}>
                <Feather name="minus-circle" size={16} color="#8A97AB" />
                <Text style={styles.feedbackIgnoredText}>
                  Ignored. Nothing was added.
                </Text>
              </View>
              <TouchableOpacity onPress={handleUndo} activeOpacity={0.7}>
                <Text style={styles.undoText}>Undo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default memo(FamilyPulseSection);

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    padding: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 34,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  openBtn: {
    height: 32,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(240, 144, 52, 0.16)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Roboto-Medium',
    color: '#F0913A',
  },
  safeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2F6B52',
    borderRadius: 22,
    height: 42,
    paddingHorizontal: 14,
    gap: 10,
  },
  safeBannerText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Roboto-Medium',
    color: '#6FD9A6',
  },
  familyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1D33',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  familyBoxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  familyAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(240, 145, 58, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.3)',
  },
  familyAvatarText: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#F0913A',
  },
  familyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  familyBoxName: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  familyBoxMeta: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#8A97AB',
  },
  familyBoxRight: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 3,
    height: 62,
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.2,
  },
  metricValue: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  birthdayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5A4128',
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
    height: 44,
  },
  birthdayText: {
    fontSize: 13.5,
    lineHeight: 18,
    fontFamily: 'Roboto-Medium',
    color: '#F6C08E',
    flex: 1,
  },
  suggestionCard: {
    backgroundColor: '#0B1A2F',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    padding: 16,
    gap: 14,
  },
  suggestionContentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sparkleIcon: {
    color: '#F0913A',
    fontSize: 16,
    lineHeight: 20,
    marginTop: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    fontFamily: 'Roboto-Regular',
    letterSpacing: 0.15,
    color: '#E6EBF2',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 38,
  },
  confirmBtn: {
    height: 38,
    backgroundColor: '#F0913A',
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
    color: '#0B1A2F',
  },
  editBtn: {
    height: 38,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    color: '#C9D1DC',
  },
  ignoreBtn: {
    height: 38,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ignoreBtnText: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
  },
  feedbackStateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  feedbackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedbackSuccessText: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    color: '#4CC38A',
  },
  feedbackIgnoredText: {
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
    color: '#8A97AB',
  },
  undoText: {
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
    color: '#F0913A',
  },
});
