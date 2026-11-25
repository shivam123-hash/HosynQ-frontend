import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppTopBar from '../../../components/AppTopBar';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  fetchCalendarFeed,
  fetchEventDetail,
  createCalendarEvent,
  updateCalendarEvent,
  cancelCalendarEvent,
  respondToCalendarEvent,
} from '../../../redux/features/calendar/calendarSlice';
import {
  getMyFamilyBasicThunk,
  getMyFamilyThunk,
} from '../../../redux/features/family/familySlice';
import calendarServices from '../../../services/calendarServices';
import {
  mapApiEventToUiEvent,
  mapApiTaskToCalendarTask,
  isUUID,
  addDaysToDate,
  toIsoDateString,
  to24HourTime,
  formatDateNice,
  mapUiRepeatToBackend,
  mapUiRemindersToBackend,
  buildCreateEventPayload,
  buildUpdateEventPayload,
  extractFamilyMembersFromState,
  normalizeRsvpResponse,
} from './calendarApiHelpers';
import {
  CalendarHeader,
  CalendarSegmentedTabs,
  CalendarMemberFilter,
  DayView,
  WeekView,
  MonthView,
  FilterCalendarModal,
  EventDetailModal,
  EventCommentsModal,
  CancelEventModal,
  CreateEventModal,
} from './components';
import { TaskDetailModal } from '../tasksScreen/components';
import { TaskItem } from '../tasksScreen/types';
import { CALENDAR_CATEGORIES } from './constants';
import { CalendarSkeleton } from '../../../components/SkeletonLoader';
import {
  TEST_CALENDAR_EVENTS,
  TEST_TASKS_DUE,
  TEST_FAMILY_MEMBERS,
} from '../../../__test_fixtures__/calendarFixtures';
import {
  CalendarEvent,
  CalendarTaskDue,
  CalendarViewMode,
  CalendarFilterState,
  CalendarFamilyMember,
} from './types';

export interface CalendarScreenProps {
  initialViewMode?: CalendarViewMode;
  initialDate?: string;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onExplorePress?: () => void;
  onCompassPress?: () => void;
  onOpenChat?: () => void;
  initialEvents?: CalendarEvent[];
  initialTasksDue?: CalendarTaskDue[];
  initialFamilyMembers?: CalendarFamilyMember[];
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  initialViewMode = 'day',
  initialDate,
  onProfilePress,
  onNotificationsPress,
  onExplorePress,
  onCompassPress,
  initialEvents,
  initialTasksDue,
  initialFamilyMembers,
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

  const familyMembersList: CalendarFamilyMember[] = useMemo(() => {
    if (initialFamilyMembers && initialFamilyMembers.length > 0) {
      return initialFamilyMembers;
    }
    const extracted = extractFamilyMembersFromState(familyState);
    if (extracted.length > 0) {
      return extracted;
    }
    if (isTestEnv) {
      return TEST_FAMILY_MEMBERS;
    }
    return [];
  }, [familyState, initialFamilyMembers, isTestEnv]);

