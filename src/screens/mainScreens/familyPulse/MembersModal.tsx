import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { JoinRequestsModal } from './JoinRequestsModal';
import { InviteAdultModal } from './InviteAdultModal';
import { ChangeRoleModal } from './ChangeRoleModal';
import {
  FamilyActionConfirmationModal,
  type FamilyActionModalType,
} from './FamilyActionConfirmationModal';

export type MemberRole = 'Owner' | 'Admin' | 'Adult' | 'Child';

export interface FamilyMemberItem {
  id: string;
  name: string;
  relation: string;
  role: MemberRole;
  initials: string;
  avatarBg: string;
}

export interface MembersModalProps {
  visible?: boolean;
  isScreen?: boolean;
  onClose: () => void;
  onInviteSomeone?: () => void;
  onAddChildProfile?: () => void;
  onSelectMember?: (member: FamilyMemberItem) => void;
  onReviewJoinRequests?: () => void;
  onOpenTransferOwnership?: () => void;
  onOpenDeleteFamily?: () => void;
  onOpenStaff?: () => void;
  initialSelectedMemberForRole?: FamilyMemberItem | null;
}

const DEFAULT_MEMBERS: FamilyMemberItem[] = [
  {
    id: 'priya',
    name: 'Priya (you)',
    relation: 'Mother',
    role: 'Owner',
    initials: 'P',
    avatarBg: '#4A2E1A',
  },
  {
    id: 'rohan',
    name: 'Rohan',
    relation: 'Father',
    role: 'Admin',
    initials: 'R',
    avatarBg: '#1F3A66',
  },
  {
    id: 'dadi',
    name: 'Dadi',
    relation: 'Grandmother',
    role: 'Adult',
    initials: 'D',
    avatarBg: '#253F2D',
  },
  {
    id: 'anaya',
    name: 'Anaya',
    relation: 'Daughter · 15',
    role: 'Child',
    initials: 'A',
    avatarBg: '#4B1F3A',
  },
  {
    id: 'aarav',
    name: 'Aarav',
    relation: 'Son · 9',
    role: 'Child',
    initials: 'Aa',
    avatarBg: '#493A12',
  },
];

