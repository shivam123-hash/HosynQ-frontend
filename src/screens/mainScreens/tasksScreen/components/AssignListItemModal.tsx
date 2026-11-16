import React, { useState } from 'react';
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
import { ListItemEntry } from '../types';

export interface AssignListItemModalProps {
  visible: boolean;
  item: ListItemEntry | null;
  onClose: () => void;
  onAssign: (itemId: string, assigneeName?: string, initial?: string, bg?: string) => void;
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
  {
    id: 'aarav',
    name: 'Aarav',
    roleSubtitle: '0 items',
    initial: 'Aa',
    avatarBg: '#78350F',
  },
];

const AssignListItemModal: React.FC<AssignListItemModalProps> = ({
  visible,
  item,
  onClose,
  onAssign,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<string>('rohan');
  const [anyoneCanPick, setAnyoneCanPick] = useState<boolean>(false);

  React.useEffect(() => {
    if (item && item.assignedTo) {
      const match = MEMBERS.find(
        (m) => m.name.toLowerCase().includes(item.assignedTo!.toLowerCase())
      );
      if (match) {
        setSelectedId(match.id);
        setAnyoneCanPick(false);
      }
    } else {
      setSelectedId('rohan');
      setAnyoneCanPick(!item?.assignedTo);
    }
  }, [item, visible]);

  if (!item) return null;

  const selectedMember = MEMBERS.find((m) => m.id === selectedId);

  const handleConfirm = () => {
    if (anyoneCanPick) {
      onAssign(item.id, undefined, undefined, undefined);
    } else if (selectedMember) {
      onAssign(
        item.id,
        selectedMember.name.replace(' (you)', ''),
        selectedMember.initial,
        selectedMember.avatarBg
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
              {MEMBERS.map((member, idx) => {
                const isSelected = !anyoneCanPick && selectedId === member.id;

                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.memberRow,
                      idx > 0 && styles.memberRowDivider,
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
    backgroundColor: '#0B1A2F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#CAD4DF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A97AB',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  membersCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    marginBottom: 20,
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  memberRowDivider: {
    borderTopWidth: 1,
    borderColor: '#1A2C46',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberTextCol: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  memberSub: {
    fontSize: 12,
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
    paddingVertical: 10,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  giveBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  giveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
