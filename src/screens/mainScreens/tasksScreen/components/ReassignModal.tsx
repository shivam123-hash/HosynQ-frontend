import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useAppSelector } from '../../../../redux';
import AppBottomSheet from '../../../../components/AppBottomSheet';
import Colors from '../../../../units/Colors';
import Spacing from '../../../../units/Spacing';
import BorderRadius from '../../../../units/BorderRadius';
import Typography from '../../../../units/Typography';
import tasksServices, { WorkloadMemberData } from '../../../../services/tasksServices';
import { isUUID } from '../taskApiHelpers';
import { FAMILY_MEMBERS } from '../mockData';

export interface ReassignModalProps {
  visible: boolean;
  taskTitle: string;
  currentAssignee?: string;
  onClose: () => void;
  onSelectAssignee: (memberId: string, memberName?: string) => void;
}

const MEMBER_ORDER = ['priya', 'rohan', 'dadi', 'anaya', 'aarav'];

const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  priya: { bg: Colors.avatarBrown, text: Colors.avatarBrownText },
  rohan: { bg: Colors.avatarNavy, text: Colors.avatarNavyText },
  dadi: { bg: Colors.avatarGreen, text: Colors.avatarGreenText },
  anaya: { bg: Colors.avatarWine, text: Colors.avatarWineText },
  aarav: { bg: Colors.avatarOlive, text: Colors.avatarOliveText },
};

export interface ReassignMemberOption {
  id: string;
  name: string;
  initial: string;
  avatarBg: string;
  avatarColor: string;
  taskCount: number;
  isChild: boolean;
}

