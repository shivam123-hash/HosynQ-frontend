import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../../units/Colors';
import {
  BriefHeader,
  BriefTimeframeSelector,
  BriefAiCard,
  BriefTodayEvents,
  BriefDueTasks,
  BriefWatchOutList,
  BriefSmartSuggestion,
  BriefHowMadeCard,
  BriefWeekDayByDay,
  BriefWhoWorkload,
  BriefComingUpList,
  BriefMonthStatCards,
  BriefLoadingState,
  BriefEmptyState,
} from './components';
import { TaskDetailModal } from '../tasksScreen/components';
import { TaskItem } from '../tasksScreen/types';
import { EventDetailModal } from '../calendarScreen/components';
import { CalendarEvent } from '../calendarScreen/types';
import { BriefTimeframe, BriefTaskItem, BriefEventItem, ChecklistItem } from './types';
import {
  TODAY_AI_TEXT,
  TODAY_EVENTS,
  TODAY_DUE_TASKS,
  TODAY_WATCH_OUT,
  TODAY_SUGGESTION,
  WEEK_AI_TEXT,
  WEEK_DAYS,
  WEEK_MEMBERS,
  WEEK_COMING_UP,
  WEEK_SUGGESTION,
  MONTH_AI_TEXT,
  MONTH_STATS,
  MONTH_MEMBERS,
  MONTH_COMING_UP,
  MONTH_SUGGESTION,
  EMPTY_CHECKLIST,
} from './mockData';

export interface YourBriefScreenProps {
  initialTimeframe?: BriefTimeframe;
  forceLoading?: boolean;
  isEmpty?: boolean;
  onBack?: () => void;
  onShare?: () => void;
  onOpenCalendar?: () => void;
  onOpenTasks?: () => void;
  onAddTask?: () => void;
  onAddEvent?: () => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectTask?: (task: TaskItem) => void;
}

