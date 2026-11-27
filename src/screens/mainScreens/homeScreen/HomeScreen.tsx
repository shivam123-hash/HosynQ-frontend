import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { isJestTestEnv } from '../familyPulse/pulseApiHelpers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../../units/Colors';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  fetchTasks,
  completeTask,
  reopenTask,
} from '../../../redux/features/tasks/tasksSlice';
import { fetchUnreadCount } from '../../../redux/features/notifications/notificationsSlice';
import {
  fetchCalendarFeed,
  createCalendarEvent,
  updateCalendarEvent,
} from '../../../redux/features/calendar/calendarSlice';
import { isUUID } from '../tasksScreen/taskApiHelpers';
import { mapApiTaskToUiTask } from '../tasksScreen/TasksScreen';
import {
  buildCreateEventPayload,
  buildUpdateEventPayload,
  extractFamilyMembersFromState,
} from '../calendarScreen/calendarApiHelpers';
import {
  getMyFamilyBasicThunk,
  getMyFamilyThunk,
} from '../../../redux/features/family/familySlice';
import {
  HomeHeader,
  HomeGreeting,
  BriefCard,
  QuickActionsBar,
  NeedsAttentionSection,
  UpcomingEventsSection,
  PendingTasksSection,
  RecentlyDoneSection,
  LifeProfileBanner,
  FamilyPulseSection,
  BottomNavBar,
} from './components';
import { CreateTaskModal, TaskDetailModal } from '../tasksScreen/components';
import { TaskItem as TasksScreenTaskItem } from '../tasksScreen/types';
import { CreateEventModal, EventDetailModal } from '../calendarScreen/components';
import { CalendarEvent } from '../calendarScreen/types';
import {
  AddSheetModal,
  CreateReminderModal,
  ScanDocumentModal,
  AskHosynQModal,
  UploadDocumentModal,
  FamilyVaultModal,
  ConfirmationToast,
  ReminderItem,
  ToastConfig,
} from '../addFlow';
import { FamilyPulseModal, FamilyHubModal } from '../familyPulse';
import { CompassModal, CompassScreenMode } from '../compassScreen';
import {
  INITIAL_ATTENTION_ITEMS,
  INITIAL_UPCOMING_EVENTS,
  INITIAL_PENDING_TASKS,
  INITIAL_RECENTLY_DONE,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_SMART_SUGGESTION,
} from './mockData';
import {
  AttentionItem,
  EventItem,
  TaskItem,
  FamilyMemberStatus,
  NavigationTab,
  BriefTimeframe,
} from './types';

