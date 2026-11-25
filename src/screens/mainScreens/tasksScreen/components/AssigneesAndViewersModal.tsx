import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppSelector } from '../../../../redux';
import CommonBtn from '../../../../components/CommonBtn';
import { Colors, Fonts, Typography } from '../../../../units';

export type ViewersOption = 'everyone' | 'adults' | 'assignees';

export interface AssigneesAndViewersModalProps {
  visible: boolean;
  selectedAssignees: string[]; // names, e.g. ['You'] or ['Priya']
  selectedViewers: ViewersOption;
  onClose: () => void;
  onSave: (assignees: string[], viewers: ViewersOption, viewersLabel: string) => void;
  members?: { id: string; name: string; initial: string; avatarBg: string; avatarColor: string }[];
}

const VIEWERS_CONFIG: {
  id: ViewersOption;
  title: string;
  subtitle: string;
  label: string;
}[] = [
  {
    id: 'everyone',
    title: 'Everyone in the family',
    subtitle: 'Children too',
    label: 'Everyone in the family',
  },
  {
    id: 'adults',
    title: 'Only adults',
    subtitle: 'Hidden from children',
    label: 'Only adults',
  },
  {
    id: 'assignees',
    title: 'Only the people doing it',
    subtitle: 'And you',
    label: 'Only assignees',
  },
];

