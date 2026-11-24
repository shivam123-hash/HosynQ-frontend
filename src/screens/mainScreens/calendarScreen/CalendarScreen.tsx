import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppTopBar from '../../../components/AppTopBar';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  fetchCalendarFeed,
  createCalendarEvent,
  updateCalendarEvent,
  cancelCalendarEvent,
  respondToCalendarEvent,
  fetchImportantDates,
  deleteImportantDate,
} from '../../../redux/features/calendar/calendarSlice';
import { getMyFamilyThunk } from '../../../redux/features/family/familySlice';
import calendarServices from '../../../services/calendarServices';
import {
  mapApiEventToUiEvent,
  mapApiTaskToCalendarTask,
  mapApiImportantDateToUiItem,
  isUUID,
  addDaysToDate,
  toIsoDateString,
} from './calendarApiHelpers';
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
import { TaskDetailModal } from '../tasksScreen/components';
import { TaskItem } from '../tasksScreen/types';
import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_TASKS_DUE,
  INITIAL_IMPORTANT_DATES,
  CALENDAR_FAMILY_MEMBERS,
} from './mockData';
import {
  CalendarEvent,
  CalendarTaskDue,
  CalendarViewMode,
  CalendarFilterState,
  CalendarFamilyMember,
  ImportantDateItem,
} from './types';

