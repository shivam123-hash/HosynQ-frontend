import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import AppBottomSheet from '../../../../components/AppBottomSheet';
import Colors from '../../../../units/Colors';
import Spacing from '../../../../units/Spacing';
import BorderRadius from '../../../../units/BorderRadius';
import Typography from '../../../../units/Typography';
import { FAMILY_MEMBERS } from '../mockData';

export interface ReassignModalProps {
  visible: boolean;
  taskTitle: string;
  currentAssignee?: string;
  onClose: () => void;
  onSelectAssignee: (name: string) => void;
}

const MEMBER_ORDER = ['priya', 'rohan', 'dadi', 'anaya', 'aarav'];

const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  priya: { bg: Colors.avatarBrown, text: Colors.avatarBrownText },
  rohan: { bg: Colors.avatarNavy, text: Colors.avatarNavyText },
  dadi: { bg: Colors.avatarGreen, text: Colors.avatarGreenText },
  anaya: { bg: Colors.avatarWine, text: Colors.avatarWineText },
  aarav: { bg: Colors.avatarOlive, text: Colors.avatarOliveText },
};

const ReassignModal: React.FC<ReassignModalProps> = ({
  visible,
  taskTitle,
  currentAssignee = 'Priya',
  onClose,
  onSelectAssignee,
}) => {
  const rawMembers = FAMILY_MEMBERS.filter((m) => m.id !== 'everyone');
  const members = [...rawMembers].sort((a, b) => {
    const idxA = MEMBER_ORDER.indexOf(a.id);
    const idxB = MEMBER_ORDER.indexOf(b.id);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  const [selectedId, setSelectedId] = useState('rohan');
  const [notifyAssignee, setNotifyAssignee] = useState(true);

  const selectedMember =
    members.find((m) => m.id === selectedId) || members[0];

  const handleConfirm = () => {
    onSelectAssignee(selectedMember.name);
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
        {members.map((m, index) => {
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
    fontWeight: Typography.weight.bold,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: Typography.size.bodyMedium,
    fontWeight: Typography.weight.semiBold,
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
    fontWeight: Typography.weight.semiBold,
    color: Colors.textLightMutedAlt,
  },
});
