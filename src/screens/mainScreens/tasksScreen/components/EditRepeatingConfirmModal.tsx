import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export type RepeatEditScope = 'this_only' | 'all_future';

export interface EditRepeatingConfirmModalProps {
  visible: boolean;
  repeatInterval?: string; // e.g. "every month"
  dueDateText?: string; // e.g. "31 Oct"
  onClose: () => void;
  onConfirm: (scope: RepeatEditScope) => void;
}

const EditRepeatingConfirmModal: React.FC<EditRepeatingConfirmModalProps> = ({
  visible,
  repeatInterval = 'every month',
  dueDateText = '31 Oct',
  onClose,
  onConfirm,
}) => {
  const [selectedScope, setSelectedScope] = useState<RepeatEditScope>('all_future');

  const handleSave = () => {
    onConfirm(selectedScope);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.dialogCard}>
          {/* Top Repeat Icon */}
          <View style={styles.iconCircle}>
            <Feather name="repeat" size={24} color="#F0913A" />
          </View>

          <Text style={styles.title}>Change just this one?</Text>
          <Text style={styles.subtitle}>
            {`This task repeats ${repeatInterval}.`}
          </Text>

          {/* Scope Options */}
          <View style={styles.optionsCard}>
            {/* Option 1: Only this one */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedScope('this_only')}
              activeOpacity={0.7}
            >
              <View style={styles.optionTextCol}>
                <Text style={styles.optionTitle}>Only this one</Text>
                <Text style={styles.optionSubtitle}>{`Due ${dueDateText}`}</Text>
              </View>

              <View
                style={[
                  styles.radioCircle,
                  selectedScope === 'this_only' && styles.radioCircleSelected,
                ]}
              >
                {selectedScope === 'this_only' && (
                  <View style={styles.radioInnerDot} />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Option 2: This and all future ones */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedScope('all_future')}
              activeOpacity={0.7}
            >
              <View style={styles.optionTextCol}>
                <Text style={styles.optionTitle}>This and all future ones</Text>
                <Text style={styles.optionSubtitle}>
                  {`From ${dueDateText} onwards`}
                </Text>
              </View>

              <View
                style={[
                  styles.radioCircle,
                  selectedScope === 'all_future' && styles.radioCircleSelected,
                ]}
              >
                {selectedScope === 'all_future' && (
                  <View style={styles.radioInnerDot} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Primary Button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>Save changes</Text>
          </TouchableOpacity>

          {/* Secondary Button */}
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

export default EditRepeatingConfirmModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 24,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialogCard: {
    width: '100%',
    backgroundColor: '#122440',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0B1A2F',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#CAD4DF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8A97AB',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  optionsCard: {
    width: '100%',
    backgroundColor: '#0B1A2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  optionTextCol: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  optionSubtitle: {
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
  saveBtn: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F0913A',
  },
});
