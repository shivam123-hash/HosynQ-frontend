import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import { MoodType } from './types';
import { FamilyPulseModal } from './FamilyPulseModal';
import { TodayMoodModal } from './TodayMoodModal';
import { FamilyVaultModal } from '../addFlow/FamilyVaultModal';

export interface FamilyHubModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenVault?: () => void;
  onOpenPulse?: () => void;
  onInviteMember?: () => void;
  onThemePress?: () => void;
}

interface MemberHub {
  id: string;
  name: string;
  initial: string;
  bgColor: string;
  textColor: string;
  statusLocation: string;
  isOnline: boolean;
}

const MEMBERS: MemberHub[] = [
  {
    id: 'priya',
    name: 'Priya',
    initial: 'P',
    bgColor: Colors.avatarBrown,
    textColor: Colors.primarySubtle,
    statusLocation: 'You',
    isOnline: true,
  },
  {
    id: 'rohan',
    name: 'Rohan',
    initial: 'R',
    bgColor: Colors.avatarNavy,
    textColor: Colors.accentBlueSoft,
    statusLocation: 'Office',
    isOnline: true,
  },
  {
    id: 'anaya',
    name: 'Anaya',
    initial: 'A',
    bgColor: Colors.avatarWine,
    textColor: Colors.accentPink,
    statusLocation: 'Home',
    isOnline: true,
  },
  {
    id: 'aarav',
    name: 'Aarav',
    initial: 'Aa',
    bgColor: Colors.avatarOlive,
    textColor: Colors.accentYellow,
    statusLocation: 'School',
    isOnline: true,
  },
  {
    id: 'dadi',
    name: 'Dadi',
    initial: 'D',
    bgColor: Colors.avatarGreen,
    textColor: Colors.accentGreenSoft,
    statusLocation: 'Home',
    isOnline: false,
  },
];

const MOOD_OPTIONS: { id: MoodType; label: string }[] = [
  { id: 'great', label: 'Great' },
  { id: 'good', label: 'Good' },
  { id: 'okay', label: 'Okay' },
  { id: 'tired', label: 'Tired' },
  { id: 'stressed', label: 'Stressed' },
];

