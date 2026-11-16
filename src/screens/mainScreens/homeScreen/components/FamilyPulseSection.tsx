import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { FamilyMemberStatus, SmartSuggestion } from '../types';

export interface FamilyPulseSectionProps {
  members: FamilyMemberStatus[];
  suggestion: SmartSuggestion;
  onOpenPulse?: () => void;
  onMemberPress?: (member: FamilyMemberStatus) => void;
  onConfirmSuggestion?: () => void;
  onEditSuggestion?: () => void;
  onIgnoreSuggestion?: () => void;
}

const FamilyPulseSection: React.FC<FamilyPulseSectionProps> = ({
  members,
  suggestion,
  onOpenPulse,
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

  // Color mapping per member from Figma CSS
  const getMemberInitialsColor = (initials: string) => {
    switch (initials) {
      case 'R':
        return '#8DB8F5';
      case 'A':
        return '#F2A3CC';
      case 'Aa':
        return '#F2C14E';
      case 'D':
        return '#9BD3A8';
      default:
        return '#FFFFFF';
    }
  };

  const getMemberBgColor = (initials: string) => {
    switch (initials) {
      case 'R':
        return '#1E3A66';
      case 'A':
        return '#4A1F3A';
      case 'Aa':
        return '#4A3A12';
      case 'D':
        return '#253F2C';
      default:
        return '#1E3A66';
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

        {/* Family Members Row */}
        <View style={styles.membersRow}>
          {members.map((member) => (
            <TouchableOpacity
              key={member.id}
              onPress={() => onMemberPress?.(member)}
              activeOpacity={0.7}
              style={styles.memberItem}
            >
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: getMemberBgColor(member.initials) },
                ]}
              >
                <Text
                  style={[
                    styles.initialsText,
                    { color: getMemberInitialsColor(member.initials) },
                  ]}
                >
                  {member.initials}
                </Text>
                {member.isSafe && <View style={styles.statusDot} />}
              </View>
              <Text style={styles.memberName} numberOfLines={1}>
                {member.name}
              </Text>
              <Text style={styles.memberStatus} numberOfLines={1}>
                {member.status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
                <Feather name="star" size={16} color="#F0913A" style={styles.sparkleIcon} />
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
    borderWidth: 1,
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
    fontFamily: 'Roboto',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#CAD4DF',
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
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
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
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#6FD9A6',
  },
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  memberItem: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  initialsText: {
    fontFamily: 'Roboto',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CC38A',
    borderWidth: 2,
    borderColor: '#122440',
  },
  memberName: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#CAD4DF',
  },
  memberStatus: {
    fontFamily: 'Roboto',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '400',
    color: '#8A97AB',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2A3E5E',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 3,
    height: 62,
    justifyContent: 'center',
  },
  metricLabel: {
    fontFamily: 'Roboto',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
  },
  metricValue: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  birthdayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5A4128',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
    height: 44,
  },
  birthdayText: {
    fontFamily: 'Roboto',
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '500',
    color: '#F6C08E',
    flex: 1,
  },
  suggestionCard: {
    backgroundColor: '#0B1A2F',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2A3E5E',
    padding: 16,
    gap: 14,
  },
  suggestionContentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sparkleIcon: {
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '400',
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
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1A2F',
  },
  editBtn: {
    height: 38,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '500',
    color: '#C9D1DC',
  },
  ignoreBtn: {
    height: 38,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ignoreBtnText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '500',
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
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '500',
    color: '#4CC38A',
  },
  feedbackIgnoredText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '400',
    color: '#8A97AB',
  },
  undoText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '700',
    color: '#F0913A',
  },
});
