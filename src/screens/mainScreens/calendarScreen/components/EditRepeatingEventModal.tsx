import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export type RepeatingEditScope = 'this_one' | 'this_and_future' | 'all';

export interface EditRepeatingEventModalProps {
  visible: boolean;
  eventTitle?: string;
  repeatRuleText?: string;
  onClose: () => void;
  onSelectScope: (scope: RepeatingEditScope) => void;
  asModal?: boolean;
}

export const EditRepeatingEventModal: React.FC<EditRepeatingEventModalProps> = ({
  visible,
  eventTitle = 'Badminton class',
  repeatRuleText = 'repeats every Friday',
  onClose,
  onSelectScope,
  asModal = true,
}) => {
  const [scope, setScope] = useState<RepeatingEditScope>('this_and_future');

  if (!visible) return null;

  const handleSave = () => {
    onSelectScope(scope);
    onClose();
  };

  const isClass = eventTitle.toLowerCase().includes('class');
  const entityName = isClass ? 'class' : 'event';
  const pluralEntity = isClass ? 'classes' : 'events';

  const content = (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog"
      />

      <View style={styles.cardContainer}>
        {/* Repeat Badge (CAL-14) */}
        <View style={styles.iconCircle}>
          <Feather name="repeat" size={24} color="#F0913A" />
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>{`Change just this ${entityName}?`}</Text>
        <Text style={styles.subtitle}>
          {`${eventTitle} ${repeatRuleText}.`}
        </Text>

        {/* Radio Options Card */}
        <View style={styles.optionsCard}>
          {/* Option 1: Only this one */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setScope('this_one')}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: scope === 'this_one' }}
          >
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>Only this one</Text>
              <Text style={styles.optionDesc}>Fri, 30 Oct</Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                scope === 'this_one' && styles.radioOuterSelected,
              ]}
            >
              {scope === 'this_one' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Option 2: This and future */}
          <TouchableOpacity
            style={[styles.optionRow, styles.rowDivider]}
            onPress={() => setScope('this_and_future')}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: scope === 'this_and_future' }}
          >
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>
                {`This and future ${pluralEntity}`}
              </Text>
              <Text style={styles.optionDesc}>From 30 Oct onwards</Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                scope === 'this_and_future' && styles.radioOuterSelected,
              ]}
            >
              {scope === 'this_and_future' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Option 3: All */}
          <TouchableOpacity
            style={[styles.optionRow, styles.rowDivider]}
            onPress={() => setScope('all')}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: scope === 'all' }}
          >
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>{`All ${pluralEntity}`}</Text>
              <Text style={styles.optionDesc}>Including past ones</Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                scope === 'all' && styles.radioOuterSelected,
              ]}
            >
              {scope === 'all' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Orange Save Changes Button (CAL-14) */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
        >
          <Text style={styles.saveBtnText}>Save changes</Text>
        </TouchableOpacity>

        {/* Orange Cancel Link (CAL-14) */}
        <TouchableOpacity
          style={styles.cancelLink}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelLinkText}>Cancel</Text>
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
      animationType="fade"
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

export default EditRepeatingEventModal;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 10, 20, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#122440',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#294C7D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#CAD4DF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  optionsCard: {
    width: '100%',
    backgroundColor: '#0F1E36',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderColor: '#1A2C46',
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12.5,
    color: '#8A97AB',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3A4D6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#F0913A',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F0913A',
  },
  saveBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelLink: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  cancelLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F0913A',
  },
});
