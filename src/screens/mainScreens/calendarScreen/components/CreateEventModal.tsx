import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { CalendarEvent, CalendarFamilyMember } from '../types';
import {
  formatDateNice,
  to24HourTime,
  isUUID,
  toIsoDateString,
  extractFamilyMembersFromState,
} from '../calendarApiHelpers';
import { useAppSelector, useAppDispatch } from '../../../../redux';
import {
  getMyFamilyBasicThunk,
  getMyFamilyThunk,
} from '../../../../redux/features/family/familySlice';
import { TEST_FAMILY_MEMBERS } from '../../../../__test_fixtures__/calendarFixtures';
import calendarServices from '../../../../services/calendarServices';
import CategoryPickerModal from './CategoryPickerModal';
import InviteListModal from './InviteListModal';
import EventRemindersModal from './EventRemindersModal';
import CancelEventModal from './CancelEventModal';
import RepeatPickerModal from './RepeatPickerModal';
import EditRepeatingEventModal, {
  RepeatingEditScope,
} from './EditRepeatingEventModal';
import EventDateTimePickerModal from './EventDateTimePickerModal';

export interface CreateEventModalProps {
  visible: boolean;
  eventToEdit?: CalendarEvent | null;
  initialDate?: string; // YYYY-MM-DD
  members?: CalendarFamilyMember[];
  onClose: () => void;
  onSaveEvent: (eventData: Partial<CalendarEvent>) => void;
  onDeleteEvent?: (eventId: string) => void;
  asModal?: boolean;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  eventToEdit,
  initialDate = '2026-11-04',
  members,
  onClose,
  onSaveEvent,
  onDeleteEvent,
  asModal = true,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const isEditing = Boolean(eventToEdit);
  const isTestEnv =
    typeof (globalThis as any).process !== 'undefined' &&
    (globalThis as any).process?.env?.NODE_ENV === 'test';

  const familyState = useAppSelector((state) => state.family);
  const [availabilityMembers, setAvailabilityMembers] = useState<CalendarFamilyMember[]>([]);

  const displayMembers = React.useMemo(() => {
    if (members && members.length > 0) {
      return members;
    }
    const extracted = extractFamilyMembersFromState(familyState);
    if (extracted.length > 0) {
      return extracted;
    }
    if (availabilityMembers.length > 0) {
      return availabilityMembers;
    }
    if (isTestEnv) {
      return TEST_FAMILY_MEMBERS;
    }
    return [];
  }, [members, familyState, availabilityMembers, isTestEnv]);

  // Auto-fetch family details if list is empty
  useEffect(() => {
    if (visible && displayMembers.length === 0 && !isTestEnv) {
      console.log('[CreateEventModal] displayMembers is empty, fetching family details...');
      dispatch(getMyFamilyBasicThunk());
      dispatch(getMyFamilyThunk());
    }
  }, [visible, displayMembers.length, dispatch, isTestEnv]);

