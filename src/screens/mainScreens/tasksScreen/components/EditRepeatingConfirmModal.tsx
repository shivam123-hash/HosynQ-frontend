import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppDialog from '../../../../components/AppDialog';
import Colors from '../../../../units/Colors';

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
    <AppDialog
      visible={visible}
      type="custom"
      iconName="repeat"
      iconColor={Colors.primary}
      iconCircleBorderColor={Colors.borderBold}
      iconCircleBgColor={Colors.background}
      title="Change just this one?"
      description={`This task repeats ${repeatInterval}.`}
      primaryButtonText="Save changes"
      primaryButtonVariant="primary"
      onPrimaryPress={handleSave}
      secondaryButtonText="Cancel"
      secondaryButtonColor={Colors.primary}
      onSecondaryPress={onClose}
      onClose={onClose}
    >
      <View style={styles.optionsCard}>
        {/* Option 1: Only this one */}
        <TouchableOpacity
          style={[
            styles.optionRow,
            selectedScope === 'this_only' && styles.optionRowSelected,
          ]}
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
          style={[
            styles.optionRow,
            selectedScope === 'all_future' && styles.optionRowSelected,
          ]}
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
    </AppDialog>
  );
};

export default EditRepeatingConfirmModal;

const styles = StyleSheet.create({
  optionsCard: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    overflow: 'hidden',
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  optionRowSelected: {
    backgroundColor: '#1A2B47',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderBold,
  },
  optionTextCol: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textLightMutedAlt,
  },
  optionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondaryMuted,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.handleMuted,
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
});
