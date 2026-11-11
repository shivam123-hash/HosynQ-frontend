import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { CALENDAR_FAMILY_MEMBERS } from '../mockData';

export interface InviteListModalProps {
  visible: boolean;
  selectedMemberIds: string[];
  onClose: () => void;
  onSaveInvites: (invitedIds: string[]) => void;
  asModal?: boolean;
}

export const InviteListModal: React.FC<InviteListModalProps> = ({
  visible,
  selectedMemberIds,
  onClose,
  onSaveInvites,
  asModal = true,
}) => {
  const insets = useSafeAreaInsets();
  const [invitedIds, setInvitedIds] = useState<string[]>(selectedMemberIds);
  const [askConfirmation, setAskConfirmation] = useState(true);

  useEffect(() => {
    setInvitedIds(selectedMemberIds);
  }, [selectedMemberIds, visible]);

  if (!visible) return null;

  const toggleMember = (id: string) => {
    setInvitedIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleDone = () => {
    onSaveInvites(invitedIds);
    onClose();
  };

  const count = invitedIds.length;
  const buttonText =
    count === 0
      ? 'Invite members'
      : count === 1
      ? 'Invite 1 person'
      : `Invite ${count} people`;

  const content = (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Close invite list modal"
      />

      <View
        style={[
          styles.sheetContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Title & Subtitle (CAL-12) */}
        <Text style={styles.sheetTitle}>Who’s invited?</Text>
        <Text style={styles.sheetSubtitle}>
          They’ll see it on their calendar
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.membersCard}>
            {CALENDAR_FAMILY_MEMBERS.map((m, idx) => {
              const isChecked = invitedIds.includes(m.id);
              const isPriya = m.name === 'Priya';
              const displayName = isPriya ? 'Priya (you)' : m.name;
              const statusSubtitle = isPriya ? 'Organiser' : 'Free at 8:00 PM';

              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.memberRow, idx > 0 && styles.rowDivider]}
                  onPress={() => toggleMember(m.id)}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  accessibilityLabel={displayName}
                >
                  <View style={[styles.avatar, { backgroundColor: m.color }]}>
                    <Text
                      style={[
                        styles.avatarText,
                        { color: m.textColor || '#FFFFFF' },
                      ]}
                    >
                      {m.initial}
                    </Text>
                  </View>

                  <View style={styles.memberTextCol}>
                    <Text style={styles.memberName}>{displayName}</Text>
                    <Text style={styles.memberStatusText}>
                      {statusSubtitle}
                    </Text>
                  </View>

                  {/* Checkbox (CAL-12 orange square) */}
                  <View
                    style={[
                      styles.checkbox,
                      isChecked && styles.checkboxChecked,
                    ]}
                  >
                    {isChecked && (
                      <Feather name="check" size={14} color="#0B1A2F" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Ask them to confirm they're coming row (CAL-12) */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleTitle}>
              Ask them to confirm they’re coming
            </Text>
            <Switch
              value={askConfirmation}
              onValueChange={setAskConfirmation}
              trackColor={{ false: '#243A5E', true: '#F0913A' }}
              thumbColor="#CAD4DF"
              ios_backgroundColor="#243A5E"
            />
          </View>
        </ScrollView>

        {/* Invite Button (CAL-12) */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={handleDone}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={buttonText}
        >
          <Text style={styles.doneBtnText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!asModal) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

export default InviteListModal;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 10, 20, 0.72)',
    justifyContent: 'flex-end',
    zIndex: 999,
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '88%',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13.5,
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
    overflow: 'hidden',
    marginBottom: 20,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderColor: '#1A2C46',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  memberTextCol: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  memberStatusText: {
    fontSize: 12.5,
    color: '#8A97AB',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#3A4D6B',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  doneBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