const ReassignModal: React.FC<ReassignModalProps> = ({
  visible,
  taskTitle,
  currentAssignee = 'Priya',
  onClose,
  onSelectAssignee,
}) => {
  const familyMembers = useAppSelector(
    (state) =>
      ((state.family.myFamilyData?.family as any)?.members as any[]) ||
      ((state.family.myFamilyData as any)?.members as any[]) ||
      []
  );

  const [workloadMembers, setWorkloadMembers] = useState<WorkloadMemberData[]>([]);

  useEffect(() => {
    if (visible) {
      tasksServices
        .getWorkload()
        .then((res) => {
          if (res?.members && res.members.length > 0) {
            setWorkloadMembers(res.members);
          }
        })
        .catch((err) => {
          console.log('[ReassignModal] Could not fetch workload:', err?.message || err);
        });
    }
  }, [visible]);

  const members: ReassignMemberOption[] = useMemo(() => {
    if (workloadMembers && workloadMembers.length > 0) {
      return workloadMembers.map((wm) => ({
        id: wm.memberId,
        name: wm.fullName,
        initial: ((wm.fullName || 'M').trim()[0] || 'M').toUpperCase(),
        avatarBg: wm.avatarColor || Colors.primary,
        avatarColor: '#FFFFFF',
        taskCount: wm.activeTasksCount ?? 0,
        isChild: false,
      }));
    }
    if (familyMembers && familyMembers.length > 0) {
      return familyMembers.map((m: any) => ({
        id: m.memberId || m.id,
        name: m.fullName || m.name || 'Member',
        initial: ((m.fullName || m.name || 'M').trim()[0] || 'M').toUpperCase(),
        avatarBg: m.avatarColor || Colors.primary,
        avatarColor: '#FFFFFF',
        taskCount: 1,
        isChild:
          m.role === 'CHILD' ||
          m.relationship === 'DAUGHTER' ||
          m.relationship === 'SON' ||
          m.relationship === 'CHILD',
      }));
    }
    const rawMembers = FAMILY_MEMBERS.filter((m) => m.id !== 'everyone');
    const sorted = [...rawMembers].sort((a, b) => {
      const idxA = MEMBER_ORDER.indexOf(a.id);
      const idxB = MEMBER_ORDER.indexOf(b.id);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
    return sorted.map((m) => ({
      id: m.id,
      name: m.name,
      initial: m.initial,
      avatarBg: m.avatarBg,
      avatarColor: m.avatarColor,
      taskCount: m.taskCount || 1,
      isChild: m.id === 'anaya' || m.id === 'aarav',
    }));
  }, [familyMembers]);

  const [selectedId, setSelectedId] = useState<string>(() => {
    const rohan = members.find((m: ReassignMemberOption) => m.name.toLowerCase() === 'rohan' || m.id === 'rohan');
    return rohan?.id || members.find((m: ReassignMemberOption) => m.name.toLowerCase() !== currentAssignee.toLowerCase())?.id || members[0]?.id || 'rohan';
  });
  const [notifyAssignee, setNotifyAssignee] = useState(true);

  useEffect(() => {
    if (members.length > 0 && !members.some((m: ReassignMemberOption) => m.id === selectedId)) {
      const rohan = members.find((m: ReassignMemberOption) => m.name.toLowerCase() === 'rohan' || m.id === 'rohan');
      setSelectedId(rohan?.id || members[0].id);
    }
  }, [members, selectedId]);

  const selectedMember =
    members.find((m: ReassignMemberOption) => m.id === selectedId) ||
    members[0] || {
      id: 'rohan',
      name: 'Rohan',
      initial: 'R',
      avatarBg: Colors.avatarNavy,
      avatarColor: Colors.avatarNavyText,
      taskCount: 1,
      isChild: false,
    };

  const handleConfirm = () => {
    onSelectAssignee(selectedMember.id, selectedMember.name);
    onClose();
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Reassign task"
      subtitle={taskTitle}
      primaryButtonText={`Reassign to ${selectedMember.name}`}
      onPrimaryPress={handleConfirm}
      secondaryButtonText="Cancel"
      onSecondaryPress={onClose}
    >
      {/* Family Members List Card */}
      <View style={styles.membersCard}>
        {members.map((m: ReassignMemberOption, index: number) => {
          const isSelected = selectedId === m.id;
          const isLast = index === members.length - 1;
          const isCurrentlyAssigned =
            m.name.toLowerCase() === currentAssignee.toLowerCase() ||
            (currentAssignee.toLowerCase() === 'you' && m.name === 'Priya');
          const isChild = m.id === 'anaya' || m.id === 'aarav';

          const taskCount = m.taskCount || 1;
          const taskCountText = `${taskCount} task${taskCount === 1 ? '' : 's'} this week`;
          const subtitleText = isCurrentlyAssigned
            ? `Assigned now · ${taskCountText}`
            : isChild
            ? `Child · ${taskCountText}`
            : taskCountText;

          const colors = AVATAR_COLORS[m.id] || {
            bg: m.avatarBg,
            text: m.avatarColor,
          };

          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.memberRow,
                isSelected && styles.memberRowSelected,
                !isLast && styles.rowDivider,
              ]}
              onPress={() => setSelectedId(m.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, { backgroundColor: colors.bg }]}>
                <Text style={[styles.avatarText, { color: colors.text }]}>
                  {m.initial}
                </Text>
              </View>

              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                  {`${m.name}${m.name === 'Priya' ? ' (you)' : ''}`}
                </Text>
                <Text style={styles.memberSub}>{subtitleText}</Text>
              </View>

              {/* Radio Button */}
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

      {/* Let Member Know Toggle Row */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>
          {`Let ${selectedMember.name} know`}
        </Text>
        <Switch
          value={notifyAssignee}
          onValueChange={setNotifyAssignee}
          trackColor={{ false: Colors.borderBold, true: Colors.primary }}
          thumbColor={Colors.white}
          ios_backgroundColor={Colors.borderBold}
        />
      </View>
    </AppBottomSheet>
  );
};

export default ReassignModal;

const styles = StyleSheet.create({
  membersCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
  },
  memberRowSelected: {
    backgroundColor: Colors.cardSelected,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBold,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: 'Roboto-Bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.textLightMutedAlt,
  },
  memberSub: {
    fontSize: Typography.size.bodySmall,
    color: Colors.textSecondaryMuted,
    marginTop: Spacing.xxs,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  switchLabel: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.textLightMutedAlt,
  },
});