export const MembersModal: React.FC<MembersModalProps> = ({
  visible = true,
  isScreen = false,
  onClose,
  onInviteSomeone,
  onAddChildProfile,
  onSelectMember,
  onReviewJoinRequests,
  onOpenTransferOwnership,
  onOpenDeleteFamily,
  onOpenStaff,
  initialSelectedMemberForRole = null,
}) => {
  const insets = useSafeAreaInsets();
  const [members, setMembers] = useState<FamilyMemberItem[]>(DEFAULT_MEMBERS);
  const [selectedMemberForRole, setSelectedMemberForRole] =
    useState<FamilyMemberItem | null>(initialSelectedMemberForRole);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [actionModal, setActionModal] = useState<{
    visible: boolean;
    type: FamilyActionModalType;
    member?: FamilyMemberItem;
  }>({
    visible: false,
    type: 'remove_member',
  });
  const copyTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const familyId = 'HSQ-4821';

  const handleOpenInvite = () => {
    if (onInviteSomeone) {
      onInviteSomeone();
    } else {
      setShowInviteModal(true);
    }
  };

  const handleOpenJoinRequests = () => {
    if (onReviewJoinRequests) {
      onReviewJoinRequests();
    } else {
      setShowJoinRequestsModal(true);
    }
  };

  const handlePromptRemoveMember = (member: FamilyMemberItem) => {
    setActionModal({
      visible: true,
      type: 'remove_member',
      member,
    });
  };

  const handlePromptLeaveFamily = () => {
    const currentUser = members.find((m) => m.id === 'priya');
    if (currentUser?.role === 'Owner') {
      setActionModal({
        visible: true,
        type: 'transfer_owner_required',
      });
    } else {
      setActionModal({
        visible: true,
        type: 'leave_family',
      });
    }
  };

  const handleConfirmAction = () => {
    if (actionModal.type === 'remove_member' && actionModal.member) {
      const removedId = actionModal.member.id;
      setMembers((prev) => prev.filter((m) => m.id !== removedId));
    } else if (actionModal.type === 'leave_family') {
      onClose();
    } else if (actionModal.type === 'transfer_owner_required') {
      if (onOpenTransferOwnership) {
        onOpenTransferOwnership();
      } else {
        const nextAdult = members.find((m) => m.role === 'Admin' || m.role === 'Adult');
        if (nextAdult) {
          setSelectedMemberForRole(nextAdult);
        }
      }
    }
    setActionModal((prev) => ({ ...prev, visible: false }));
  };

  React.useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopyFamilyId = () => {
    setCopiedNotification(true);
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = setTimeout(() => {
      setCopiedNotification(false);
    }, 2000);
  };

  const getRoleBadgeStyles = (role: MemberRole) => {
    switch (role) {
      case 'Owner':
        return {
          container: styles.roleBadgeOwner,
          text: styles.roleBadgeTextOwner,
        };
      case 'Admin':
        return {
          container: styles.roleBadgeAdmin,
          text: styles.roleBadgeTextAdmin,
        };
      case 'Adult':
        return {
          container: styles.roleBadgeAdult,
          text: styles.roleBadgeTextAdult,
        };
      case 'Child':
      default:
        return {
          container: styles.roleBadgeChild,
          text: styles.roleBadgeTextChild,
        };
    }
  };

  const topPadding =
    Math.max(
      insets.top,
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 48
    ) + (Platform.OS === 'ios' ? 8 : 4);

  const mainContent = (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButtonLeft}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Members</Text>

        <TouchableOpacity
          style={styles.headerButtonRight}
          onPress={handleOpenInvite}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Add member"
        >
          <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Family ID Card */}
        <View style={styles.familyCard}>
          <View style={styles.familyAvatarCircle}>
            <Text style={styles.familyAvatarText}>S</Text>
          </View>

          <View style={styles.familyInfo}>
            <Text style={styles.familyNameText}>The Sharma Family</Text>
            <Text style={styles.familyIdText}>{`Family ID ${familyId}`}</Text>
          </View>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopyFamilyId}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Copy Family ID ${familyId}`}
          >
            <Ionicons name="copy-outline" size={17} color="#F0913A" />
          </TouchableOpacity>
        </View>

        {/* Copied Feedback Toast */}
        {copiedNotification && (
          <View style={styles.toastNotice}>
            <Feather name="check" size={14} color="#10B981" />
            <Text style={styles.toastNoticeText}>
              {`Family ID ${familyId} copied to clipboard`}
            </Text>
          </View>
        )}

        {/* Join Request Banner */}
        <TouchableOpacity
          style={styles.joinRequestBanner}
          onPress={handleOpenJoinRequests}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="1 person is waiting to join"
        >
          <Ionicons name="person-add-outline" size={18} color="#F0913A" />
          <Text style={styles.joinRequestText}>
            1 person is waiting to join
          </Text>
          <Feather name="chevron-right" size={18} color="#F0913A" />
        </TouchableOpacity>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>MEMBERS · 5</Text>
        </View>

        {/* Members List Card */}
        <View style={styles.membersCard}>
          {members.map((member, index) => {
            const isLast = index === members.length - 1;
            const badgeStyle = getRoleBadgeStyles(member.role);

            return (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.memberRow,
                  !isLast && styles.memberRowBorder,
                ]}
                onPress={() => {
                  if (onSelectMember) {
                    onSelectMember(member);
                  } else {
                    setSelectedMemberForRole(member);
                  }
                }}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`${member.name}, ${member.relation}, ${member.role}`}
              >
                {/* Member Avatar */}
                <View
                  style={[
                    styles.memberAvatar,
                    { backgroundColor: member.avatarBg },
                  ]}
                >
                  <Text style={styles.memberAvatarText}>
                    {member.initials}
                  </Text>
                </View>

                {/* Member Details */}
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRelation}>
                    {member.relation}
                  </Text>
                </View>

                {/* Role Badge */}
                <TouchableOpacity
                  style={[styles.roleBadgeBase, badgeStyle.container]}
                  onPress={() => setSelectedMemberForRole(member)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Change ${member.name}’s role, currently ${member.role}`}
                >
                  <Text style={[styles.roleBadgeTextBase, badgeStyle.text]}>
                    {member.role}
                  </Text>
                </TouchableOpacity>

                {/* Chevron Right */}
                <Feather
                  name="chevron-right"
                  size={18}
                  color="#3F5068"
                  style={styles.chevronIcon}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Staff Entry Card */}
        <TouchableOpacity
          style={styles.staffEntryCard}
          onPress={onOpenStaff}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Staff, Drivers and house help"
        >
          <View style={styles.staffEntryLeft}>
            <View style={styles.staffIconCircle}>
              <Feather name="users" size={17} color="#8EB7F5" />
            </View>
            <View>
              <Text style={styles.staffEntryTitle}>Staff</Text>
              <Text style={styles.staffEntrySubtitle}>
                Drivers and house help
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color="#3F5068" />
        </TouchableOpacity>

        {/* Footer Actions: Leave family & Delete family */}
        <View style={styles.footerActionsRow}>
          <TouchableOpacity
            style={styles.footerActionButton}
            onPress={handlePromptLeaveFamily}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Leave family"
          >
            <Text style={styles.footerActionText}>Leave family</Text>
          </TouchableOpacity>

          <Text style={styles.footerActionDot}>·</Text>

          <TouchableOpacity
            style={styles.footerActionButton}
            onPress={onOpenDeleteFamily}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Delete family"
          >
            <Text style={[styles.footerActionText, styles.footerActionDanger]}>
              Delete family
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pinned Bottom Buttons */}
      <View
        style={[
          styles.pinnedBottomContainer,
          { paddingBottom: Math.max(insets.bottom, 20) + 8 },
        ]}
      >
        {/* Invite Someone Button */}
        <TouchableOpacity
          style={styles.primaryInviteButton}
          onPress={handleOpenInvite}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Invite someone"
        >
          <Ionicons name="person-add-outline" size={19} color="#FFFFFF" />
          <Text style={styles.primaryInviteButtonText}>Invite someone</Text>
        </TouchableOpacity>

        {/* Add a Child Profile Button */}
        <TouchableOpacity
          style={styles.secondaryAddChildButton}
          onPress={onAddChildProfile}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Add a child profile"
        >
          <Ionicons name="person-outline" size={18} color="#F0913A" />
          <Text style={styles.secondaryAddChildButtonText}>
            Add a child profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-Modals */}
      <JoinRequestsModal
        visible={showJoinRequestsModal}
        onClose={() => setShowJoinRequestsModal(false)}
      />

      <InviteAdultModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      <ChangeRoleModal
        visible={!!selectedMemberForRole}
        member={selectedMemberForRole}
        onClose={() => setSelectedMemberForRole(null)}
        onTransferOwnershipPress={onOpenTransferOwnership}
        onSaveRole={(memberId, newRole) => {
          setMembers((prev) =>
            prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
          );
          setSelectedMemberForRole(null);
        }}
      />

      <FamilyActionConfirmationModal
        visible={actionModal.visible}
        type={actionModal.type}
        memberName={actionModal.member?.name}
        familyName="The Sharma Family"
        onClose={() => setActionModal((prev) => ({ ...prev, visible: false }))}
        onConfirm={handleConfirmAction}
        onSecondary={() => setActionModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );

  if (isScreen) {
    return mainContent;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {mainContent}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerButtonLeft: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonRight: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  familyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11223A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  familyAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  familyInfo: {
    flex: 1,
    marginLeft: 14,
  },
  familyNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  familyIdText: {
    fontSize: 13,
    color: '#8A9BAE',
    marginTop: 3,
  },
  copyButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#14253E',
    borderWidth: 1,
    borderColor: '#233754',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#132845',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3B66',
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 8,
    alignSelf: 'center',
    gap: 6,
  },
  toastNoticeText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  joinRequestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11223A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 12,
  },
  joinRequestText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8997AB',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  membersCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3249',
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 64,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#182D49',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberDetails: {
    flex: 1,
    marginLeft: 14,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberRelation: {
    fontSize: 13,
    color: '#6C7A90',
    marginTop: 2,
  },
  roleBadgeBase: {
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadgeTextBase: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Badge Colors
  roleBadgeOwner: {
    borderColor: '#F0923A',
    backgroundColor: 'rgba(240, 146, 58, 0.08)',
  },
  roleBadgeTextOwner: {
    color: '#F0923A',
  },
  roleBadgeAdmin: {
    borderColor: '#4D85CF',
    backgroundColor: 'rgba(77, 133, 207, 0.08)',
  },
  roleBadgeTextAdmin: {
    color: '#4D85CF',
  },
  roleBadgeAdult: {
    borderColor: '#3A4556',
    backgroundColor: 'rgba(58, 69, 86, 0.08)',
  },
  roleBadgeTextAdult: {
    color: '#C8D1DC',
  },
  roleBadgeChild: {
    borderColor: '#4CC38A',
    backgroundColor: 'rgba(76, 195, 138, 0.08)',
  },
  roleBadgeTextChild: {
    color: '#4CC38A',
  },
  chevronIcon: {
    marginLeft: 16,
  },
  pinnedBottomContainer: {
    borderTopWidth: 1,
    borderTopColor: '#1D314E',
    backgroundColor: '#0B1A2F',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  primaryInviteButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0913A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryInviteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  secondaryAddChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  secondaryAddChildButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F0913A',
    marginLeft: 8,
  },
  staffEntryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 14,
  },
  staffEntryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  staffIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1A3358',
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffEntryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  staffEntrySubtitle: {
    fontSize: 12.5,
    color: '#8A9BAE',
    marginTop: 2,
  },
  footerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  footerActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  footerActionText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#8A9BAE',
  },
  footerActionDanger: {
    color: '#F06A6D',
  },
  footerActionDot: {
    color: '#4A5870',
    fontSize: 14,
  },
});

export default MembersModal;
