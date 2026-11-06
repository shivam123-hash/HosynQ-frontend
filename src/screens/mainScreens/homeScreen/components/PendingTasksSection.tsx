import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { TaskItem, TaskFilterCategory } from '../types';

export interface PendingTasksSectionProps {
  tasks: TaskItem[];
  onAllTasksPress?: () => void;
  onToggleTask?: (taskId: string) => void;
  onTaskPress?: (task: TaskItem) => void;
}

const PendingTasksSection: React.FC<PendingTasksSectionProps> = ({
  tasks,
  onAllTasksPress,
  onToggleTask,
  onTaskPress,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TaskFilterCategory>('all');
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    health: false,
    travel: false,
  });

  const categories: { id: TaskFilterCategory; label: string; dotColor?: string }[] = [
    { id: 'all', label: `All ${tasks.length}` },
    { id: 'household', label: 'Household', dotColor: '#F0913A' },
    { id: 'finance', label: 'Finance', dotColor: '#F06A6A' },
    { id: 'health', label: 'Health', dotColor: '#A884F0' },
    { id: 'travel', label: 'Travel', dotColor: '#3CC4C4' },
  ];

  const filteredTasks =
    selectedCategory === 'all'
      ? tasks
      : tasks.filter((t) => t.category === selectedCategory);

  const householdTasks = filteredTasks.filter((t) => t.category === 'household');
  const financeTasks = filteredTasks.filter((t) => t.category === 'finance');
  const healthTasks = filteredTasks.filter((t) => t.category === 'health');
  const travelTasks = filteredTasks.filter((t) => t.category === 'travel');

  const toggleCategoryExpand = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const renderPriorityDot = (priority: TaskItem['priority']) => {
    let color = '#5A6880';
    if (priority === 'high') color = '#F06A6A';
    if (priority === 'medium') color = '#F2C14E';
    return <View style={[styles.priorityDot, { backgroundColor: color }]} />;
  };

  const renderTaskItem = (task: TaskItem, isLastInGroup: boolean) => {
    return (
      <TouchableOpacity
        key={task.id}
        onPress={() => onTaskPress?.(task)}
        activeOpacity={0.7}
        style={[styles.taskRow, !isLastInGroup && styles.rowDivider]}
      >
        {/* Circular Checkbox */}
        <TouchableOpacity
          onPress={() => onToggleTask?.(task.id)}
          activeOpacity={0.7}
          style={styles.checkboxTouch}
        >
          <View style={[styles.checkbox, task.isCompleted && styles.checkboxCompleted]}>
            {task.isCompleted && <Feather name="check" size={13} color="#0B1A2F" />}
          </View>
        </TouchableOpacity>

        {/* Task Details */}
        <View style={styles.taskContentCol}>
          <Text
            style={[styles.taskTitle, task.isCompleted && styles.taskTitleCompleted]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <Text style={styles.taskSubtitle} numberOfLines={1}>
            <Text style={task.isOverdue ? styles.overdueDate : styles.normalDate}>
              {task.dueDate}
              {' · '}
              {task.assignee}
            </Text>
            {task.frequency ? (
              <Text style={styles.normalDate}>{` · ${task.frequency}`}</Text>
            ) : null}
          </Text>
        </View>

        {/* Priority Indicator Dot */}
        {renderPriorityDot(task.priority)}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Pending tasks</Text>
          <Text style={styles.taskCounter}>{tasks.length}</Text>
        </View>

        <TouchableOpacity
          onPress={onAllTasksPress}
          activeOpacity={0.7}
          style={styles.allTasksBtn}
        >
          <Text style={styles.allTasksText}>All tasks</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Horizontal Chips */}
      <View style={styles.filterPillsRow}>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.7}
              style={[
                styles.filterPill,
                isActive ? styles.activeFilterPill : styles.inactiveFilterPill,
              ]}
            >
              {cat.dotColor && !isActive && (
                <View style={[styles.pillDot, { backgroundColor: cat.dotColor }]} />
              )}
              <Text
                style={[
                  styles.filterPillText,
                  isActive ? styles.activeFilterPillText : styles.inactiveFilterPillText,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Task Card */}
      <View style={styles.taskCard}>
        {/* Household Group */}
        {householdTasks.length > 0 && (
          <View style={styles.categoryGroup}>
            <View style={styles.categoryHeaderRow}>
              <View style={[styles.groupDot, styles.dotHousehold]} />
              <Text style={styles.categoryHeaderText}>
                HOUSEHOLD · {householdTasks.length}
              </Text>
            </View>
            {householdTasks.map((task, i) =>
              renderTaskItem(task, i === householdTasks.length - 1)
            )}
          </View>
        )}

        {/* Finance Group */}
        {financeTasks.length > 0 && (
          <View style={[styles.categoryGroup, styles.groupDivider]}>
            <View style={styles.categoryHeaderRow}>
              <View style={[styles.groupDot, styles.dotFinance]} />
              <Text style={styles.categoryHeaderText}>
                FINANCE · {financeTasks.length}
              </Text>
            </View>
            {financeTasks.map((task, i) =>
              renderTaskItem(task, i === financeTasks.length - 1)
            )}
          </View>
        )}

        {/* Collapsible Health Group */}
        {healthTasks.length > 0 && (
          <View style={styles.collapsibleWrapper}>
            <TouchableOpacity
              onPress={() => toggleCategoryExpand('health')}
              activeOpacity={0.7}
              style={styles.collapsibleHeaderRow}
            >
              <View style={styles.collapsibleLeft}>
                <View style={[styles.groupDot, styles.dotHealth]} />
                <Text style={styles.collapsibleTitle}>Health</Text>
              </View>
              <View style={styles.collapsibleRight}>
                <Text style={styles.collapsibleCount}>{healthTasks.length}</Text>
                <Feather
                  name={expandedCategories.health ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#7E8F9F"
                />
              </View>
            </TouchableOpacity>

            {expandedCategories.health &&
              healthTasks.map((task, i) =>
                renderTaskItem(task, i === healthTasks.length - 1)
              )}
          </View>
        )}

        {/* Collapsible Travel Group */}
        {travelTasks.length > 0 && (
          <View style={styles.collapsibleWrapper}>
            <TouchableOpacity
              onPress={() => toggleCategoryExpand('travel')}
              activeOpacity={0.7}
              style={styles.collapsibleHeaderRow}
            >
              <View style={styles.collapsibleLeft}>
                <View style={[styles.groupDot, styles.dotTravel]} />
                <Text style={styles.collapsibleTitle}>Travel</Text>
              </View>
              <View style={styles.collapsibleRight}>
                <Text style={styles.collapsibleCount}>{travelTasks.length}</Text>
                <Feather
                  name={expandedCategories.travel ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#7E8F9F"
                />
              </View>
            </TouchableOpacity>

            {expandedCategories.travel &&
              travelTasks.map((task, i) =>
                renderTaskItem(task, i === travelTasks.length - 1)
              )}
          </View>
        )}
      </View>
    </View>
  );
};

export default memo(PendingTasksSection);

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 30,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 34,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  title: {
    fontFamily: 'Roboto',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  taskCounter: {
    fontFamily: 'Roboto',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#8A97AB',
  },
  allTasksBtn: {
    height: 32,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(240, 144, 52, 0.16)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allTasksText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#F0913A',
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    height: 32,
    borderRadius: 16,
    gap: 6,
  },
  activeFilterPill: {
    backgroundColor: '#F0913A',
    borderWidth: 1.5,
    borderColor: '#F0913A',
  },
  inactiveFilterPill: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  filterPillText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
  },
  activeFilterPillText: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  inactiveFilterPillText: {
    color: '#C9D1DC',
    fontWeight: '400',
  },
  taskCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  categoryGroup: {
    paddingTop: 2,
  },
  groupDivider: {
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 11,
    gap: 10,
  },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryHeaderText: {
    fontFamily: 'Roboto',
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '700',
    color: '#7E8F9F',
    letterSpacing: 1.2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1F3352',
  },
  checkboxTouch: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3A4F6B',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#4CC38A',
    borderColor: '#4CC38A',
  },
  taskContentCol: {
    flex: 1,
    gap: 3,
  },
  taskTitle: {
    fontFamily: 'Roboto',
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '500',
    color: '#CAD4DF',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6E7C92',
  },
  taskSubtitle: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
  },
  normalDate: {
    color: '#7E8F9F',
    fontWeight: '400',
  },
  overdueDate: {
    color: '#F0913A',
    fontWeight: '500',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotHousehold: {
    backgroundColor: '#F0913A',
  },
  dotFinance: {
    backgroundColor: '#F06A6A',
  },
  dotHealth: {
    backgroundColor: '#A884F0',
  },
  dotTravel: {
    backgroundColor: '#3CC4C4',
  },
  collapsibleWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
  },
  collapsibleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  collapsibleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  collapsibleTitle: {
    fontFamily: 'Roboto',
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '400',
    color: '#CAD4DF',
  },
  collapsibleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapsibleCount: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#7E8F9F',
  },
});