  // Primary Views state
  const [viewMode, setViewMode] = useState<CalendarViewMode>(initialViewMode);
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
    showTypes: ['events', 'tasks'],
    member: 'everyone',
    categories: [],
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Data state: initialize from props, test fixtures, or existing Redux cache to avoid blank/double-refresh flicker
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (initialEvents !== undefined) return initialEvents;
    if (isTestEnv) return TEST_CALENDAR_EVENTS;
    const cachedEvents = calendarState?.feed?.events;
    return Array.isArray(cachedEvents) && cachedEvents.length > 0
      ? cachedEvents.map(mapApiEventToUiEvent)
      : [];
  });
  const [tasksDue, setTasksDue] = useState<CalendarTaskDue[]>(() => {
    if (initialTasksDue !== undefined) return initialTasksDue;
    if (isTestEnv) return TEST_TASKS_DUE;
    const cachedTasks = calendarState?.feed?.tasks;
    return Array.isArray(cachedTasks) && cachedTasks.length > 0
      ? cachedTasks.map(mapApiTaskToCalendarTask)
      : [];
  });

  // Family loading and fail-fast gating state
  const hasExistingFamily = familyMembersList.length > 0;
  const [familyLoadError, setFamilyLoadError] = useState<string | null>(null);
  const [isFamilyLoaded, setIsFamilyLoaded] = useState<boolean>(
    isTestEnv || hasExistingFamily
  );
  const [isFamilyLoading, setIsFamilyLoading] = useState<boolean>(
    !isTestEnv && !hasExistingFamily
  );
  const [hasLoadedFeedOnce, setHasLoadedFeedOnce] = useState<boolean>(
    isTestEnv ||
      (Array.isArray(calendarState?.feed?.events) &&
        calendarState.feed.events.length > 0)
  );
  const hasAttemptedFamilyFetchRef = useRef<boolean>(isTestEnv || hasExistingFamily);
  const fetchedRangeKeyRef = useRef<string | null>(null);

  // Fetch basic family details and members only if not already in Redux (fail-fast gatekeeper)
  const loadFamilyBasicDetails = useCallback(async () => {
    if (isTestEnv) {
      setIsFamilyLoaded(true);
      setIsFamilyLoading(false);
      return;
    }
    setIsFamilyLoading(true);
    setFamilyLoadError(null);
    try {
      const data = await dispatch(getMyFamilyBasicThunk()).unwrap();
      console.log(
        '[CalendarScreen] getMyFamilyBasic members count:',
        data?.members?.length || (data?.family as any)?.members?.length || 0
      );
      setIsFamilyLoaded(true);
      setFamilyLoadError(null);
    } catch (err: any) {
      const errorMsg =
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to fetch basic family details.';
      console.error('[CalendarScreen] getMyFamilyBasic failed:', errorMsg);
      // Resilient fallback to getMyFamilyThunk before stopping
      try {
        console.log('[CalendarScreen] Attempting fallback to getMyFamilyThunk...');
        await dispatch(getMyFamilyThunk()).unwrap();
        setIsFamilyLoaded(true);
        setFamilyLoadError(null);
      } catch (fbErr: any) {
        setFamilyLoadError(errorMsg);
        setIsFamilyLoaded(false);
      }
    } finally {
      setIsFamilyLoading(false);
    }
  }, [dispatch, isTestEnv]);

  useEffect(() => {
    if (hasAttemptedFamilyFetchRef.current) return;
    hasAttemptedFamilyFetchRef.current = true;
    loadFamilyBasicDetails();
  }, [loadFamilyBasicDetails]);

  // Slide down to refresh state & handler
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (isTestEnv) {
        return;
      }
      // 1. Refresh family basic details
      let familyOk = true;
      try {
        await dispatch(getMyFamilyBasicThunk()).unwrap();
        setIsFamilyLoaded(true);
        setFamilyLoadError(null);
      } catch (err: any) {
        try {
          await dispatch(getMyFamilyThunk()).unwrap();
          setIsFamilyLoaded(true);
          setFamilyLoadError(null);
        } catch (fbErr: any) {
          familyOk = false;
          const errorMsg =
            typeof err === 'string'
              ? err
              : err?.message || 'Failed to fetch basic family details.';
          console.error('[CalendarScreen] Refresh getMyFamilyBasic error:', errorMsg);
          setFamilyLoadError(errorMsg);
          setIsFamilyLoaded(false);
        }
      }

      // 2. If family basic details succeeded, refresh calendar feed
      if (familyOk) {
        const firstDayStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
        const fromDate = addDaysToDate(firstDayStr, -7);
        const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const lastDayStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
        const toDate = addDaysToDate(lastDayStr, 7);

        await dispatch(
          fetchCalendarFeed({
            from: fromDate,
            to: toDate,
            today: new Date().toISOString().slice(0, 10),
          })
        ).unwrap();
      }
    } catch (e) {
      console.error('[CalendarScreen] Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, selectedYear, selectedMonth, isTestEnv]);

  const refreshControl = useMemo(() => {
    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor="#F0913A"
        colors={['#F0913A']}
      />
    );
  }, [refreshing, handleRefresh]);

  const showSkeleton =
    !isTestEnv &&
    !refreshing &&
    !familyLoadError &&
    events.length === 0 &&
    (!isFamilyLoaded ||
      isFamilyLoading ||
      !hasLoadedFeedOnce ||
      Boolean(calendarState?.loading));

  // Fetch feed once per month/year (only after family details are ready) and important dates once on mount
  useEffect(() => {
    if (!isFamilyLoaded && !isTestEnv) {
      // Gatekeeper: Family details failed or still loading, do not run any other API!
      return;
    }

    const firstDayStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    const fromDate = addDaysToDate(firstDayStr, -7);
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const lastDayStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
    const toDate = addDaysToDate(lastDayStr, 7);
    const rangeKey = `${fromDate}_${toDate}`;

    if (fetchedRangeKeyRef.current !== rangeKey) {
      fetchedRangeKeyRef.current = rangeKey;
      const feedPromise = dispatch(
        fetchCalendarFeed({
          from: fromDate,
          to: toDate,
          today: new Date().toISOString().slice(0, 10),
        })
      );
      if (typeof (feedPromise as any)?.finally === 'function') {
        (feedPromise as any).finally(() => setHasLoadedFeedOnce(true));
      } else {
        setHasLoadedFeedOnce(true);
      }
    }
  }, [dispatch, selectedYear, selectedMonth, isFamilyLoaded, isTestEnv]);

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

  // Modals state
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CalendarEvent | null>(null);
  const [selectedEventForComments, setSelectedEventForComments] = useState<CalendarEvent | null>(null);
  const [selectedEventForCancel, setSelectedEventForCancel] = useState<CalendarEvent | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
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

        const matchesCreator =
          Boolean(
            selectedMemberId &&
            ((e as any).createdByMemberId === selectedMemberId ||
             (e as any).createdById === selectedMemberId)
          );

        if (!matchesForId && !matchesGoingId && !matchesForName && !matchesGoingName && !matchesCreator) {
          return false;
        }
      }

      // Filter modal categories
      if (filters.categories.length > 0) {
        const filterUpper = filters.categories.map((c) => c.toUpperCase());
        if (!filterUpper.includes((e.category || '').toUpperCase())) return false;
      }

      // Show types
      if (!filters.showTypes.includes('events')) return false;

      // Search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = (e.title || '').toLowerCase().includes(query);
        const matchesLocation = (e.location || '').toLowerCase().includes(query);
        const matchesCategory = (e.category || '').toLowerCase().includes(query);
        const matchesNotes = (e.notes || '').toLowerCase().includes(query);
        const matchesMember = (e.forMemberName || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation && !matchesCategory && !matchesNotes && !matchesMember) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedMemberId, familyMembersList, filters, searchQuery]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    if (!filters.showTypes.includes('tasks')) return [];
    let list = tasksDue;

    if (selectedMemberId !== 'everyone') {
      const selectedMember = familyMembersList.find((m) => m.id === selectedMemberId);
      const memberCleanName = selectedMember
        ? selectedMember.name.replace(' (you)', '').trim().toLowerCase()
        : '';

      list = list.filter((t) => {
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
    }

    if (searchQuery.trim().length > 0) {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter((t) => {
        const matchesTitle = (t.title || '').toLowerCase().includes(query);
        const matchesAssignee = (t.assignee || '').toLowerCase().includes(query);
        return matchesTitle || matchesAssignee;
      });
    }

    return list;
  }, [tasksDue, selectedMemberId, familyMembersList, filters.showTypes, searchQuery]);

  // Handlers
  const handleToggleTask = (taskId: string) => {
    setTasksDue((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const refreshCalendarFeed = () => {
    const firstDayStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    const fromDate = addDaysToDate(firstDayStr, -7);
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const lastDayStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
    const toDate = addDaysToDate(lastDayStr, 7);
    dispatch(fetchCalendarFeed({ from: fromDate, to: toDate, today: new Date().toISOString().slice(0, 10) }));
  };

  const handleOpenEventDetail = (evt: CalendarEvent) => {
    setSelectedEventForDetail(evt);
    if (isUUID(evt.id)) {
      dispatch(fetchEventDetail({ id: evt.id, on: evt.date || selectedDate }))
        .unwrap()
        .then((fullEvent) => {
          if (fullEvent) {
            const mapped = mapApiEventToUiEvent(fullEvent);
            const preservedResponse =
              normalizeRsvpResponse(mapped.myResponse) ||
              normalizeRsvpResponse(evt.myResponse) ||
              null;
            const preservedCreator = Boolean(mapped.isCreator || evt.isCreator);
            const merged: CalendarEvent = {
              ...mapped,
              myResponse: preservedResponse,
              isCreator: preservedCreator,
              canRespond:
                Boolean(preservedResponse) || preservedCreator
                  ? false
                  : mapped.canRespond,
            };
            setSelectedEventForDetail(merged);
            setEvents((prev) => prev.map((e) => (e.id === evt.id ? { ...e, ...merged } : e)));
          }
        })
        .catch((err) => {
          console.log('[handleOpenEventDetail] Fetch detail error:', err);
        });
    }
  };

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    const targetId = eventToEdit?.id || eventData.id;
    const isEditing = Boolean(
      eventToEdit?.id ||
      (targetId && (isUUID(targetId) || events.some((e) => e.id === targetId)))
    );
    const starts24 = eventData.isAllDay ? undefined : to24HourTime(eventData.startTime);
    const ends24 = eventData.isAllDay ? undefined : to24HourTime(eventData.endTime);
    const repeatBackend = mapUiRepeatToBackend(eventData.repeat);
    const remindersBackend = mapUiRemindersToBackend(eventData.reminders);

    if (isEditing && targetId) {
      setEvents((prev) =>
        prev.map((e) => (e.id === targetId ? ({ ...e, ...eventData } as CalendarEvent) : e))
      );
      if (selectedEventForDetail?.id === targetId) {
        setSelectedEventForDetail((prev) => (prev ? ({ ...prev, ...eventData } as CalendarEvent) : null));
      }
      if (isUUID(targetId)) {
        try {
          const payload = buildUpdateEventPayload(
            eventData,
            eventData.scope,
            eventData.date || selectedDate
          );
          console.log('[CalendarScreen.handleSaveEvent] Updating event targetId:', targetId);
          console.log('[CalendarScreen.handleSaveEvent] Update eventData (UI):', eventData);
          try {
            console.log(
              '[CalendarScreen.handleSaveEvent] Backend Update Payload (formatted):\n',
              JSON.stringify(payload, null, 2)
            );
          } catch {
            // ignore serialization error
          }
          const updated = await dispatch(
            updateCalendarEvent({
              id: targetId,
              payload,
            })
          ).unwrap();
          console.log('[CalendarScreen.handleSaveEvent] Update Success, updated event:', updated);
          try {
            console.log(
              '[CalendarScreen.handleSaveEvent] Update Response (formatted):\n',
              JSON.stringify(updated, null, 2)
            );
          } catch {
            // ignore serialization error
          }
          if (updated) {
            const mapped = mapApiEventToUiEvent(updated);
            setEvents((prev) => prev.map((e) => (e.id === targetId ? { ...e, ...mapped } : e)));
            if (selectedEventForDetail?.id === targetId) {
              setSelectedEventForDetail(mapped);
            }
          }
          refreshCalendarFeed();
        } catch (err) {
          console.log('[CalendarScreen.handleSaveEvent] Update error:', err);
        }
      }
    } else {
      const newEvt: CalendarEvent = {
        id: `evt-${Date.now()}`,
        title: eventData.title || 'New Event',
        date: eventData.date || selectedDate,
        endDate: eventData.endDate || eventData.date || selectedDate,
        startTime: eventData.startTime || '3:00 PM',
        endTime: eventData.endTime || '4:00 PM',
        formattedDate: formatDateNice(eventData.date || selectedDate) || 'Fri, 30 Oct',
        formattedTime: eventData.formattedTime || `${eventData.startTime || '3:00 PM'} – ${eventData.endTime || '4:00 PM'}`,
        isAllDay: Boolean(eventData.isAllDay),
        category: eventData.category || 'Family',
        categoryColor: eventData.categoryColor || '#3B82F6',
        location: eventData.location || '',
        forMemberId: eventData.forMemberId,
        createdByMemberId: familyState?.myMemberId || eventData.createdByMemberId,
        isCreator: true,
        canRespond: false,
        invitedMemberIds: eventData.invitedMemberIds || eventData.goingMemberIds || [],
        goingMemberIds: eventData.goingMemberIds || [],
        goingMembers:
          eventData.goingMembers && eventData.goingMembers.length > 0
            ? eventData.goingMembers
            : (eventData.goingMemberIds || []).map((id) => {
                const mem = familyMembersList.find((m) => m.id === id);
                return {
                  id,
                  name: mem?.name || 'Member',
                  initial: mem?.name ? mem.name[0].toUpperCase() : 'M',
                  color: mem?.color || '#3B82F6',
                };
              }),
        reminders: eventData.reminders || '2 hours before',
        repeat: eventData.repeat || 'Doesn’t repeat',
        notes: eventData.notes || '',
        comments: [],
      };
      setEvents((prev) => [newEvt, ...prev]);

      try {
        const payload = buildCreateEventPayload(eventData);
        console.log('[CalendarScreen.handleSaveEvent] Creating new event. UI data:', eventData);
        try {
          console.log(
            '[CalendarScreen.handleSaveEvent] Backend Create Payload (formatted):\n',
            JSON.stringify(payload, null, 2)
          );
        } catch {
          // ignore serialization error
        }
        const created = await dispatch(createCalendarEvent(payload)).unwrap();
        console.log('[CalendarScreen.handleSaveEvent] Create Success, created event:', created);
        try {
          console.log(
            '[CalendarScreen.handleSaveEvent] Create Response (formatted):\n',
            JSON.stringify(created, null, 2)
          );
        } catch {
          // ignore serialization error
        }
        if (created) {
          const mapped = mapApiEventToUiEvent(created);
          setEvents((prev) => prev.map((e) => (e.id === newEvt.id ? mapped : e)));
        }
        refreshCalendarFeed();
      } catch (err: any) {
        console.log('[CalendarScreen.handleSaveEvent] Create error:', err);
        setEvents((prev) => prev.filter((e) => e.id !== newEvt.id));
        Alert.alert(
          'Error creating event',
          Array.isArray(err) ? err.join(', ') : (err?.message || 'Failed to create event on server')
        );
      }
    }
    setEventToEdit(null);
  };

  const handleConfirmCancelEvent = async (
    eventId: string,
    cancelReason?: string,
    scope: 'THIS_ONE' | 'THIS_AND_FUTURE' | 'ALL' = 'THIS_ONE'
  ) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setSelectedEventForDetail(null);
    setSelectedEventForCancel(null);

    if (isUUID(eventId)) {
      try {
        await dispatch(
          cancelCalendarEvent({
            id: eventId,
            payload: {
              scope,
              occurrenceOn: selectedDate,
              note: cancelReason,
            },
          })
        ).unwrap();
        refreshCalendarFeed();
      } catch (err) {
        console.log('[handleConfirmCancelEvent] Error:', err);
      }
    }
  };

  const handleRsvpResponse = async (eventId: string, response: 'GOING' | 'NOT_GOING') => {
    const existingEvent =
      events.find((e) => e.id === eventId) ||
      (selectedEventForDetail?.id === eventId ? selectedEventForDetail : null);

    const existingNormalizedResponse = normalizeRsvpResponse(
      existingEvent?.myResponse
    );

    // Lock response: creator or user who already responded cannot submit again
    if (
      existingEvent?.isCreator ||
      Boolean(existingNormalizedResponse) ||
      existingEvent?.canRespond === false
    ) {
      return;
    }

    const previousResponse = existingNormalizedResponse;
    const previousCanRespond = existingEvent?.canRespond;

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, myResponse: response, canRespond: false } : e
      )
    );
    if (selectedEventForDetail?.id === eventId) {
      setSelectedEventForDetail((prev) =>
        prev ? { ...prev, myResponse: response, canRespond: false } : null
      );
    }

    if (isUUID(eventId)) {
      try {
        const updated = await dispatch(respondToCalendarEvent({ id: eventId, response })).unwrap();
        if (updated) {
          const mapped = {
            ...mapApiEventToUiEvent(updated),
            myResponse: updated.myResponse ?? response,
            canRespond: false,
          };
          setSelectedEventForDetail(mapped);
          setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...mapped } : e)));
        }
      } catch (err) {
        console.log('[handleRsvpResponse] Error:', err);
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, myResponse: previousResponse, canRespond: previousCanRespond }
              : e
          )
        );
        if (selectedEventForDetail?.id === eventId) {
          setSelectedEventForDetail((prev) =>
            prev
              ? { ...prev, myResponse: previousResponse, canRespond: previousCanRespond }
              : null
          );
        }
        Alert.alert('RSVP failed', 'Could not submit your response. Please try again.');
      }
    }
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
        const res = await calendarServices.addComment(eventId, commentText);
        if (res?.comment) {
          const realComment = {
            id: res.comment.id,
            authorId: res.comment.author?.memberId || '',
            authorName: res.comment.author?.fullName || 'You',
            authorInitial: res.comment.author?.fullName
              ? res.comment.author.fullName.trim()[0].toUpperCase()
              : 'Y',
            authorColor: res.comment.author?.avatarColor || '#4A2E1A',
            time: 'Just now',
            text: res.comment.body || commentText,
            isCurrentUser: true,
          };
          setEvents((prev) =>
            prev.map((e) =>
              e.id === eventId
                ? {
                    ...e,
                    comments: e.comments.map((c) => (c.id === newComment.id ? realComment : c)),
                  }
                : e
            )
          );
        }
      } catch (e) {
        // Optimistic comment remains visible
      }
    }
  };

  const hasActiveFilters =
    filters.member !== 'everyone' ||
    filters.categories.length > 0 ||
    filters.showTypes.length < 2;

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
        title="Calendar"
        hasActiveFilters={hasActiveFilters}
        onFilterPress={() => setFilterModalVisible(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearchVisible={isSearchVisible}
        onToggleSearch={() => {
          setIsSearchVisible((prev) => !prev);
          if (isSearchVisible) {
            setSearchQuery('');
          }
        }}
      />

      {familyLoadError && !isTestEnv ? (
        <ScrollView
          style={styles.calendarBody}
          contentContainerStyle={styles.errorContainer}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <Feather name="alert-circle" size={42} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load family members</Text>
          <Text style={styles.errorMessage}>{familyLoadError}</Text>
          <Text style={styles.errorSubtext}>
            Calendar events and tasks cannot be loaded without family membership.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadFamilyBasicDetails}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Retry loading family members"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : showSkeleton ? (
        <ScrollView
          style={styles.calendarBody}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <CalendarSkeleton />
        </ScrollView>
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
              onSelectEvent={handleOpenEventDetail}
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
              refreshControl={refreshControl}
            />
          )}

          {/* Week View (CAL-02) */}
          {viewMode === 'week' && (
            <WeekView
              selectedDate={selectedDate}
              events={filteredEvents}
              tasksDue={filteredTasks}
              onSelectEvent={handleOpenEventDetail}
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
              refreshControl={refreshControl}
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
              onSelectEvent={handleOpenEventDetail}
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
              refreshControl={refreshControl}
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
        members={familyMembersList}
        onClose={() => setSelectedEventForDetail(null)}
        onEditEvent={(evt) => {
          handleSaveEvent(evt);
        }}
        onOpenComments={(evt) => setSelectedEventForComments(evt)}
        onCancelEvent={(evt, reason) => handleConfirmCancelEvent(evt.id, reason)}
        onAddComment={handleAddComment}
        onRsvpResponse={handleRsvpResponse}
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
  errorContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F87171',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#F0913A',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#0B1A2F',
    fontWeight: '700',
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
});
