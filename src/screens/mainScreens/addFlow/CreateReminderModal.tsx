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
import Colors from '../../../units/Colors';
import { ReminderItem } from './types';

export interface CreateReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveReminder: (reminder: ReminderItem) => void;
  onConvertToTask?: () => void;
}

interface FamilyMemberOption {
  id: string;
  name: string;
  displayName: string;
  initial: string;
  color: string;
  textColor: string;
}

const FAMILY_MEMBERS: FamilyMemberOption[] = [
  {
    id: 'm1',
    name: 'You',
    displayName: 'Priya (you)',
    initial: 'P',
    color: Colors.avatarBrown,
    textColor: Colors.amberLight,
  },
  {
    id: 'm2',
    name: 'Rohan',
    displayName: 'Rohan',
    initial: 'R',
    color: Colors.avatarNavy,
    textColor: Colors.accentBlueSoft,
  },
  {
    id: 'm3',
    name: 'Anaya',
    displayName: 'Anaya',
    initial: 'A',
    color: Colors.avatarWine,
    textColor: Colors.accentPink,
  },
  {
    id: 'm4',
    name: 'Aarav',
    displayName: 'Aarav',
    initial: 'Aa',
    color: Colors.avatarOlive,
    textColor: Colors.accentYellow,
  },
  {
    id: 'm5',
    name: 'Dadi',
    displayName: 'Dadi',
    initial: 'D',
    color: Colors.avatarGreen,
    textColor: Colors.accentGreenSoft,
  },
];

const REPEAT_OPTIONS = [
  'Doesn’t repeat',
  'Daily',
  'Every week',
  'Every month',
  'Every year',
];

