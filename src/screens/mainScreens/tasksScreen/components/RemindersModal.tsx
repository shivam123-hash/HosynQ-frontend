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
import Feather from '@react-native-vector-icons/feather';

export interface RemindersModalProps {
  visible: boolean;
  initialReminders?: string[]; // list of selected options, e.g. ['1 hour before']
  initialAlsoRemindViewers?: boolean;
  onClose: () => void;
  onSave: (remindersText: string, remindersList: string[], alsoRemindViewers: boolean) => void;
}

const REMINDER_OPTIONS = [
  { id: 'due', title: 'When it’s due' },
  { id: '1hour', title: '1 hour before' },
  { id: 'morning', title: 'On the morning it’s due (9:00 AM)' },
  { id: '1day', title: '1 day before' },
  { id: '1week', title: '1 week before' },
  { id: 'custom', title: 'Custom time' },
];

const RemindersModal: React.FC<RemindersModalProps> = ({
  visible,
  initialReminders = ['1 hour before'],
  initialAlsoRemindViewers = false,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedItems, setSelectedItems] = useState<string[]>(initialReminders);
  const [alsoRemindViewers, setAlsoRemindViewers] = useState<boolean>(initialAlsoRemindViewers);

  React.useEffect(() => {
    setSelectedItems(initialReminders);
    setAlsoRemindViewers(initialAlsoRemindViewers);
  }, [initialReminders, initialAlsoRemindViewers, visible]);

  const toggleItem = (title: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(title)) {
        return prev.filter((t) => t !== title);
      }
      return [...prev, title];
    });
  };

  const handleDone = () => {
    const formatted =
      selectedItems.length > 0 ? selectedItems.join(' · ') : 'None';
    onSave(formatted, selectedItems, alsoRemindViewers);
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

          <Text style={styles.title}>Reminders</Text>
          <Text style={styles.subtitle}>Pick as many as you like</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Checkbox Options Card */}
            <View style={styles.optionsCard}>
              {REMINDER_OPTIONS.map((item, index) => {
                const isSelected = selectedItems.includes(item.title);
                const isLast = index === REMINDER_OPTIONS.length - 1;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.optionRow, !isLast && styles.rowDivider]}
                    onPress={() => toggleItem(item.title)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionTitle}>{item.title}</Text>

                    {/* Checkbox Box */}
                    <View
                      style={[
                        styles.checkBox,
                        isSelected && styles.checkBoxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Feather name="check" size={14} color="#0B1A2F" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Also remind viewers switch */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                Also remind the people who can see it
              </Text>
              <Switch
                value={alsoRemindViewers}
                onValueChange={setAlsoRemindViewers}
                trackColor={{ false: '#3A4556', true: '#F0913A' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

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

export default RemindersModal;

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
  },
  subtitle: {
    fontSize: 14,
    color: '#8A97AB',
    textAlign: 'center',
    marginTop: 4,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1F3352',
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxSelected: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
    flex: 1,
    marginRight: 16,
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