const YourBriefScreen: React.FC<YourBriefScreenProps> = ({
  initialTimeframe = 'today',
  forceLoading = false,
  isEmpty = false,
  onBack,
  onShare,
  onOpenCalendar,
  onOpenTasks,
  onAddTask,
  onAddEvent,
  onSelectEvent,
  onSelectTask,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<BriefTimeframe>(initialTimeframe);
  const [isLoading, setIsLoading] = useState<boolean>(forceLoading);
  const [isBriefEmpty, setIsBriefEmpty] = useState<boolean>(isEmpty);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CalendarEvent | null>(null);

  // Interactive Task List state for "Due today"
  const [tasks, setTasks] = useState<BriefTaskItem[]>(TODAY_DUE_TASKS);
  const [todayEvents, setTodayEvents] = useState<BriefEventItem[]>(TODAY_EVENTS);

  // Checklist state for Empty state
  const [checklist] = useState<ChecklistItem[]>(EMPTY_CHECKLIST);

  const toTaskItem = (
    t: Partial<BriefTaskItem> & { title: string }
  ): TaskItem => {
    const assignee = t.assignee || 'Priya';
    return {
      id: t.id || `task-${Date.now()}`,
      title: t.title,
      dueDate: t.dueDate || 'Today',
      dueType: t.isOverdue ? 'overdue' : 'today',
      assignee,
      assigneeInitial: assignee.slice(0, 1).toUpperCase(),
      category: 'household',
      isCompleted: Boolean(t.isCompleted),
      priority: t.priority || 'medium',
      notes: '',
      repeat: 'Doesn’t repeat',
      comments: [],
    };
  };

  const toCalendarEvent = (
    e: Partial<BriefEventItem> & { title: string }
  ): CalendarEvent => {
    const startTime = e.time ? `${e.time} ${e.period || 'PM'}` : '3:00 PM';
    return {
      id: e.id || `event-${Date.now()}`,
      title: e.title,
      date: '2026-10-30',
      startTime,
      endTime: '',
      formattedDate: 'Today · Fri, 30 Oct',
      formattedTime: startTime,
      isAllDay: false,
      category: e.category || 'Family',
      categoryColor: e.category === 'Personal' ? '#10B981' : '#3B82F6',
      location: e.location || '',
      goingMemberIds: ['m1'],
      goingMembers: [
        { id: 'm1', name: 'Priya', initial: 'P', color: '#B45309' },
      ],
      reminders: '1 hour before',
      repeat: 'Doesn’t repeat',
      notes: '',
      comments: [],
    };
  };

  const handleOpenEventDetail = (event: Partial<BriefEventItem> & { title: string }) => {
    const calEvent = toCalendarEvent(event);
    if (onSelectEvent) {
      onSelectEvent(calEvent);
    } else {
      setSelectedEventForDetail(calEvent);
    }
  };

  const handleOpenTaskDetail = (task: Partial<BriefTaskItem> & { title: string }) => {
    const taskItem = toTaskItem(task);
    if (onSelectTask) {
      onSelectTask(taskItem);
    } else {
      setSelectedTaskForDetail(taskItem);
    }
  };

  const handleEditEvent = (updated: CalendarEvent) => {
    setTodayEvents((prev) =>
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
  };

  const handleCancelEvent = (cancelled: CalendarEvent) => {
    setTodayEvents((prev) => prev.filter((e) => e.id !== cancelled.id));
    setSelectedEventForDetail(null);
  };

  const handleToggleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      )
    );
  }, []);

  const handleChecklistItemPress = useCallback((item: ChecklistItem) => {
    if (item.id === 'chk-2') {
      onAddTask?.();
    } else if (item.id === 'chk-3') {
      onAddEvent?.();
    }
  }, [onAddTask, onAddEvent]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare();
    } else {
      Alert.alert('Share Brief', 'Family brief copied to clipboard.');
    }
  }, [onShare]);

  // Demo toggle helper (on title long press) to cycle normal -> loading -> empty
  const handleDebugToggle = useCallback(() => {
    if (!isLoading && !isBriefEmpty) {
      setIsLoading(true);
    } else if (isLoading) {
      setIsLoading(false);
      setIsBriefEmpty(true);
    } else {
      setIsBriefEmpty(false);
    }
  }, [isLoading, isBriefEmpty]);

  const getDateMetaForCurrentTab = () => {
    switch (selectedTimeframe) {
      case 'week':
        return { range: 'Fri 30 Oct – Thu 5 Nov', updated: 'Updated 7:00 AM' };
      case 'month':
        return { range: 'October 2026', updated: 'Updated 7:00 AM' };
      case 'today':
      default:
        return { range: 'Friday, 30 October', updated: 'Updated 2:10 PM' };
    }
  };

  const dateMeta = getDateMetaForCurrentTab();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Top Header Bar */}
      <BriefHeader
        onBackPress={onBack}
        onSharePress={handleShare}
        onStateTogglePress={handleDebugToggle}
      />

      {/* Timeframe Pill Selector (Today / Week / Month) */}
      <BriefTimeframeSelector
        selectedTimeframe={selectedTimeframe}
        onSelectTimeframe={setSelectedTimeframe}
      />

      {/* Main Content Area */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {isLoading ? (
          // ================= Loading View (Pic 5) =================
          <BriefLoadingState dateRangeText={dateMeta.range} />
        ) : isBriefEmpty ? (
          // ================= Empty State View (Pic 3) =================
          <BriefEmptyState
            checklist={checklist}
            onAddTaskPress={onAddTask || (() => Alert.alert('Add Task', 'Open task creation'))}
            onChecklistItemPress={handleChecklistItemPress}
          />
        ) : selectedTimeframe === 'today' ? (
          // ================= Today View (Pic 1) =================
          <>
            <BriefAiCard
              dateRangeText={dateMeta.range}
              updatedText={dateMeta.updated}
              summaryText={TODAY_AI_TEXT}
            />

            <BriefTodayEvents
              events={todayEvents}
              onOpenCalendar={onOpenCalendar}
              onEventPress={(event) => handleOpenEventDetail(event)}
            />

            <BriefDueTasks
              tasks={tasks}
              onOpenTasks={onOpenTasks}
              onToggleTask={handleToggleTask}
              onTaskPress={(task) => handleOpenTaskDetail(task)}
            />

            <BriefWatchOutList
              items={TODAY_WATCH_OUT}
              onItemPress={(item) => {
                if (
                  item.title.toLowerCase().includes('event') ||
                  item.title.toLowerCase().includes('ptm')
                ) {
                  handleOpenEventDetail({
                    title: item.title,
                    location: item.subtitle,
                  });
                } else {
                  handleOpenTaskDetail({
                    id: item.id,
                    title: item.title,
                    dueDate: item.subtitle,
                    priority: 'high',
                  });
                }
              }}
            />

            <BriefSmartSuggestion
              sectionTitle="Suggested for today"
              suggestion={TODAY_SUGGESTION}
              onConfirm={() => Alert.alert('Confirmed', 'Reminder set for Rohan at 6:00 PM.')}
              onIgnore={() => Alert.alert('Ignored', 'Suggestion dismissed.')}
            />

            <BriefHowMadeCard
              description="From 7 tasks, 3 events and 2 reminders in your family’s HosynQ. Nothing from outside the app."
              textColor="#C9D1DC"
              onFeedback={(useful) =>
                Alert.alert(
                  'Thank you',
                  useful ? 'Glad this was helpful!' : 'Thanks for your feedback.'
                )
              }
            />
          </>
        ) : selectedTimeframe === 'week' ? (
          // ================= Week View (Pic 2) =================
          <>
            <BriefAiCard
              dateRangeText={dateMeta.range}
              updatedText={dateMeta.updated}
              summaryText={WEEK_AI_TEXT}
            />

            <BriefWeekDayByDay days={WEEK_DAYS} />

            <BriefWhoWorkload
              sectionTitle="Who’s doing what"
              members={WEEK_MEMBERS}
            />

            <BriefComingUpList
              sectionTitle="Coming up"
              items={WEEK_COMING_UP}
              onItemPress={(item) => {
                if (
                  item.iconName === 'calendar' ||
                  item.title.toLowerCase().includes('birthday') ||
                  item.title.toLowerCase().includes('ptm')
                ) {
                  handleOpenEventDetail({
                    id: item.id,
                    title: item.title,
                    location: item.subtitle,
                  });
                } else {
                  handleOpenTaskDetail({
                    id: item.id,
                    title: item.title,
                    dueDate: item.subtitle,
                    priority: item.isWarning ? 'high' : 'medium',
                  });
                }
              }}
            />

            <BriefSmartSuggestion
              sectionTitle="Suggested this week"
              suggestion={WEEK_SUGGESTION}
              onConfirm={() =>
                Alert.alert('Confirmed', 'Task moved to Sunday for Rohan.')
              }
              onIgnore={() => Alert.alert('Ignored', 'Suggestion dismissed.')}
            />

            <BriefHowMadeCard
              description="From 11 tasks and 4 events planned between 30 October and 5 November."
              onFeedback={(useful) =>
                Alert.alert(
                  'Thank you',
                  useful ? 'Glad this was helpful!' : 'Thanks for your feedback.'
                )
              }
            />
          </>
        ) : (
          // ================= Month View (Pic 4) =================
          <>
            <BriefAiCard
              dateRangeText={dateMeta.range}
              updatedText={dateMeta.updated}
              summaryText={MONTH_AI_TEXT}
            />

            <BriefMonthStatCards stats={MONTH_STATS} />

            <BriefWhoWorkload
              sectionTitle="Who got things done"
              members={MONTH_MEMBERS}
            />

            <BriefComingUpList
              sectionTitle="Coming in November"
              items={MONTH_COMING_UP}
              onItemPress={(item) => {
                if (
                  item.iconName === 'calendar' ||
                  item.title.toLowerCase().includes('birthday') ||
                  item.title.toLowerCase().includes('ptm')
                ) {
                  handleOpenEventDetail({
                    id: item.id,
                    title: item.title,
                    location: item.subtitle,
                  });
                } else {
                  handleOpenTaskDetail({
                    id: item.id,
                    title: item.title,
                    dueDate: item.subtitle,
                    priority: item.isWarning ? 'high' : 'medium',
                  });
                }
              }}
            />

            <BriefSmartSuggestion
              sectionTitle="Suggested this month"
              suggestion={MONTH_SUGGESTION}
              onConfirm={() =>
                Alert.alert('Confirmed', 'Added task to renew Rohan’s passport.')
              }
              onIgnore={() => Alert.alert('Ignored', 'Suggestion dismissed.')}
            />

            <BriefHowMadeCard
              description="From 38 completed tasks, 12 events and the renewal dates in your family’s Life Profiles."
              textColor="#B6B8B8"
              onFeedback={(useful) =>
                Alert.alert(
                  'Thank you',
                  useful ? 'Glad this was helpful!' : 'Thanks for your feedback.'
                )
              }
            />
          </>
        )}
      </ScrollView>

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
          }}
          onDelete={(t: TaskItem) => {
            setTasks((prev) => prev.filter((item) => item.id !== t.id));
            setSelectedTaskForDetail(null);
          }}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEventForDetail && (
        <EventDetailModal
          visible={Boolean(selectedEventForDetail)}
          event={selectedEventForDetail}
          onClose={() => setSelectedEventForDetail(null)}
          onEditEvent={handleEditEvent}
          onOpenComments={() => {}}
          onCancelEvent={handleCancelEvent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

export default YourBriefScreen;
