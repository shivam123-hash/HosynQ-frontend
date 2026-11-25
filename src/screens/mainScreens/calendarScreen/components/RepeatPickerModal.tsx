import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface RepeatOption {
  id: string;
  label: string;
  subtitle: string;
}

export const REPEAT_OPTIONS: RepeatOption[] = [
  {
    id: 'NONE',
    label: 'Doesn’t repeat',
    subtitle: 'One-time event',
  },
  {
    id: 'DAILY',
    label: 'Every day',
    subtitle: 'Repeats daily',
  },
  {
    id: 'WEEKDAY',
    label: 'Every weekday',
    subtitle: 'Monday to Friday',
  },
  {
    id: 'WEEKLY',
    label: 'Every week',
    subtitle: 'Repeats weekly on this day',
  },
  {
    id: 'MONTHLY',
    label: 'Every month',
    subtitle: 'Repeats on the same date each month',
  },
  {
    id: 'YEARLY',
    label: 'Every year',
    subtitle: 'Repeats annually on this date',
  },
];

export interface RepeatPickerModalProps {
  visible: boolean;
  selectedRepeat: string;
  onClose: () => void;
  onSelectRepeat: (repeatText: string) => void;
  asModal?: boolean;
}

export const RepeatPickerModal: React.FC<RepeatPickerModalProps> = ({
  visible,
  selectedRepeat,
  onClose,
  onSelectRepeat,
  asModal = true,
}) => {
  const insets = useSafeAreaInsets();
  const [currentSelected, setCurrentSelected] = useState(
    selectedRepeat || 'Doesn’t repeat'
  );

  useEffect(() => {
    setCurrentSelected(selectedRepeat || 'Doesn’t repeat');
  }, [selectedRepeat, visible]);

  if (!visible) return null;

  const handleSelect = (label: string) => {
    setCurrentSelected(label);
  };

  const handleDone = () => {
    onSelectRepeat(currentSelected);
    onClose();
  };

  const content = (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Close repeat picker"
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
        <Text style={styles.sheetTitle}>Repeat</Text>
        <Text style={styles.sheetSubtitle}>
          Choose how often this event occurs
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.optionsCard}>
            {REPEAT_OPTIONS.map((opt, idx) => {
              const isSelected =
                currentSelected.toLowerCase() === opt.label.toLowerCase() ||
                (opt.label === 'Doesn’t repeat' &&
                  (currentSelected === "Doesn't repeat" ||
                    currentSelected === 'Doesn’t repeat'));

              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                    idx > 0 && styles.rowDivider,
                  ]}
                  onPress={() => handleSelect(opt.label)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={opt.label}
                >
                  <View style={styles.optionTextCol}>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                  </View>

                  {/* Radio circle */}
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
        </ScrollView>

        {/* Done Button */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={handleDone}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <Text style={styles.doneBtnText}>Done</Text>
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

export default RepeatPickerModal;

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
    backgroundColor: '#122440',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '82%',
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
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13.5,
    color: '#8A97AB',
    textAlign: 'center',
    marginBottom: 18,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  optionsCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    overflow: 'hidden',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'transparent',
  },
  optionRowSelected: {
    backgroundColor: '#1A2B47',
  },
  rowDivider: {
    borderTopWidth: 1,
    borderColor: '#1A2C46',
  },
  optionTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  optionLabel: {
    fontSize: 15.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  optionLabelActive: {
    color: '#FFFFFF',
    fontFamily: 'Roboto-Bold',
  },
  optionSubtitle: {
    fontSize: 12.5,
    color: '#8A97AB',
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#3A4D6B',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioOuterSelected: {
    borderColor: '#F0913A',
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#F0913A',
  },
  doneBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  doneBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
});
