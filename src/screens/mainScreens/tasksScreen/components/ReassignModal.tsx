import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FAMILY_MEMBERS } from '../mockData';

export interface ReassignModalProps {
  visible: boolean;
  taskTitle: string;
  currentAssignee: string;
  onClose: () => void;
  onSelectAssignee: (name: string) => void;
}

const ReassignModal: React.FC<ReassignModalProps> = ({
  visible,
  taskTitle,
  currentAssignee,
  onClose,
  onSelectAssignee,
}) => {
  const insets = useSafeAreaInsets();
  const members = FAMILY_MEMBERS.filter((m) => m.id !== 'everyone');
  const [selectedId, setSelectedId] = useState('rohan');
  const [notifyAssignee, setNotifyAssignee] = useState(true);

  const selectedMember =
    members.find((m) => m.id === selectedId) || members[0];

  const handleConfirm = () => {
    onSelectAssignee(selectedMember.name);
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
          <View style={styles.handle} />
          <Text style={styles.title}>Reassign task</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {taskTitle}
          </Text>

          {/* Members List */}
          <View style={styles.membersCard}>
            {members.map((m, index) => {
              const isSelected = selectedId === m.id;
              const isLast = index === members.length - 1;
              const isCurrentlyAssigned =
                m.name.toLowerCase() === currentAssignee.toLowerCase();

              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.memberRow, !isLast && styles.rowDivider]}
                  onPress={() => setSelectedId(m.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.avatar, { backgroundColor: m.avatarBg }]}
                  >
                    <Text style={[styles.avatarText, { color: m.avatarColor }]}>
                      {m.initial}
                    </Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {m.name}
                      {m.name === 'Priya' ? ' (you)' : ''}
                    </Text>
                    <Text style={styles.memberSub}>
                      {isCurrentlyAssigned
                        ? `Assigned now · ${m.taskCount || 4} tasks this week`
                        : `${m.taskCount || 1} tasks this week`}
                    </Text>
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

          {/* Let member know switch */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {`Let ${selectedMember.name} know`}
            </Text>
            <Switch
              value={notifyAssignee}
              onValueChange={setNotifyAssignee}
              trackColor={{ false: '#1F3352', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>
              {`Reassign to ${selectedMember.name}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReassignModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 22, 0.75)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#0B1A2F',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    alignSelf: 'center',
    marginBottom: 14,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1F3352',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  memberSub: {
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  actionBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1A2F',
  },
  cancelBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F0913A',
  },
});

