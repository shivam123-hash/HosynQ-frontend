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

export interface EventRemindersModalProps {
  visible: boolean;
  selectedReminder: string;
  onClose: () => void;
  onSaveReminders: (reminderText: string) => void;
  asModal?: boolean;
}

const REMINDER_OPTIONS = [
  'When it starts',
  '30 minutes before',
  '2 hours before',
  'The evening before (7:00 PM)',
  '1 day before',
  '1 week before',
  'Custom time',
];

export const EventRemindersModal: React.FC<EventRemindersModalProps> = ({
  visible,
  selectedReminder,
  onClose,
  onSaveReminders,
  asModal = true,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedList, setSelectedList] = useState<string[]>(() => {
    return selectedReminder
      ? selectedReminder.split(' · ')
      : ['1 day before', '2 hours before'];
  });
  const [remindEveryone, setRemindEveryone] = useState(true);

  useEffect(() => {
    if (selectedReminder) {
      setSelectedList(selectedReminder.split(' · '));
    }
  }, [selectedReminder, visible]);

  if (!visible) return null;

  const toggleOption = (opt: string) => {
    setSelectedList((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  const handleDone = () => {
    const finalStr =
      selectedList.length > 0 ? selectedList.join(' · ') : 'No reminder';
    onSaveReminders(finalStr);
    onClose();
  };

  const content = (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Close reminders modal"
      />

      <View
        style={[
          styles.sheetContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Title & Subtitle (CAL-13) */}
        <Text style={styles.sheetTitle}>Reminders</Text>
        <Text style={styles.sheetSubtitle}>Pick as many as you like</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.optionsCard}>
            {REMINDER_OPTIONS.map((opt, idx) => {
              const isChecked = selectedList.includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionRow, idx > 0 && styles.rowDivider]}
                  onPress={() => toggleOption(opt)}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  accessibilityLabel={opt}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      isChecked && styles.optionLabelActive,
                    ]}
                  >
                    {opt}
                  </Text>

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

          {/* Remind everyone invited toggle (CAL-13) */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleTitle}>Remind everyone invited</Text>
            <Switch
              value={remindEveryone}
              onValueChange={setRemindEveryone}
              trackColor={{ false: '#243A5E', true: '#F0913A' }}
              thumbColor="#CAD4DF"
              ios_backgroundColor="#243A5E"
            />
          </View>
        </ScrollView>

        {/* Done Button (CAL-13) */}
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

export default EventRemindersModal;

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
  optionsCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
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
    paddingVertical: 15,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderColor: '#1A2C46',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  optionLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
