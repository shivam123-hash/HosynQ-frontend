import React, { useState, useEffect, useMemo } from 'react';
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
import { MembersModal } from './MembersModal';
import { useAppDispatch, useAppSelector, RootState } from '../../../redux/store';
import { getMyFamilyThunk } from '../../../redux/features/family/familySlice';
import {
  fetchPulseHomeThunk,
  setTodayMoodThunk,
} from '../../../redux/features/pulse/pulseSlice';
import {
  MOOD_API_MAP,
  isJestTestEnv,
  mapApiMoodToUiType,
} from './pulseApiHelpers';
import { FamilyHubSkeleton } from '../../../components/SkeletonLoader';

export interface FamilyHubModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenVault?: () => void;
  onOpenPulse?: () => void;
  onInviteMember?: () => void;
  onThemePress?: () => void;
  onOpenCompass?: () => void;
  onOpenMembers?: () => void;
  initialFamily?: any;
}

interface MemberHub {
  id: string;
  name: string;
  initial: string;
  bgColor: string;
  textColor: string;
  statusLocation: string;
  isOnline: boolean;
  raw?: any;
}

const AVATAR_COLOR_PALETTE = [
  '#5C3A21', // Brown
  '#1F3A66', // Navy Blue
  '#6E2042', // Wine Red
  '#5A4E1B', // Olive / Mustard
  '#24422E', // Forest Green
  '#3D2A54', // Deep Purple
];

const FALLBACK_MEMBERS: MemberHub[] = [
  {
    id: 'priya',
    name: 'Priya',
    initial: 'P',
    bgColor: '#5C3A21',
    textColor: Colors.white,
    statusLocation: 'You',
    isOnline: true,
  },
  {
    id: 'rohan',
    name: 'Rohan',
    initial: 'R',
    bgColor: '#1F3A66',
    textColor: Colors.white,
    statusLocation: 'Office',
    isOnline: true,
  },
  {
    id: 'anaya',
    name: 'Anaya',
    initial: 'A',
    bgColor: '#6E2042',
    textColor: Colors.white,
    statusLocation: 'Home',
    isOnline: true,
  },
  {
    id: 'aarav',
    name: 'Aarav',
    initial: 'Aa',
    bgColor: '#5A4E1B',
    textColor: Colors.white,
    statusLocation: 'School',
    isOnline: true,
  },
  {
    id: 'dadi',
    name: 'Dadi',
    initial: 'D',
    bgColor: '#24422E',
    textColor: Colors.white,
    statusLocation: 'Home',
    isOnline: false,
  },
];

/**
 * Extracts smart initials matching HosynQ design system:
 * - "Aarav" -> "Aa"
 * - "Priya" -> "P"
 * - "Rohan" -> "R"
 */
const getMemberInitial = (name: string): string => {
  if (!name) return 'U';
  const clean = name.trim().split(/\s+/)[0];
  if (clean.length >= 2 && clean.toLowerCase().startsWith('aa')) {
    return 'Aa';
  }
  return clean.charAt(0).toUpperCase();
};

/**
 * Resolves location / status subtitle text:
 * - Current User: "You"
 * - Child: "School"
 * - Adult Account: "Office" / "Home"
 * - Managed elder: "Home"
 */
