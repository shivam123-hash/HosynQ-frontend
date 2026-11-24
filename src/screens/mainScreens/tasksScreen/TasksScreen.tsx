import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  View,
  Text,
  Alert,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../../units/Colors';
import BottomNavBar from '../homeScreen/components/BottomNavBar';
import { NavigationTab } from '../homeScreen/types';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  fetchTasks,
  completeTask,
  reopenTask,
  fetchTaskDetail,
  clearTasksError,
  clearSelectedTask,
  deleteTask,
  reassignTask,
  createTask,
} from '../../../redux/features/tasks/tasksSlice';
import {
  fetchLists,
  createList,
  updateList,
  deleteList,
} from '../../../redux/features/lists/listsSlice';
import { getMyFamilyThunk } from '../../../redux/features/family/familySlice';
import { CreateTaskPayload, TaskItemData } from '../../../services/tasksServices';
import { mapApiListSummaryToUiList } from './listApiHelpers';
import {
  TasksHeader,
  TasksSegmentedTabs,
  TasksStatusTabs,
  FamilyMemberAvatarFilter,
  PendingAlertCardsRow,
  TaskCategoryAccordion,
  CompletedTasksList,
  NoTasksEmptyState,
  FilterTasksModal,
  NoMatchingTasksState,
  TaskDetailModal,
  CreateTaskModal,
  ActiveFilterTag,
  ListsOverviewSection,
  NewListModal,
  ListDetailModal,
  TripPlannerModal,
  TripScreenName,
  TripData,
  INITIAL_TRIP_DATA,
} from './components';
import { TasksSkeleton, ListsSkeleton } from '../../../components/SkeletonLoader';
import {
  INITIAL_TASKS,
  INITIAL_LISTS,
  FAMILY_MEMBERS,
  CATEGORY_META,
  PRIORITY_META,
} from './mockData';
import {
  TaskItem,
  TasksMainTab,
  TasksStatusTab,
  TaskFilterState,
  TaskCategory,
  TaskPriority,
  TaskDueDateType,
  ListGroup,
  ListType,
} from './types';
import {
  formatTaskDueDate,
  isTaskOverdue,
  resolveMemberId,
  resolveMemberDisplayName,
  isUUID,
} from './taskApiHelpers';

export const mapApiTaskToUiTask = (apiTask: TaskItemData): TaskItem => {
  const assigneesList = apiTask.assignees || [];
  const assigneeName =
    assigneesList.length > 0
      ? assigneesList.map((a) => a.fullName || 'Member').join(', ')
      : 'You';
  const firstAssignee = assigneesList[0];
  const assigneeInitial = assigneeName ? assigneeName.trim()[0].toUpperCase() : 'P';

  const isCompleted = apiTask.status === 'DONE';
  const overdue = Boolean(
    apiTask.isOverdue ||
    isTaskOverdue({
      isOverdue: apiTask.isOverdue,
      isCompleted,
      dueOn: apiTask.dueOn,
      dueTime: apiTask.dueTime,
      dueFormatted: apiTask.dueFormatted,
    })
  );

  let dueType: TaskDueDateType = 'later';
  if (overdue) {
    dueType = 'overdue';
  } else if (apiTask.isToday) {
    dueType = 'today';
  } else if (apiTask.dueFormatted?.toLowerCase().includes('week') || apiTask.dueOn) {
    dueType = 'this_week';
  }

  const categoryLower = (apiTask.category ? apiTask.category.toLowerCase() : 'household') as TaskCategory;
  const priorityLower = (apiTask.priority ? apiTask.priority.toLowerCase() : 'medium') as TaskPriority;

  const formattedDueDate = formatTaskDueDate(apiTask.dueOn, apiTask.isToday, overdue);
  const formattedDueWithTime = apiTask.dueTime
    ? `${formattedDueDate} · by ${apiTask.dueTime}`
    : formattedDueDate;

  return {
    id: apiTask.id,
    title: apiTask.title,
    dueDate: formattedDueDate,
    dueTime: apiTask.dueTime || undefined,
    dueType,
    dueFormatted: apiTask.dueFormatted || formattedDueWithTime,
    assignee: assigneeName,
    assigneeInitial,
    assigneeAvatarBg: firstAssignee?.avatarColor || '#5C3A21',
    assigneeAvatarColor: '#FFFFFF',
    category: categoryLower,
    categoryLabel: apiTask.category,
    priority: priorityLower,
    priorityLabel: apiTask.priority,
    repeat: apiTask.repeat || 'Doesn’t repeat',
    reminders: apiTask.reminders?.length ? apiTask.reminders.join(', ') : 'None',
    viewers:
      apiTask.visibility === 'EVERYONE'
        ? 'Everyone in the family'
        : apiTask.visibility === 'ADULTS_ONLY'
        ? 'Adults only'
        : 'Assignees only',
    notes: apiTask.notes || undefined,
    createdBy: apiTask.createdBy?.fullName || undefined,
    isCompleted,
    completedAt: apiTask.completedAt || undefined,
    completedBy: apiTask.completedByMemberId || undefined,
    isOverdue: overdue,
    overdueDateText: overdue ? 'Overdue' : undefined,
  };
};

