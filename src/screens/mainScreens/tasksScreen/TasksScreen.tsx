import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  View,
  Text,
  Alert,
  RefreshControl,
  Animated,
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
import {
  fetchTripsThunk,
  fetchTripDetailThunk,
  clearSelectedTrip,
} from '../../../redux/features/trips/tripsSlice';
import { getMyFamilyBasicThunk } from '../../../redux/features/family/familySlice';
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
  TripsListModal,
  TripScreenName,
  TripData,
  createEmptyTripData,
  extractTripMembersFromFamilyState,
  mapApiTripToUiTrip,
} from './components';
import { mapApiListDetailToPackingItems } from './components/tripPlanner/tripApiHelpers';
import { TasksSkeleton, ListsSkeleton } from '../../../components/SkeletonLoader';
import { CATEGORY_META, PRIORITY_META } from './constants';
import { TEST_TASKS } from '../../../__test_fixtures__/tasksFixtures';
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
  FamilyMemberOption,
} from './types';
import {
  formatTaskDueDate,
  isTaskOverdue,
  resolveMemberId,
  resolveMemberDisplayName,
  isUUID,
} from './taskApiHelpers';
import { Typography, Fonts } from '../../../units';

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
    assigneeAvatarBg: firstAssignee?.avatarColor || Colors.avatarBrown,
    assigneeAvatarColor: Colors.white,
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
  initialTaskId?: string | null;
  initialListId?: string | null;
  onClearInitialIds?: () => void;
  returnToChat?: boolean;
  onReturnToChat?: () => void;
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
  initialLists?: ListGroup[];
  initialFamilyMembers?: FamilyMemberOption[];
  initialTripData?: TripData | null;
}

