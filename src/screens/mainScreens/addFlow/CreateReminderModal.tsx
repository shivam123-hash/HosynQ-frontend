import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { ReminderItem } from './types';

export interface CreateReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveReminder: (reminder: ReminderItem) => void;
}

export const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  visible,
  onClose,
  onSaveReminder,
}) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('Call the plumber about the kitchen tap');
  const [reminderType, setReminderType] = useState<'time' | 'place'>('time');
  const [selectedWhen, setSelectedWhen] = useState('This evening, 7:00 PM');
  const [assignee, setAssignee] = useState('You');
  const [repeat, setRepeat] = useState("Doesn't repeat");

  const whenChips = [
    'In 1 hour',
    'This evening, 7:00 PM',
    'Tomorrow, 9:00 AM',
    'Pick a time',
  ];

  const handleSetReminder = () => {
    const newReminder: ReminderItem = {
      id: `rem-${Date.now()}`,
      title: title.trim() || 'Reminder',
      type: reminderType,
      whenText: selectedWhen,
      assignee,
      repeat,
    };
    onSaveReminder(newReminder);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Feather name="x" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New reminder</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Input Label & Box */}
            <Text style={styles.inputLabel}>Remind me to...</Text>
            <View style={styles.inputBox}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="What do you want to be reminded of?"
                placeholderTextColor="#687B91"
                multiline
                style={styles.textInput}
              />
            </View>

            {/* Type Toggle: At a time vs At a place */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                onPress={() => setReminderType('time')}
                activeOpacity={0.8}
                style={[
                  styles.segmentBtn,
                  reminderType === 'time' && styles.segmentBtnActive,
                ]}
              >
                <Feather
                  name="clock"
                  size={16}
                  color={reminderType === 'time' ? '#0A131F' : '#8E9BAE'}
                  style={styles.segmentIcon}
                />
                <Text
                  style={[
                    styles.segmentText,
                    reminderType === 'time' && styles.segmentTextActive,
                  ]}
                >
                  At a time
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setReminderType('place')}
                activeOpacity={0.8}
                style={[
                  styles.segmentBtn,
                  reminderType === 'place' && styles.segmentBtnActive,
                ]}
              >
                <Feather
                  name="map-pin"
                  size={16}
                  color={reminderType === 'place' ? '#0A131F' : '#8E9BAE'}
                  style={styles.segmentIcon}
                />
                <Text
                  style={[
                    styles.segmentText,
                    reminderType === 'place' && styles.segmentTextActive,
                  ]}
                >
                  At a place
                </Text>
              </TouchableOpacity>
            </View>

            {/* WHEN Section */}
            <Text style={styles.sectionHeading}>WHEN</Text>
            <View style={styles.chipsContainer}>
              {whenChips.map((chip) => {
                const isSelected = selectedWhen === chip;
                return (
                  <TouchableOpacity
                    key={chip}
                    onPress={() => setSelectedWhen(chip)}
                    activeOpacity={0.7}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                      ]}
                    >
                      {chip}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Settings Card: Remind & Repeat */}
            <View style={styles.cardContainer}>
              <TouchableOpacity
                onPress={() =>
                  setAssignee(assignee === 'You' ? 'Rohan' : 'You')
                }
                activeOpacity={0.7}
                style={styles.rowItem}
              >
                <View style={styles.rowLeft}>
                  <Feather name="user" size={18} color="#8E9BAE" />
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Remind</Text>
                    <View style={styles.avatarRow}>
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>P</Text>
                      </View>
                      <Text style={styles.rowValue}>{assignee}</Text>
                    </View>
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color="#5C6E82" />
              </TouchableOpacity>

              <View style={styles.rowDivider} />

              <TouchableOpacity
                onPress={() =>
                  setRepeat(
                    repeat === "Doesn't repeat" ? 'Daily' : "Doesn't repeat"
                  )
                }
                activeOpacity={0.7}
                style={styles.rowItem}
              >
                <View style={styles.rowLeft}>
                  <Feather name="repeat" size={18} color="#8E9BAE" />
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Repeat</Text>
                    <Text style={styles.rowValue}>{repeat}</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color="#5C6E82" />
              </TouchableOpacity>
            </View>

            {/* Hint Box (Dashed) */}
            <View style={styles.hintBox}>
              <Feather name="bell" size={18} color="#8E9BAE" style={styles.hintIcon} />
              <Text style={styles.hintText}>
                A reminder is just a nudge. If someone needs to get it done,
                make it a task instead.
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Button */}
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              onPress={handleSetReminder}
              activeOpacity={0.8}
              style={styles.submitBtn}
              accessibilityRole="button"
              accessibilityLabel="Set reminder"
            >
              <Text style={styles.submitBtnText}>Set reminder</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#162434',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#162536',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRightSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  inputLabel: {
    fontSize: 13,
    color: '#8E9BAE',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputBox: {
    backgroundColor: '#101F2F',
    borderWidth: 1.5,
    borderColor: '#F0913A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    minHeight: 88,
  },
  textInput: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
    padding: 0,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#112030',
    borderRadius: 24,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#192C3E',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  segmentBtnActive: {
    backgroundColor: '#F0913A',
  },
  segmentIcon: {
    marginRight: 6,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E9BAE',
  },
  segmentTextActive: {
    color: '#0A131F',
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7D8B9B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  chipUnselected: {
    backgroundColor: '#112030',
    borderColor: '#1C2E42',
  },
  chipText: {
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#0A131F',
    fontWeight: '700',
  },
  chipTextUnselected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cardContainer: {
    backgroundColor: '#112030',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1B2C3E',
    marginBottom: 20,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTextCol: {
    marginLeft: 14,
  },
  rowLabel: {
    fontSize: 12,
    color: '#8E9BAE',
    marginBottom: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C87D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#172739',
    marginLeft: 48,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#24364A',
    borderRadius: 14,
    padding: 14,
  },
  hintIcon: {
    marginRight: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: '#8E9BAE',
    lineHeight: 18,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#142232',
  },
  submitBtn: {
    backgroundColor: '#F0913A',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