const AssigneesAndViewersModal: React.FC<AssigneesAndViewersModalProps> = ({
  visible,
  selectedAssignees,
  selectedViewers,
  onClose,
  onSave,
  members: propMembers,
}) => {
  const insets = useSafeAreaInsets();
  const currentUser = useAppSelector((state) => state.auth?.user);
  const myMemberId = useAppSelector(
    (state) =>
      state.family.myMemberId ||
      state.family.myFamilyData?.family?.myMemberId ||
      state.family.family?.myMemberId ||
      (state.family.myFamilyData as any)?.myMemberId ||
      null
  );
  const familyMembers = useAppSelector(
    (state) =>
      ((state.family.myFamilyData?.family as any)?.members as any[]) ||
      ((state.family.myFamilyData as any)?.members as any[]) ||
      ((state.family.family as any)?.members as any[]) ||
      []
  );

  const userInitial = useMemo(() => {
    const raw =
      currentUser?.fullName ||
      currentUser?.name ||
      currentUser?.displayName ||
      'Y';
    return (raw.trim()[0] || 'Y').toUpperCase();
  }, [currentUser]);

  const members = useMemo(() => {
    if (propMembers && propMembers.length > 0) {
      return propMembers;
    }
    if (familyMembers && familyMembers.length > 0) {
      return familyMembers.map((m: any) => {
        const isCurrentMember =
          m.isYou ||
          (myMemberId && (m.memberId === myMemberId || m.id === myMemberId)) ||
          (currentUser?.id && (m.userId === currentUser.id || m.id === currentUser.id));

        const rawName = m.fullName || m.name || (isCurrentMember ? 'You' : 'Member');
        const name = isCurrentMember ? 'You' : rawName;
        return {
          id: m.memberId || m.id || name,
          name,
          initial: (isCurrentMember ? userInitial : rawName[0] || 'M').toUpperCase(),
          avatarBg: m.avatarColor || (isCurrentMember ? Colors.primary : Colors.avatarNavy),
          avatarColor: Colors.white,
        };
      });
    }
    return [
      {
        id: myMemberId || 'you',
        name: 'You',
        initial: userInitial,
        avatarBg: Colors.primary,
        avatarColor: Colors.white,
      },
    ];
  }, [familyMembers, myMemberId, currentUser, userInitial, propMembers]);

  // Normalize initial selection to match member names or 'You'
  const [currentAssignees, setCurrentAssignees] = useState<string[]>(() => {
    if (!selectedAssignees || selectedAssignees.length === 0) return ['You'];
    return selectedAssignees;
  });

  const [currentViewers, setCurrentViewers] =
    useState<ViewersOption>(selectedViewers || 'everyone');

  React.useEffect(() => {
    if (selectedAssignees && selectedAssignees.length > 0) {
      setCurrentAssignees(selectedAssignees);
    }
    if (selectedViewers) {
      setCurrentViewers(selectedViewers);
    }
  }, [selectedAssignees, selectedViewers, visible]);

  const toggleAssignee = (memberName: string) => {
    setCurrentAssignees((prev) => {
      if (prev.includes(memberName)) {
        // Keep at least one assignee
        if (prev.length === 1) return prev;
        return prev.filter((n) => n !== memberName);
      }
      return [...prev, memberName];
    });
  };

  const handleDone = () => {
    const chosenConfig =
      VIEWERS_CONFIG.find((v) => v.id === currentViewers) || VIEWERS_CONFIG[0];
    onSave(currentAssignees, currentViewers, chosenConfig.label);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
        >
          {/* Top Handle */}
          <View style={styles.handle} />

          <Text style={styles.title}>Who’s doing it?</Text>
          <Text style={styles.subtitle}>Pick one or more people</Text>

          {/* Members Avatars Row */}
          <View style={styles.membersRow}>
            {members.map((m) => {
              const displayName = m.name === 'Priya' ? 'You' : m.name;
              const isSelected = currentAssignees.includes(displayName);

              return (
                <TouchableOpacity
                  key={m.id}
                  style={styles.memberCol}
                  onPress={() => toggleAssignee(m.name)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.avatarWrapper,
                      isSelected && styles.avatarWrapperSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.avatarCircle,
                        { backgroundColor: m.avatarBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarInitial,
                          { color: m.avatarColor },
                        ]}
                      >
                        {m.initial}
                      </Text>
                    </View>

                    {/* Small Checkmark Badge */}
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Feather name="check" size={10} color={Colors.background} />
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.memberName,
                      isSelected && styles.memberNameSelected,
                    ]}
                  >
                    {displayName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section: Who can see it */}
          <Text style={styles.sectionHeader}>WHO CAN SEE IT</Text>

          <View style={styles.viewersCard}>
            {VIEWERS_CONFIG.map((option, index) => {
              const isSelected = currentViewers === option.id;
              const isLast = index === VIEWERS_CONFIG.length - 1;

              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.viewerRow,
                    isSelected && styles.viewerRowSelected,
                    !isLast && styles.rowDivider,
                  ]}
                  onPress={() => setCurrentViewers(option.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.viewerTextCol}>
                    <Text style={styles.viewerTitle}>{option.title}</Text>
                    <Text style={styles.viewerSubtitle}>{option.subtitle}</Text>
                  </View>

                  {/* Radio Circle */}
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Done Button */}
          <CommonBtn
            title="Done"
            onPress={handleDone}
            backgroundColor={Colors.primary}
            height={52}
            borderRadius={26}
            marginTop={24}
            fontSize={16}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AssigneesAndViewersModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.tasksDarkOverlay,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: Colors.borderBold,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMutedAlt,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: Typography.size.titleLarge,
    fontFamily: Fonts.bold,
    color: Colors.textLightMutedAlt,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.size.body,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  memberCol: {
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: Colors.transparent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrapperSelected: {
    borderColor: Colors.primary,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: Typography.size.titleSmall,
    fontFamily: Fonts.bold,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  memberName: {
    fontSize: Typography.size.bodySmall,
    color: Colors.textSecondaryMuted,
    fontFamily: Fonts.medium,
  },
  memberNameSelected: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
  sectionHeader: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    letterSpacing: 1.2,
    color: Colors.textSecondaryMuted,
    marginBottom: 12,
  },
  viewersCard: {
    backgroundColor: Colors.transparent,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    overflow: 'hidden',
    marginBottom: 24,
  },
  viewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.transparent,
  },
  viewerRowSelected: {
    backgroundColor: Colors.cardSelected,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBold,
  },
  viewerTextCol: {
    flex: 1,
    marginRight: 12,
  },
  viewerTitle: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
  viewerSubtitle: {
    fontSize: Typography.size.bodySmall,
    color: Colors.textSecondaryMuted,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  doneBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
});