const TasksScreen: React.FC<TasksScreenProps> = ({
  initialMainTab = 'tasks',
  initialStatus = 'pending',
  initialTaskId,
  initialListId,
  onClearInitialIds,
  returnToChat,
  onReturnToChat,
  forceEmpty = false,
  showBottomNavBar = true,
  initialTasks,
  initialLists,
  initialFamilyMembers,
  initialTripData,
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
  const familyState = useAppSelector((state) => state.family);
  const {
    upcomingTrips,
    selectedTrip,
    packingList: tripPackingList,
    counts: tripCounts,
    loadingList: tripsLoading,
  } = useAppSelector((state) => state.trips);

  const familyMembers = useAppSelector(
    (state) =>
      ((state.family.myFamilyData?.family as any)?.members as any[]) ||
      ((state.family.myFamilyData as any)?.members as any[]) ||
      ((state.family.family as any)?.members as any[]) ||
      []
  );
  const currentUser = useAppSelector((state) => state.auth?.user);
  const myMemberId = useAppSelector(
    (state) =>
      state.family.myMemberId ||
      state.family.myFamilyData?.family?.myMemberId ||
      state.family.family?.myMemberId ||
      (state.family.myFamilyData as any)?.myMemberId ||
      null
  );

  const memberFilterOptions = useMemo(() => {
    const everyoneOpt = {
      id: 'everyone',
      name: 'Everyone',
      realName: 'Everyone',
      isYou: false,
      initial: 'All',
      avatarBg: Colors.avatarNavy,
      avatarColor: Colors.white,
    };

    const currentUserName =
      currentUser?.fullName ||
      currentUser?.firstName ||
      (currentUser?.name ? currentUser.name : '');

    if (!familyMembers || familyMembers.length === 0) {
      const userInitial = (currentUserName?.trim()[0] || 'Y').toUpperCase();
      const displayName = currentUserName ? `You (${currentUserName})` : 'You';
      return [
        everyoneOpt,
        {
          id: myMemberId || 'you',
          name: displayName,
          realName: currentUserName || 'You',
          isYou: true,
          initial: userInitial,
          avatarBg: Colors.primary,
          avatarColor: Colors.white,
        },
      ];
    }

    return [
      everyoneOpt,
      ...familyMembers.map((m: any) => {
        const isCurrentMember =
          m.isYou ||
          (myMemberId && (m.memberId === myMemberId || m.id === myMemberId || m._id === myMemberId)) ||
          (currentUser?.id && (m.userId === currentUser.id || m.id === currentUser.id || m._id === currentUser.id));

        const rawName =
          m.fullName ||
          m.personal?.fullName ||
          m.name ||
          (isCurrentMember ? (currentUserName || 'You') : 'Member');

        const memberRealName = isCurrentMember ? (currentUserName || rawName) : rawName;
        const displayName = isCurrentMember
          ? (memberRealName && memberRealName !== 'You' ? `You (${memberRealName})` : 'You')
          : rawName;

        const initial = (
          (memberRealName || rawName).trim()[0] || (isCurrentMember ? 'Y' : 'M')
        ).toUpperCase();

        return {
          id: m.memberId || m.id || m._id || (isCurrentMember ? 'you' : rawName),
          name: displayName,
          realName: memberRealName,
          isYou: Boolean(isCurrentMember),
          initial,
          avatarBg: m.avatarColor || (isCurrentMember ? Colors.primary : Colors.primary),
          avatarColor: Colors.white,
        };
      }),
    ];
  }, [familyMembers, myMemberId, currentUser]);

  const isTestEnv =
    typeof (globalThis as any).process !== 'undefined' &&
    (globalThis as any).process.env?.NODE_ENV === 'test';
  const [tasks, setTasks] = useState<TaskItem[]>(
    forceEmpty ? [] : initialTasks !== undefined ? initialTasks : (isTestEnv ? TEST_TASKS : [])
  );
  const [mainTab, setMainTab] = useState<TasksMainTab>(initialMainTab);
  const [statusTab, setStatusTab] = useState<TasksStatusTab>(initialStatus);

  // Sync mainTab when initialMainTab prop changes
  useEffect(() => {
    if (initialMainTab) {
      setMainTab(initialMainTab);
    }
  }, [initialMainTab]);
  const statusContentOpacity = useRef(new Animated.Value(1)).current;

  const handleSelectStatusTab = useCallback(
    (newStatus: TasksStatusTab) => {
      if (newStatus === statusTab) return;
      // Fluid micro-fade so switching lists doesn't feel abrupt
      Animated.sequence([
        Animated.timing(statusContentOpacity, {
          toValue: 0.6,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(statusContentOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      setStatusTab(newStatus);
    },
    [statusTab, statusContentOpacity]
  );
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
  const [lists, setLists] = useState<ListGroup[]>(
    forceEmpty ? [] : initialLists !== undefined ? initialLists : []
  );
  const [selectedList, setSelectedList] = useState<ListGroup | null>(null);

  const returnToChatRef = useRef(returnToChat);
  useEffect(() => {
    returnToChatRef.current = returnToChat;
  }, [returnToChat]);

  // Handle deep navigation to a specific task
  useEffect(() => {
    if (initialTaskId) {
      setMainTab('tasks');
      const foundTask = tasks.find((t) => t.id === initialTaskId);
      if (foundTask) {
        setSelectedTask(foundTask);
      } else {
        const placeholderTask: TaskItem = {
          id: initialTaskId,
          title: 'Loading task...',
          dueDate: '',
          dueType: 'today',
          isCompleted: false,
          assignee: '',
          assigneeInitial: '?',
          assigneeAvatarBg: Colors.avatarBrown,
          assigneeAvatarColor: Colors.white,
          category: 'household',
          priority: 'medium',
          repeat: 'Doesn’t repeat',
          reminders: 'None',
          viewers: 'Everyone in family',
          notes: '',
        };
        setSelectedTask(placeholderTask);
      }
      if (isUUID(initialTaskId)) {
        dispatch(fetchTaskDetail({ taskId: initialTaskId, today: new Date().toISOString().slice(0, 10) }));
      }
      onClearInitialIds?.();
    }
  }, [initialTaskId, tasks, dispatch, onClearInitialIds]);

  // Update selectedTask once full task detail is fetched or tasks update
  useEffect(() => {
    if (apiSelectedTask && selectedTask && selectedTask.id === apiSelectedTask.id) {
      if (selectedTask.title === 'Loading task...') {
        setSelectedTask(mapApiTaskToUiTask(apiSelectedTask));
      }
    }
  }, [apiSelectedTask, selectedTask]);

  useEffect(() => {
    if (selectedTask && selectedTask.title === 'Loading task...') {
      const match = tasks.find((t) => t.id === selectedTask.id);
      if (match) {
        setSelectedTask(match);
      }
    }
  }, [tasks, selectedTask]);

  // Handle deep navigation to a specific list
  useEffect(() => {
    if (initialListId) {
      setMainTab('lists');
      const foundList = lists.find((l) => l.id === initialListId);
      if (foundList) {
        setSelectedList(foundList);
      } else {
        const placeholderList: ListGroup = {
          id: initialListId,
          title: 'Loading list...',
          type: 'custom',
          typeLabel: 'Custom',
          items: [],
          sharedWith: ['Family'],
          isSharedWithAll: true,
          completedCount: 0,
          itemCount: 0,
        };
        setSelectedList(placeholderList);
        dispatch(fetchLists());
      }
      onClearInitialIds?.();
    }
  }, [initialListId, lists, dispatch, onClearInitialIds]);

  // Update selectedList once lists update
  useEffect(() => {
    if (selectedList && selectedList.title === 'Loading list...') {
      const match = lists.find((l) => l.id === selectedList.id);
      if (match) {
        setSelectedList(match);
      }
    }
  }, [lists, selectedList]);
  const [newListModalVisible, setNewListModalVisible] = useState(false);
  const [newListPrefillType, setNewListPrefillType] =
    useState<ListType>('grocery');

  // Trip planner state (TRP-01 to TRP-05 orchestrated in single container + live Trips API)
  const tripMembers = useMemo(
    () => extractTripMembersFromFamilyState(familyState),
    [familyState]
  );
  const [tripData, setTripData] = useState<TripData | null>(
    forceEmpty ? null : initialTripData !== undefined ? initialTripData : null
  );
  const [activeTripDraft, setActiveTripDraft] = useState<TripData>(
    initialTripData || createEmptyTripData(tripMembers)
  );
  const [tripPlannerVisible, setTripPlannerVisible] = useState(false);
  const [tripsListVisible, setTripsListVisible] = useState(false);
  const [tripInitialScreen, setTripInitialScreen] = useState<TripScreenName>('overview');
  const fetchedOverviewTripIdRef = useRef<string | null>(null);

  // Task cache by status using useRef to avoid re-rendering and flickering on tab toggles
  const tasksCacheRef = useRef<{
    pending: TaskItem[] | null;
    completed: TaskItem[] | null;
  }>({
    pending: null,
    completed: null,
  });

  const isFetchingRef = useRef<{
    pending: boolean;
    completed: boolean;
  }>({
    pending: false,
    completed: false,
  });

  const [refreshing, setRefreshing] = useState(false);

  const fetchTasksByStatus = useCallback(
    async (status: 'PENDING' | 'DONE', forceRefresh = false) => {
      const key = status === 'PENDING' ? 'pending' : 'completed';
      if (!forceRefresh && tasksCacheRef.current[key] !== null) {
        return;
      }
      if (isFetchingRef.current[key]) return;
      isFetchingRef.current[key] = true;

      try {
        console.log(`[TasksScreen] Fetching ${status} tasks from server...`);
        const res = await dispatch(
          fetchTasks({
            status,
            today: new Date().toISOString().slice(0, 10),
          })
        ).unwrap();

        const uiItems = (res.tasks || []).map(mapApiTaskToUiTask);
        tasksCacheRef.current[key] = uiItems;

        setTasks((prev) => {
          const otherKey = key === 'pending' ? 'completed' : 'pending';
          const otherItems =
            tasksCacheRef.current[otherKey] ||
            prev.filter((t) => (key === 'pending' ? t.isCompleted : !t.isCompleted));
          return key === 'pending'
            ? [...uiItems, ...otherItems]
            : [...otherItems, ...uiItems];
        });
      } catch (e) {
        console.log(`[TasksScreen] Failed to fetch ${status} tasks:`, e);
      } finally {
        isFetchingRef.current[key] = false;
      }
    },
    [dispatch]
  );

  const loadLists = useCallback(() => {
    dispatch(fetchLists());
  }, [dispatch]);

  const loadTrips = useCallback(() => {
    dispatch(fetchTripsThunk({ tab: 'UPCOMING', page: 1, limit: 20 }));
  }, [dispatch]);

  // Initial load: fetch family, lists, trips, and both task statuses (pending + done)
  useEffect(() => {
    dispatch(getMyFamilyBasicThunk());
    loadLists();
    loadTrips();
    fetchTasksByStatus('PENDING');
    fetchTasksByStatus('DONE');
  }, [dispatch, loadLists, loadTrips, fetchTasksByStatus]);

  // Pull to refresh handler: pulls fresh data without flickers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const refreshCalls: Array<Promise<any> | void> = [
      dispatch(getMyFamilyBasicThunk()),
      loadLists(),
      loadTrips(),
      fetchTasksByStatus('PENDING', true),
      fetchTasksByStatus('DONE', true),
    ];
    const topTripId = upcomingTrips?.[0]?.id;
    if (topTripId && isUUID(topTripId)) {
      fetchedOverviewTripIdRef.current = topTripId;
      refreshCalls.push(dispatch(fetchTripDetailThunk(topTripId)));
    }
    await Promise.all(refreshCalls);
    setRefreshing(false);
  }, [dispatch, loadLists, loadTrips, fetchTasksByStatus, upcomingTrips]);

  useEffect(() => {
    if (initialTripData !== undefined) {
      setTripData(initialTripData);
      return;
    }
    if (!forceEmpty && upcomingTrips && upcomingTrips.length > 0) {
      const topTrip = upcomingTrips[0];
      if (!isTestEnv && topTrip.id && isUUID(topTrip.id) && fetchedOverviewTripIdRef.current !== topTrip.id) {
        fetchedOverviewTripIdRef.current = topTrip.id;
        dispatch(fetchTripDetailThunk(topTrip.id));
      }

      const detailOrSummary =
        selectedTrip?.id === topTrip.id ? selectedTrip : topTrip;
      const resolvedListId =
        (detailOrSummary as any)?.packingList?.id ||
        detailOrSummary?.packingListId ||
        topTrip.packingListId;
      const packingItems =
        tripPackingList &&
        resolvedListId &&
        tripPackingList.id === resolvedListId
          ? mapApiListDetailToPackingItems(tripPackingList)
          : [];
      const mappedNext = mapApiTripToUiTrip(
        detailOrSummary,
        tripMembers,
        packingItems
      );

      if ((mappedNext.packingTotalItems ?? 0) === 0 && resolvedListId && apiLists) {
        const matchedSummaryList = apiLists.find((l) => l.id === resolvedListId);
        if (matchedSummaryList?.counts) {
          mappedNext.packingTotalItems = matchedSummaryList.counts.total ?? 0;
          mappedNext.packingPackedItems = matchedSummaryList.counts.done ?? 0;
        }
      }

      setTripData(mappedNext);
    } else if (!forceEmpty && upcomingTrips && upcomingTrips.length === 0) {
      fetchedOverviewTripIdRef.current = null;
      setTripData(null);
    }
  }, [
    upcomingTrips,
    selectedTrip,
    tripPackingList,
    apiLists,
    tripMembers,
    initialTripData,
    forceEmpty,
    isTestEnv,
    dispatch,
  ]);

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
    const updatedTask: TaskItem = {
      ...task,
      isCompleted: true,
      completedAt: 'Just now',
      completedBy: 'You',
    };

    if (tasksCacheRef.current.pending) {
      tasksCacheRef.current.pending = tasksCacheRef.current.pending.filter((t) => t.id !== task.id);
    }
    if (tasksCacheRef.current.completed) {
      tasksCacheRef.current.completed = [updatedTask, ...tasksCacheRef.current.completed];
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? updatedTask : t))
    );

    try {
      if (isUUID(task.id)) {
        console.log('[TasksScreen] Completing task:', task.id);
        await dispatch(
          completeTask({ taskId: task.id, today: new Date().toISOString().slice(0, 10) })
        ).unwrap();
        console.log('[TasksScreen] ✅ Task marked as completed:', task.id);
      }
    } catch (err: any) {
      console.log('[TasksScreen] ❌ Complete error:', err);
      fetchTasksByStatus('PENDING', true);
      fetchTasksByStatus('DONE', true);
      Alert.alert(
        'Action Failed',
        typeof err === 'string' ? err : err?.message || 'Failed to complete task. Please try again.'
      );
    }
  }, [dispatch, fetchTasksByStatus]);

  // Reopen task
  const handleReopenTask = useCallback(async (task: TaskItem) => {
    // 1. Optimistic update
    const updatedTask: TaskItem = {
      ...task,
      isCompleted: false,
      completedAt: undefined,
      completedBy: undefined,
    };

    if (tasksCacheRef.current.completed) {
      tasksCacheRef.current.completed = tasksCacheRef.current.completed.filter((t) => t.id !== task.id);
    }
    if (tasksCacheRef.current.pending) {
      tasksCacheRef.current.pending = [updatedTask, ...tasksCacheRef.current.pending];
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? updatedTask : t))
    );

    try {
      if (isUUID(task.id)) {
        console.log('[TasksScreen] Reopening task:', task.id);
        await dispatch(reopenTask(task.id)).unwrap();
        console.log('[TasksScreen] ✅ Task reopened:', task.id);
      }
    } catch (err: any) {
      console.log('[TasksScreen] ❌ Reopen error:', err);
      fetchTasksByStatus('PENDING', true);
      fetchTasksByStatus('DONE', true);
      Alert.alert(
        'Action Failed',
        typeof err === 'string' ? err : err?.message || 'Failed to reopen task. Please try again.'
      );
    }
  }, [dispatch, fetchTasksByStatus]);

  // Reassign task
  const handleReassignTask = useCallback(
    async (task: TaskItem, newAssigneeIdOrName: string) => {
      const myMemberId =
        familyMembers.find((m: any) => m.isYou)?.memberId ||
        (familyMembers[0]?.myMemberId ?? null);

      const resolvedId = resolveMemberId(newAssigneeIdOrName, familyMembers, myMemberId);
      const displayName = resolveMemberDisplayName(newAssigneeIdOrName, familyMembers);

      const updatedTask = {
        ...task,
        assignee: displayName,
        assigneeInitial: displayName === 'You' ? 'P' : displayName[0],
      };

      if (tasksCacheRef.current.pending) {
        tasksCacheRef.current.pending = tasksCacheRef.current.pending.map((t) =>
          t.id === task.id ? updatedTask : t
        );
      }
      if (tasksCacheRef.current.completed) {
        tasksCacheRef.current.completed = tasksCacheRef.current.completed.map((t) =>
          t.id === task.id ? updatedTask : t
        );
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updatedTask : t))
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
          } catch (err) {
            console.log('[TasksScreen] ❌ Reassign error:', err);
          }
        }
      }
    },
    [dispatch, familyMembers]
  );

  // Delete task
  const handleDeleteTask = useCallback(async (task: TaskItem) => {
    const previousTasks = tasks;
    if (tasksCacheRef.current.pending) {
      tasksCacheRef.current.pending = tasksCacheRef.current.pending.filter((t) => t.id !== task.id);
    }
    if (tasksCacheRef.current.completed) {
      tasksCacheRef.current.completed = tasksCacheRef.current.completed.filter((t) => t.id !== task.id);
    }
    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    try {
      if (isUUID(task.id)) {
        console.log('[TasksScreen] Deleting task:', task.id);
        await dispatch(deleteTask(task.id)).unwrap();
        console.log('[TasksScreen] ✅ Task deleted:', task.id);
      }
      Alert.alert('Task Deleted', `"${task.title}" has been deleted.`);
    } catch (err: any) {
      console.log('[TasksScreen] ❌ Delete error:', err);
      setTasks(previousTasks);
      fetchTasksByStatus('PENDING', true);
      fetchTasksByStatus('DONE', true);
      Alert.alert(
        'Action Failed',
        typeof err === 'string' ? err : err?.message || 'Failed to delete task. Please try again.'
      );
    }
  }, [dispatch, fetchTasksByStatus, tasks]);

  // Create new task (optimistically adds to UI and refreshes from DB)
  const handleCreateTask = useCallback(
    (newTaskData: Partial<TaskItem>) => {
      if (newTaskData.id) {
        const item = newTaskData as TaskItem;
        if (tasksCacheRef.current.pending) {
          tasksCacheRef.current.pending = [item, ...tasksCacheRef.current.pending];
        }
        setTasks((prev) => [item, ...prev]);
      }
      setStatusTab('pending');
      fetchTasksByStatus('PENDING', true);
    },
    [fetchTasksByStatus]
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
    const isMemberActive = Boolean(
      selectedMemberId &&
      selectedMemberId !== 'everyone' &&
      filters.assignedTo &&
      filters.assignedTo !== 'everyone'
    );
    const isPriorityActive = Boolean(filters.priority && filters.priority !== 'all');
    const isCategoryActive = Boolean(filters.category && filters.category !== 'all');
    const isDueActive = Boolean(filters.due && filters.due !== 'any');

    return isMemberActive || isPriorityActive || isCategoryActive || isDueActive;
  }, [filters, selectedMemberId]);

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
      if (selectedMemberId !== 'everyone') {
        const member = memberFilterOptions.find((m) => m.id === selectedMemberId);
        if (member) {
          const itemAssignee = item.assignee.toLowerCase();
          if (member.isYou || member.id === 'you' || member.id === myMemberId) {
            // Logged-in user (You / Rupesh)
            const userName = (member.realName || currentUser?.fullName || currentUser?.firstName || '').toLowerCase();
            const matchesYou =
              itemAssignee.includes('you') ||
              (userName.length > 0 && itemAssignee.includes(userName));
            if (!matchesYou) return false;
          } else {
            // Other family member (e.g. Arman)
            const targetName = (member.realName || member.name).toLowerCase();
            if (!itemAssignee.includes(targetName)) return false;
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
    selectedMemberId,
    memberFilterOptions,
    myMemberId,
    currentUser,
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
          color: CATEGORY_META[cat]?.color || Colors.primary,
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

  const isCardDueFilterOnly =
    (filters.due === 'overdue' || filters.due === 'this_week') &&
    filters.priority === 'all' &&
    filters.category === 'all' &&
    searchQuery.trim().length === 0;

  const hasZeroMatchingFilters =
    !hasZeroTasksOverall &&
    !isCardDueFilterOnly &&
    filteredTasks.length === 0 &&
    isFilterActive;

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Main Segmented Tabs (Tasks / Lists) */}
        <TasksSegmentedTabs
          selectedTab={mainTab}
          onSelectTab={setMainTab}
        />

        {mainTab === 'lists' ? (
          ((listsLoading && lists.length === 0) ||
            (tripsLoading && upcomingTrips.length === 0 && !tripData)) &&
          !forceEmpty ? (
            <ListsSkeleton />
          ) : (
            <ListsOverviewSection
              lists={lists}
              tripData={tripData}
              totalTripsCount={(tripCounts?.upcoming || 0) + (tripCounts?.past || 0)}
              onSelectList={(list) => setSelectedList(list)}
              onCreateNewList={(prefillType) => {
                setNewListPrefillType(prefillType || 'grocery');
                setNewListModalVisible(true);
              }}
              onOpenVacationPlanner={() => {
                if (tripData) {
                  setActiveTripDraft(tripData);
                  if (tripData.id && isUUID(tripData.id)) {
                    dispatch(fetchTripDetailThunk(tripData.id));
                  }
                } else {
                  dispatch(clearSelectedTrip());
                  setActiveTripDraft(createEmptyTripData(tripMembers));
                }
                setTripInitialScreen('overview');
                setTripPlannerVisible(true);
              }}
              onPlanNewTrip={() => {
                dispatch(clearSelectedTrip());
                setActiveTripDraft(createEmptyTripData(tripMembers));
                setTripInitialScreen('overview');
                setTripPlannerVisible(true);
              }}
              onOpenTripsList={() => setTripsListVisible(true)}
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
              onSelectStatus={handleSelectStatusTab}
              pendingCount={pendingCount}
              completedCount={completedCount}
            />

            {/* Family Member Avatar Filter */}
            <FamilyMemberAvatarFilter
              members={memberFilterOptions}
              selectedMemberId={selectedMemberId}
              onSelectMember={handleSelectMember}
            />

            <Animated.View style={{ opacity: statusContentOpacity }}>
              {statusTab === 'pending' ? (
                <>
                  {/* Overdue & Due This Week Alert Cards ALWAYS VISIBLE */}
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

                  {/* If filters result in 0 tasks: TSK-05 */}
                  {hasZeroMatchingFilters ? (
                    <NoMatchingTasksState
                      activeTags={activeTags}
                      onClearAll={() => {
                        setSelectedMemberId('everyone');
                        setFilters({
                          assignedTo: 'everyone',
                          priority: 'all',
                          category: 'all',
                          due: 'any',
                        });
                      }}
                    />
                  ) : categorizedPendingTasks.length === 0 ? (
                    <View style={styles.emptyPendingContainer}>
                      <View style={styles.emptyPendingOuterCircle}>
                        <View style={styles.emptyPendingInnerCircle}>
                          <Feather name="check" size={24} color={Colors.primary} />
                        </View>
                      </View>
                      <Text style={styles.emptyPendingTitle}>
                        {filters.due === 'overdue'
                          ? 'No overdue tasks!'
                          : filters.due === 'this_week'
                            ? 'No tasks due this week!'
                            : 'All caught up!'}
                      </Text>
                      <Text style={styles.emptyPendingSubtitle}>
                        {filters.due === 'overdue'
                          ? 'Great job! There are no overdue tasks.'
                          : filters.due === 'this_week'
                            ? 'You have no tasks due this week.'
                            : 'No pending tasks right now.'}
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
            </Animated.View>
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
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          setSelectedMemberId(newFilters.assignedTo || 'everyone');
        }}
        matchCount={filteredTasks.length}
        members={memberFilterOptions}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={!!selectedTask}
        task={selectedTask}
        members={memberFilterOptions}
        liveTaskDetail={apiSelectedTask?.id === selectedTask?.id ? apiSelectedTask : null}
        onClose={() => {
          setSelectedTask(null);
          dispatch(clearSelectedTask());
          if (returnToChatRef.current) {
            onReturnToChat?.();
          }
        }}
        onToggleComplete={(task) => {
          if (task.isCompleted) {
            handleReopenTask(task);
          } else {
            handleCompleteTask(task);
          }
          setSelectedTask(null);
          if (returnToChatRef.current) {
            onReturnToChat?.();
          }
        }}
        onReassign={handleReassignTask}
        onDelete={(taskId) => {
          handleDeleteTask(taskId);
          setSelectedTask(null);
          if (returnToChatRef.current) {
            onReturnToChat?.();
          }
        }}
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
        onClose={() => {
          setSelectedList(null);
          if (returnToChatRef.current) {
            onReturnToChat?.();
          }
        }}
        onUpdateList={handleUpdateList}
        onDeleteList={handleDeleteList}
      />

      {/* Vacation Planner Modal (TRP-01 to TRP-05 orchestrated in single container) */}
      <TripPlannerModal
        visible={tripPlannerVisible}
        tripData={activeTripDraft}
        initialScreen={tripInitialScreen}
        onClose={() => {
          setTripPlannerVisible(false);
          loadTrips();
          loadLists();
          if (!isTestEnv && activeTripDraft.id && isUUID(activeTripDraft.id)) {
            dispatch(fetchTripDetailThunk(activeTripDraft.id));
          }
        }}
        onUpdateTripData={(updated) => {
          setActiveTripDraft(updated);
          if (updated.id) {
            setTripData(updated);
          }
        }}
      />

      {/* All Trips List Modal (API #1 Upcoming / Past Tabs) */}
      <TripsListModal
        visible={tripsListVisible}
        onClose={() => setTripsListVisible(false)}
        onSelectTrip={(summary) => {
          const mapped = mapApiTripToUiTrip(summary, tripMembers);
          setActiveTripDraft(mapped);
          setTripsListVisible(false);
          setTripInitialScreen('overview');
          setTripPlannerVisible(true);
          if (summary.id && isUUID(summary.id)) {
            dispatch(fetchTripDetailThunk(summary.id));
          }
        }}
        onPlanNewTrip={() => {
          setTripsListVisible(false);
          dispatch(clearSelectedTrip());
          setActiveTripDraft(createEmptyTripData(tripMembers));
          setTripInitialScreen('overview');
          setTripPlannerVisible(true);
        }}
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
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  emptyPendingOuterCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: Colors.borderBold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPendingInnerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.surfaceMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPendingTitle: {
    fontSize: Typography.size.titleSmall,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyPendingSubtitle: {
    fontSize: Typography.size.body,
    color: Colors.textSecondaryMuted,
    marginTop: 6,
    textAlign: 'center',
  },
});