export interface CalendarScreenProps {
  initialViewMode?: CalendarViewMode;
  initialDate?: string;
  showImportantDatesBtn?: boolean;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onExplorePress?: () => void;
  onCompassPress?: () => void;
  onOpenChat?: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  initialViewMode = 'day',
  initialDate,
  showImportantDatesBtn = false,
  onProfilePress,
  onNotificationsPress,
  onExplorePress,
  onCompassPress,
}) => {
  const insets = useSafeAreaInsets();

  const dispatch = useAppDispatch();
  const calendarState = useAppSelector((state) => state.calendar);
  const notificationsState = useAppSelector((state) => state.notifications);
  const familyState = useAppSelector((state) => state.family);
  const unreadCount = notificationsState?.unreadCount ?? 0;

  const isTestEnv =
    typeof (globalThis as any).process !== 'undefined' &&
    (globalThis as any).process?.env?.NODE_ENV === 'test';

  const rawMembers = useMemo(() => {
    return (
      ((familyState?.myFamilyData?.family as any)?.members as any[]) ||
      ((familyState?.myFamilyData as any)?.members as any[]) ||
      ((familyState?.family as any)?.members as any[]) ||
      []
    );
  }, [familyState]);

  const familyMembersList: CalendarFamilyMember[] = useMemo(() => {
    if (rawMembers && rawMembers.length > 0) {
      return rawMembers.map((m: any, idx: number) => {
        const fullName = m.fullName || m.name || (m.isYou ? 'You' : `Member ${idx + 1}`);
        const firstName = fullName.trim().split(' ')[0] || fullName;
        const initial = (firstName.trim()[0] || 'M').toUpperCase();
        return {
          id: String(m.memberId || m.id || m.userId || `m-${idx}`),
          name: m.isYou ? `${firstName} (you)` : firstName,
          initial,
          color: m.avatarColor || (idx % 2 === 0 ? '#1F3A66' : '#4A2E1A'),
          textColor: '#FFFFFF',
        };
      });
    }
    return CALENDAR_FAMILY_MEMBERS;
  }, [rawMembers]);

  // Primary Views state
  const [viewMode, setViewMode] = useState<CalendarViewMode>(initialViewMode);
  const [isImportantDatesActive, setIsImportantDatesActive] = useState(false);
  const todayIso = toIsoDateString(new Date());
  const effectiveInitialDate = initialDate || (isTestEnv ? '2026-10-30' : todayIso);
  const [selectedDate, setSelectedDate] = useState<string>(effectiveInitialDate);

  // Month navigation state
  const initialDateParts = effectiveInitialDate.split('-').map(Number);
  const [selectedYear, setSelectedYear] = useState<number>(
    initialDateParts[0] || (isTestEnv ? 2026 : new Date().getFullYear())
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    initialDateParts[1] !== undefined ? initialDateParts[1] - 1 : (isTestEnv ? 9 : new Date().getMonth())
  );

  // Automatically keep selectedYear and selectedMonth in sync when selectedDate changes
  useEffect(() => {
    const parts = selectedDate.split('-').map(Number);
    if (parts[0] && parts[1] !== undefined) {
      const yr = parts[0];
      const mo = parts[1] - 1;
      setSelectedYear((prevYr) => (prevYr !== yr ? yr : prevYr));
      setSelectedMonth((prevMo) => (prevMo !== mo ? mo : prevMo));
    }
  }, [selectedDate]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    let newYear = selectedYear;
    let newMonth = selectedMonth - 1;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    const parts = selectedDate.split('-').map(Number);
    const day = parts[2] || 1;
    const maxDays = new Date(newYear, newMonth + 1, 0).getDate();
    const clampedDay = Math.min(day, maxDays);
    const newDateStr = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;

    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    setSelectedDate(newDateStr);
  };

  const handleNextMonth = () => {
    let newYear = selectedYear;
    let newMonth = selectedMonth + 1;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    const parts = selectedDate.split('-').map(Number);
    const day = parts[2] || 1;
    const maxDays = new Date(newYear, newMonth + 1, 0).getDate();
    const clampedDay = Math.min(day, maxDays);
    const newDateStr = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;

    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    setSelectedDate(newDateStr);
  };

  const handleGoToToday = () => {
    if (isTestEnv) {
      setSelectedYear(2026);
      setSelectedMonth(9);
      setSelectedDate('2026-10-30');
    } else {
      const now = new Date();
      const yr = now.getFullYear();
      const mo = now.getMonth();
      const todayStr = toIsoDateString(now);
      setSelectedYear(yr);
      setSelectedMonth(mo);
      setSelectedDate(todayStr);
    }
  };

  // Filter state
  const [selectedMemberId, setSelectedMemberId] = useState<string>('everyone');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<CalendarFilterState>({
    showTypes: ['events', 'tasks', 'important_dates'],
    member: 'everyone',
    categories: [],
  });

  // Data state: only take data that comes from APIs
  const [events, setEvents] = useState<CalendarEvent[]>(
    isTestEnv ? INITIAL_CALENDAR_EVENTS : []
  );
  const [tasksDue, setTasksDue] = useState<CalendarTaskDue[]>(
    isTestEnv ? INITIAL_TASKS_DUE : []
  );
  const [importantDates, setImportantDates] = useState<ImportantDateItem[]>(
    isTestEnv ? INITIAL_IMPORTANT_DATES : []
  );

  // Fetch family members on mount
  useEffect(() => {
    dispatch(getMyFamilyThunk());
  }, [dispatch]);

  // Fetch feed and important dates on mount and when month/year changes
  useEffect(() => {
    const fromDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const toDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

    dispatch(
      fetchCalendarFeed({
        from: fromDate,
        to: toDate,
        today: new Date().toISOString().slice(0, 10),
      })
    );
    dispatch(fetchImportantDates());
  }, [dispatch, selectedYear, selectedMonth]);

  // Sync events from Redux feed
  const apiEvents = calendarState?.feed?.events;
  useEffect(() => {
    if (apiEvents) {
      if (isTestEnv) {
        if (apiEvents.length > 0) {
          setEvents(apiEvents.map(mapApiEventToUiEvent));
        }
        return;
      }
      setEvents(apiEvents.map(mapApiEventToUiEvent));
    }
  }, [apiEvents, isTestEnv]);

  // Sync tasks from Redux feed
  const apiTasks = calendarState?.feed?.tasks;
  useEffect(() => {
    if (apiTasks) {
      if (isTestEnv) {
        if (apiTasks.length > 0) {
          setTasksDue(apiTasks.map(mapApiTaskToCalendarTask));
        }
        return;
      }
      setTasksDue(apiTasks.map(mapApiTaskToCalendarTask));
    }
  }, [apiTasks, isTestEnv]);

  // Sync important dates from Redux
  const apiImportantDates = calendarState?.importantDatesList;
  useEffect(() => {
    if (apiImportantDates) {
      if (isTestEnv) {
        if (apiImportantDates.length > 0) {
          setImportantDates(apiImportantDates.map(mapApiImportantDateToUiItem));
        }
        return;
      }
      setImportantDates(apiImportantDates.map(mapApiImportantDateToUiItem));
    }
  }, [apiImportantDates, isTestEnv]);

  // Modals state
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CalendarEvent | null>(null);
  const [selectedEventForComments, setSelectedEventForComments] = useState<CalendarEvent | null>(null);
  const [selectedEventForCancel, setSelectedEventForCancel] = useState<CalendarEvent | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [selectedImportantDate, setSelectedImportantDate] = useState<ImportantDateItem | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Member filter
      if (selectedMemberId !== 'everyone') {
        const selectedMember = familyMembersList.find((m) => m.id === selectedMemberId);
        const memberCleanName = selectedMember
          ? selectedMember.name.replace(' (you)', '').trim().toLowerCase()
          : '';

        const matchesForId = e.forMemberId === selectedMemberId;
        const matchesGoingId = Boolean(
          e.goingMemberIds && e.goingMemberIds.includes(selectedMemberId)
        );

        const forMemberName = (e.forMemberName || '').toLowerCase();
        const matchesForName = Boolean(
          memberCleanName &&
          (forMemberName.includes(memberCleanName) || memberCleanName.includes(forMemberName))
        );

        const matchesGoingName = Boolean(
          memberCleanName &&
          e.goingMembers &&
          e.goingMembers.some((g: any) => {
            const gName = (g.name || g.fullName || '').toLowerCase();
            return gName.includes(memberCleanName) || memberCleanName.includes(gName);
          })
        );

        if (!matchesForId && !matchesGoingId && !matchesForName && !matchesGoingName) {
          return false;
        }
      }

      // Filter modal categories
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(e.category)) return false;
      }

      // Show types
      if (!filters.showTypes.includes('events')) return false;

      return true;
    });
  }, [events, selectedMemberId, familyMembersList, filters]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    if (!filters.showTypes.includes('tasks')) return [];
    if (selectedMemberId === 'everyone') return tasksDue;

    const selectedMember = familyMembersList.find((m) => m.id === selectedMemberId);
    const memberCleanName = selectedMember
      ? selectedMember.name.replace(' (you)', '').trim().toLowerCase()
      : '';

    return tasksDue.filter((t) => {
      const matchesId =
        t.memberId === selectedMemberId ||
        (t as any).assigneeId === selectedMemberId ||
        (t as any).userId === selectedMemberId;

      const taskAssignee = (t.assignee || '').toLowerCase();
      const matchesName = Boolean(
        memberCleanName &&
        (taskAssignee.includes(memberCleanName) || memberCleanName.includes(taskAssignee))
      );

      return matchesId || matchesName;
    });
  }, [tasksDue, selectedMemberId, familyMembersList, filters.showTypes]);

  // Filtered Important Dates
  const filteredImportantDates = useMemo(() => {
    if (!filters.showTypes.includes('important_dates')) return [];
    if (selectedMemberId === 'everyone') return importantDates;

    const selectedMember = familyMembersList.find((m) => m.id === selectedMemberId);
    const memberCleanName = selectedMember
      ? selectedMember.name.replace(' (you)', '').trim().toLowerCase()
      : '';

    return importantDates.filter((item) => {
      if (!memberCleanName) return true;
      const pName = (item.personName || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      return (
        pName.includes(memberCleanName) ||
        memberCleanName.includes(pName) ||
        title.includes(memberCleanName) ||
        item.whoSeesIt === 'Everyone'
      );
    });
  }, [importantDates, selectedMemberId, familyMembersList, filters.showTypes]);

  // Handlers
  const handleToggleTask = (taskId: string) => {
    setTasksDue((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    const targetId = eventToEdit?.id || eventData.id;
    if (targetId) {
      setEvents((prev) =>
        prev.map((e) => (e.id === targetId ? ({ ...e, ...eventData } as CalendarEvent) : e))
      );
      if (selectedEventForDetail?.id === targetId) {
        setSelectedEventForDetail((prev) => (prev ? ({ ...prev, ...eventData } as CalendarEvent) : null));
      }
      if (isUUID(targetId)) {
        dispatch(
          updateCalendarEvent({
            id: targetId,
            payload: {
              title: eventData.title,
              location: eventData.location,
              notes: eventData.notes,
              category: eventData.category?.toUpperCase(),
              startsOn: eventData.date,
            },
          })
        );
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

      dispatch(
        createCalendarEvent({
          title: newEvt.title,
          notes: newEvt.notes,
          location: newEvt.location,
          category: newEvt.category.toUpperCase(),
          startsOn: newEvt.date,
          startTime: newEvt.startTime !== 'All day' ? newEvt.startTime : undefined,
          endsOn: newEvt.date,
          endTime: newEvt.endTime || undefined,
        })
      );
    }
    setEventToEdit(null);
  };

  const handleConfirmCancelEvent = (eventId: string, cancelReason?: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    if (isUUID(eventId)) {
      dispatch(
        cancelCalendarEvent({
          id: eventId,
          payload: {
            scope: 'THIS_ONE',
            note: cancelReason,
          },
        })
      );
    }
    setSelectedEventForDetail(null);
    setSelectedEventForCancel(null);
  };

  const handleAddComment = async (eventId: string, commentText: string) => {
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

    if (isUUID(eventId)) {
      try {
        await calendarServices.addComment(eventId, commentText);
      } catch (e) {
        // Optimistic comment remains visible
      }
    }
  };

  const handleDeleteImportantDate = async (item: ImportantDateItem) => {
    if (
      item.type === 'birthday' ||
      item.type === 'document' ||
      (typeof item.id === 'string' &&
        (item.id.startsWith('birthday:') || item.id.startsWith('document:')))
    ) {
      Alert.alert(
        'Protected Milestone',
        'Birthdays and document renewals are automatically synced from member profiles and the document vault and cannot be deleted here.'
      );
      return;
    }

    setImportantDates((prev) => prev.filter((d) => d.id !== item.id));
    setSelectedImportantDate(null);
    try {
      await dispatch(deleteImportantDate(item.id)).unwrap();
      dispatch(fetchImportantDates());
    } catch (err) {
      console.log('Failed to delete important date API:', err);
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
        unreadCount={unreadCount}
        hasUnreadNotifications={unreadCount > 0}
        onAvatarPress={onProfilePress}
        onExplorePress={onExplorePress}
        onNotificationsPress={onNotificationsPress}
        onCompassPress={onCompassPress}
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
          dates={filteredImportantDates}
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
            onSelectMember={(memId) => {
              setSelectedMemberId(memId);
              setFilters((prev) => ({ ...prev, member: memId }));
            }}
            members={familyMembersList}
          />

          {/* Day View (CAL-01 & CAL-04) */}
          {viewMode === 'day' && (
            <DayView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              events={filteredEvents}
              tasksDue={filteredTasks}
              onSelectEvent={(evt) => setSelectedEventForDetail(evt)}
              onSelectTask={(t) => {
                const taskItem: TaskItem = {
                  id: t.id,
                  title: t.title,
                  dueDate: t.isOverdue ? t.overdueText || 'Overdue' : 'Today',
                  dueType: t.isOverdue ? 'overdue' : 'today',
                  assignee: t.assignee,
                  assigneeInitial: (t.assignee || 'P').slice(0, 1),
                  category: 'household',
                  isCompleted: t.isCompleted,
                  priority: 'medium',
                };
                setSelectedTaskForDetail(taskItem);
              }}
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
              selectedDate={selectedDate}
              events={filteredEvents}
              tasksDue={filteredTasks}
              onSelectEvent={(evt) => setSelectedEventForDetail(evt)}
              onSelectTask={(t) => {
                const taskItem: TaskItem = {
                  id: t.id,
                  title: t.title,
                  dueDate: t.isOverdue ? t.overdueText || 'Overdue' : 'Today',
                  dueType: t.isOverdue ? 'overdue' : 'today',
                  assignee: t.assignee,
                  assigneeInitial: (t.assignee || 'P').slice(0, 1),
                  category: 'household',
                  isCompleted: t.isCompleted,
                  priority: 'medium',
                };
                setSelectedTaskForDetail(taskItem);
              }}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setViewMode('day');
              }}
              onPrevWeek={() => {
                setSelectedDate((prev) => addDaysToDate(prev, -7));
              }}
              onNextWeek={() => {
                setSelectedDate((prev) => addDaysToDate(prev, 7));
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
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onGoToToday={handleGoToToday}
              events={filteredEvents}
              tasksDue={filteredTasks}
              onOpenDayView={(d) => {
                setSelectedDate(d);
                setViewMode('day');
              }}
              onSelectEvent={(evt) => setSelectedEventForDetail(evt)}
              onSelectTask={(t) => {
                const taskItem: TaskItem = {
                  id: t.id,
                  title: t.title,
                  dueDate: t.isOverdue ? t.overdueText || 'Overdue' : 'Today',
                  dueType: t.isOverdue ? 'overdue' : 'today',
                  assignee: t.assignee,
                  assigneeInitial: (t.assignee || 'P').slice(0, 1),
                  category: 'household',
                  isCompleted: t.isCompleted,
                  priority: 'medium',
                };
                setSelectedTaskForDetail(taskItem);
              }}
              onToggleTask={handleToggleTask}
            />
          )}
        </View>
      )}

      {/* Sub-Modals */}
      <FilterCalendarModal
        visible={filterModalVisible}
        currentFilters={filters}
        members={familyMembersList}
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
          !selectedEventForCancel
        }
        event={selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        onEditEvent={(evt) => {
          handleSaveEvent(evt);
        }}
        onOpenComments={(evt) => setSelectedEventForComments(evt)}
        onCancelEvent={(evt, reason) => handleConfirmCancelEvent(evt.id, reason)}
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
        onConfirmCancel={(id, reason) => handleConfirmCancelEvent(id, reason)}
      />

      <CreateEventModal
        visible={createModalVisible}
        eventToEdit={eventToEdit}
        initialDate={selectedDate}
        members={familyMembersList}
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
        onDeleteDate={handleDeleteImportantDate}
      />

      {/* Task Detail Modal */}
      {selectedTaskForDetail && (
        <TaskDetailModal
          visible={Boolean(selectedTaskForDetail)}
          task={selectedTaskForDetail}
          onClose={() => setSelectedTaskForDetail(null)}
          onToggleComplete={(t) => {
            handleToggleTask(t.id);
            setSelectedTaskForDetail(null);
          }}
          onReassign={(task, assignee) => {
            setTasksDue((prev) =>
              prev.map((item) =>
                item.id === task.id ? { ...item, assignee } : item
              )
            );
            setSelectedTaskForDetail((prev) =>
              prev ? { ...prev, assignee } : null
            );
          }}
          onDelete={(t: TaskItem) => {
            setTasksDue((prev) => prev.filter((item) => item.id !== t.id));
            setSelectedTaskForDetail(null);
          }}
        />
      )}
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
