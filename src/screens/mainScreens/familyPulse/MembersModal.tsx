import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAppDispatch, useAppSelector, RootState } from '../../../redux/store';
import {
  getMyFamilyThunk,
  fetchJoinRequestsThunk,
  removeMemberThunk,
  leaveFamilyThunk,
} from '../../../redux/features/family/familySlice';
import { MembersSkeleton } from '../../../components/SkeletonLoader';
import { JoinRequestsModal } from './JoinRequestsModal';
import { InviteAdultModal } from './InviteAdultModal';
import { ChangeRoleModal } from './ChangeRoleModal';
import {
  FamilyActionConfirmationModal,
  type FamilyActionModalType,
} from './FamilyActionConfirmationModal';
import { AddChildModal } from './AddChildModal';
import { DeleteFamilyModal } from './DeleteFamilyModal';
import { TransferOwnershipModal } from './TransferOwnershipModal';
import { StaffModal } from './StaffModal';

export type MemberRole = 'Owner' | 'Admin' | 'Adult' | 'Child';

export interface FamilyMemberItem {
  id: string;
  name: string;
  relation: string;
  role: MemberRole;
  initials: string;
  avatarBg: string;
  avatarUrl?: string | null;
  isYou?: boolean;
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
  const dispatch = useAppDispatch();

  const {
    family,
    myFamilyData,
    myFamilyLoading,
    pendingRequests,
    actionLoading,
  } = useAppSelector((state) => state.family);