export const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  visible,
  onClose,
  onSaveReminder,
  onConvertToTask,
}) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('Call the plumber about the kitchen tap');
  const [reminderType, setReminderType] = useState<'time' | 'place'>('time');
  const [selectedWhen, setSelectedWhen] = useState('This evening, 7:00 PM');
  const [assignee, setAssignee] = useState('You');
  const [repeat, setRepeat] = useState('Doesn’t repeat');
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);

  const currentMember =
    FAMILY_MEMBERS.find((m) => m.name === assignee) || FAMILY_MEMBERS[0];

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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Feather name="x" size={20} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer} pointerEvents="none">
              <Text style={styles.headerTitle}>New reminder</Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Remind me to... Input */}
            <Text style={styles.inputLabel}>Remind me to...</Text>
            <View style={styles.inputBox}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="What do you want to be reminded about?"
                placeholderTextColor={Colors.textPlaceholder}
                style={styles.textInput}
                multiline
              />
            </View>

            {/* At a time / At a place Segmented Control */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                onPress={() => setReminderType('time')}
                activeOpacity={0.8}
                style={[
                  styles.segmentBtn,
                  reminderType === 'time' && styles.segmentBtnActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel="At a time"
              >
                <Feather
                  name="clock"
                  size={16}
                  color={reminderType === 'time' ? Colors.cardInsetDark : Colors.textSubtle}
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
                accessibilityRole="button"
                accessibilityLabel="At a place"
              >
                <Feather
                  name="map-pin"
                  size={16}
                  color={reminderType === 'place' ? Colors.cardInsetDark : Colors.textSubtle}
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
              {whenChips.map((chipText) => {
                const isSelected = selectedWhen === chipText;
                return (
                  <TouchableOpacity
                    key={chipText}
                    onPress={() => setSelectedWhen(chipText)}
                    activeOpacity={0.7}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={chipText}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected
                          ? styles.chipTextSelected
                          : styles.chipTextUnselected,
                      ]}
                    >
                      {chipText}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Remind & Repeat Card Container */}
            <View style={styles.cardContainer}>
              {/* Remind row */}
              <TouchableOpacity
                onPress={() => setShowAssigneeModal(true)}
                activeOpacity={0.7}
                style={styles.rowItem}
                accessibilityRole="button"
                accessibilityLabel={`Remind ${assignee}`}
              >
                <View style={styles.rowLeft}>
                  <Feather name="user" size={18} color={Colors.textSubtle} />
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Remind</Text>
                    <View style={styles.avatarRow}>
                      <View
                        style={[
                          styles.avatarCircle,
                          { backgroundColor: currentMember.color },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarText,
                            { color: currentMember.textColor },
                          ]}
                        >
                          {currentMember.initial}
                        </Text>
                      </View>
                      <Text style={styles.rowValue}>{assignee}</Text>
                    </View>
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.textMutedSoft} />
              </TouchableOpacity>

              <View style={styles.rowDivider} />

              {/* Repeat row */}
              <TouchableOpacity
                onPress={() => setShowRepeatModal(true)}
                activeOpacity={0.7}
                style={styles.rowItem}
                accessibilityRole="button"
                accessibilityLabel={`Repeat ${repeat}`}
              >
                <View style={styles.rowLeft}>
                  <Feather name="repeat" size={18} color={Colors.textSubtle} />
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Repeat</Text>
                    <Text style={styles.rowValue}>{repeat}</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.textMutedSoft} />
              </TouchableOpacity>
            </View>

            {/* Hint Box (Nudge to task) */}
            <View style={styles.hintBox}>
              <Feather
                name="bell"
                size={16}
                color={Colors.textSubtle}
                style={styles.hintIcon}
              />
              <Text style={styles.hintText}>
                A reminder is just a nudge. If someone needs to get it done,{' '}
                <Text
                  onPress={() => {
                    onClose();
                    onConvertToTask?.();
                  }}
                  style={styles.hintLink}
                >
                  make it a task instead.
                </Text>
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Submit Button */}
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom + 8, 24) },
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

        {/* Assignee Picker Bottom Sheet Modal */}
        <Modal
          visible={showAssigneeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAssigneeModal(false)}
        >
          <View style={styles.pickerOverlay}>
            <TouchableOpacity
              style={styles.pickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowAssigneeModal(false)}
            />
            <View
              style={[
                styles.pickerSheet,
                { paddingBottom: Math.max(insets.bottom + 16, 24) },
              ]}
            >
              <View style={styles.pickerHandle} />
              <Text style={styles.pickerTitle}>Remind who?</Text>
              <Text style={styles.pickerSubtitle}>
                Choose a family member to notify
              </Text>
              <View style={styles.pickerCard}>
                {FAMILY_MEMBERS.map((member, idx) => {
                  const isSelected = assignee === member.name;
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.pickerRow,
                        idx > 0 && styles.pickerRowDivider,
                      ]}
                      onPress={() => {
                        setAssignee(member.name);
                        setShowAssigneeModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.avatarCircle,
                          { backgroundColor: member.color },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarText,
                            { color: member.textColor },
                          ]}
                        >
                          {member.initial}
                        </Text>
                      </View>
                      <Text style={styles.pickerRowText}>
                        {member.displayName}
                      </Text>
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
            </View>
          </View>
        </Modal>

        {/* Repeat Picker Bottom Sheet Modal */}
        <Modal
          visible={showRepeatModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRepeatModal(false)}
        >
          <View style={styles.pickerOverlay}>
            <TouchableOpacity
              style={styles.pickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowRepeatModal(false)}
            />
            <View
              style={[
                styles.pickerSheet,
                { paddingBottom: Math.max(insets.bottom + 16, 24) },
              ]}
            >
              <View style={styles.pickerHandle} />
              <Text style={styles.pickerTitle}>Repeat</Text>
              <Text style={styles.pickerSubtitle}>Set reminder cadence</Text>
              <View style={styles.pickerCard}>
                {REPEAT_OPTIONS.map((opt, idx) => {
                  const isSelected = repeat === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.pickerRow,
                        idx > 0 && styles.pickerRowDivider,
                      ]}
                      onPress={() => {
                        setRepeat(opt);
                        setShowRepeatModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.pickerRowText}>{opt}</Text>
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
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    color: Colors.textSubtle,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputBox: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 24,
    minHeight: 96,
  },
  textInput: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    lineHeight: 25,
    padding: 0,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.cardInsetAlt,
    borderRadius: 28,
    padding: 4,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: Colors.surfaceNavyDark,
    height: 54,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    height: 44,
  },
  segmentBtnActive: {
    backgroundColor: Colors.primary,
  },
  segmentIcon: {
    marginRight: 8,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
  segmentTextActive: {
    color: Colors.cardInsetDark,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPlaceholder,
    letterSpacing: 1,
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
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipUnselected: {
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.borderBold,
  },
  chipText: {
    fontSize: 14,
  },
  chipTextSelected: {
    color: Colors.cardInsetDark,
    fontWeight: '700',
  },
  chipTextUnselected: {
    color: Colors.white,
    fontWeight: '600',
  },
  cardContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    marginBottom: 20,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
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
    color: Colors.textTertiaryAlt,
    marginBottom: 4,
    fontWeight: '500',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.avatarBrown,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.amberLight,
  },
  rowValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.surfaceElevated2,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.surfaceNavyLight,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.transparent,
    marginBottom: 20,
  },
  hintIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  hintText: {
    flex: 1,
    fontSize: 13.5,
    color: Colors.textSubtle,
    lineHeight: 19,
  },
  hintLink: {
    color: Colors.textLightMutedAlt,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 8,
    backgroundColor: Colors.transparent,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 18, 0.7)',
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  pickerSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  pickerHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMuted,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  pickerSubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: 18,
  },
  pickerCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    overflow: 'hidden',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  pickerRowDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceElevated2,
  },
  pickerRowText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderLightAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
