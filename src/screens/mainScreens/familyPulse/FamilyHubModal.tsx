import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
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
}

interface MemberHub {
  id: string;
  name: string;
  initial: string;
  bgColor: string;
  statusLocation: string;
  isOnline: boolean;
}

const MEMBERS: MemberHub[] = [
  {
    id: 'priya',
    name: 'Priya',
    initial: 'P',
    bgColor: Colors.avatarBrown,
    statusLocation: 'You',
    isOnline: true,
  },
  {
    id: 'rohan',
    name: 'Rohan',
    initial: 'R',
    bgColor: Colors.avatarNavy,
    statusLocation: 'Office',
    isOnline: true,
  },
  {
    id: 'anaya',
    name: 'Anaya',
    initial: 'A',
    bgColor: Colors.avatarWine,
    statusLocation: 'Home',
    isOnline: true,
  },
  {
    id: 'aarav',
    name: 'Aarav',
    initial: 'Aa',
    bgColor: Colors.avatarOlive,
    statusLocation: 'School',
    isOnline: true,
  },
  {
    id: 'dadi',
    name: 'Dadi',
    initial: 'D',
    bgColor: Colors.avatarGreen,
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Family</Text>
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.circleButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Invite member"
            >
              <Feather name="user-plus" size={18} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.circleButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <Feather name="settings" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
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
            >
              <Text style={styles.familyIdText}>HSQ-4821</Text>
              <Feather
                name="copy"
                size={12}
                color={Colors.primary}
                style={styles.copyIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Members Avatars Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.membersRow}
          >
            {MEMBERS.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.avatarContainer}>
                  <View
                    style={[
                      styles.memberAvatarCircle,
                      { backgroundColor: member.bgColor },
                    ]}
                  >
                    <Text style={styles.memberAvatarInitial}>{member.initial}</Text>
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
            <TouchableOpacity style={styles.memberItem} activeOpacity={0.7}>
              <View style={styles.addMemberCircle}>
                <Feather name="plus" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.addMemberText}>Add</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* 2x2 Feature Grid */}
          <View style={styles.gridContainer}>
            {/* Family Pulse */}
            <TouchableOpacity
              style={styles.gridCard}
              onPress={handleOpenPulse}
              activeOpacity={0.85}
            >
              <View style={styles.gridIconCirclePulse}>
                <Feather name="activity" size={20} color={Colors.accentPurple} />
              </View>
              <Text style={styles.gridCardTitle}>Family Pulse</Text>
              <Text style={styles.gridCardSubtitle}>3 of 5 checked in today</Text>
            </TouchableOpacity>

            {/* Family Chat */}
            <TouchableOpacity style={styles.gridCard} activeOpacity={0.85}>
              <View style={styles.gridCardTopRow}>
                <View style={styles.gridIconCircleChat}>
                  <Feather
                    name="message-circle"
                    size={20}
                    color={Colors.accentBlue}
                  />
                </View>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>2</Text>
                </View>
              </View>
              <Text style={styles.gridCardTitle}>Family chat</Text>
              <Text style={styles.gridCardSubtitle}>
                Anaya: Can someone pick me up?
              </Text>
            </TouchableOpacity>

            {/* Compass */}
            <TouchableOpacity style={styles.gridCard} activeOpacity={0.85}>
              <View style={styles.gridIconCircleCompass}>
                <Feather name="navigation" size={20} color={Colors.accentTeal} />
              </View>
              <Text style={styles.gridCardTitle}>Compass</Text>
              <Text style={styles.gridCardSubtitle}>4 sharing location</Text>
            </TouchableOpacity>

            {/* Members */}
            <TouchableOpacity style={styles.gridCard} activeOpacity={0.85}>
              <View style={styles.gridCardTopRow}>
                <View style={styles.gridIconCircleMembers}>
                  <Feather name="users" size={20} color={Colors.accentGreen} />
                </View>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>1</Text>
                </View>
              </View>
              <Text style={styles.gridCardTitle}>Members</Text>
              <Text style={styles.gridCardSubtitle}>
                1 join request to review
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full-width Family Vault Card */}
          <TouchableOpacity
            style={styles.vaultCard}
            onPress={handleOpenVault}
            activeOpacity={0.85}
          >
            <View style={styles.vaultIconBox}>
              <Feather name="folder" size={22} color={Colors.primary} />
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
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {/* How are you today? Card */}
          <View style={styles.moodCard}>
            <Text style={styles.moodSectionTitle}>How are you today?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodChipsRow}
            >
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
            </ScrollView>
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
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 10,
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
    padding: 16,
    marginBottom: 20,
  },
  familyAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  familyAvatarText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  familyTextGroup: {
    flex: 1,
  },
  familyName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  familyMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  familyIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  familyIdText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  copyIcon: {
    marginLeft: 2,
  },
  membersRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  memberItem: {
    alignItems: 'center',
    width: 54,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  memberAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarInitial: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  statusDotGreen: {
    backgroundColor: Colors.accentTeal,
  },
  statusDotGray: {
    backgroundColor: Colors.textSecondary,
  },
  memberNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 2,
  },
  memberLocationText: {
    fontSize: 11,
    color: Colors.textSecondary,
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
    marginBottom: 6,
  },
  addMemberText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 16,
  },
  gridCard: {
    width: '47.5%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  gridCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridIconCirclePulse: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(157, 101, 229, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridIconCircleChat: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(58, 142, 240, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridIconCircleCompass: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(46, 196, 182, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridIconCircleMembers: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(31, 160, 102, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  counterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  counterBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  gridCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  gridCardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  vaultCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 20,
  },
  vaultIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(240, 145, 58, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  vaultTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  vaultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  vaultSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  moodCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  moodSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 14,
  },
  moodChipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  moodChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodChipActive: {
    backgroundColor: Colors.primary,
  },
  moodChipInactive: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moodChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  moodChipTextActive: {
    color: Colors.black,
  },
  moodChipTextInactive: {
    color: Colors.white,
  },
});

export default FamilyHubModal;