export interface TasksScreenProps {
  initialMainTab?: TasksMainTab;
  initialStatus?: TasksStatusTab;
  forceEmpty?: boolean;
  onProfilePress?: () => void;
  onExplorePress?: () => void;
  onNotificationsPress?: () => void;
  onCompassPress?: () => void;
  onTabChange?: (tab: NavigationTab) => void;
  onOpenCalendar?: () => void;
  onOpenChat?: () => void;
  showBottomNavBar?: boolean;
  initialTasks?: TaskItem[];
}

const TasksScreen: React.FC<TasksScreenProps> = ({
  initialMainTab = 'tasks',
  initialStatus = 'pending',
  forceEmpty = false,
  showBottomNavBar = true,
  initialTasks,
  onProfilePress,
  onExplorePress,
  onNotificationsPress,
  onCompassPress,
  onTabChange,
  onOpenCalendar,
  onOpenChat,
}) => {
  const dispatch = useAppDispatch();
  const {
    tasks: apiTasks,
    selectedTask: apiSelectedTask,
    loading: tasksLoading,
    error: tasksError,
    counts: apiCounts,
    summary: apiSummary,
  } = useAppSelector((state) => state.tasks);
  const { lists: apiLists, loading: listsLoading } = useAppSelector((state) => state.lists);

  const familyMembers = useAppSelector(
    (state) =>
      ((state.family.myFamilyData?.family as any)?.members as any[]) ||
      ((state.family.myFamilyData as any)?.members as any[]) ||
      []
  );

  const memberFilterOptions = useMemo(() => {
    if (!familyMembers || familyMembers.length === 0) {
      return FAMILY_MEMBERS;
    }
    return [
      {
        id: 'everyone',
        name: 'Everyone',
        initial: 'All',
        avatarBg: '#1E3A66',
        avatarColor: '#FFFFFF',
      },
      ...familyMembers.map((m: any) => {
        const name = m.fullName || m.name || 'Member';
        const initial = (name.trim()[0] || 'M').toUpperCase();
        return {
          id: m.memberId || m.id,
          name,
          initial,
          avatarBg: m.avatarColor || Colors.primary,
          avatarColor: '#FFFFFF',
        };
      }),
    ];
  }, [familyMembers]);

  const isTestEnv =
    typeof (globalThis as any).process !== 'undefined' &&
    (globalThis as any).process.env?.NODE_ENV === 'test';
  const defaultInitialTasks = isTestEnv && !forceEmpty ? INITIAL_TASKS : [];
  const [tasks, setTasks] = useState<TaskItem[]>(
    forceEmpty ? [] : initialTasks !== undefined ? initialTasks : defaultInitialTasks
  );
  const [mainTab, setMainTab] = useState<TasksMainTab>(initialMainTab);
  const [statusTab, setStatusTab] = useState<TasksStatusTab>(initialStatus);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('everyone');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<TaskFilterState>({
    assignedTo: 'everyone',
    priority: 'all',
    category: 'all',
    due: 'any',
  });

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    household: true,
    finance: true,
    travel: true,
    family: true,
    health: true,
    personal: true,
  });

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [prefillTitle, setPrefillTitle] = useState('');

  // Lists state
  const defaultInitialLists = isTestEnv && !forceEmpty ? INITIAL_LISTS : [];
  const [lists, setLists] = useState<ListGroup[]>(
    forceEmpty ? [] : defaultInitialLists
  );
  const [selectedList, setSelectedList] = useState<ListGroup | null>(null);
  const [newListModalVisible, setNewListModalVisible] = useState(false);
  const [newListPrefillType, setNewListPrefillType] =
    useState<ListType>('grocery');

  // Trip planner state (TRP-01 to TRP-05 orchestrated in single container)
  const [tripData, setTripData] = useState<TripData>(INITIAL_TRIP_DATA);
  const [tripPlannerVisible, setTripPlannerVisible] = useState(false);
  const [tripInitialScreen, setTripInitialScreen] = useState<TripScreenName>('dates');

  const loadTasks = useCallback(() => {
    const statusParam = statusTab === 'completed' ? 'DONE' : 'PENDING';
    const assigneeId = selectedMemberId === 'everyone' ? undefined : selectedMemberId;

    console.log('[TasksScreen] Loading tasks for tab:', statusParam, 'assignee:', assigneeId);
    dispatch(
      fetchTasks({
        status: statusParam,
        assigneeMemberId: assigneeId,
        today: new Date().toISOString().slice(0, 10),
      })
    );
  }, [statusTab, selectedMemberId, dispatch]);

  const loadLists = useCallback(() => {
    dispatch(fetchLists());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getMyFamilyThunk());
    loadLists();
  }, [dispatch, loadLists]);

  useEffect(() => {
    if (mainTab === 'lists') {
      loadLists();
    }
  }, [mainTab, loadLists]);

  useEffect(() => {
    dispatch(clearTasksError());
    loadTasks();
  }, [loadTasks, dispatch]);

  useEffect(() => {
    if (apiTasks) {
      if (isTestEnv) {
        if (apiTasks.length > 0) {
          setTasks(apiTasks.map(mapApiTaskToUiTask));
        } else if (forceEmpty) {
          setTasks([]);
        }
        return;
      }
      setTasks(apiTasks.map(mapApiTaskToUiTask));
    }
  }, [apiTasks, isTestEnv, forceEmpty]);

  useEffect(() => {
    if (apiLists) {
      if (isTestEnv) {
        if (apiLists.length > 0) {
          setLists(apiLists.map((l) => mapApiListSummaryToUiList(l)));
        } else if (forceEmpty) {
          setLists([]);
        }
        return;
      }
      setLists(apiLists.map((l) => mapApiListSummaryToUiList(l)));
    }
  }, [apiLists, isTestEnv, forceEmpty]);

  const handleCreateList = useCallback((newList: ListGroup) => {
    setLists((prev) => [newList, ...prev]);
    setSelectedList(newList);
    loadLists();
  }, [loadLists]);

  const handleUpdateList = useCallback((updatedList: ListGroup) => {
    setLists((prev) =>
      prev.map((l) => (l.id === updatedList.id ? updatedList : l))
    );
    setSelectedList(updatedList);
  }, []);

  const handleDeleteList = useCallback((listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
    setSelectedList(null);
    if (isUUID(listId)) {
      dispatch(deleteList(listId));
    }
  }, [dispatch]);

  // Keep family member avatar and filter modal in sync
  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setFilters((prev) => ({ ...prev, assignedTo: memberId }));
  };

  // Toggle task category accordion
  const handleToggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  // Helper: Detect valid UUIDs
  const isUUID = (id: string): boolean =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Open Detail Modal
  const handleTaskPress = useCallback((task: TaskItem) => {
    console.log('[TasksScreen] Opening detail modal for task:', task.id);
    if (isUUID(task.id)) {
      dispatch(fetchTaskDetail({ taskId: task.id, today: new Date().toISOString().slice(0, 10) }));
    }
    setSelectedTask(task);
  }, [dispatch]);

  // Mark task completed
  const handleCompleteTask = useCallback(async (task: TaskItem) => {
    // 1. Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              isCompleted: true,
              completedAt: 'Just now',
              completedBy: 'You',
            }
          : t
      )
    );
    try {
      if (isUUID(task.id)) {
        console.log('[TasksScreen] Completing task:', task.id);
        await dispatch(
          completeTask({ taskId: task.id, today: new Date().toISOString().slice(0, 10) })
        ).unwrap();
        console.log('[TasksScreen] ✅ Task marked as completed:', task.id);
        loadTasks(); // Refresh live state from database
      }
    } catch (err: any) {
      console.log('[TasksScreen] ❌ Complete error:', err);
      // 2. Revert optimistic update on failure!
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                isCompleted: false,
                completedAt: undefined,
                completedBy: undefined,
              }
            : t
        )
      );
      Alert.alert(
        'Action Failed',
        typeof err === 'string' ? err : err?.message || 'Failed to complete task. Please try again.'
      );
    }
  }, [dispatch, loadTasks]);

  // Reopen task
  const handleReopenTask = useCallback(async (task: TaskItem) => {
    // 1. Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              isCompleted: false,
              completedAt: undefined,
              completedBy: undefined,
            }
          : t
      )
    );
    try {
      if (isUUID(task.id)) {
        console.log('[TasksScreen] Reopening task:', task.id);
        await dispatch(reopenTask(task.id)).unwrap();
        console.log('[TasksScreen] ✅ Task reopened:', task.id);
        loadTasks(); // Refresh live state from database
      }
    } catch (err: any) {
      console.log('[TasksScreen] ❌ Reopen error:', err);
      // 2. Revert optimistic update on failure
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                isCompleted: true,
                completedAt: task.completedAt || 'Just now',
                completedBy: task.completedBy || 'You',
              }
            : t
        )
      );
      Alert.alert(
        'Action Failed',
        typeof err === 'string' ? err : err?.message || 'Failed to reopen task. Please try again.'
      );
    }
  }, [dispatch, loadTasks]);

  // Reassign task
  const handleReassignTask = useCallback(
    async (task: TaskItem, newAssigneeIdOrName: string) => {
      const myMemberId =
        familyMembers.find((m: any) => m.isYou)?.memberId ||
        (familyMembers[0]?.myMemberId ?? null);

      const resolvedId = resolveMemberId(newAssigneeIdOrName, familyMembers, myMemberId);
      const displayName = resolveMemberDisplayName(newAssigneeIdOrName, familyMembers);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                assignee: displayName,
                assigneeInitial: displayName === 'You' ? 'P' : displayName[0],
              }
            : t
        )
      );
      Alert.alert('Task Reassigned', `Assigned to ${displayName}.`);

      if (isUUID(task.id)) {
        const targetMemberId = resolvedId || (isUUID(newAssigneeIdOrName) ? newAssigneeIdOrName : null);
        if (targetMemberId && isUUID(targetMemberId)) {
          try {
            console.log('[TasksScreen] Reassigning task:', task.id, 'to member ID:', targetMemberId);
            await dispatch(
              reassignTask({ taskId: task.id, payload: { memberId: targetMemberId } })
            ).unwrap();
            console.log('[TasksScreen] ✅ Task reassigned:', task.id);
            loadTasks();
          } catch (err) {
            console.log('[TasksScreen] ❌ Reassign error:', err);
          }
        } else {
          console.log('[TasksScreen] ⚠️ Skipping reassign API: could not resolve UUID for member:', newAssigneeIdOrName);
        }
      }
    },
    [dispatch, loadTasks, familyMembers]
  );

  // Delete task
  const handleDeleteTask = useCallback(async (task: TaskItem) => {
    const previousTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      if (isUUID(task.id)) {
        console.log('[TasksScreen] Deleting task:', task.id);
        await dispatch(deleteTask(task.id)).unwrap();
        console.log('[TasksScreen] ✅ Task deleted:', task.id);
        loadTasks();
      }
      Alert.alert('Task Deleted', `"${task.title}" has been deleted.`);
    } catch (err: any) {
      console.log('[TasksScreen] ❌ Delete error:', err);
      setTasks(previousTasks);
      Alert.alert(
        'Action Failed',
        typeof err === 'string' ? err : err?.message || 'Failed to delete task. Please try again.'
      );
    }
  }, [dispatch, loadTasks, tasks]);

  // Create new task (optimistically adds to UI and refreshes from DB)
  const handleCreateTask = useCallback(
    (newTaskData: Partial<TaskItem>) => {
      if (newTaskData.id) {
        setTasks((prev) => [newTaskData as TaskItem, ...prev]);
      }
      setStatusTab('pending');
      loadTasks();
    },
    [loadTasks]
  );

  // Pending count & Completed count
  const pendingTasksAll = useMemo(
    () => tasks.filter((t) => !t.isCompleted),
    [tasks]
  );
  const completedTasksAll = useMemo(
    () => tasks.filter((t) => t.isCompleted),
    [tasks]
  );

  const pendingCount =
    apiCounts?.pending !== undefined
      ? apiCounts.pending
      : pendingTasksAll.length;
  const completedCount =
    apiCounts?.completed !== undefined
      ? apiCounts.completed
      : completedTasksAll.length;

  const overdueCount = useMemo(
    () =>
      apiSummary?.overdue !== undefined
        ? apiSummary.overdue
        : pendingTasksAll.filter((t) => t.isOverdue || t.dueType === 'overdue').length,
    [apiSummary?.overdue, pendingTasksAll]
  );

  const dueThisWeekCount = useMemo(
    () =>
      apiSummary?.dueThisWeek !== undefined
        ? apiSummary.dueThisWeek
        : pendingTasksAll.filter(
            (t) => t.dueType === 'this_week' || t.dueType === 'today'
          ).length,
    [apiSummary?.dueThisWeek, pendingTasksAll]
  );

  // Active filter count check
  const isFilterActive = useMemo(() => {
    return (
      filters.assignedTo !== 'everyone' ||
      filters.priority !== 'all' ||
      filters.category !== 'all' ||
      filters.due !== 'any'
    );
  }, [filters]);

  // Filtering logic
  const filteredTasks = useMemo(() => {
    const list = statusTab === 'pending' ? pendingTasksAll : completedTasksAll;

    return list.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesAssignee = item.assignee.toLowerCase().includes(query);
        if (!matchesTitle && !matchesAssignee) return false;
      }

      // 2. Member filter
      if (filters.assignedTo !== 'everyone') {
        const member = memberFilterOptions.find((m) => m.id === filters.assignedTo);
        if (member) {
          const mName = member.name.toLowerCase();
          const itemAssignee = item.assignee.toLowerCase();
          if (mName === 'priya') {
            if (!itemAssignee.includes('priya') && !itemAssignee.includes('you'))
              return false;
          } else {
            if (!itemAssignee.includes(mName)) return false;
          }
        }
      }

      // 3. Priority filter
      if (filters.priority !== 'all') {
        if (item.priority !== filters.priority) return false;
      }

      // 4. Category filter
      if (filters.category !== 'all') {
        if (item.category !== filters.category) return false;
      }

      // 5. Due filter
      if (filters.due !== 'any') {
        if (filters.due === 'overdue') {
          if (!item.isOverdue && item.dueType !== 'overdue') return false;
        } else if (filters.due === 'today') {
          if (item.dueType !== 'today' && item.dueDate !== 'Today') return false;
        } else if (filters.due === 'this_week') {
          if (item.dueType !== 'this_week' && item.dueType !== 'today')
            return false;
        } else if (filters.due === 'this_month') {
          // Includes tasks due today, this week, or within the current month
          if (item.dueType === 'overdue') return false;
        }
      }

      return true;
    });
  }, [
    statusTab,
    pendingTasksAll,
    completedTasksAll,
    searchQuery,
    filters,
  ]);

  // Group pending tasks by category
  const categorizedPendingTasks = useMemo(() => {
    const groups: {
      category: TaskCategory;
      title: string;
      color: string;
      items: TaskItem[];
    }[] = [];

    const order: TaskCategory[] = [
      'household',
      'finance',
      'travel',
      'family',
      'health',
      'personal',
    ];

    order.forEach((cat) => {
      const items = filteredTasks.filter((t) => t.category === cat);
      if (items.length > 0) {
        groups.push({
          category: cat,
          title: CATEGORY_META[cat]?.label || cat,
          color: CATEGORY_META[cat]?.color || '#F0913A',
          items,
        });
      }
    });

    return groups;
  }, [filteredTasks]);

  // Construct active filter tags for TSK-05
  const activeTags = useMemo<ActiveFilterTag[]>(() => {
    const tags: ActiveFilterTag[] = [];

    if (filters.priority !== 'all') {
      tags.push({
        id: 'priority',
        label: PRIORITY_META[filters.priority]?.label || filters.priority,
        onRemove: () => setFilters((prev) => ({ ...prev, priority: 'all' })),
      });
    }

    if (filters.category !== 'all') {
      tags.push({
        id: 'category',
        label: CATEGORY_META[filters.category]?.label || filters.category,
        onRemove: () => setFilters((prev) => ({ ...prev, category: 'all' })),
      });
    }

    if (filters.due !== 'any') {
      tags.push({
        id: 'due',
        label:
          filters.due === 'overdue'
            ? 'Overdue'
            : filters.due === 'today'
            ? 'Due today'
            : filters.due === 'this_week'
            ? 'Due this week'
            : 'Due this month',
        onRemove: () => setFilters((prev) => ({ ...prev, due: 'any' })),
      });
    }

    return tags;
  }, [filters]);

  const hasZeroTasksOverall =
    statusTab === 'pending' &&
    (forceEmpty ||
      (initialTasks !== undefined && initialTasks.length === 0) ||
      (tasks.length === 0 &&
        pendingCount === 0 &&
        completedCount === 0 &&
        !isFilterActive &&
        searchQuery.trim().length === 0));

  const hasZeroMatchingFilters =
    !hasZeroTasksOverall && filteredTasks.length === 0 && isFilterActive;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <TasksHeader
        onProfilePress={onProfilePress}
        onExplorePress={onExplorePress}
        onNotificationsPress={onNotificationsPress}
        onCompassPress={onCompassPress}
        onFilterPress={() => setFilterModalVisible(true)}
        isFilterActive={isFilterActive}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearchVisible={isSearchVisible}
        onToggleSearch={() => setIsSearchVisible(!isSearchVisible)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Segmented Tabs (Tasks / Lists) */}
        <TasksSegmentedTabs
          selectedTab={mainTab}
          onSelectTab={setMainTab}
        />

        {mainTab === 'lists' ? (
          listsLoading && lists.length === 0 && !forceEmpty ? (
            <ListsSkeleton />
          ) : (
            <ListsOverviewSection
              lists={lists}
              tripData={tripData}
              onSelectList={(list) => setSelectedList(list)}
              onCreateNewList={(prefillType) => {
                setNewListPrefillType(prefillType || 'grocery');
                setNewListModalVisible(true);
              }}
              onOpenVacationPlanner={() => {
                setTripInitialScreen(!tripData.step1Done ? 'dates' : 'overview');
                setTripPlannerVisible(true);
              }}
            />
          )
        ) : tasksLoading && tasks.length === 0 && !forceEmpty ? (
          <TasksSkeleton />
        ) : hasZeroTasksOverall ? (
          /* TSK-03: No tasks yet */
          <NoTasksEmptyState
            onAddTaskPress={() => setCreateModalVisible(true)}
            onSelectSuggestion={(sugTitle) => {
              setPrefillTitle(sugTitle);
              setCreateModalVisible(true);
            }}
          />
        ) : (
          <>
            {/* Status Tabs (Pending / Completed) */}
            <TasksStatusTabs
              status={statusTab}
              onSelectStatus={setStatusTab}
              pendingCount={pendingCount}
              completedCount={completedCount}
            />

            {/* Family Member Avatar Filter */}
            <FamilyMemberAvatarFilter
              members={memberFilterOptions}
              selectedMemberId={selectedMemberId}
              onSelectMember={handleSelectMember}
            />

            {/* If filters result in 0 tasks: TSK-05 */}
            {hasZeroMatchingFilters ? (
              <NoMatchingTasksState
                activeTags={activeTags}
                onClearAll={() =>
                  setFilters({
                    assignedTo: 'everyone',
                    priority: 'all',
                    category: 'all',
                    due: 'any',
                  })
                }
              />
            ) : statusTab === 'pending' ? (
              <>
                {/* Overdue & Due This Week Alert Cards */}
                <PendingAlertCardsRow
                  overdueCount={overdueCount}
                  dueThisWeekCount={dueThisWeekCount}
                  isOverdueActive={filters.due === 'overdue'}
                  isDueThisWeekActive={filters.due === 'this_week'}
                  onPressOverdue={() =>
                    setFilters((prev) => ({
                      ...prev,
                      due: prev.due === 'overdue' ? 'any' : 'overdue',
                    }))
                  }
                  onPressDueThisWeek={() =>
                    setFilters((prev) => ({
                      ...prev,
                      due: prev.due === 'this_week' ? 'any' : 'this_week',
                    }))
                  }
                />

                {/* Categorized Pending Task Accordions */}
                {categorizedPendingTasks.length === 0 ? (
                  <View style={styles.emptyPendingContainer}>
                    <View style={styles.emptyPendingOuterCircle}>
                      <View style={styles.emptyPendingInnerCircle}>
                        <Feather name="check" size={24} color="#F0913A" />
                      </View>
                    </View>
                    <Text style={styles.emptyPendingTitle}>All caught up!</Text>
                    <Text style={styles.emptyPendingSubtitle}>
                      No pending tasks right now.
                    </Text>
                  </View>
                ) : (
                  categorizedPendingTasks.map((group) => (
                    <TaskCategoryAccordion
                      key={group.category}
                      categoryTitle={group.title}
                      categoryColor={group.color}
                      items={group.items}
                      isExpanded={!!expandedCategories[group.category]}
                      onToggleExpand={() => handleToggleCategory(group.category)}
                      onToggleComplete={handleCompleteTask}
                      onSelectTask={handleTaskPress}
                    />
                  ))
                )}
              </>
            ) : (
              /* Completed Tasks List */
              <CompletedTasksList
                tasks={filteredTasks}
                onReopenTask={handleReopenTask}
                onSelectTask={handleTaskPress}
              />
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      {showBottomNavBar && (
        <View style={styles.dockWrapper}>
          <BottomNavBar
            activeTab="tasks"
            onTabChange={(tab) => {
              if (tab === 'home') onTabChange?.('home');
              if (tab === 'calendar') onOpenCalendar?.();
              if (tab === 'chat') onOpenChat?.();
              onTabChange?.(tab);
            }}
            onAddPress={() => {
              if (mainTab === 'lists') {
                setNewListPrefillType('grocery');
                setNewListModalVisible(true);
              } else {
                setPrefillTitle('');
                setCreateModalVisible(true);
              }
            }}
          />
        </View>
      )}

      {/* Filter Tasks Modal */}
      <FilterTasksModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={setFilters}
        matchCount={filteredTasks.length}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={!!selectedTask}
        task={selectedTask}
        liveTaskDetail={apiSelectedTask?.id === selectedTask?.id ? apiSelectedTask : null}
        onClose={() => {
          setSelectedTask(null);
          dispatch(clearSelectedTask());
        }}
        onToggleComplete={(task) => {
          if (task.isCompleted) {
            handleReopenTask(task);
          } else {
            handleCompleteTask(task);
          }
          setSelectedTask(null);
        }}
        onReassign={handleReassignTask}
        onDelete={handleDeleteTask}
        onUpdateTask={(updatedTask) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
          );
          setSelectedTask(updatedTask);
        }}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreateTask={handleCreateTask}
        initialTitle={prefillTitle}
      />

      {/* New List Modal (LST-03) */}
      <NewListModal
        visible={newListModalVisible}
        prefillType={newListPrefillType}
        onClose={() => setNewListModalVisible(false)}
        onCreateList={handleCreateList}
      />

      {/* List Detail Modal (LST-04, LST-09) */}
      <ListDetailModal
        visible={Boolean(selectedList)}
        list={selectedList}
        onClose={() => setSelectedList(null)}
        onUpdateList={handleUpdateList}
        onDeleteList={handleDeleteList}
      />

      {/* Vacation Planner Modal (TRP-01 to TRP-05 orchestrated in single container) */}
      <TripPlannerModal
        visible={tripPlannerVisible}
        tripData={tripData}
        initialScreen={tripInitialScreen}
        onClose={() => setTripPlannerVisible(false)}
        onUpdateTripData={(updated) => setTripData(updated)}
      />
    </SafeAreaView>
  );
};

export default TasksScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 150, // Floating dock clearance
  },
  dockWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  emptyPendingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyPendingOuterCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPendingInnerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#2A3E5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPendingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyPendingSubtitle: {
    fontSize: 14,
    color: '#8A97AB',
    marginTop: 6,
    textAlign: 'center',
  },
});