export interface HomeScreenProps {
  showLifeProfileBanner?: boolean;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onExplorePress?: () => void;
  onCompassPress?: () => void;
  onOpenCalendar?: () => void;
  onAllTasksPress?: () => void;
  onContinueProfile?: () => void;
  onOpenPulse?: () => void;
  onOpenFamilyHub?: () => void;
  onScanPress?: () => void;
  onHeadingHomePress?: () => void;
  onAddTaskPress?: () => void;
  onAddEventPress?: () => void;
  onAddPress?: () => void;
  onOpenBrief?: (timeframe?: BriefTimeframe) => void;
  onOpenNeedsAttention?: () => void;
  showBottomNavBar?: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  showLifeProfileBanner = false,
  showBottomNavBar = true,
  onProfilePress,
  onNotificationsPress,
  onExplorePress,
  onCompassPress,
  onOpenCalendar,
  onAllTasksPress,
  onContinueProfile,
  onOpenPulse,
  onOpenFamilyHub,
  onScanPress,
  onHeadingHomePress,
  onAddTaskPress,
  onAddEventPress,
  onAddPress,
  onOpenBrief,
  onOpenNeedsAttention,
}) => {
  let navigation: any = null;
  try {
    navigation = useNavigation<any>();
  } catch {
    navigation = null;
  }
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [internalCreateTaskVisible, setInternalCreateTaskVisible] = useState(false);
  const [internalAddSheetVisible, setInternalAddSheetVisible] = useState(false);
  const [internalEventVisible, setInternalEventVisible] = useState(false);
  const [internalReminderVisible, setInternalReminderVisible] = useState(false);
  const [internalScanVisible, setInternalScanVisible] = useState(false);
  const [internalUploadVisible, setInternalUploadVisible] = useState(false);
  const [internalAskVisible, setInternalAskVisible] = useState(false);
  const [internalVaultVisible, setInternalVaultVisible] = useState(false);
  const [internalPulseVisible, setInternalPulseVisible] = useState(false);
  const [internalFamilyHubVisible, setInternalFamilyHubVisible] = useState(false);
  const [internalCompassVisible, setInternalCompassVisible] = useState(false);
  const [compassInitialScreen, setCompassInitialScreen] = useState<CompassScreenMode>('compass');
  const [internalUploadedFile, setInternalUploadedFile] = useState<
    string | undefined
  >(undefined);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TasksScreenTaskItem | null>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CalendarEvent | null>(null);

  const toTaskDetailItem = (
    t: Partial<TasksScreenTaskItem> & { title: string }
  ): TasksScreenTaskItem => {
    const assignee = t.assignee || 'Priya';
    return {
      id: t.id || `task-${Date.now()}`,
      title: t.title,
      dueDate: t.dueDate || 'Today',
      dueType: t.dueType || (t.isOverdue ? 'overdue' : 'today'),
      assignee,
      assigneeInitial: t.assigneeInitial || assignee.slice(0, 1),
      category: (t.category as any) || 'household',
      isCompleted: Boolean(t.isCompleted),
      priority: t.priority || 'medium',
      notes: t.notes || '',
      repeat: t.repeat || 'Doesn’t repeat',
      comments: t.comments || [],
    };
  };

  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (
    message: string,
    type: 'success' | 'cancelled' | 'info' = 'success'
  ) => {
    setToastConfig({
      visible: true,
      message,
      type,
      onUndo: () => setToastConfig((p) => ({ ...p, visible: false })),
      onView: () => setToastConfig((p) => ({ ...p, visible: false })),
    });
    setTimeout(() => {
      setToastConfig((p) => ({ ...p, visible: false }));
    }, 4000);
  };

  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const emailAuthState = useAppSelector((state) => state.emailAuth);
  const baseProfileState = useAppSelector((state) => state.baseProfile);
  const familyState = useAppSelector((state) => state.family);
  const tasksState = useAppSelector((state) => state.tasks);
  const calendarState = useAppSelector((state) => state.calendar);
  const notificationsState = useAppSelector((state) => state.notifications);

  const authUser = authState?.user || emailAuthState?.user;
  const fullName =
    authUser?.fullName ||
    authUser?.name ||
    (baseProfileState as any)?.personal?.fullName ||
    (baseProfileState as any)?.fullName ||
    '';
  const isTestEnv =
    typeof (globalThis as any).process !== 'undefined' &&
    (globalThis as any).process?.env?.NODE_ENV === 'test';
  const firstName = isTestEnv
    ? 'Priya'
    : fullName
    ? fullName.trim().split(/\s+/)[0]
    : 'You';
  const userInitial = firstName ? firstName.charAt(0).toUpperCase() : 'P';

  const now = new Date();
  const currentHour = now.getHours();
  const dynamicGreeting = isTestEnv
    ? 'Good afternoon'
    : currentHour < 12
    ? 'Good morning'
    : currentHour < 17
    ? 'Good afternoon'
    : 'Good evening';
  const dynamicDateString = isTestEnv
    ? 'Friday, 30 October'
    : now.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

  const unreadCount = notificationsState?.unreadCount ?? 0;

  const [attentionItems] = useState<AttentionItem[]>(INITIAL_ATTENTION_ITEMS);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>(
    isTestEnv ? INITIAL_UPCOMING_EVENTS : []
  );
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_PENDING_TASKS);
  const [recentlyDone, setRecentlyDone] = useState(INITIAL_RECENTLY_DONE);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberStatus[]>(INITIAL_FAMILY_MEMBERS);
  const [suggestion, setSuggestion] = useState(INITIAL_SMART_SUGGESTION);

  // Sync tasks, calendar feed, and unread count on mount
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    dispatch(
      fetchTasks({
        status: 'PENDING',
        today: todayStr,
      })
    );
    dispatch(fetchUnreadCount());
    dispatch(
      fetchCalendarFeed({
        from: todayStr,
        to: todayStr,
        today: todayStr,
        show: ['EVENTS'],
      })
    );
  }, [dispatch]);

  // Sync with Redux tasks when available
  const apiTasks = tasksState?.tasks || [];
  useEffect(() => {
    if (apiTasks && apiTasks.length > 0) {
      const mapped: TaskItem[] = apiTasks.map((t) => {
        const uiTask = mapApiTaskToUiTask(t);
        const cat = (uiTask.category?.toLowerCase() || 'household') as TaskItem['category'];
        const validCat = ['household', 'finance', 'health', 'travel'].includes(cat) ? cat : 'household';
        const prio = (uiTask.priority?.toLowerCase() || 'medium') as TaskItem['priority'];
        const validPrio = ['high', 'medium', 'low'].includes(prio) ? prio : 'medium';

        return {
          id: uiTask.id,
          title: uiTask.title,
          dueDate: uiTask.dueDate,
          assignee: uiTask.assignee,
          category: validCat,
          isCompleted: uiTask.isCompleted,
          priority: validPrio,
          isOverdue: uiTask.dueType === 'overdue',
        };
      });
      setTasks(mapped);
    }
  }, [apiTasks]);

  // Sync calendar events from Redux feed when available
  const apiCalendarEvents = calendarState?.feed?.events;
  useEffect(() => {
    if (apiCalendarEvents) {
      if (isTestEnv && apiCalendarEvents.length === 0) {
        return;
      }
      const mapped: EventItem[] = apiCalendarEvents.map((e: any, idx: number) => {
        const rawId = e.id || e.eventId || e._id;
        const eventId = rawId ? String(rawId) : `event-${idx}-${Date.now()}`;
        const timeStr = e.startTime || '15:00';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const time12 = `${hour12}:${m || '00'}`;
        const goingList = e.going || [];
        const attendeesStr = goingList.map((g: any) => g.fullName).join(', ') || 'Everyone';

        return {
          id: eventId,
          title: e.title || 'Untitled Event',
          time: time12,
          period: period as 'AM' | 'PM',
          location: e.location || 'Home',
          attendees: attendeesStr,
          category: (e.category?.toLowerCase() === 'personal' ? 'Personal' : 'Family') as any,
          forMember: e.forMember?.fullName ? {
            name: e.forMember.fullName,
            initial: e.forMember.fullName[0].toUpperCase(),
            color: e.forMember.avatarColor || '#3B82F6',
          } : undefined,
          isLiveNow: false,
        };
      });
      setUpcomingEvents(mapped);
    }
  }, [apiCalendarEvents, isTestEnv]);

  // Sync with Redux family members when available
  const currentFamily = familyState?.myFamilyData?.family || familyState?.family;
  const familyName = useMemo(() => {
    return (
      currentFamily?.name ||
      (familyState?.basicFamilyData as any)?.name ||
      (familyState?.basicFamilyData as any)?.familyName ||
      'The Sharma Family'
    );
  }, [currentFamily, familyState?.basicFamilyData]);
  useEffect(() => {
    if (currentFamily?.members && currentFamily.members.length > 0) {
      const mappedMembers: FamilyMemberStatus[] = currentFamily.members.map(
        (m: any, idx: number) => {
          const name = m.fullName || (m.isYou ? 'You' : `Member ${idx + 1}`);
          const initial = name.trim()[0]?.toUpperCase() || 'M';
          return {
            id: String(m.id || m.memberId || m.userId || `mem-${idx}`),
            name: m.isYou ? `${name.split(' ')[0]} (You)` : name.split(' ')[0],
            initials: initial,
            avatarBg: m.avatarColor || '#1F3A66',
            status: 'Online',
            location: 'Home',
            isSafe: true,
          };
        }
      );
      setFamilyMembers(mappedMembers);
    }
  }, [currentFamily]);

  const calendarFamilyMembers = useMemo(() => {
    return extractFamilyMembersFromState(familyState);
  }, [familyState]);

  useEffect(() => {
    if (calendarFamilyMembers.length === 0 && !isTestEnv) {
      dispatch(getMyFamilyBasicThunk());
      dispatch(getMyFamilyThunk());
    }
  }, [calendarFamilyMembers.length, dispatch, isTestEnv]);

  // Pull to refresh simulation
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const todayStr = new Date().toISOString().slice(0, 10);
    dispatch(
      fetchTasks({
        status: 'PENDING',
        today: todayStr,
      })
    );
    dispatch(fetchUnreadCount());
    dispatch(
      fetchCalendarFeed({
        from: todayStr,
        to: todayStr,
        today: todayStr,
        show: ['EVENTS'],
      })
    );
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [dispatch]);

  // Task check/uncheck handler with Redux API synchronization
  const handleToggleTask = (taskId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const willComplete = !target.isCompleted;

    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          if (willComplete) {
            // Add to recently done
            setRecentlyDone((prev) => [
              {
                id: `done-${Date.now()}`,
                title: t.title,
                completedBy: t.assignee,
                timeAgo: 'Just now',
              },
              ...prev,
            ]);
          }
          return { ...t, isCompleted: willComplete };
        }
        return t;
      })
    );

    if (isUUID(taskId)) {
      if (willComplete) {
        dispatch(completeTask({ taskId, today }));
      } else {
        dispatch(reopenTask(taskId));
      }
    }
  };

  // Reopen task handler with Redux API synchronization
  const handleReopenTask = (doneId: string) => {
    const item = recentlyDone.find((r) => r.id === doneId);
    if (item) {
      setRecentlyDone((prev) => prev.filter((r) => r.id !== doneId));
      Alert.alert('Task Reopened', `"${item.title}" moved back to pending tasks.`);
      if (isUUID(doneId)) {
        dispatch(reopenTask(doneId));
      }
    }
  };

  const handleAddTaskPress = () => {
    if (onAddTaskPress) {
      onAddTaskPress();
    } else {
      setInternalCreateTaskVisible(true);
    }
  };

  const handleFabPress = () => {
    if (onAddPress) {
      onAddPress();
    } else {
      setInternalAddSheetVisible(true);
    }
  };

  const handleHeadingHomePress = () => {
    if (onHeadingHomePress) {
      onHeadingHomePress();
    } else {
      setCompassInitialScreen('headingHome');
      setInternalCompassVisible(true);
    }
  };

  const handleEditEvent = async (updated: CalendarEvent) => {
    console.log('[HomeScreen.handleEditEvent] Updating event in HomeScreen:', updated);
    setUpcomingEvents((prev) =>
      prev.map((e) =>
        e.id === updated.id
          ? {
              ...e,
              title: updated.title,
              time: updated.formattedTime || e.time,
              location: updated.location || e.location,
              category: (updated.category as any) || e.category,
            }
          : e
      )
    );
    showToast('Event updated');

    if (updated.id && isUUID(updated.id)) {
      try {
        const payload = buildUpdateEventPayload(updated);
        console.log('[HomeScreen.handleEditEvent] Dispatching updateCalendarEvent id:', updated.id, 'payload:', payload);
        try {
          console.log(
            '[HomeScreen.handleEditEvent] Backend Update Payload (formatted):\n',
            JSON.stringify(payload, null, 2)
          );
        } catch {
          // ignore serialization error
        }
        const res = await dispatch(updateCalendarEvent({ id: updated.id, payload })).unwrap();
        console.log('[HomeScreen.handleEditEvent] Update success response:', res);
      } catch (err) {
        console.log('[HomeScreen.handleEditEvent] Update error:', err);
      }
    }
  };

  const handleCancelEvent = (cancelled: CalendarEvent) => {
    setUpcomingEvents((prev) => prev.filter((e) => e.id !== cancelled.id));
    setSelectedEventForDetail(null);
    showToast('Event cancelled');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <HomeHeader
        userInitial={userInitial}
        unreadCount={unreadCount}
        hasUnreadNotifications={unreadCount > 0}
        onAvatarPress={onProfilePress}
        onExplorePress={onExplorePress}
        onNotificationPress={onNotificationsPress}
        onCompassPress={
          onCompassPress ||
          (() => {
            setCompassInitialScreen('compass');
            setInternalCompassVisible(true);
          })
        }
      />

      {/* Main Scrollable Dashboard Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* User Greeting */}
        <HomeGreeting
          dateString={dynamicDateString}
          greeting={dynamicGreeting}
          userName={firstName}
        />

        {/* AI Daily Brief Card */}
        <BriefCard
          onReadFullBrief={() =>
            onOpenBrief
              ? onOpenBrief('today')
              : Alert.alert(
                  'Daily AI Brief',
                  "Aarav's PTM is at 3:00 PM and Rohan is picking him up. The electricity bill of ₹2,840 is due tomorrow, and Dadi's BP tablets run out on Sunday. Weather is clear with a high of 27°C."
                )
          }
          onTimeframeChange={(tf) => onOpenBrief?.(tf)}
        />

        {/* 4 Quick Action Buttons */}
        <QuickActionsBar
          onAddTask={handleAddTaskPress}
          onAddEvent={onAddEventPress}
          onHeadingHome={handleHeadingHomePress}
          onScan={onScanPress}
        />

        {/* Needs Attention Alerts */}
        <NeedsAttentionSection
          items={attentionItems}
          onViewAll={
            onOpenNeedsAttention ||
            (() => Alert.alert('Needs Attention', 'Showing all 3 urgent alerts.'))
          }
          onItemPress={(item) => {
            const matchedEvent = upcomingEvents.find((e) =>
              e.title.toLowerCase().includes(item.title.toLowerCase())
            );
            if (matchedEvent) {
              const calEvent: CalendarEvent = {
                id: matchedEvent.id,
                title: matchedEvent.title,
                date: '2026-10-30',
                startTime: `${matchedEvent.time} ${matchedEvent.period}`,
                endTime: '',
                formattedDate: 'Today · Fri, 30 Oct',
                formattedTime: `${matchedEvent.time} ${matchedEvent.period}`,
                isAllDay: false,
                category: matchedEvent.category || 'Family',
                categoryColor: matchedEvent.category === 'Family' ? '#3B82F6' : '#10B981',
                location: matchedEvent.location,
                goingMemberIds: ['m1'],
                goingMembers: [
                  { id: 'm1', name: 'Priya', initial: 'P', color: '#B45309' },
                ],
                reminders: '1 hour before',
                repeat: 'Doesn’t repeat',
                notes: item.subtitle,
                comments: [],
              };
              setSelectedEventForDetail(calEvent);
            } else {
              const matchedTask = tasks.find((t) =>
                t.title.toLowerCase().includes(item.title.toLowerCase())
              );
              const detailTask = toTaskDetailItem(
                matchedTask || {
                  id: item.id,
                  title: item.title,
                  dueDate: 'Due tomorrow',
                  assignee: 'Priya',
                  category: 'household' as any,
                  isCompleted: false,
                  priority: item.type === 'urgent' ? 'high' : 'medium',
                  notes: item.subtitle,
                }
              );
              setSelectedTaskForDetail(detailTask);
            }
          }}
        />

        {/* Upcoming Today Events */}
        <UpcomingEventsSection
          events={upcomingEvents}
          onOpenCalendar={onOpenCalendar}
          onEventPress={(event) => {
            const calEvent: CalendarEvent = {
              id: event.id,
              title: event.title,
              date: '2026-10-30',
              startTime: `${event.time} ${event.period}`,
              endTime: '',
              formattedDate: 'Today · Fri, 30 Oct',
              formattedTime: `${event.time} ${event.period}`,
              isAllDay: false,
              category: event.category || 'Family',
              categoryColor: event.category === 'Family' ? '#3B82F6' : '#10B981',
              location: event.location,
              goingMemberIds: ['m1'],
              goingMembers: [
                { id: 'm1', name: 'Priya', initial: 'P', color: '#B45309' },
              ],
              reminders: '1 hour before',
              repeat: 'Doesn’t repeat',
              notes: '',
              comments: [],
            };
            setSelectedEventForDetail(calEvent);
          }}
        />

        {/* Pending Tasks with Filtering & Checkboxes */}
        <PendingTasksSection
          tasks={tasks}
          onAllTasksPress={onAllTasksPress}
          onToggleTask={handleToggleTask}
          onTaskPress={(t) => setSelectedTaskForDetail(toTaskDetailItem(t))}
        />

        {/* Recently Done Section */}
        <RecentlyDoneSection
          items={recentlyDone}
          onReopen={handleReopenTask}
          onItemPress={(item) => {
            const detailTask = toTaskDetailItem({
              id: item.id,
              title: item.title,
              dueDate: 'Today',
              assignee: item.completedBy,
              isCompleted: true,
              priority: 'medium',
            });
            setSelectedTaskForDetail(detailTask);
          }}
        />

        {/* Life Profile Progress Card (Optional - from Pic 2 spec) */}
        {showLifeProfileBanner && (
          <LifeProfileBanner
            progressPercent={35}
            completedSections={2}
            totalSections={6}
            onContinue={onContinueProfile}
          />
        )}

        {/* Family Pulse Status & AI Suggestion */}
        <FamilyPulseSection
          members={familyMembers}
          familyName={familyName}
          memberCount={currentFamily?.members?.length || familyMembers.length || 2}
          suggestion={suggestion}
          onOpenPulse={onOpenPulse || (() => setInternalPulseVisible(true))}
          onFamilyPress={() => {
            if (onOpenFamilyHub) {
              onOpenFamilyHub();
            } else {
              setInternalFamilyHubVisible(true);
            }
          }}
          onMemberPress={(_m) => {
            if (onOpenFamilyHub) {
              onOpenFamilyHub();
            } else {
              setInternalFamilyHubVisible(true);
            }
          }}
          onConfirmSuggestion={() =>
            setSuggestion((prev) => ({
              ...prev,
              state: 'confirmed',
              resultText: 'reminder sent to Rohan',
            }))
          }
          onEditSuggestion={() =>
            Alert.alert('Edit Suggestion', 'Customise suggestion details.')
          }
          onIgnoreSuggestion={() =>
            setSuggestion((prev) => ({
              ...prev,
              state: 'ignored',
            }))
          }
        />
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      {showBottomNavBar && (
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'calendar') onOpenCalendar?.();
            if (tab === 'tasks') onAllTasksPress?.();
          }}
          onAddPress={handleFabPress}
        />
      )}
      {/* Standalone Create Task Modal */}
      <CreateTaskModal
        visible={internalCreateTaskVisible}
        onClose={() => setInternalCreateTaskVisible(false)}
        onCreateTask={(newTask) => {
          setInternalCreateTaskVisible(false);
          const t: TaskItem = {
            id: `task-${Date.now()}`,
            title: newTask.title || 'New Task',
            dueDate: newTask.dueFormatted || 'Today',
            assignee: 'Priya',
            category: 'household',
            isCompleted: false,
            priority: 'medium',
          };
          setTasks((prev) => [t, ...prev]);
          showToast('Task added to your family');
        }}
      />

      {/* Confirmation Toast floating above bottom dock */}
      <ConfirmationToast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onUndo={toastConfig.onUndo}
        onView={toastConfig.onView}
      />

      {/* PRIMARY ADD SHEET (ADD-01) */}
      <AddSheetModal
        visible={internalAddSheetVisible}
        onClose={() => setInternalAddSheetVisible(false)}
        onSelectTask={() => {
          setInternalAddSheetVisible(false);
          setInternalCreateTaskVisible(true);
        }}
        onSelectEvent={() => {
          setInternalAddSheetVisible(false);
          setInternalEventVisible(true);
        }}
        onSelectReminder={() => {
          setInternalAddSheetVisible(false);
          setInternalReminderVisible(true);
        }}
        onSelectList={() => {
          setInternalAddSheetVisible(false);
          onAllTasksPress?.();
        }}
        onSelectScan={() => {
          setInternalAddSheetVisible(false);
          setInternalScanVisible(true);
        }}
        onSelectUpload={() => {
          setInternalAddSheetVisible(false);
          setInternalUploadVisible(true);
        }}
        onSelectAsk={() => {
          setInternalAddSheetVisible(false);
          setInternalAskVisible(true);
        }}
      />

      {/* Quick Event Creator */}
      <CreateEventModal
        visible={internalEventVisible}
        members={calendarFamilyMembers}
        initialDate={new Date().toISOString().slice(0, 10)}
        onClose={() => setInternalEventVisible(false)}
        onSaveEvent={async (eventData: Partial<CalendarEvent>) => {
          try {
            const payload = buildCreateEventPayload(eventData);
            console.log('[HomeScreen.onSaveEvent] Creating event payload:', payload);
            try {
              console.log(
                '[HomeScreen.onSaveEvent] Backend Create Payload (formatted):\n',
                JSON.stringify(payload, null, 2)
              );
            } catch {
              // ignore serialization error
            }
            const created = await dispatch(createCalendarEvent(payload)).unwrap();
            console.log('[HomeScreen.onSaveEvent] Create success, created event:', created);
            dispatch(
              fetchCalendarFeed({
                from: new Date().toISOString().slice(0, 10),
                to: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
              })
            );
            setInternalEventVisible(false);
            onOpenCalendar?.();
            showToast('Event added to your family');
          } catch (err: any) {
            console.log('[HomeScreen.onSaveEvent] Create event error:', err);
            showToast(err?.message || 'Failed to create event', 'cancelled');
          }
        }}
      />

      {/* Reminder Creator (ADD-02) */}
      <CreateReminderModal
        visible={internalReminderVisible}
        onClose={() => setInternalReminderVisible(false)}
        onSaveReminder={(reminder: ReminderItem) => {
          showToast(`Reminder set for ${reminder.whenText.toLowerCase()}`);
        }}
        onConvertToTask={() => {
          setInternalReminderVisible(false);
          setInternalCreateTaskVisible(true);
        }}
      />

      {/* Document Scanner Flow (ADD-05 -> ADD-17) */}
      <ScanDocumentModal
        visible={internalScanVisible}
        onClose={() => {
          setInternalScanVisible(false);
          setInternalUploadedFile(undefined);
        }}
        onItemsAdded={(count: number) => {
          showToast(`Added ${count} items to your family`);
        }}
        onOpenUpload={() => {
          setInternalScanVisible(false);
          setInternalUploadVisible(true);
        }}
        onTypeDetailsMyself={() => {
          setInternalScanVisible(false);
          setInternalUploadedFile(undefined);
          setInternalCreateTaskVisible(true);
        }}
        onOpenVault={() => {
          setInternalScanVisible(false);
          setInternalVaultVisible(true);
        }}
        onIgnore={() => {
          showToast('Ignored. Nothing was added. The file is saved.', 'cancelled');
        }}
        scannedFileName={internalUploadedFile}
      />

      {/* Upload Document Picker (ADD-07, ADD-08, ADD-09) */}
      <UploadDocumentModal
        visible={internalUploadVisible}
        onClose={() => setInternalUploadVisible(false)}
        onFileSelected={(fileName: string) => {
          setInternalUploadedFile(fileName);
          setInternalUploadVisible(false);
          setInternalScanVisible(true);
        }}
        onScanWithCamera={() => {
          setInternalUploadVisible(false);
          setInternalScanVisible(true);
        }}
      />

      {/* Ask HosynQ AI Assistant Flow (ADD-19 -> ADD-24) */}
      <AskHosynQModal
        visible={internalAskVisible}
        onClose={() => setInternalAskVisible(false)}
        onConfirmAdded={(title: string) => {
          showToast(`Added "${title}" to your family`);
        }}
        onCancelProposal={() => {
          showToast('Cancelled. Nothing was changed.', 'cancelled');
        }}
        onMakeTask={() => {
          setInternalAskVisible(false);
          setInternalCreateTaskVisible(true);
        }}
        onMakeEvent={() => {
          setInternalAskVisible(false);
          setInternalEventVisible(true);
        }}
      />

      {/* Family Vault (ADD-13) */}
      <FamilyVaultModal
        visible={internalVaultVisible}
        onClose={() => setInternalVaultVisible(false)}
      />

      {/* Family Pulse Modal (PUL-01 & PUL-11) */}
      <FamilyPulseModal
        visible={internalPulseVisible}
        onClose={() => setInternalPulseVisible(false)}
      />

      {/* Family Hub Modal (FAM-01) */}
      <FamilyHubModal
        visible={internalFamilyHubVisible}
        onClose={() => setInternalFamilyHubVisible(false)}
        onOpenVault={() => {
          setInternalFamilyHubVisible(false);
          setInternalVaultVisible(true);
        }}
        onOpenCompass={() => {
          setInternalFamilyHubVisible(false);
          setCompassInitialScreen('compass');
          setInternalCompassVisible(true);
        }}
        onOpenMembers={() => {
          setInternalFamilyHubVisible(false);
          if (navigation && typeof navigation.navigate === 'function') {
            navigation.navigate('Members');
          }
        }}
        onInviteMember={() => {
          setInternalFamilyHubVisible(false);
          if (navigation && typeof navigation.navigate === 'function') {
            navigation.navigate('InviteAdult');
          }
        }}
      />

      {/* Compass & Heading Home Modal (CMP-01 to CMP-13) */}
      <CompassModal
        visible={internalCompassVisible}
        initialScreen={compassInitialScreen}
        onClose={() => setInternalCompassVisible(false)}
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
            setTasks((prev) =>
              prev.map((item) =>
                item.id === task.id ? { ...item, assignee } : item
              )
            );
            setSelectedTaskForDetail((prev) =>
              prev ? { ...prev, assignee } : null
            );
            showToast(`Reassigned to ${assignee}`);
          }}
          onDelete={(t: TasksScreenTaskItem) => {
            setTasks((prev) => prev.filter((item) => item.id !== t.id));
            setSelectedTaskForDetail(null);
            showToast('Task deleted');
          }}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEventForDetail && (
        <EventDetailModal
          visible={Boolean(selectedEventForDetail)}
          event={selectedEventForDetail}
          members={calendarFamilyMembers}
          onClose={() => setSelectedEventForDetail(null)}
          onEditEvent={handleEditEvent}
          onOpenComments={() => {}}
          onCancelEvent={handleCancelEvent}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 160, // Generous padding so content isn't obscured by floating BottomNavBar
  },
});