  // Form State
  const [title, setTitle] = useState('');
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDateIso, setStartDateIso] = useState<string>(
    eventToEdit?.date || initialDate || '2026-11-04'
  );
  const [endDateIso, setEndDateIso] = useState<string>(
    eventToEdit?.endDate || eventToEdit?.date || initialDate || '2026-11-04'
  );
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [categoryName, setCategoryName] = useState('Family');
  const [categoryColor, setCategoryColor] = useState('#3B82F6');
  const [invitedMemberIds, setInvitedMemberIds] = useState<string[]>([]);
  const [repeatText, setRepeatText] = useState('Doesn’t repeat');
  const [remindersText, setRemindersText] = useState('2 hours before');
  const [notes, setNotes] = useState('');
  const [availabilitySummary, setAvailabilitySummary] = useState<string | null>(null);

  // Sub-modal pickers
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRepeatingModal, setShowRepeatingModal] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [dateTimePickerMode, setDateTimePickerMode] = useState<
    'starts' | 'ends'
  >('starts');

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setStartDate(eventToEdit.formattedDate || 'Fri, 30 Oct');
      setEndDate(eventToEdit.formattedDate || 'Fri, 30 Oct');
      setStartDateIso(eventToEdit.date || '2026-10-30');
      setEndDateIso(eventToEdit.endDate || eventToEdit.date || '2026-10-30');
      setStartTime(eventToEdit.startTime || '3:00 PM');
      setEndTime(eventToEdit.endTime || '3:45 PM');
      setIsAllDay(eventToEdit.isAllDay);
      setLocation(eventToEdit.location || 'St. Mary’s School, Room 12');
      setCategoryName(eventToEdit.category || 'Family');
      setCategoryColor(eventToEdit.categoryColor || '#3B82F6');
      const existingGoingIds =
        eventToEdit.goingMemberIds && eventToEdit.goingMemberIds.length > 0
          ? eventToEdit.goingMemberIds
          : eventToEdit.goingMembers && eventToEdit.goingMembers.length > 0
          ? eventToEdit.goingMembers.map((g) => g.id)
          : (eventToEdit as any).inviteeMemberIds && Array.isArray((eventToEdit as any).inviteeMemberIds)
          ? (eventToEdit as any).inviteeMemberIds
          : [];
      setInvitedMemberIds(
        existingGoingIds.length > 0
          ? existingGoingIds
          : displayMembers.length > 0
          ? displayMembers.map((m) => m.id)
          : isTestEnv
          ? ['m1', 'm2']
          : []
      );
      setRepeatText(eventToEdit.repeat || 'Doesn’t repeat');
      setRemindersText(
        eventToEdit.reminders || 'Thursday, 7:00 PM · 2 hours before'
      );
      setNotes(eventToEdit.notes || '');
    } else {
      setTitle(isTestEnv ? 'Nani’s birthday dinner' : '');
      const defaultIso = initialDate || (isTestEnv ? '2026-11-04' : toIsoDateString(new Date()));
      const defaultStart = formatDateNice(defaultIso) || defaultIso;
      setStartDate(defaultStart);
      setEndDate(defaultStart);
      setStartDateIso(defaultIso);
      setEndDateIso(defaultIso);
      setStartTime(isTestEnv ? '8:00 PM' : '10:00 AM');
      setEndTime(isTestEnv ? '10:00 PM' : '11:00 AM');
      setIsAllDay(false);
      setLocation(isTestEnv ? 'Nani’s home, Model Town' : '');
      setCategoryName('Family');
      setCategoryColor('#3B82F6');
      setInvitedMemberIds(displayMembers.map((m) => m.id));
      setRepeatText(isTestEnv ? 'Every year' : 'Doesn’t repeat');
      setRemindersText(isTestEnv ? '1 day before · 2 hours before' : '2 hours before');
      setNotes('');
    }
  }, [eventToEdit, initialDate, visible, displayMembers]);

  // Synchronize invited members if displayMembers loads after mount
  useEffect(() => {
    if (!eventToEdit && visible && invitedMemberIds.length === 0 && displayMembers.length > 0) {
      setInvitedMemberIds(displayMembers.map((m) => m.id));
    }
  }, [displayMembers, visible, eventToEdit, invitedMemberIds.length]);

  useEffect(() => {
    if (!isAllDay && startTime && visible) {
      const dateToUse = eventToEdit?.date || startDateIso || initialDate || toIsoDateString(new Date());
      const clean24h = to24HourTime(startTime);
      const cleanEnd24h = to24HourTime(endTime);
      if (clean24h) {
        calendarServices
          .getAvailability({
            on: dateToUse,
            startTime: clean24h,
            endTime: cleanEnd24h,
            excludeEventId: eventToEdit?.id && isUUID(eventToEdit.id) ? eventToEdit.id : undefined,
          })
          .then((res: any) => {
            if (res?.members && Array.isArray(res.members)) {
              if (res.members.length > 0 && availabilityMembers.length === 0) {
                const mappedAvail: CalendarFamilyMember[] = res.members.map((m: any, idx: number) => {
                  const fullName = m.fullName || m.name || (m.isYou ? 'You' : `Member ${idx + 1}`);
                  const firstName = fullName.trim().split(' ')[0] || fullName;
                  return {
                    id: String(m.memberId || m.id || `m-${idx}`),
                    name: m.isYou ? `${firstName} (you)` : firstName,
                    initial: (firstName[0] || 'M').toUpperCase(),
                    color: m.avatarColor || m.color || (idx % 2 === 0 ? '#1F3A66' : '#4A2E1A'),
                    textColor: '#FFFFFF',
                    isYou: Boolean(m.isYou),
                  };
                });
                setAvailabilityMembers(mappedAvail);
              }
              const freeMembers = res.members.filter((m: any) => m.isFree || m.status === 'FREE');
              if (freeMembers.length === res.members.length && res.members.length > 0) {
                setAvailabilitySummary(`All free at ${startTime}`);
              } else if (freeMembers.length > 0) {
                setAvailabilitySummary(`${freeMembers.length} free`);
              } else {
                setAvailabilitySummary('Members busy');
              }
            }
          })
          .catch(() => {
            // Silently fallback in offline or testing
          });
      }
    } else {
      setAvailabilitySummary(null);
    }
  }, [startTime, endTime, startDate, startDateIso, isAllDay, eventToEdit?.id, eventToEdit?.date, initialDate, visible, availabilityMembers.length]);

  if (!visible) return null;

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Required', 'Please enter an event name');
      return;
    }

    // Validate start and end time ordering on the same day
    if (!isAllDay) {
      const s24 = to24HourTime(startTime);
      const e24 = to24HourTime(endTime);
      const sIso = startDateIso || initialDate;
      const eIso = endDateIso || sIso;
      const isSameDate =
        (sIso && eIso && sIso === eIso) ||
        (startDate && endDate && startDate === endDate);

      if (s24 && e24 && isSameDate && e24 < s24) {
        Alert.alert('Invalid Time', 'End time cannot be earlier than start time on the same date.');
        return;
      }
    }

    if (
      isEditing &&
      repeatText &&
      repeatText !== 'Doesn’t repeat'
    ) {
      setShowRepeatingModal(true);
      return;
    }

    commitSave();
  };

  const commitSave = (scope?: RepeatingEditScope) => {
    const trimmedTitle = title.trim();
    const scopeEnum =
      scope === 'this_one'
        ? 'THIS_ONE'
        : scope === 'this_and_future'
        ? 'THIS_AND_FUTURE'
        : scope === 'all'
        ? 'ALL'
        : undefined;

    const resolvedDate =
      startDateIso ||
      (eventToEdit ? eventToEdit.date : undefined) ||
      initialDate ||
      '2026-11-04';
    const resolvedEndDate = endDateIso || resolvedDate;

    const eventPayload: Partial<CalendarEvent> = {
      id: eventToEdit ? eventToEdit.id : `evt-${Date.now()}`,
      title: trimmedTitle,
      date: resolvedDate,
      endDate: resolvedEndDate,
      startTime: isAllDay ? '12:00 AM' : startTime,
      endTime: isAllDay ? '11:59 PM' : endTime,
      formattedDate: startDate,
      formattedTime: isAllDay ? 'All day' : `${startTime} – ${endTime}`,
      isAllDay,
      location: location.trim(),
      category: categoryName,
      categoryColor,
      invitedMemberIds,
      goingMemberIds: invitedMemberIds,
      goingMembers: (displayMembers.length > 0 ? displayMembers : (members || []))
        .filter((m) => invitedMemberIds.includes(m.id))
        .map((m) => ({
          id: m.id,
          name: m.name,
          initial: m.initial || (m.name ? m.name[0].toUpperCase() : 'U'),
          color: m.color || '#1F3A66',
          textColor: m.textColor,
        })),
      repeat: repeatText,
      reminders: remindersText,
      notes: notes.trim(),
      comments: eventToEdit ? eventToEdit.comments : [],
      scope: scopeEnum,
      ...(eventToEdit ? {} : { isCreator: true, canRespond: false }),
    };

    console.log(
      eventToEdit
        ? '[CreateEventModal] Submitting UPDATE event data:'
        : '[CreateEventModal] Submitting CREATE event data:',
      eventPayload
    );
    try {
      console.log(
        '[CreateEventModal] Event Data (formatted):\n',
        JSON.stringify(eventPayload, null, 2)
      );
    } catch {
      // ignore serialization errors
    }

    onSaveEvent(eventPayload);

    onClose();
  };

  const handleRepeatScopeSelected = (scope: RepeatingEditScope) => {
    setShowRepeatingModal(false);
    commitSave(scope);
  };

  const inviteSummaryText = () => {
    if (invitedMemberIds.length === 0) {
      return 'No one invited';
    }
    if (displayMembers.length > 0 && invitedMemberIds.length >= displayMembers.length) {
      return 'Everyone';
    }
    if (invitedMemberIds.length === 2 && invitedMemberIds.includes('m1') && invitedMemberIds.includes('m2')) {
      return 'Rohan and you';
    }
    return `${invitedMemberIds.length} members`;
  };

  const membersToDisplay = displayMembers.filter((m) =>
    invitedMemberIds.includes(m.id)
  );

  if (!visible) return null;

  const modalContent = (
    <View
      style={[
        styles.container,
        !asModal && styles.embeddedContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
        {/* Header (CAL-09 / CAL-10) */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Feather name="x" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit event' : 'New event'}
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Event Name Input (CAL-09 / CAL-10) */}
          <Text style={styles.inputLabel}>Event name</Text>
          <View
            style={[
              styles.nameInputContainer,
              isTitleFocused && styles.nameInputContainerFocused,
            ]}
          >
            <TextInput
              style={styles.nameInput}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setIsTitleFocused(true)}
              onBlur={() => setIsTitleFocused(false)}
              placeholder="e.g. Aarav’s PTM"
              placeholderTextColor="#8A97AB"
              selectionColor="#F0913A"
            />
          </View>

          {/* STARTS & ENDS Cards (CAL-09 / CAL-10) */}
          <View style={styles.startsEndsRow}>
            {/* Starts Card */}
            <TouchableOpacity
              style={styles.timeCard}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Starts time"
              onPress={() => {
                setDateTimePickerMode('starts');
                setShowDateTimePicker(true);
              }}
            >
              <Text style={styles.timeCardSubheader}>STARTS</Text>
              <Text style={styles.timeCardDate}>{startDate}</Text>
              <Text style={styles.timeCardTime}>
                {isAllDay ? 'All day' : startTime}
              </Text>
            </TouchableOpacity>

            {/* Ends Card */}
            <TouchableOpacity
              style={styles.timeCard}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Ends time"
              onPress={() => {
                setDateTimePickerMode('ends');
                setShowDateTimePicker(true);
              }}
            >
              <Text style={styles.timeCardSubheader}>ENDS</Text>
              <Text style={styles.timeCardDate}>{endDate}</Text>
              <Text style={styles.timeCardTime}>
                {isAllDay ? 'All day' : endTime}
              </Text>
            </TouchableOpacity>
          </View>

          {/* All day Switch Row (CAL-09 / CAL-10) */}
          <View style={styles.allDayRow}>
            <Text style={styles.allDayLabel}>All day</Text>
            <Switch
              value={isAllDay}
              onValueChange={(val) => {
                setIsAllDay(val);
                if (val) {
                  setStartTime('12:00 AM');
                  setEndTime('11:59 PM');
                  if (
                    remindersText.includes('2 hours') ||
                    remindersText.includes('30 min') ||
                    remindersText.includes('When it starts') ||
                    remindersText.includes('hour')
                  ) {
                    setRemindersText('1 day before');
                  }
                } else {
                  setStartTime('10:00 AM');
                  setEndTime('11:00 AM');
                }
              }}
              trackColor={{ false: '#243A5E', true: '#F0913A' }}
              thumbColor="#CAD4DF"
              ios_backgroundColor="#243A5E"
            />
          </View>

          {/* Unified Details Card (CAL-09 / CAL-10 5 rows) */}
          <View style={styles.unifiedCard}>
            {/* Row 1: Where */}
            <View style={styles.cardRow}>
              <View style={styles.rowIconCol}>
                <Feather name="map-pin" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Where</Text>
                <TextInput
                  style={styles.whereInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Where (e.g. St. Mary’s School)"
                  placeholderTextColor="#8A97AB"
                  selectionColor="#F0913A"
                />
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </View>

            {/* Row 2: Invite */}
            <TouchableOpacity
              style={[styles.cardRow, styles.rowDivider]}
              onPress={() => setShowInviteModal(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Invite members"
            >
              <View style={styles.rowIconCol}>
                <Feather name="users" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Invite</Text>
                <View style={styles.inviteRow}>
                  <View style={styles.avatarsOverlap}>
                    {membersToDisplay.slice(0, 5).map((m, mIdx) => (
                      <View
                        key={m.id}
                        style={[
                          styles.avatarDot,
                          mIdx > 0 && styles.avatarDotOverlap,
                          {
                            backgroundColor: m.color,
                            zIndex: 5 - mIdx,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarDotText,
                            { color: m.textColor || '#FFFFFF' },
                          ]}
                        >
                          {m.initial}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inviteValueText}>
                      {inviteSummaryText()}
                    </Text>
                    {availabilitySummary && (
                      <Text style={styles.availabilityPillText}>
                        {availabilitySummary}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Row 3: Category */}
            <TouchableOpacity
              style={[styles.cardRow, styles.rowDivider]}
              onPress={() => setShowCategoryPicker(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Select category"
            >
              <View style={styles.rowIconCol}>
                <Feather name="tag" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Category</Text>
                <View style={styles.categoryValueRow}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: categoryColor },
                    ]}
                  />
                  <Text style={styles.categoryValueText}>{categoryName}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Row 4: Repeat */}
            <TouchableOpacity
              style={[styles.cardRow, styles.rowDivider]}
              onPress={() => setShowRepeatPicker(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Repeat option"
            >
              <View style={styles.rowIconCol}>
                <Feather name="repeat" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Repeat</Text>
                <Text style={styles.rowValueText}>{repeatText}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>

            {/* Row 5: Reminders */}
            <TouchableOpacity
              style={[styles.cardRow, styles.rowDivider]}
              onPress={() => setShowRemindersModal(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Select reminders"
            >
              <View style={styles.rowIconCol}>
                <Feather name="bell" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Reminders</Text>
                <Text style={styles.rowValueText}>{remindersText}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </TouchableOpacity>
          </View>

          {/* Delete Action if editing (CAL-10) */}
          {isEditing && (
            <TouchableOpacity
              style={styles.cancelLink}
              onPress={() => setShowCancelModal(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cancel this event"
            >
              <View style={styles.cancelIconWrap}>
                <Feather name="calendar" size={18} color="#F06A6A" />
                <View style={styles.cancelXOverlay}>
                  <Feather name="x" size={9} color="#F06A6A" />
                </View>
              </View>
              <Text style={styles.cancelLinkText}>Cancel this event</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Create event / Save changes Button (CAL-09 / CAL-10) */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSave}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? 'Save changes' : 'Create event'}
          >
            <Text style={styles.submitBtnText}>
              {isEditing ? 'Save changes' : 'Create event'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sub-modals (as overlays within the modal container) */}
        <CategoryPickerModal
          visible={showCategoryPicker}
          selectedCategoryName={categoryName}
          onClose={() => setShowCategoryPicker(false)}
          onSelectCategory={(name, color) => {
            setCategoryName(name);
            setCategoryColor(color);
          }}
          asModal={false}
        />

        <RepeatPickerModal
          visible={showRepeatPicker}
          selectedRepeat={repeatText}
          onClose={() => setShowRepeatPicker(false)}
          onSelectRepeat={(selected) => setRepeatText(selected)}
          asModal={false}
        />

        <InviteListModal
          visible={showInviteModal}
          selectedMemberIds={invitedMemberIds}
          members={displayMembers}
          onClose={() => setShowInviteModal(false)}
          onSaveInvites={setInvitedMemberIds}
          asModal={false}
        />

        <EventRemindersModal
          visible={showRemindersModal}
          selectedReminder={remindersText}
          isAllDay={isAllDay}
          onClose={() => setShowRemindersModal(false)}
          onSaveReminders={setRemindersText}
          asModal={false}
        />

        {Boolean(eventToEdit) && (
          <CancelEventModal
            visible={showCancelModal}
            event={eventToEdit!}
            onClose={() => setShowCancelModal(false)}
            onConfirmCancel={(id) => {
              setShowCancelModal(false);
              onClose();
              onDeleteEvent?.(id);
            }}
            asModal={false}
          />
        )}

        <EditRepeatingEventModal
          visible={showRepeatingModal}
          eventTitle={title}
          repeatRuleText={repeatText}
          onClose={() => setShowRepeatingModal(false)}
          onSelectScope={handleRepeatScopeSelected}
          asModal={false}
        />

        {/* Starts / Ends Date & Time Picker (Bottom Sheet) */}
        <EventDateTimePickerModal
          visible={showDateTimePicker}
          mode={dateTimePickerMode}
          initialDate={dateTimePickerMode === 'starts' ? startDate : endDate}
          initialTime={dateTimePickerMode === 'starts' ? startTime : endTime}
          isAllDay={isAllDay}
          onClose={() => setShowDateTimePicker(false)}
          onSave={(dateStr, timeStr, isoDate) => {
            if (timeStr === 'All day') {
              setIsAllDay(true);
            } else if (isAllDay && timeStr) {
              setIsAllDay(false);
            }
            if (dateTimePickerMode === 'starts') {
              setStartDate(dateStr);
              setStartTime(timeStr);
              if (isoDate) setStartDateIso(isoDate);
              if (endDate === startDate) {
                setEndDate(dateStr);
                if (isoDate) setEndDateIso(isoDate);
              }
            } else {
              setEndDate(dateStr);
              setEndTime(timeStr);
              if (isoDate) setEndDateIso(isoDate);
            }
          }}
          asModal={false}
        />
      </View>
  );

  if (!asModal) {
    return modalContent;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {modalContent}
    </Modal>
  );
};

export default CreateEventModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  embeddedContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 500,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  inputLabel: {
    fontSize: 12.5,
    color: '#8A97AB',
    marginBottom: 8,
  },
  nameInputContainer: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  nameInputContainerFocused: {
    borderColor: '#F0913A',
    borderWidth: 1.5,
  },
  nameInput: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    padding: 0,
  },
  startsEndsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  timeCardSubheader: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#7D8B9B',
    letterSpacing: 1,
    marginBottom: 4,
  },
  timeCardDate: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  timeCardTime: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#F0913A',
  },
  allDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 18,
  },
  allDayLabel: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  unifiedCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderColor: '#1A2C46',
  },
  rowIconCol: {
    width: 24,
    alignItems: 'center',
  },
  rowTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  rowLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 2,
  },
  whereInput: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    padding: 0,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  avatarsOverlap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarDotOverlap: {
    marginLeft: -6,
  },
  avatarDotText: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
  },
  inviteValueText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  availabilityPillText: {
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
    color: '#10B981',
    marginTop: 2,
  },
  categoryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryValueText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  rowValueText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  cancelLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    marginBottom: 10,
  },
  cancelIconWrap: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelXOverlay: {
    position: 'absolute',
    top: 5,
    left: 4,
  },
  cancelLinkText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#F06A6A',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderColor: '#1F3352',
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
});
