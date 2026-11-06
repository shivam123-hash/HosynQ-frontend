import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../../units/Colors';
import BottomNavBar from '../homeScreen/components/BottomNavBar';
import { NavigationTab } from '../homeScreen/types';
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
} from './components';
import {
  INITIAL_TASKS,
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
} from './types';

export interface TasksScreenProps {
  initialMainTab?: TasksMainTab;
  initialStatus?: TasksStatusTab;
  forceEmpty?: boolean;
  onProfilePress?: () => void;
  onExplorePress?: () => void;
  onNotificationsPress?: () => void;
  onTabChange?: (tab: NavigationTab) => void;
  onOpenCalendar?: () => void;
  onOpenChat?: () => void;
  showBottomNavBar?: boolean;
}

const TasksScreen: React.FC<TasksScreenProps> = ({
  initialMainTab = 'tasks',
  initialStatus = 'pending',
  forceEmpty = false,
  showBottomNavBar = true,
  onProfilePress,
  onExplorePress,
  onNotificationsPress,
  onTabChange,
  onOpenCalendar,
  onOpenChat,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(
    forceEmpty ? [] : INITIAL_TASKS
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

  // Mark task completed
  const handleCompleteTask = useCallback((task: TaskItem) => {
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
  }, []);

  // Reopen task
  const handleReopenTask = useCallback((task: TaskItem) => {
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
  }, []);

  // Reassign task
  const handleReassignTask = useCallback((task: TaskItem, newAssignee: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              assignee: newAssignee,
              assigneeInitial: newAssignee === 'You' ? 'P' : newAssignee[0],
            }
          : t
      )
    );
    Alert.alert('Task Reassigned', `Assigned to ${newAssignee}.`);
  }, []);

  // Delete task
  const handleDeleteTask = useCallback((task: TaskItem) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    Alert.alert('Task Deleted', `"${task.title}" has been deleted.`);
  }, []);

  // Create new task
  const handleCreateTask = useCallback((newTaskData: Partial<TaskItem>) => {
    const created: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskData.title || 'Untitled task',
      dueDate: newTaskData.dueDate || 'Today',
      dueFormatted: newTaskData.dueFormatted || 'Today',
      dueType: newTaskData.dueType || 'today',
      assignee: newTaskData.assignee || 'You',
      assigneeInitial: newTaskData.assigneeInitial || 'P',
      category: newTaskData.category || 'household',
      categoryLabel: newTaskData.categoryLabel || 'Household',
      priority: newTaskData.priority || 'medium',
      priorityLabel: newTaskData.priorityLabel || 'Medium',
      repeat: newTaskData.repeat || 'Doesn’t repeat',
      reminders: newTaskData.reminders || '1 hour before',
      viewers: newTaskData.viewers || 'Everyone in the family',
      notes: newTaskData.notes,
      isCompleted: false,
    };

    setTasks((prev) => [created, ...prev]);
    setStatusTab('pending');
  }, []);

  // Pending count & Completed count
  const pendingTasksAll = useMemo(
    () => tasks.filter((t) => !t.isCompleted),
    [tasks]
  );
  const completedTasksAll = useMemo(
    () => tasks.filter((t) => t.isCompleted),
    [tasks]
  );

  const overdueCount = useMemo(
    () => pendingTasksAll.filter((t) => t.isOverdue || t.dueType === 'overdue').length,
    [pendingTasksAll]
  );

  const dueThisWeekCount = useMemo(
    () =>
      pendingTasksAll.filter(
        (t) => t.dueType === 'this_week' || t.dueType === 'today'
      ).length,
    [pendingTasksAll]
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
        const member = FAMILY_MEMBERS.find((m) => m.id === filters.assignedTo);
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
            : 'Due this week',
        onRemove: () => setFilters((prev) => ({ ...prev, due: 'any' })),
      });
    }

    return tags;
  }, [filters]);

  const hasZeroTasksOverall = tasks.length === 0;
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

        {hasZeroTasksOverall ? (
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
              pendingCount={pendingTasksAll.length}
              completedCount={completedTasksAll.length}
            />

            {/* Family Member Avatar Filter */}
            <FamilyMemberAvatarFilter
              members={FAMILY_MEMBERS}
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
                {categorizedPendingTasks.map((group) => (
                  <TaskCategoryAccordion
                    key={group.category}
                    categoryTitle={group.title}
                    categoryColor={group.color}
                    items={group.items}
                    isExpanded={!!expandedCategories[group.category]}
                    onToggleExpand={() => handleToggleCategory(group.category)}
                    onToggleComplete={handleCompleteTask}
                    onSelectTask={setSelectedTask}
                  />
                ))}
              </>
            ) : (
              /* Completed Tasks List */
              <CompletedTasksList
                tasks={filteredTasks}
                onReopenTask={handleReopenTask}
                onSelectTask={setSelectedTask}
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
              setPrefillTitle('');
              setCreateModalVisible(true);
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
        onClose={() => setSelectedTask(null)}
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
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreateTask={handleCreateTask}
        initialTitle={prefillTitle}
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
});

