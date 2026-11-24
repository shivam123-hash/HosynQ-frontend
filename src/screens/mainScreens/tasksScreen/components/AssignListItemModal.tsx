import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../redux';
import { ListItemEntry } from '../types';

export interface AssignListItemModalProps {
  visible: boolean;
  item: ListItemEntry | null;
  onClose: () => void;
  onAssign: (
    itemId: string,
    assigneeName?: string,
    initial?: string,
    bg?: string,
    memberId?: string
  ) => void;
}

interface AssigneeChoice {
  id: string;
  name: string;
  roleSubtitle: string;
  initial: string;
  avatarBg: string;
}

const MEMBERS: AssigneeChoice[] = [
  {
    id: 'priya',
    name: 'Priya (you)',
    roleSubtitle: '2 items on this list',
    initial: 'P',
    avatarBg: '#78350F',
  },
  {
    id: 'rohan',
    name: 'Rohan',
    roleSubtitle: 'Going to the market Saturday',
    initial: 'R',
    avatarBg: '#1E3A8A',
  },
  {
    id: 'dadi',
    name: 'Dadi',
    roleSubtitle: '1 item',
    initial: 'D',
    avatarBg: '#064E3B',
  },
  {
    id: 'anaya',
    name: 'Anaya',
    roleSubtitle: '1 item',
    initial: 'A',
    avatarBg: '#831843',
  },
];

const AssignListItemModal: React.FC<AssignListItemModalProps> = ({
  visible,
  item,
  onClose,
  onAssign,
}) => {
  const insets = useSafeAreaInsets();
  const familyMembers = useAppSelector(
    (state) =>
      ((state.family.myFamilyData?.family as any)?.members as any[]) ||
      ((state.family.myFamilyData as any)?.members as any[]) ||
      []
  );

  const members: AssigneeChoice[] = useMemo(() => {
    if (familyMembers && familyMembers.length > 0) {
      return familyMembers.map((m: any) => {
        const rawName = m.fullName || m.name || 'Member';
        const name = m.isYou ? `${rawName} (you)` : rawName;
        return {
          id: m.memberId || m.id,
          name,
          roleSubtitle: m.isYou ? 'You' : m.role || 'Family Member',
          initial: (rawName.trim()[0] || 'M').toUpperCase(),
          avatarBg: m.avatarColor || '#1E3A8A',
        };
      });
    }
    return MEMBERS;
  }, [familyMembers]);

  const [selectedId, setSelectedId] = useState<string>('rohan');
  const [anyoneCanPick, setAnyoneCanPick] = useState<boolean>(false);

  React.useEffect(() => {
    if (item && item.assignedTo) {
      const match = members.find(
        (m) => m.name.toLowerCase().includes(item.assignedTo!.toLowerCase())
      );
      if (match) {
        setSelectedId(match.id);
        setAnyoneCanPick(false);
      }
    } else {
      setSelectedId(members[0]?.id || 'rohan');
      setAnyoneCanPick(!item?.assignedTo);
    }
  }, [item, visible, members]);

  if (!item) return null;

  const selectedMember = members.find((m) => m.id === selectedId) || members[0];

  const handleConfirm = () => {
    if (anyoneCanPick) {
      onAssign(item.id, undefined, undefined, undefined, undefined);
    } else if (selectedMember) {
      onAssign(
        item.id,
        selectedMember.name.replace(' (you)', ''),
        selectedMember.initial,
        selectedMember.avatarBg,
        selectedMember.id
      );
    }
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
          accessibilityRole="button"
          accessibilityLabel="Close assign modal"
        />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Title & Subtitle */}
          <Text style={styles.title}>Who’s getting this?</Text>
          <Text style={styles.subtitle}>
            {item.title}
            {item.quantity ? ` · ${item.quantity}` : ''}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Members Card */}
            <View style={styles.membersCard}>
              {members.map((member, idx) => {
                const isSelected = !anyoneCanPick && selectedId === member.id;

                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.memberRow,
                      idx > 0 && styles.memberRowDivider,
                      isSelected && styles.memberRowSelected,
                    ]}
                    onPress={() => {
                      setSelectedId(member.id);
                      setAnyoneCanPick(false);
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityLabel={member.name}
                  >
                    {/* Avatar Initial Circle */}
                    <View
                      style={[
                        styles.avatarCircle,
                        { backgroundColor: member.avatarBg },
                      ]}
                    >
                      <Text style={styles.avatarText}>{member.initial}</Text>
                    </View>

                    {/* Member Details */}
                    <View style={styles.memberTextCol}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberSub}>
                        {member.roleSubtitle}
                      </Text>
                    </View>

                    {/* Radio Button */}
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Anyone can pick it up toggle */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Anyone can pick it up</Text>
              <Switch
                value={anyoneCanPick}
                onValueChange={setAnyoneCanPick}
                trackColor={{ false: '#3A4556', true: '#F0913A' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.giveBtn}
            onPress={handleConfirm}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Give to ${selectedMember?.name || 'Anyone'}`}
          >
            <Text style={styles.giveBtnText}>
              {anyoneCanPick
                ? 'Save as unassigned'
                : `Give to ${selectedMember?.name.replace(' (you)', '') || 'Priya'}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AssignListItemModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#122440',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Light',
    color: '#8A97AB',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  membersCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    marginBottom: 14,
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  memberRowSelected: {
    backgroundColor: '#1A2B47',
  },
  memberRowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  memberTextCol: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  memberSub: {
    fontSize: 13,
    color: '#8A97AB',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioOuterSelected: {
    borderColor: '#F0913A',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F0913A',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  giveBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  giveBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
});