const getMemberStatusLocation = (member: any): string => {
  if (member.isYou) return 'You';
  if (member.role === 'DEPENDENT_CHILD_PROFILE' || (member.age && member.age < 18)) {
    return 'School';
  }
  if (
    member.familyRole?.toUpperCase() === 'GRANDMOTHER' ||
    member.familyRole?.toUpperCase() === 'GRANDFATHER'
  ) {
    return 'Home';
  }
  if (member.hasAccount) {
    return 'Office';
  }
  return 'Home';
};

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
  onOpenCompass,
  onOpenMembers,
  initialFamily,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  // Redux: fetch & select family & pulse state
  const { myFamilyData, family, myFamilyLoading, pendingRequests } = useAppSelector(
    (state: RootState) => state.family
  );
  const pulseState = useAppSelector((state: RootState) => state.pulse);
  const isTestEnv = isJestTestEnv();

  useEffect(() => {
    if (visible) {
      dispatch(getMyFamilyThunk());
      if (!isTestEnv) {
        dispatch(fetchPulseHomeThunk());
      }
    }
  }, [visible, dispatch, isTestEnv]);

  const [selectedMood, setSelectedMood] = useState<MoodType>('good');
  const [showPulseModal, setShowPulseModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const serverMood = mapApiMoodToUiType(pulseState?.home?.moods?.mine);
  useEffect(() => {
    if (serverMood) {
      setSelectedMood(serverMood);
    }
  }, [serverMood]);

  const pulseCheckedIn = pulseState?.home?.moods?.checkedIn;
  const pulseTotal = pulseState?.home?.moods?.total;
  const pulseCheckinLabel =
    typeof pulseCheckedIn === 'number' && typeof pulseTotal === 'number' && pulseTotal > 0
      ? `${pulseCheckedIn} of ${pulseTotal} checked in today`
      : 'Check in & share gratitude';

  // Unified dynamic family resolution
  const currentFamily = initialFamily || myFamilyData?.family || family;
  const familyName = currentFamily?.name || 'The Sharma Family';
  const familyInitial = familyName.trim()
    ? familyName.trim().charAt(0).toUpperCase()
    : 'T';
  const familyCode = currentFamily?.familyCode || 'HSQ-4821';
  const rawMembers = currentFamily?.members;
  const memberCount =
    currentFamily?.memberCount ??
    (rawMembers && rawMembers.length > 0 ? rawMembers.length : 5);

  // Determine owner label
  const isOwner = currentFamily
    ? currentFamily.myRole === 'FAMILY_OWNER'
    : true;
  const ownerMember = rawMembers?.find((m: any) => m.role === 'FAMILY_OWNER');
  const ownerLabel = isOwner
    ? 'you'
    : ownerMember?.fullName
    ? ownerMember.fullName.trim().split(/\s+/)[0]
    : 'you';
  const familyMetaText = `${memberCount} members · Owner: ${ownerLabel}`;

  // Map API members to UI member items
  const dynamicMembers = useMemo(() => {
    if (!rawMembers || rawMembers.length === 0) {
      return FALLBACK_MEMBERS;
    }
    return rawMembers.map((m: any, index: number) => {
      const id = String(m.memberId || m.id || m.userId || `member-${index}`);
      const firstName = m.fullName ? m.fullName.trim().split(/\s+/)[0] : 'Member';
      const initial = getMemberInitial(m.fullName || firstName);
      const bgColor =
        m.avatarColor || AVATAR_COLOR_PALETTE[index % AVATAR_COLOR_PALETTE.length];
      const statusLocation = getMemberStatusLocation(m);
      const isOnline = Boolean(m.hasAccount);

      return {
        id,
        name: firstName,
        initial,
        bgColor,
        textColor: Colors.white,
        statusLocation,
        isOnline,
        raw: m,
      };
    });
  }, [rawMembers]);

  const pendingRequestCount =
    currentFamily?.pendingRequestCount ??
    (pendingRequests && pendingRequests.length > 0
      ? pendingRequests.length
      : myFamilyData?.pendingRequest
      ? 1
      : 0);

  const pendingLabel = `${pendingRequestCount} join request${pendingRequestCount === 1 ? '' : 's'} to review`;

  const handleCopyFamilyId = () => {
    Alert.alert('Copied', `Family ID ${familyCode} copied to clipboard`);
  };

  const handleInvitePress = () => {
    if (onInviteMember) {
      onInviteMember();
    } else {
      Alert.alert('Invite Member', `Share invite link or Family ID ${familyCode}`);
    }
  };

  const handleOpenMembersPress = () => {
    if (onOpenMembers) {
      onOpenMembers();
    } else {
      setShowMembersModal(true);
    }
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
              onPress={handleInvitePress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Invite member to ${familyName}`}
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
          {myFamilyLoading && !currentFamily ? (
            <FamilyHubSkeleton />
          ) : myFamilyData && myFamilyData.inFamily === false && !initialFamily ? (
            <>
              {myFamilyData.pendingRequest ? (
                <View style={styles.pendingRequestCard}>
                  <View style={styles.pendingIconRow}>
                    <Feather name="clock" size={20} color="#F0913A" />
                    <Text style={styles.pendingCardTitle}>Join Request Pending</Text>
                  </View>
                  <Text style={styles.pendingCardBody}>
                    Your request to join{' '}
                    <Text style={styles.pendingCardBold}>
                      {myFamilyData.pendingRequest.familyName}
                    </Text>{' '}
                    is awaiting approval from the family owner.
                  </Text>
                  {Boolean(myFamilyData.pendingRequest.familyCode) && (
                    <View style={styles.pendingFamilyCodeRow}>
                      <Text style={styles.pendingCodeLabel}>Family ID:</Text>
                      <Text style={styles.pendingCodeValue}>
                        {myFamilyData.pendingRequest.familyCode}
                      </Text>
                    </View>
                  )}
                  <View style={styles.pendingStatusBadge}>
                    <Text style={styles.pendingStatusText}>STATUS: PENDING</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.notInFamilyCard}>
                  <Feather
                    name="users"
                    size={36}
                    color="#8EB7F5"
                    style={{ marginBottom: 12 }}
                  />
                  <Text style={styles.notInFamilyTitle}>No Family Group Yet</Text>
                  <Text style={styles.notInFamilyBody}>
                    You are not currently part of any family group. Create your own
                    family or join an existing family using their code or invite
                    link.
                  </Text>
                  <TouchableOpacity
                    style={styles.createJoinFamilyBtn}
                    onPress={handleInvitePress}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Create or Join Family"
                  >
                    <Text style={styles.createJoinFamilyBtnText}>
                      Create or Join Family
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <>
              {/* Family Card */}
              <View style={styles.familyCard}>
                <View style={styles.familyAvatar}>
                  <Text style={styles.familyAvatarText}>{familyInitial}</Text>
                </View>
                <View style={styles.familyTextGroup}>
                  <Text style={styles.familyName} numberOfLines={1}>
                    {familyName}
                  </Text>
                  <Text style={styles.familyMeta}>{familyMetaText}</Text>
                </View>
                <TouchableOpacity
                  style={styles.familyIdBadge}
                  onPress={handleCopyFamilyId}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Copy Family ID ${familyCode}`}
                >
                  <Text style={styles.familyIdText}>{familyCode}</Text>
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
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.membersRowContent}
                >
                  {dynamicMembers.map((member: MemberHub, idx: number) => (
                    <TouchableOpacity
                      key={`hub-member-${member.id || 'idx'}-${idx}`}
                      style={styles.memberItem}
                      activeOpacity={0.8}
                      onPress={handleOpenMembersPress}
                      accessibilityRole="button"
                      accessibilityLabel={`${member.name}, ${member.statusLocation}`}
                    >
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
                      <Text style={styles.memberNameText} numberOfLines={1}>
                        {member.name}
                      </Text>
                      <Text style={styles.memberLocationText} numberOfLines={1}>
                        {member.statusLocation}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {/* Add Member Button */}
                  <TouchableOpacity
                    style={styles.memberItem}
                    activeOpacity={0.7}
                    onPress={handleInvitePress}
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
                </ScrollView>
              </View>

              {/* 2x2 Feature Grid */}
              <View style={styles.gridContainer}>
                {/* Family Pulse */}
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={handleOpenPulse}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`Family Pulse, ${pulseCheckinLabel}`}
                >
                  <View style={styles.gridCardTopRow}>
                    <View style={styles.gridIconCirclePulse}>
                      <Feather
                        name="activity"
                        size={20}
                        color={Colors.accentPurple}
                      />
                    </View>
                  </View>
                  <View style={styles.gridCardBottomGroup}>
                    <Text style={styles.gridCardTitle}>Family Pulse</Text>
                    <Text style={styles.gridCardSubtitle}>
                      {pulseCheckinLabel}
                    </Text>
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
                  onPress={() => {
                    onClose();
                    onOpenCompass?.();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Compass, 4 sharing location"
                >
                  <View style={styles.gridCardTopRow}>
                    <View style={styles.gridIconCircleCompass}>
                      <Feather
                        name="navigation"
                        size={20}
                        color={Colors.accentTeal}
                      />
                    </View>
                  </View>
                  <View style={styles.gridCardBottomGroup}>
                    <Text style={styles.gridCardTitle}>Compass</Text>
                    <Text style={styles.gridCardSubtitle}>
                      4 sharing location
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Members */}
                <TouchableOpacity
                  style={styles.gridCard}
                  activeOpacity={0.85}
                  onPress={handleOpenMembersPress}
                  accessibilityRole="button"
                  accessibilityLabel={`Members, ${pendingLabel}`}
                >
                  <View style={styles.gridCardTopRow}>
                    <View style={styles.gridIconCircleMembers}>
                      <Feather
                        name="users"
                        size={20}
                        color={Colors.accentGreen}
                      />
                    </View>
                    {pendingRequestCount > 0 && (
                      <View style={styles.counterBadge}>
                        <Text style={styles.counterBadgeText}>
                          {pendingRequestCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.gridCardBottomGroup}>
                    <Text style={styles.gridCardTitle}>Members</Text>
                    <Text style={styles.gridCardSubtitle}>
                      {pendingRequestCount > 0
                        ? `${pendingRequestCount} join request${pendingRequestCount === 1 ? '' : 's'} to review`
                        : `${memberCount} family member${memberCount === 1 ? '' : 's'}`}
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
                          isSelected
                            ? styles.moodChipActive
                            : styles.moodChipInactive,
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
            </>
          )}
        </ScrollView>

        {/* Sub-Modals */}
        <FamilyPulseModal
          visible={showPulseModal}
          asModal={false}
          onClose={() => setShowPulseModal(false)}
        />

        <TodayMoodModal
          visible={showMoodModal}
          asModal={false}
          currentMood={selectedMood}
          saving={pulseState?.submittingMood}
          onClose={() => setShowMoodModal(false)}
          onSelectMood={(mood, note) => {
            setSelectedMood(mood);
            if (!isTestEnv) {
              dispatch(
                setTodayMoodThunk({
                  mood: MOOD_API_MAP[mood].api,
                  note: note?.trim() ? note.trim().slice(0, 140) : null,
                })
              );
            }
          }}
        />

        <FamilyVaultModal
          visible={showVaultModal}
          onClose={() => setShowVaultModal(false)}
        />

        <MembersModal
          visible={showMembersModal}
          onClose={() => setShowMembersModal(false)}
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Bold',
  },
  familyTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  familyName: {
    fontSize: 17,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  familyMeta: {
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
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
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.2,
    marginRight: 6,
  },
  copyIcon: {
    marginLeft: 1,
  },
  membersRow: {
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  membersRowContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-SemiBold',
    color: Colors.white,
    marginBottom: 2,
    textAlign: 'center',
  },
  memberLocationText: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Regular',
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
    fontFamily: 'Roboto-SemiBold',
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
    fontFamily: 'Roboto-Bold',
  },
  gridCardTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  vaultSubtitle: {
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Bold',
  },
  moodChipTextInactive: {
    color: Colors.white,
    fontFamily: 'Roboto-Medium',
  },
  pendingRequestCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 20,
    marginBottom: 20,
  },
  pendingIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  pendingCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
  },
  pendingCardBody: {
    fontSize: 14,
    color: Colors.white,
    lineHeight: 20,
    marginBottom: 12,
  },
  pendingCardBold: {
    fontWeight: '700',
    color: Colors.white,
  },
  pendingFamilyCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pendingCodeLabel: {
    fontSize: 13,
    color: Colors.textSubtle,
  },
  pendingCodeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  pendingStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(240, 145, 58, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pendingStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  notInFamilyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  notInFamilyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  notInFamilyBody: {
    fontSize: 14,
    color: Colors.textSubtle,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  createJoinFamilyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createJoinFamilyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
  },
});

export default FamilyHubModal;
