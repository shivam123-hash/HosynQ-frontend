import React, { useEffect, useMemo, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { getMyFamilyBasicThunk } from '../../../redux/features/family/familySlice';
import {
  createReminderThunk,
  updateReminderThunk,
} from '../../../redux/features/reminders/remindersSlice';
import { isUUID } from '../../../redux/features/lists/listsSlice';
import {
  ReminderApi,
  UpdateReminderPayload,
} from '../../../services/remindersServices';
import DueDateTimeModal from '../tasksScreen/components/DueDateTimeModal';
import ReminderDialog, {
  INITIAL_REMINDER_DIALOG_STATE,
  ReminderDialogState,
} from './ReminderDialog';
import {
  REMINDER_REPEAT_OPTIONS,
  REMINDER_WEEKDAYS,
  convertWhenChipToIstSchedule,
  extractReminderMembersFromFamilyState,
  format24HourTo12Hour,
  formatReminderRecipients,
  formatReminderScheduleLabel,
  getIstDateParts,
  isJestTestEnv,
  mapApiRepeatToUi,
  mapUiRepeatToApi,
} from './reminderApiHelpers';
import { ReminderItem } from './types';

export interface CreateReminderModalProps {
  visible: boolean;
  asModal?: boolean;
  onClose: () => void;
  onSaveReminder?: (reminder: ReminderItem) => void;
  onApiSaved?: (reminder: ReminderApi, isEdit: boolean) => void;
  onConvertToTask?: () => void;
  reminderToEdit?: ReminderApi | null;
}

const WHEN_CHIPS = [
  'In 1 hour',
  'This evening, 7:00 PM',
  'Tomorrow, 9:00 AM',
  'Pick a time',
] as const;

export const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  visible,
  asModal = true,
  onClose,
  onSaveReminder,
  onApiSaved,
  onConvertToTask,
  reminderToEdit,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const familyState = useAppSelector((state) => state.family);
  const remindersState = useAppSelector((state) => state.reminders);
  const isTestEnv = isJestTestEnv();

  const { members, myMemberId, isChild } = useMemo(
    () => extractReminderMembersFromFamilyState(familyState),
    [familyState]
  );

  const isEditing = Boolean(reminderToEdit?.id);

  const [title, setTitle] = useState('');
  const [reminderType, setReminderType] = useState<'time' | 'place'>('time');
  const [selectedWhen, setSelectedWhen] = useState<string>('This evening, 7:00 PM');
  const [customIsoDate, setCustomIsoDate] = useState<string>('');
  const [customTimeStr, setCustomTimeStr] = useState<string>('7:00 PM');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [repeat, setRepeat] = useState('Doesn’t repeat');
  const [repeatDays, setRepeatDays] = useState<string[]>(['MON', 'TUE', 'WED', 'THU', 'FRI']);
  const [repeatEndsOn, setRepeatEndsOn] = useState<string>('');
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<
    'schedule' | 'repeatEnd' | null
  >(null);
  const [dialog, setDialog] = useState<ReminderDialogState>(
    INITIAL_REMINDER_DIALOG_STATE
  );

  useEffect(() => {
    if (!visible) return;
    if ((members.length === 0 || !familyState?.basicFamilyData) && !isTestEnv) {
      dispatch(getMyFamilyBasicThunk());
    }

    if (reminderToEdit) {
      setTitle(reminderToEdit.text || '');
      setReminderType('time');
      setSelectedWhen('Pick a time');
      setCustomIsoDate(
        reminderToEdit.remindOn
          ? String(reminderToEdit.remindOn).slice(0, 10)
          : getIstDateParts().isoDate
      );
      setCustomTimeStr(
        reminderToEdit.remindTime
          ? format24HourTo12Hour(reminderToEdit.remindTime)
          : '7:00 PM'
      );
      const editMemberIds = (reminderToEdit.members || [])
        .map((m) => m.memberId)
        .filter((id) => isUUID(id));
      setSelectedMemberIds(
        editMemberIds.length > 0
          ? editMemberIds
          : isUUID(myMemberId)
          ? [myMemberId]
          : []
      );
      setRepeat(mapApiRepeatToUi(reminderToEdit.repeat));
      setRepeatDays(
        reminderToEdit.repeatDays && reminderToEdit.repeatDays.length > 0
          ? reminderToEdit.repeatDays
          : ['MON', 'TUE', 'WED', 'THU', 'FRI']
      );
      setRepeatEndsOn(
        reminderToEdit.repeatEndsOn
          ? String(reminderToEdit.repeatEndsOn).slice(0, 10)
          : ''
      );
    } else {
      setTitle('');
      setReminderType('time');
      setSelectedWhen('This evening, 7:00 PM');
      setCustomIsoDate(getIstDateParts().isoDate);
      setCustomTimeStr('7:00 PM');
      const fallbackSelf =
        (isUUID(myMemberId) ? myMemberId : '') ||
        members.find((m) => m.isYou && isUUID(m.id))?.id ||
        members.find((m) => isUUID(m.id))?.id ||
        '';
      setSelectedMemberIds(fallbackSelf ? [fallbackSelf] : []);
      setRepeat('Doesn’t repeat');
      setRepeatDays(['MON', 'TUE', 'WED', 'THU', 'FRI']);
      setRepeatEndsOn('');
    }
    setShowAssigneeModal(false);
    setShowRepeatModal(false);
    setDatePickerTarget(null);
  }, [visible, reminderToEdit, members.length, myMemberId, dispatch, isTestEnv]);

  const schedulePreview = useMemo(
    () => convertWhenChipToIstSchedule(selectedWhen, customIsoDate, customTimeStr),
    [selectedWhen, customIsoDate, customTimeStr]
  );

  const selectedMembersList = useMemo(() => {
    if (members.length === 0) return [];
    const selectedSet = new Set(selectedMemberIds);
    const matched = members.filter((m) => selectedSet.has(m.id));
    if (matched.length > 0) return matched;
    const self = members.find((m) => m.isYou) || members[0];
    return self ? [self] : [];
  }, [members, selectedMemberIds]);

  const primaryMember = selectedMembersList[0];

  const assigneeDisplayText = useMemo(() => {
    if (selectedMembersList.length === 0) return 'You';
    if (selectedMembersList.length === 1) return selectedMembersList[0].name;
    if (selectedMembersList.length === 2) {
      return `${selectedMembersList[0].firstName} & ${selectedMembersList[1].firstName}`;
    }
    return `${selectedMembersList[0].firstName} +${selectedMembersList.length - 1}`;
  }, [selectedMembersList]);

  const toggleMember = (id: string) => {
    if (isChild) {
      setSelectedMemberIds([id]);
      setShowAssigneeModal(false);
      return;
    }
    setSelectedMemberIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((x) => x !== id) : prev;
      }
      if (prev.length >= 30) return prev;
      return [...prev, id];
    });
  };

  const toggleWeekday = (day: string) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSelectWhenChip = (chipText: string) => {
    setSelectedWhen(chipText);
    if (chipText === 'Pick a time') {
      setDatePickerTarget('schedule');
    }
  };

  const handleSetReminder = async () => {
    const cleanText = title.trim();
    if (!cleanText) {
      setDialog({
        visible: true,
        type: 'warning',
        iconName: 'bell',
        title: 'Reminder text required',
        description: 'Enter what you want to be reminded about.',
        primaryButtonText: 'OK',
      });
      return;
    }

    if (cleanText.length > 120) {
      setDialog({
        visible: true,
        type: 'warning',
        iconName: 'alert-circle',
        title: 'Reminder too long',
        description: 'Please keep the reminder under 120 characters.',
        primaryButtonText: 'OK',
      });
      return;
    }

    const validAppMemberSet = new Set(
      members.map((m) => m.id).filter((id) => isUUID(id))
    );
    const validMemberIds = selectedMemberIds.filter((id) =>
      validAppMemberSet.has(id)
    );
    const { remindOn, remindTime } = schedulePreview;
    const repeatApi = mapUiRepeatToApi(repeat);

    if (repeatApi === 'CUSTOM') {
      if (repeatDays.length === 0) {
        setDialog({
          visible: true,
          type: 'warning',
          iconName: 'repeat',
          title: 'Select repeat days',
          description: 'Pick at least one day for a custom repeating reminder.',
          primaryButtonText: 'OK',
        });
        return;
      }
      if (repeatEndsOn && repeatEndsOn < remindOn) {
        setDialog({
          visible: true,
          type: 'warning',
          iconName: 'calendar',
          title: 'Invalid end date',
          description: 'Repeat end date cannot be before the reminder date.',
          primaryButtonText: 'OK',
        });
        return;
      }
    }

    try {
      if (isEditing && reminderToEdit) {
        const updatePayload: UpdateReminderPayload = {
          text: cleanText,
          remindOn,
          remindTime,
          ...(validMemberIds.length > 0 ? { memberIds: validMemberIds } : {}),
        };
        if (repeatApi) {
          updatePayload.repeat = repeatApi;
        } else if (reminderToEdit.repeat) {
          updatePayload.repeat = null;
        }
        if (repeatApi === 'CUSTOM') {
          updatePayload.repeatDays = repeatDays;
          if (repeatEndsOn) {
            updatePayload.repeatEndsOn = repeatEndsOn;
          } else if (reminderToEdit.repeatEndsOn) {
            updatePayload.repeatEndsOn = null;
          }
        } else if (reminderToEdit.repeatEndsOn) {
          updatePayload.repeatEndsOn = null;
        }

        const updated = await dispatch(
          updateReminderThunk({
            id: reminderToEdit.id,
            payload: updatePayload,
          })
        ).unwrap();

        onApiSaved?.(updated, true);
        onSaveReminder?.({
          id: updated.id,
          title: updated.text,
          type: reminderType,
          whenText: formatReminderScheduleLabel(
            updated.remindOn,
            updated.remindTime
          ),
          assignee: formatReminderRecipients(updated),
          repeat,
        });
        onClose();
        return;
      }

      const created = await dispatch(
        createReminderThunk({
          text: cleanText,
          remindOn,
          remindTime,
          ...(validMemberIds.length > 0 ? { memberIds: validMemberIds } : {}),
          ...(repeatApi ? { repeat: repeatApi } : {}),
          ...(repeatApi === 'CUSTOM'
            ? {
                repeatDays,
                ...(repeatEndsOn ? { repeatEndsOn } : {}),
              }
            : {}),
        })
      ).unwrap();

      onApiSaved?.(created, false);
      onSaveReminder?.({
        id: created.id,
        title: created.text,
        type: reminderType,
        whenText: formatReminderScheduleLabel(
          created.remindOn,
          created.remindTime
        ),
        assignee: formatReminderRecipients(created),
        repeat,
      });
      onClose();
    } catch (err: any) {
      setDialog({
        visible: true,
        type: 'danger',
        iconName: 'alert-circle',
        title: isEditing ? 'Could not update reminder' : 'Could not set reminder',
        description: String(err || 'Please check the schedule and try again.'),
        primaryButtonText: 'OK',
      });
    }
  };

  const repeatApiValue = mapUiRepeatToApi(repeat);

  if (!asModal && !visible) {
    return null;
  }

  const content = (
      <View
        style={[
          styles.container,
          !asModal && styles.inlineOverlay,
          { paddingTop: insets.top },
        ]}
      >
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
              <Text style={styles.headerTitle}>
                {isEditing ? 'Edit reminder' : 'New reminder'}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                maxLength={120}
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
                  color={
                    reminderType === 'time'
                      ? Colors.cardInsetDark
                      : Colors.textSubtle
                  }
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
                  color={
                    reminderType === 'place'
                      ? Colors.cardInsetDark
                      : Colors.textSubtle
                  }
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

            {reminderType === 'place' && (
              <Text style={styles.rolledNote}>
                Place nudges live in Compass — pick a schedule below so this reminder still alerts on time.
              </Text>
            )}

            {/* WHEN Section */}
            <View style={styles.whenHeaderRow}>
              <Text style={styles.sectionHeading}>WHEN (IST)</Text>
              <Text style={styles.whenPreviewText}>
                {formatReminderScheduleLabel(
                  schedulePreview.remindOn,
                  schedulePreview.remindTime
                )}
              </Text>
            </View>

            <View style={styles.chipsContainer}>
              {WHEN_CHIPS.map((chipText) => {
                const isSelected = selectedWhen === chipText;
                return (
                  <TouchableOpacity
                    key={chipText}
                    onPress={() => handleSelectWhenChip(chipText)}
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
                      {chipText === 'Pick a time' && isSelected
                        ? formatReminderScheduleLabel(
                            schedulePreview.remindOn,
                            schedulePreview.remindTime
                          )
                        : chipText}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {schedulePreview.rolledToTomorrow && (
              <Text style={styles.rolledNote}>
                7:00 PM today has passed in IST — scheduled for tomorrow at 7:00 PM.
              </Text>
            )}

            {/* Remind & Repeat Card Container */}
            <View style={styles.cardContainer}>
              {/* Remind row */}
              <TouchableOpacity
                onPress={() => setShowAssigneeModal(true)}
                activeOpacity={0.7}
                style={styles.rowItem}
                accessibilityRole="button"
                accessibilityLabel={`Remind ${assigneeDisplayText}`}
              >
                <View style={styles.rowLeft}>
                  <Feather name="user" size={18} color={Colors.textSubtle} />
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Remind</Text>
                    <View style={styles.avatarRow}>
                      <View
                        style={[
                          styles.avatarCircle,
                          {
                            backgroundColor:
                              primaryMember?.color || Colors.avatarBrown,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarText,
                            {
                              color:
                                primaryMember?.textColor || Colors.amberLight,
                            },
                          ]}
                        >
                          {primaryMember?.initial || 'Y'}
                        </Text>
                      </View>
                      <Text style={styles.rowValue}>{assigneeDisplayText}</Text>
                    </View>
                  </View>
                </View>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={Colors.textMutedSoft}
                />
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
                <Feather
                  name="chevron-right"
                  size={18}
                  color={Colors.textMutedSoft}
                />
              </TouchableOpacity>
            </View>

            {repeatApiValue === 'CUSTOM' && (
              <View style={styles.customRepeatBox}>
                <Text style={styles.customLabel}>REPEAT ON DAYS</Text>
                <View style={styles.weekdaysRow}>
                  {REMINDER_WEEKDAYS.map((day) => {
                    const active = repeatDays.includes(day);
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.weekdayChip,
                          active && styles.weekdayChipActive,
                        ]}
                        onPress={() => toggleWeekday(day)}
                      >
                        <Text
                          style={[
                            styles.weekdayText,
                            active && styles.weekdayTextActive,
                          ]}
                        >
                          {day.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.repeatEndRow}
                  onPress={() => setDatePickerTarget('repeatEnd')}
                >
                  <Text style={styles.repeatEndLabel}>
                    {repeatEndsOn
                      ? `Ends on ${repeatEndsOn}`
                      : 'Optional: Pick end date'}
                  </Text>
                  {repeatEndsOn ? (
                    <TouchableOpacity onPress={() => setRepeatEndsOn('')}>
                      <Text style={styles.clearEndText}>Clear</Text>
                    </TouchableOpacity>
                  ) : (
                    <Feather name="calendar" size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Hint Box (Nudge to task) */}
            {!isEditing && (
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
            )}
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
              disabled={remindersState.submitting}
              activeOpacity={0.8}
              style={styles.submitBtn}
              accessibilityRole="button"
              accessibilityLabel={isEditing ? 'Save changes' : 'Set reminder'}
            >
              {remindersState.submitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isEditing ? 'Save changes' : 'Set reminder'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Assignee Picker Inline Bottom Sheet (non-modal to prevent iOS nested Modal bug) */}
        {showAssigneeModal && (
          <View style={[StyleSheet.absoluteFill, styles.pickerOverlay, { zIndex: 1100 }]}>
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
                {isChild
                  ? 'You can set reminders for yourself'
                  : 'Choose app-enabled family members to notify'}
              </Text>
              {members.length === 0 ? (
                <View style={styles.emptyMembersBox}>
                  <Text style={styles.emptyMembersText}>
                    Defaulting to you. No other app-enabled family members found yet.
                  </Text>
                </View>
              ) : (
                <View style={styles.pickerCard}>
                  {members.map((member, idx) => {
                    const isSelected = selectedMemberIds.includes(member.id);
                    return (
                      <TouchableOpacity
                        key={member.id}
                        style={[
                          styles.pickerRow,
                          idx > 0 && styles.pickerRowDivider,
                        ]}
                        onPress={() => toggleMember(member.id)}
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
                            styles.checkOuter,
                            isSelected && styles.checkOuterSelected,
                          ]}
                        >
                          {isSelected && (
                            <Feather name="check" size={13} color="#0B1A2F" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              <TouchableOpacity
                style={styles.sheetDoneBtn}
                onPress={() => setShowAssigneeModal(false)}
              >
                <Text style={styles.sheetDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Repeat Picker Inline Bottom Sheet */}
        {showRepeatModal && (
          <View style={[StyleSheet.absoluteFill, styles.pickerOverlay, { zIndex: 1100 }]}>
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
                {REMINDER_REPEAT_OPTIONS.map((opt, idx) => {
                  const isSelected = repeat === opt.label;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      style={[
                        styles.pickerRow,
                        idx > 0 && styles.pickerRowDivider,
                      ]}
                      onPress={() => {
                        setRepeat(opt.label);
                        setShowRepeatModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.pickerRowText}>{opt.label}</Text>
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
        )}

        {/* Date / Time Picker (non-modal overlay) */}
        <DueDateTimeModal
          asModal={false}
          visible={Boolean(datePickerTarget)}
          initialDate={
            datePickerTarget === 'repeatEnd'
              ? repeatEndsOn || customIsoDate
              : customIsoDate || getIstDateParts().isoDate
          }
          initialTime={customTimeStr || '7:00 PM'}
          onClose={() => setDatePickerTarget(null)}
          onSave={(_dateLabel, _formatted, dueTime, isoDate) => {
            if (datePickerTarget === 'repeatEnd') {
              if (isoDate) setRepeatEndsOn(isoDate);
            } else {
              if (isoDate) setCustomIsoDate(isoDate);
              if (dueTime) setCustomTimeStr(dueTime);
              setSelectedWhen('Pick a time');
            }
            setDatePickerTarget(null);
          }}
        />

        <ReminderDialog
          dialog={dialog}
          onClose={() => setDialog(INITIAL_REMINDER_DIALOG_STATE)}
        />
      </View>
  );

  if (!asModal) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inlineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 22,
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-SemiBold',
    color: Colors.textSubtle,
  },
  segmentTextActive: {
    color: Colors.cardInsetDark,
    fontFamily: 'Roboto-Bold',
  },
  whenHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: Colors.textPlaceholder,
    letterSpacing: 1,
  },
  whenPreviewText: {
    fontSize: 12.5,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.primary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  rolledNote: {
    fontSize: 12,
    color: Colors.amberLight,
    marginBottom: 18,
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
    fontFamily: 'Roboto-Bold',
  },
  chipTextUnselected: {
    color: Colors.white,
    fontFamily: 'Roboto-SemiBold',
  },
  cardContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    marginTop: 8,
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
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Bold',
    color: Colors.amberLight,
  },
  rowValue: {
    fontSize: 17,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.surfaceElevated2,
  },
  customRepeatBox: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  customLabel: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    color: Colors.textPlaceholder,
    letterSpacing: 1,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  weekdayChip: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  weekdayText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.textSubtle,
  },
  weekdayTextActive: {
    color: '#0B1A2F',
    fontFamily: 'Roboto-Bold',
  },
  repeatEndRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  repeatEndLabel: {
    fontSize: 13.5,
    color: '#CAD4DF',
  },
  clearEndText: {
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.primary,
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
    fontFamily: 'Roboto-SemiBold',
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
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  pickerOverlay: {
    backgroundColor: 'rgba(5, 11, 18, 0.72)',
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  pickerSheet: {
    backgroundColor: '#122440',
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
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 4,
  },
  pickerSubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: 18,
  },
  emptyMembersBox: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  emptyMembersText: {
    fontSize: 13.5,
    color: Colors.textSubtle,
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
    fontFamily: 'Roboto-SemiBold',
    color: Colors.white,
    marginLeft: 12,
  },
  checkOuter: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderLightAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOuterSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
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
  sheetDoneBtn: {
    marginTop: 14,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDoneText: {
    fontSize: 15.5,
    fontFamily: 'Roboto-Bold',
    color: '#0B1A2F',
  },
});

export default CreateReminderModal;
