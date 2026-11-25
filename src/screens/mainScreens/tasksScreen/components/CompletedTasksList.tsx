import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { TaskItem } from '../types';
import Fonts from '../../../../units/FontsStyle';
import Colors from '../../../../units/Colors';
import Typography from '../../../../units/Typography';

export interface CompletedTasksListProps {
  tasks: TaskItem[];
  onReopenTask: (task: TaskItem) => void;
  onSelectTask: (task: TaskItem) => void;
}

const getCompletionDay = (completedAt?: string): 'today' | 'yesterday' | 'earlier' => {
  if (!completedAt) return 'today';
  if (completedAt === 'Just now' || completedAt.toLowerCase() === 'today') return 'today';

  const date = new Date(completedAt);
  if (isNaN(date.getTime())) {
    // If it's not a parseable date string, treat as today
    return 'today';
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffMs = today.getTime() - itemDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  return 'earlier';
};

const formatCompletedTime = (completedAt?: string) => {
  if (!completedAt) return 'Done';
  if (completedAt === 'Just now') return 'Just now';

  const date = new Date(completedAt);
  if (isNaN(date.getTime())) return completedAt;

  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const timeStr = `${formattedHours}:${minutes} ${ampm}`;

  if (isSameDay) {
    return `Today at ${timeStr}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${timeStr}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CompletedTasksList: React.FC<CompletedTasksListProps> = ({
  tasks,
  onReopenTask,
  onSelectTask,
}) => {
  const { todayTasks, yesterdayTasks, earlierTasks } = useMemo(() => {
    const today: TaskItem[] = [];
    const yesterday: TaskItem[] = [];
    const earlier: TaskItem[] = [];

    tasks.forEach((t) => {
      const day = getCompletionDay(t.completedAt);
      if (day === 'today') {
        today.push(t);
      } else if (day === 'yesterday') {
        yesterday.push(t);
      } else {
        earlier.push(t);
      }
    });

    return { todayTasks: today, yesterdayTasks: yesterday, earlierTasks: earlier };
  }, [tasks]);

  const totalDone = tasks.length;
  const summaryText =
    totalDone === 0
      ? ''
      : totalDone === 1
      ? '1 task completed'
      : `${totalDone} tasks completed`;

  return (
    <View style={styles.container}>
      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyOuterCircle}>
            <View style={styles.emptyInnerCircle}>
              <Feather name="check" size={24} color={Colors.textSecondaryMuted} />
            </View>
          </View>
          <Text style={styles.emptyTitle}>No completed tasks yet</Text>
          <Text style={styles.emptySubtitle}>
            Tasks you complete will show up here.
          </Text>
        </View>
      ) : (
        <>
          {/* Summary */}
          {summaryText.length > 0 && (
            <Text style={styles.summaryText}>{summaryText}</Text>
          )}

          {/* TODAY Section */}
          {todayTasks.length > 0 && (
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionHeader}>TODAY</Text>
              <View style={styles.card}>
                {todayTasks.map((task, index) => {
                  const isLast = index === todayTasks.length - 1;
                  return (
                    <View
                      key={task.id}
                      style={[styles.taskRow, !isLast && styles.rowDivider]}
                    >
                      <View style={styles.checkIconCircle}>
                        <Feather name="check" size={14} color={Colors.background} />
                      </View>

                      <TouchableOpacity
                        style={styles.contentColumn}
                        onPress={() => onSelectTask(task)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.taskTitleStrikethrough}>
                          {task.title}
                        </Text>
                        <Text style={styles.taskSubtitle}>
                          {`${task.assignee} · ${formatCompletedTime(task.completedAt)}`}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => onReopenTask(task)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Reopen ${task.title}`}
                      >
                        <Text style={styles.reopenText}>Reopen</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* YESTERDAY Section */}
          {yesterdayTasks.length > 0 && (
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionHeader}>YESTERDAY</Text>
              <View style={styles.card}>
                {yesterdayTasks.map((task, index) => {
                  const isLast = index === yesterdayTasks.length - 1;
                  return (
                    <View
                      key={task.id}
                      style={[styles.taskRow, !isLast && styles.rowDivider]}
                    >
                      <View style={styles.checkIconCircle}>
                        <Feather name="check" size={14} color={Colors.background} />
                      </View>

                      <TouchableOpacity
                        style={styles.contentColumn}
                        onPress={() => onSelectTask(task)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.taskTitleStrikethrough}>
                          {task.title}
                        </Text>
                        <Text style={styles.taskSubtitle}>
                          {`${task.assignee} · ${formatCompletedTime(task.completedAt)}`}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => onReopenTask(task)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Reopen ${task.title}`}
                      >
                        <Text style={styles.reopenText}>Reopen</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* EARLIER Section */}
          {earlierTasks.length > 0 && (
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionHeader}>EARLIER</Text>
              <View style={styles.card}>
                {earlierTasks.map((task, index) => {
                  const isLast = index === earlierTasks.length - 1;
                  return (
                    <View
                      key={task.id}
                      style={[styles.taskRow, !isLast && styles.rowDivider]}
                    >
                      <View style={styles.checkIconCircle}>
                        <Feather name="check" size={14} color={Colors.background} />
                      </View>

                      <TouchableOpacity
                        style={styles.contentColumn}
                        onPress={() => onSelectTask(task)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.taskTitleStrikethrough}>
                          {task.title}
                        </Text>
                        <Text style={styles.taskSubtitle}>
                          {`${task.assignee} · ${formatCompletedTime(task.completedAt)}`}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => onReopenTask(task)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Reopen ${task.title}`}
                      >
                        <Text style={styles.reopenText}>Reopen</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default CompletedTasksList;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  summaryText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textSecondaryMuted,
    marginBottom: 20,
  },
  sectionWrapper: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.bold,
    letterSpacing: 1.2,
    color: Colors.textSecondaryMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.tasksCardBg,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.tasksCardBorder,
    overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.tasksCardDivider,
  },
  checkIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentColumn: {
    flex: 1,
    marginRight: 12,
  },
  taskTitleStrikethrough: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondaryMuted,
    textDecorationLine: 'line-through',
    lineHeight: 20,
  },
  taskSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.slateMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  reopenText: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emptyOuterCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: Colors.borderBold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyInnerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.surfaceMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Typography.size.titleSmall,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.size.body,
    color: Colors.textSecondaryMuted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});

