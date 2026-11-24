import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppDialog from '../../../../components/AppDialog';
import Colors from '../../../../units/Colors';

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

  return (
    <AppDialog
      visible={visible}
      type="custom"
      iconName="repeat"
      iconColor={Colors.primary}
      iconCircleBorderColor="#294C7D"
      iconCircleBgColor={Colors.cardBackground}
      title={`Change just this ${entityName}?`}
      description={`${eventTitle} ${repeatRuleText}.`}
      primaryButtonText="Save changes"
      primaryButtonVariant="primary"
      primaryButtonAccessibilityLabel="Save changes"
      onPrimaryPress={handleSave}
      secondaryButtonText="Cancel"
      secondaryButtonColor={Colors.primary}
      secondaryButtonAccessibilityLabel="Cancel"
      onSecondaryPress={onClose}
      onClose={onClose}
      asModal={asModal}
    >
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
    </AppDialog>
  );
};

export default EditRepeatingEventModal;

const styles = StyleSheet.create({
  optionsCard: {
    width: '100%',
    backgroundColor: '#0F1E36',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderBold,
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
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12.5,
    color: Colors.textSecondaryMuted,
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
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
});
