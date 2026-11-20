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

  const [attentionItems] = useState<AttentionItem[]>(INITIAL_ATTENTION_ITEMS);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>(INITIAL_UPCOMING_EVENTS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_PENDING_TASKS);
  const [recentlyDone, setRecentlyDone] = useState(INITIAL_RECENTLY_DONE);
  const [familyMembers] = useState<FamilyMemberStatus[]>(INITIAL_FAMILY_MEMBERS);
  const [suggestion, setSuggestion] = useState(INITIAL_SMART_SUGGESTION);

  // Pull to refresh simulation
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Task check/uncheck handler
  const handleToggleTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          const willComplete = !t.isCompleted;
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
  };

  // Reopen task handler
  const handleReopenTask = (doneId: string) => {
    const item = recentlyDone.find((r) => r.id === doneId);
    if (item) {
      setRecentlyDone((prev) => prev.filter((r) => r.id !== doneId));
      Alert.alert('Task Reopened', `"${item.title}" moved back to pending tasks.`);
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

  const handleEditEvent = (updated: CalendarEvent) => {
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
          dateString="Friday, 30 October"
          greeting="Good afternoon"
          userName="Priya"
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
          suggestion={suggestion}
          onOpenPulse={onOpenPulse || (() => setInternalPulseVisible(true))}
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
        onClose={() => setInternalEventVisible(false)}
        onSaveEvent={(_event: Partial<CalendarEvent>) => {
          setInternalEventVisible(false);
          onOpenCalendar?.();
          showToast('Event added to your family');
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
        onOpenPulse={() => {
          setInternalFamilyHubVisible(false);
          setInternalPulseVisible(true);
        }}
        onOpenVault={() => {
          setInternalFamilyHubVisible(false);
          setInternalVaultVisible(true);
        }}
        onOpenCompass={() => {
          setInternalFamilyHubVisible(false);
          setCompassInitialScreen('compass');
          setInternalCompassVisible(true);
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
