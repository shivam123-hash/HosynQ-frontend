import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { FAMILY_MEMBERS } from '../mockData';

export type ViewersOption = 'everyone' | 'adults' | 'assignees';

export interface AssigneesAndViewersModalProps {
  visible: boolean;
  selectedAssignees: string[]; // names, e.g. ['You'] or ['Priya']
  selectedViewers: ViewersOption;
  onClose: () => void;
  onSave: (assignees: string[], viewers: ViewersOption, viewersLabel: string) => void;
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
}) => {
  const insets = useSafeAreaInsets();
  const members = FAMILY_MEMBERS.filter((m) => m.id !== 'everyone');

  // Normalize initial selection to match member names or 'You'
  const [currentAssignees, setCurrentAssignees] = useState<string[]>(() => {
    if (!selectedAssignees || selectedAssignees.length === 0) return ['You'];
    return selectedAssignees.map((name) =>
      name.toLowerCase() === 'priya' ? 'You' : name
    );
  });

  const [currentViewers, setCurrentViewers] =
    useState<ViewersOption>(selectedViewers || 'everyone');

  React.useEffect(() => {
    if (selectedAssignees && selectedAssignees.length > 0) {
      setCurrentAssignees(
        selectedAssignees.map((name) =>
          name.toLowerCase() === 'priya' ? 'You' : name
        )
      );
    }
    if (selectedViewers) {
      setCurrentViewers(selectedViewers);
    }
  }, [selectedAssignees, selectedViewers, visible]);

  const toggleAssignee = (memberName: string) => {
    const displayName = memberName === 'Priya' ? 'You' : memberName;
    setCurrentAssignees((prev) => {
      if (prev.includes(displayName)) {
        // Keep at least one assignee
        if (prev.length === 1) return prev;
        return prev.filter((n) => n !== displayName);
      }
      return [...prev, displayName];
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
                        <Feather name="check" size={10} color="#0B1A2F" />
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
                  style={[styles.viewerRow, !isLast && styles.rowDivider]}
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
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
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
  },
  subtitle: {
    fontSize: 14,
    color: '#8A97AB',
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
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrapperSelected: {
    borderColor: '#F0913A',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0B1A2F',
  },
  memberName: {
    fontSize: 13,
    color: '#8A97AB',
    fontWeight: '500',
  },
  memberNameSelected: {
    color: '#F0913A',
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A97AB',
    marginBottom: 12,
  },
  viewersCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 24,
  },
  viewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1F3352',
  },
  viewerTextCol: {
    flex: 1,
    marginRight: 12,
  },
  viewerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  viewerSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#F0913A',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F0913A',
  },
  doneBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
