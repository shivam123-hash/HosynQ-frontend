import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppTopBar from '../../../components/AppTopBar';
import {
  CalendarHeader,
  CalendarSegmentedTabs,
  CalendarMemberFilter,
  DayView,
  WeekView,
  MonthView,
  ImportantDatesView,
  ImportantDateDetailModal,
  FilterCalendarModal,
  EventDetailModal,
  EventCommentsModal,
  CancelEventModal,
  CreateEventModal,
} from './components';
import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_TASKS_DUE,
  INITIAL_IMPORTANT_DATES,
} from './mockData';
import {
  CalendarEvent,
  CalendarTaskDue,
  CalendarViewMode,
  CalendarFilterState,
  ImportantDateItem,
} from './types';

export interface CalendarScreenProps {
  initialViewMode?: CalendarViewMode;
  initialDate?: string;
  showImportantDatesBtn?: boolean;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onExplorePress?: () => void;
  onOpenChat?: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  initialViewMode = 'day',
  initialDate = '2026-10-30',
  showImportantDatesBtn = false,
  onProfilePress,
  onNotificationsPress,
  onExplorePress,
}) => {
  const insets = useSafeAreaInsets();

  // Primary Views state
  const [viewMode, setViewMode] = useState<CalendarViewMode>(initialViewMode);
  const [isImportantDatesActive, setIsImportantDatesActive] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);

  // Month navigation state
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // October (0-based)

  // Filter state
  const [selectedMemberId, setSelectedMemberId] = useState<string>('everyone');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<CalendarFilterState>({
    showTypes: ['events', 'tasks', 'important_dates'],
    member: 'everyone',
    categories: [],
  });

  // Data state
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [tasksDue, setTasksDue] = useState<CalendarTaskDue[]>(INITIAL_TASKS_DUE);
  const [importantDates] = useState<ImportantDateItem[]>(INITIAL_IMPORTANT_DATES);

  // Modals state
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CalendarEvent | null>(null);
  const [selectedEventForComments, setSelectedEventForComments] = useState<CalendarEvent | null>(null);
  const [selectedEventForCancel, setSelectedEventForCancel] = useState<CalendarEvent | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [selectedImportantDate, setSelectedImportantDate] = useState<ImportantDateItem | null>(null);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Member filter
      if (selectedMemberId !== 'everyone') {
        const matchesFor = e.forMemberId === selectedMemberId;
        const matchesGoing = e.goingMemberIds.includes(selectedMemberId);
        if (!matchesFor && !matchesGoing) return false;
      }

      // Filter modal categories
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(e.category)) return false;
      }

      // Show types
      if (!filters.showTypes.includes('events')) return false;

      return true;
    });
  }, [events, selectedMemberId, filters]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    if (!filters.showTypes.includes('tasks')) return [];
    return tasksDue.filter((t) => {
      if (selectedMemberId !== 'everyone' && t.memberId !== selectedMemberId) {
        return false;
      }
      return true;
    });
  }, [tasksDue, selectedMemberId, filters]);

  // Handlers
  const handleToggleTask = (taskId: string) => {
    setTasksDue((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (eventToEdit) {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventToEdit.id ? ({ ...e, ...eventData } as CalendarEvent) : e))
      );
      if (selectedEventForDetail?.id === eventToEdit.id) {
        setSelectedEventForDetail((prev) => (prev ? ({ ...prev, ...eventData } as CalendarEvent) : null));
      }
    } else {
      const newEvt: CalendarEvent = {
        id: `evt-${Date.now()}`,
        title: eventData.title || 'New Event',
        date: eventData.date || selectedDate,
        startTime: eventData.startTime || '3:00 PM',
        endTime: eventData.endTime || '4:00 PM',
        formattedDate: 'Fri, 30 Oct',
        formattedTime: eventData.formattedTime || '3:00 – 4:00 PM',
        isAllDay: Boolean(eventData.isAllDay),
        category: eventData.category || 'Family',
        categoryColor: eventData.categoryColor || '#3B82F6',
        location: eventData.location || '',
        goingMemberIds: eventData.goingMemberIds || ['m1'],
        goingMembers: [
          { id: 'm1', name: 'Priya', initial: 'P', color: '#B45309' },
        ],
        reminders: eventData.reminders || '1 hour before',
        repeat: eventData.repeat || 'Doesn’t repeat',
        notes: eventData.notes || '',
        comments: [],
      };
      setEvents((prev) => [newEvt, ...prev]);
    }
    setEventToEdit(null);
  };

  const handleConfirmCancelEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setSelectedEventForDetail(null);
    setSelectedEventForCancel(null);
  };

  const handleAddComment = (eventId: string, commentText: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      authorId: 'm1',
      authorName: 'You',
      authorInitial: 'P',
      authorColor: '#4A2E1A',
      time: 'Just now',
      text: commentText,
      isCurrentUser: true,
    };

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, comments: [...e.comments, newComment] } : e
      )
    );

    if (selectedEventForDetail?.id === eventId) {
      setSelectedEventForDetail((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : null
      );
    }

    if (selectedEventForComments?.id === eventId) {
      setSelectedEventForComments((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : null
      );
    }
  };

  const hasActiveFilters =
    filters.member !== 'everyone' ||
    filters.categories.length > 0 ||
    filters.showTypes.length < 3;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* App Top Bar */}
      <AppTopBar
        onAvatarPress={onProfilePress}
        onExplorePress={onExplorePress}
        onNotificationsPress={onNotificationsPress}
      />

      {/* Calendar Header */}
      <CalendarHeader
        title={isImportantDatesActive ? 'Important dates' : 'Calendar'}
        hasActiveFilters={hasActiveFilters}
        isImportantDatesActive={isImportantDatesActive}
        showImportantDatesBtn={showImportantDatesBtn || isImportantDatesActive}
        onImportantDatesPress={() => setIsImportantDatesActive((prev) => !prev)}
        onFilterPress={() => setFilterModalVisible(true)}
        onSearchPress={() => {
          Alert.alert('Search', 'Search for events, tasks, and important dates.');
        }}
      />

      {isImportantDatesActive ? (
        /* Important Dates Screen (CAL-15) */
        <ImportantDatesView
          dates={importantDates}
          onSelectDateItem={(item) => setSelectedImportantDate(item)}
          onAddImportantDate={() => {
            Alert.alert('Add Important Date', 'Add birthdays, anniversaries, or document renewal milestones.');
          }}
          onBackToCalendar={() => setIsImportantDatesActive(false)}
        />
      ) : (
        /* Calendar Main Views */
        <View style={styles.calendarBody}>
          {/* Day / Week / Month Tab Switcher */}
          <CalendarSegmentedTabs
            activeTab={viewMode}
            onTabChange={setViewMode}
          />

          {/* Member Avatars Strip */}
          <CalendarMemberFilter
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
          />

          {/* Day View (CAL-01 & CAL-04) */}
          {viewMode === 'day' && (
            <DayView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              events={filteredEvents}
              tasksDue={filteredTasks}
              onSelectEvent={(evt) => setSelectedEventForDetail(evt)}
              onToggleTask={handleToggleTask}
              onAddEvent={() => {
                setEventToEdit(null);
                setCreateModalVisible(true);
              }}
            />
          )}

          {/* Week View (CAL-02) */}
          {viewMode === 'week' && (
            <WeekView
              currentWeekRange="26 Oct – 1 Nov"
              events={filteredEvents}
              tasksDue={filteredTasks}
              onSelectEvent={(evt) => setSelectedEventForDetail(evt)}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setViewMode('day');
              }}
            />
          )}

          {/* Month View (CAL-03) */}
          {viewMode === 'month' && (
            <MonthView
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onPrevMonth={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear((y) => y - 1);
                } else {
                  setSelectedMonth((m) => m - 1);
                }
              }}
              onNextMonth={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear((y) => y + 1);
                } else {
                  setSelectedMonth((m) => m + 1);
                }
              }}
              onGoToToday={() => {
                setSelectedYear(2026);
                setSelectedMonth(9);
                setSelectedDate('2026-10-30');
              }}
              events={filteredEvents}
              tasksDue={filteredTasks}
              onOpenDayView={(d) => {
                setSelectedDate(d);
                setViewMode('day');
              }}
              onSelectEvent={(evt) => setSelectedEventForDetail(evt)}
            />
          )}
        </View>
      )}

      {/* Sub-Modals */}
      <FilterCalendarModal
        visible={filterModalVisible}
        currentFilters={filters}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={(f) => {
          setFilters(f);
          setSelectedMemberId(f.member);
        }}
      />

      <EventDetailModal
        visible={
          Boolean(selectedEventForDetail) &&
          !selectedEventForComments &&
          !selectedEventForCancel &&
          !createModalVisible
        }
        event={selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        onEditEvent={(evt) => {
          setEventToEdit(evt);
          setCreateModalVisible(true);
        }}
        onOpenComments={(evt) => setSelectedEventForComments(evt)}
        onCancelEvent={(evt) => handleConfirmCancelEvent(evt.id)}
        onAddComment={handleAddComment}
      />

      <EventCommentsModal
        visible={Boolean(selectedEventForComments)}
        event={selectedEventForComments}
        onClose={() => setSelectedEventForComments(null)}
        onAddComment={handleAddComment}
      />

      <CancelEventModal
        visible={Boolean(selectedEventForCancel)}
        event={selectedEventForCancel}
        onClose={() => setSelectedEventForCancel(null)}
        onConfirmCancel={handleConfirmCancelEvent}
      />

      <CreateEventModal
        visible={createModalVisible}
        eventToEdit={eventToEdit}
        initialDate={selectedDate}
        onClose={() => {
          setCreateModalVisible(false);
          setEventToEdit(null);
        }}
        onSaveEvent={handleSaveEvent}
        onDeleteEvent={(id) => {
          setCreateModalVisible(false);
          setEventToEdit(null);
          handleConfirmCancelEvent(id);
        }}
      />

      <ImportantDateDetailModal
        visible={Boolean(selectedImportantDate)}
        item={selectedImportantDate}
        onClose={() => setSelectedImportantDate(null)}
        onEditDate={() => {
          Alert.alert('Edit Milestone', 'Update important milestone date.');
        }}
        onAddTask={(item) => {
          Alert.alert('Renewal Task Added', `Added task for ${item.title} to your family tasks list.`);
        }}
      />
    </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  calendarBody: {
    flex: 1,
  },
});