  const [selectedMemberForRole, setSelectedMemberForRole] =
    useState<FamilyMemberItem | null>(initialSelectedMemberForRole);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showDeleteFamilyModal, setShowDeleteFamilyModal] = useState(false);
  const [showTransferOwnershipModal, setShowTransferOwnershipModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [actionModal, setActionModal] = useState<{
    visible: boolean;
    type: FamilyActionModalType;
    member?: FamilyMemberItem;
  }>({
    visible: false,
    type: 'remove_member',
  });
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch family and join requests on mount
  useEffect(() => {
    dispatch(getMyFamilyThunk());
    dispatch(fetchJoinRequestsThunk());
  }, [dispatch]);

  const currentFamily = myFamilyData?.family || family;
  const familyName = currentFamily?.name || 'My Family';
  const familyCode = currentFamily?.familyCode || 'HSQ-FAMILY';

  // Map API members
  const rawMembers = currentFamily?.members || [];
  const members: FamilyMemberItem[] = rawMembers.map((m: any, index: number) => {
    let role: MemberRole = 'Adult';
    if (m.role === 'FAMILY_OWNER') role = 'Owner';
    else if (m.role === 'FAMILY_ADMIN') role = 'Admin';
    else if (m.role === 'DEPENDENT_CHILD_PROFILE') role = 'Child';
    else role = 'Adult';

    const initials = m.fullName
      ? m.fullName
          .trim()
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'U';

    const relText = m.relationship
      ? m.relationship.charAt(0).toUpperCase() + m.relationship.slice(1).toLowerCase()
      : role;

    const memberId = m.id || m.memberId || m._id || m.userId || `member-${index}`;

    return {
      id: String(memberId),
      name: m.isYou ? `${m.fullName} (you)` : m.fullName,
      relation: relText,
      role,
      initials,
      avatarBg: m.avatarColor || '#1F3A66',
      avatarUrl: m.avatarUrl,
      isYou: m.isYou,
    };
  });

  const pendingCount =
    (pendingRequests && pendingRequests.length > 0)
      ? pendingRequests.length
      : myFamilyData?.pendingRequest
      ? 1
      : 0;

  const handleOpenInvite = () => {
    if (onInviteSomeone) {
      onInviteSomeone();
    } else {
      setShowInviteModal(true);
    }
  };

  const handleOpenAddChild = () => {
    if (onAddChildProfile) {
      onAddChildProfile();
    } else {
      setShowAddChildModal(true);
    }
  };

  const handleOpenJoinRequests = () => {
    if (onReviewJoinRequests) {
      onReviewJoinRequests();
    } else {
      setShowJoinRequestsModal(true);
    }
  };

  const handleOpenDeleteFamily = () => {
    if (onOpenDeleteFamily) {
      onOpenDeleteFamily();
    } else {
      setShowDeleteFamilyModal(true);
    }
  };

  const handleOpenTransferOwnership = () => {
    if (onOpenTransferOwnership) {
      onOpenTransferOwnership();
    } else {
      setShowTransferOwnershipModal(true);
    }
  };

  const handleOpenStaff = () => {
    if (onOpenStaff) {
      onOpenStaff();
    } else {
      setShowStaffModal(true);
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
    setActionModal({
      visible: true,
      type: 'leave_family',
    });
  };

  const handleConfirmAction = async () => {
    if (actionModal.type === 'remove_member' && actionModal.member) {
      const targetId = actionModal.member.id;
      try {
        await dispatch(removeMemberThunk(targetId)).unwrap();
        setActionModal((prev) => ({ ...prev, visible: false }));
        Alert.alert('Member Removed', `${actionModal.member.name} has been removed from the family.`);
      } catch (err: any) {
        Alert.alert('Cannot Remove Member', err || 'Failed to remove member.');
      }
    } else if (actionModal.type === 'leave_family') {
      const isOwner = currentFamily?.myRole === 'FAMILY_OWNER';
      if (isOwner) {
        setActionModal({
          visible: true,
          type: 'transfer_owner_required',
        });
        return;
      }
      try {
        await dispatch(leaveFamilyThunk()).unwrap();
        setActionModal((prev) => ({ ...prev, visible: false }));
        Alert.alert('Family Left', 'You have left the family.');
        onClose();
      } catch (err: any) {
        Alert.alert('Cannot Leave Family', err || 'Failed to leave family.');
      }
    } else if (actionModal.type === 'transfer_owner_required') {
      setActionModal((prev) => ({ ...prev, visible: false }));
      handleOpenTransferOwnership();
    }
  };

  useEffect(() => {
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

      {/* Loading Skeleton */}
      {myFamilyLoading && members.length === 0 ? (
        <MembersSkeleton />
      ) : (
        /* Scrollable Content */
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Family ID Card */}
          <View style={styles.familyCard}>
            <View style={styles.familyAvatarCircle}>
              <Text style={styles.familyAvatarText}>
                {familyName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.familyInfo}>
              <Text style={styles.familyNameText}>{familyName}</Text>
              <Text style={styles.familyIdText}>{`Family ID ${familyCode}`}</Text>
            </View>

            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyFamilyId}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Copy Family ID ${familyCode}`}
            >
              <Ionicons name="copy-outline" size={17} color="#F0913A" />
            </TouchableOpacity>
          </View>

          {/* Copied Feedback Toast */}
          {copiedNotification && (
            <View style={styles.toastNotice}>
              <Feather name="check" size={14} color="#10B981" />
              <Text style={styles.toastNoticeText}>
                {`Family ID ${familyCode} copied to clipboard`}
              </Text>
            </View>
          )}

          {/* Join Request Banner (rendered only if requests exist) */}
          {pendingCount > 0 && (
            <TouchableOpacity
              style={styles.joinRequestBanner}
              onPress={handleOpenJoinRequests}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${pendingCount} person is waiting to join`}
            >
              <Ionicons name="person-add-outline" size={18} color="#F0913A" />
              <Text style={styles.joinRequestText}>
                {pendingCount === 1
                  ? '1 person is waiting to join'
                  : `${pendingCount} people are waiting to join`}
              </Text>
              <Feather name="chevron-right" size={18} color="#F0913A" />
            </TouchableOpacity>
          )}

          {/* Section Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>
              {`MEMBERS · ${members.length}`}
            </Text>
          </View>

          {/* Members List Card */}
          <View style={styles.membersCard}>
            {members.length === 0 ? (
              <View style={styles.emptyMembersRow}>
                <Text style={styles.emptyMembersText}>No members found</Text>
              </View>
            ) : (
              members.map((member, index) => {
                const isLast = index === members.length - 1;
                const badgeStyle = getRoleBadgeStyles(member.role);
                const uniqueKey = `member-${member.id || 'idx'}-${index}`;

                return (
                  <TouchableOpacity
                    key={uniqueKey}
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
              })
            )}
          </View>

          {/* Staff Entry Card */}
          <TouchableOpacity
            style={styles.staffEntryCard}
            onPress={handleOpenStaff}
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
              onPress={handleOpenDeleteFamily}
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
      )}

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
          onPress={handleOpenAddChild}
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

      <AddChildModal
        visible={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
      />

      <ChangeRoleModal
        visible={!!selectedMemberForRole}
        member={selectedMemberForRole}
        onClose={() => setSelectedMemberForRole(null)}
        onTransferOwnershipPress={handleOpenTransferOwnership}
        onRemoveMember={handlePromptRemoveMember}
      />

      <DeleteFamilyModal
        visible={showDeleteFamilyModal}
        familyName={familyName}
        memberCount={members.length}
        onClose={() => setShowDeleteFamilyModal(false)}
        onDeleteFamily={() => {
          setShowDeleteFamilyModal(false);
          onClose();
        }}
      />

      <TransferOwnershipModal
        visible={showTransferOwnershipModal}
        onClose={() => setShowTransferOwnershipModal(false)}
        onTransferComplete={() => {
          setShowTransferOwnershipModal(false);
          dispatch(getMyFamilyThunk());
        }}
      />

      <StaffModal
        visible={showStaffModal}
        onClose={() => setShowStaffModal(false)}
      />

      <FamilyActionConfirmationModal
        visible={actionModal.visible}
        type={actionModal.type}
        memberName={actionModal.member?.name}
        familyName={familyName}
        loading={actionLoading}
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
  emptyMembersRow: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMembersText: {
    fontSize: 14,
    color: '#6C7A90',
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