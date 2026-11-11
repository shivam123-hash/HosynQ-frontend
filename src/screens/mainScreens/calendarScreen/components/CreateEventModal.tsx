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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { CalendarEvent } from '../types';
import { CALENDAR_FAMILY_MEMBERS } from '../mockData';
import CategoryPickerModal from './CategoryPickerModal';
import InviteListModal from './InviteListModal';
import EventRemindersModal from './EventRemindersModal';
import CancelEventModal from './CancelEventModal';
import EditRepeatingEventModal, {
  RepeatingEditScope,
} from './EditRepeatingEventModal';
import EventDateTimePickerModal from './EventDateTimePickerModal';

export interface CreateEventModalProps {
  visible: boolean;
  eventToEdit?: CalendarEvent | null;
  initialDate?: string; // YYYY-MM-DD
  onClose: () => void;
  onSaveEvent: (eventData: Partial<CalendarEvent>) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  eventToEdit,
  initialDate = '2026-11-04',
  onClose,
  onSaveEvent,
  onDeleteEvent,
}) => {
  const insets = useSafeAreaInsets();
  const isEditing = Boolean(eventToEdit);

  // Form State
  const [title, setTitle] = useState('');
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [startDate, setStartDate] = useState('Wed, 4 Nov');
  const [endDate, setEndDate] = useState('Wed, 4 Nov');
  const [startTime, setStartTime] = useState('8:00 PM');
  const [endTime, setEndTime] = useState('10:00 PM');
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [categoryName, setCategoryName] = useState('Family');
  const [categoryColor, setCategoryColor] = useState('#3B82F6');
  const [invitedMemberIds, setInvitedMemberIds] = useState<string[]>([
    'm1',
    'm2',
    'm3',
    'm4',
    'm5',
  ]);
  const [repeatText, setRepeatText] = useState('Every year');
  const [remindersText, setRemindersText] = useState(
    '1 day before · 2 hours before'
  );
  const [notes, setNotes] = useState('');

  // Sub-modal pickers
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
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
      setStartTime(eventToEdit.startTime || '3:00 PM');
      setEndTime(eventToEdit.endTime || '3:45 PM');
      setIsAllDay(eventToEdit.isAllDay);
      setLocation(eventToEdit.location || 'St. Mary’s School, Room 12');
      setCategoryName(eventToEdit.category || 'Family');
      setCategoryColor(eventToEdit.categoryColor || '#3B82F6');
      setInvitedMemberIds(
        eventToEdit.goingMemberIds && eventToEdit.goingMemberIds.length > 0
          ? eventToEdit.goingMemberIds
          : ['m1', 'm2']
      );
      setRepeatText(eventToEdit.repeat || 'Doesn’t repeat');
      setRemindersText(
        eventToEdit.reminders || 'Thursday, 7:00 PM · 1 hour before'
      );
      setNotes(eventToEdit.notes || '');
    } else {
      setTitle('Nani’s birthday dinner');
      setStartDate('Wed, 4 Nov');
      setEndDate('Wed, 4 Nov');
      setStartTime('8:00 PM');
      setEndTime('10:00 PM');
      setIsAllDay(false);
      setLocation('Nani’s home, Model Town');
      setCategoryName('Family');
      setCategoryColor('#3B82F6');
      setInvitedMemberIds(['m1', 'm2', 'm3', 'm4', 'm5']);
      setRepeatText('Every year');
      setRemindersText('1 day before · 2 hours before');
      setNotes('');
    }
  }, [eventToEdit, initialDate, visible]);

  if (!visible) return null;

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

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

  const commitSave = () => {
    const trimmedTitle = title.trim();
    onSaveEvent({
      id: eventToEdit ? eventToEdit.id : `evt-${Date.now()}`,
      title: trimmedTitle,
      date: eventToEdit ? eventToEdit.date : '2026-11-04',
      startTime: isAllDay ? 'All day' : startTime,
      endTime: isAllDay ? 'All day' : endTime,
      formattedDate: startDate,
      formattedTime: isAllDay ? 'All day' : `${startTime} – ${endTime}`,
      isAllDay,
      location: location.trim(),
      category: categoryName,
      categoryColor,
      goingMemberIds: invitedMemberIds,
      repeat: repeatText,
      reminders: remindersText,
      notes: notes.trim(),
      comments: eventToEdit ? eventToEdit.comments : [],
    });

    onClose();
  };

  const handleRepeatScopeSelected = (_scope: RepeatingEditScope) => {
    commitSave();
  };

  const inviteSummaryText = () => {
    if (invitedMemberIds.length >= CALENDAR_FAMILY_MEMBERS.length) {
      return 'Everyone';
    }
    if (invitedMemberIds.length === 2 && invitedMemberIds.includes('m1') && invitedMemberIds.includes('m2')) {
      return 'Rohan and you';
    }
    return `${invitedMemberIds.length} members`;
  };

  const membersToDisplay = CALENDAR_FAMILY_MEMBERS.filter((m) =>
    invitedMemberIds.includes(m.id)
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
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
              onValueChange={setIsAllDay}
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
                  <Text style={styles.inviteValueText}>
                    {inviteSummaryText()}
                  </Text>
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
              onPress={() => {
                setRepeatText((prev) =>
                  prev === 'Doesn’t repeat' ? 'Every year' : 'Doesn’t repeat'
                );
              }}
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

        <InviteListModal
          visible={showInviteModal}
          selectedMemberIds={invitedMemberIds}
          onClose={() => setShowInviteModal(false)}
          onSaveInvites={setInvitedMemberIds}
          asModal={false}
        />

        <EventRemindersModal
          visible={showRemindersModal}
          selectedReminder={remindersText}
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
          onSave={(dateStr, timeStr) => {
            if (dateTimePickerMode === 'starts') {
              setStartDate(dateStr);
              setStartTime(timeStr);
              if (endDate === startDate) {
                setEndDate(dateStr);
              }
            } else {
              setEndDate(dateStr);
              setEndTime(timeStr);
            }
          }}
          asModal={false}
        />
      </View>
    </Modal>
  );
};

export default CreateEventModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timeCardSubheader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 0.8,
  },
  timeCardDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  timeCardTime: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#F0913A',
    marginTop: 2,
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '700',
  },
  inviteValueText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
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
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rowValueText: {
    fontSize: 15,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