export const FamilyHubModal: React.FC<FamilyHubModalProps> = ({
  visible,
  onClose,
  onOpenVault,
  onOpenPulse,
  onInviteMember,
  onThemePress,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedMood, setSelectedMood] = useState<MoodType>('good');
  const [showPulseModal, setShowPulseModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);

  const handleCopyFamilyId = () => {
    Alert.alert('Copied', 'Family ID HSQ-4821 copied to clipboard');
  };

  const handleOpenPulse = () => {
    if (onOpenPulse) {
      onOpenPulse();
    } else {
      setShowPulseModal(true);
    }
  };

  const handleOpenVault = () => {
    if (onOpenVault) {
      onOpenVault();
    } else {
      setShowVaultModal(true);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Feather name="chevron-left" size={22} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Family</Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={
                onInviteMember ||
                (() =>
                  Alert.alert(
                    'Invite Member',
                    'Share invite link or Family ID HSQ-4821'
                  ))
              }
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Invite member"
            >
              <Feather name="user-plus" size={19} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={
                onThemePress ||
                (() => Alert.alert('Theme', 'Dark theme active'))
              }
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Theme"
            >
              <Feather name="sun" size={19} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Family Card */}
          <View style={styles.familyCard}>
            <View style={styles.familyAvatar}>
              <Text style={styles.familyAvatarText}>S</Text>
            </View>
            <View style={styles.familyTextGroup}>
              <Text style={styles.familyName}>The Sharma Family</Text>
              <Text style={styles.familyMeta}>5 members · Owner: you</Text>
            </View>
            <TouchableOpacity
              style={styles.familyIdBadge}
              onPress={handleCopyFamilyId}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Copy Family ID"
            >
              <Text style={styles.familyIdText}>HSQ-4821</Text>
              <Feather
                name="copy"
                size={13}
                color={Colors.primary}
                style={styles.copyIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Members Avatars Row */}
          <View style={styles.membersRow}>
            {MEMBERS.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.avatarContainer}>
                  <View
                    style={[
                      styles.memberAvatarCircle,
                      { backgroundColor: member.bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.memberAvatarInitial,
                        { color: member.textColor },
                      ]}
                    >
                      {member.initial}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusDot,
                      member.isOnline
                        ? styles.statusDotGreen
                        : styles.statusDotGray,
                    ]}
                  />
                </View>
                <Text style={styles.memberNameText}>{member.name}</Text>
                <Text style={styles.memberLocationText}>
                  {member.statusLocation}
                </Text>
              </View>
            ))}

            {/* Add Member Button */}
            <TouchableOpacity
              style={styles.memberItem}
              activeOpacity={0.7}
              onPress={
                onInviteMember ||
                (() =>
                  Alert.alert(
                    'Add Member',
                    'Share invite link or Family ID HSQ-4821'
                  ))
              }
              accessibilityRole="button"
              accessibilityLabel="Add family member"
            >
              <View style={styles.avatarContainer}>
                <View style={styles.addMemberCircle}>
                  <Feather name="plus" size={20} color={Colors.primary} />
                </View>
              </View>
              <Text style={styles.addMemberText}>Add</Text>
              <Text
                style={[
                  styles.memberLocationText,
                  styles.memberLocationSpacer,
                ]}
              >
                {'\u00A0'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 2x2 Feature Grid */}
          <View style={styles.gridContainer}>
            {/* Family Pulse */}
            <TouchableOpacity
              style={styles.gridCard}
              onPress={handleOpenPulse}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Family Pulse, 3 of 5 checked in today"
            >
              <View style={styles.gridCardTopRow}>
                <View style={styles.gridIconCirclePulse}>
                  <Feather name="activity" size={20} color={Colors.accentPurple} />
                </View>
              </View>
              <View style={styles.gridCardBottomGroup}>
                <Text style={styles.gridCardTitle}>Family Pulse</Text>
                <Text style={styles.gridCardSubtitle}>3 of 5 checked in today</Text>
              </View>
            </TouchableOpacity>

            {/* Family Chat */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Family chat, 2 unread messages"
            >
              <View style={styles.gridCardTopRow}>
                <View style={styles.gridIconCircleChat}>
                  <Feather
                    name="message-square"
                    size={20}
                    color={Colors.accentBlue}
                  />
                </View>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>2</Text>
                </View>
              </View>
              <View style={styles.gridCardBottomGroup}>
                <Text style={styles.gridCardTitle}>Family chat</Text>
                <Text style={styles.gridCardSubtitle}>
                  Anaya: Can someone pick me up?
                </Text>
              </View>
            </TouchableOpacity>

            {/* Compass */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Compass, 4 sharing location"
            >
              <View style={styles.gridCardTopRow}>
                <View style={styles.gridIconCircleCompass}>
                  <Feather name="navigation" size={20} color={Colors.accentTeal} />
                </View>
              </View>
              <View style={styles.gridCardBottomGroup}>
                <Text style={styles.gridCardTitle}>Compass</Text>
                <Text style={styles.gridCardSubtitle}>4 sharing location</Text>
              </View>
            </TouchableOpacity>

            {/* Members */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Members, 1 join request to review"
            >
              <View style={styles.gridCardTopRow}>
                <View style={styles.gridIconCircleMembers}>
                  <Feather name="users" size={20} color={Colors.accentGreen} />
                </View>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>1</Text>
                </View>
              </View>
              <View style={styles.gridCardBottomGroup}>
                <Text style={styles.gridCardTitle}>Members</Text>
                <Text style={styles.gridCardSubtitle}>
                  1 join request to review
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Full-width Family Vault Card */}
          <TouchableOpacity
            style={styles.vaultCard}
            onPress={handleOpenVault}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Family Vault, Documents, insurance, warranties, contacts"
          >
            <View style={styles.vaultIconBox}>
              <Feather name="instagram" size={20} color={Colors.primary} />
            </View>
            <View style={styles.vaultTextGroup}>
              <Text style={styles.vaultTitle}>Family Vault</Text>
              <Text style={styles.vaultSubtitle}>
                Documents, insurance, warranties, contacts
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={Colors.textSubtle}
            />
          </TouchableOpacity>

          {/* How are you today? Card */}
          <View style={styles.moodCard}>
            <Text style={styles.moodSectionTitle}>How are you today?</Text>
            <View style={styles.moodChipsWrap}>
              {MOOD_OPTIONS.map((option) => {
                const isSelected = selectedMood === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.moodChip,
                      isSelected ? styles.moodChipActive : styles.moodChipInactive,
                    ]}
                    onPress={() => {
                      setSelectedMood(option.id);
                      setShowMoodModal(true);
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                  >
                    <Text
                      style={[
                        styles.moodChipText,
                        isSelected
                          ? styles.moodChipTextActive
                          : styles.moodChipTextInactive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Sub-Modals */}
        <FamilyPulseModal
          visible={showPulseModal}
          onClose={() => setShowPulseModal(false)}
        />

        <TodayMoodModal
          visible={showMoodModal}
          currentMood={selectedMood}
          onClose={() => setShowMoodModal(false)}
          onSelectMood={(mood) => setSelectedMood(mood)}
        />

        <FamilyVaultModal
          visible={showVaultModal}
          onClose={() => setShowVaultModal(false)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderMutedAlt,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  familyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  familyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  familyAvatarText: {
    color: Colors.black,
    fontSize: 19,
    fontWeight: '700',
  },
  familyTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  familyName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  familyMeta: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSubtle,
  },
  familyIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderMutedAlt,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  familyIdText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginRight: 6,
  },
  copyIcon: {
    marginLeft: 1,
  },
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  memberItem: {
    alignItems: 'center',
    width: 52,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  memberAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarInitial: {
    fontSize: 17,
    fontWeight: '700',
  },
  statusDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    position: 'absolute',
    bottom: -1,
    right: -1,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  statusDotGreen: {
    backgroundColor: '#4CC38A',
  },
  statusDotGray: {
    backgroundColor: '#5A6880',
  },
  memberNameText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 2,
    textAlign: 'center',
  },
  memberLocationText: {
    fontSize: 11.5,
    fontWeight: '400',
    color: Colors.textSubtle,
    textAlign: 'center',
  },
  memberLocationSpacer: {
    opacity: 0,
  },
  addMemberCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  gridCard: {
    width: '48.2%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    minHeight: 136,
    justifyContent: 'space-between',
  },
  gridCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  gridCardBottomGroup: {
    justifyContent: 'flex-end',
  },
  gridIconCirclePulse: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(157, 101, 229, 0.15)',
    borderWidth: 1.5,
    borderColor: Colors.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconCircleChat: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(58, 142, 240, 0.15)',
    borderWidth: 1.5,
    borderColor: Colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconCircleCompass: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(46, 196, 182, 0.15)',
    borderWidth: 1.5,
    borderColor: Colors.accentTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconCircleMembers: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(31, 160, 102, 0.15)',
    borderWidth: 1.5,
    borderColor: Colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBadgeText: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: '700',
  },
  gridCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  gridCardSubtitle: {
    fontSize: 12.5,
    color: Colors.textSubtle,
    lineHeight: 17,
  },
  vaultCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
  },
  vaultIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vaultTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  vaultTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  vaultSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSubtle,
    lineHeight: 18,
  },
  moodCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  moodSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  moodChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodChipActive: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  moodChipInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.borderMutedAlt,
  },
  moodChipText: {
    fontSize: 14,
  },
  moodChipTextActive: {
    color: Colors.black,
    fontWeight: '700',
  },
  moodChipTextInactive: {
    color: Colors.white,
    fontWeight: '500',
  },
});

export default FamilyHubModal;
