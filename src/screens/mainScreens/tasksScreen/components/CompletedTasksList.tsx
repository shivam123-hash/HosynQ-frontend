import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { TaskItem } from '../types';

export interface CompletedTasksListProps {
  tasks: TaskItem[];
  onReopenTask: (task: TaskItem) => void;
  onSelectTask: (task: TaskItem) => void;
}

const CompletedTasksList: React.FC<CompletedTasksListProps> = ({
  tasks,
  onReopenTask,
  onSelectTask,
}) => {
  const todayTasks = tasks.filter(
    (t) => t.dueDate === 'Today' || t.dueType === 'today'
  );
  const yesterdayTasks = tasks.filter(
    (t) => t.dueDate === 'Yesterday' || t.dueType !== 'today'
  );

  return (
    <View style={styles.container}>
      {/* Weekly Summary */}
      <Text style={styles.summaryText}>
        12 done this week. Anaya finished the most.
      </Text>

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
                    <Feather name="check" size={14} color="#0B1A2F" />
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
                      {`${task.assignee} · ${task.completedAt || 'Done'}`}
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
                    <Feather name="check" size={14} color="#0B1A2F" />
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
                      {`${task.assignee} · ${task.completedAt || 'Done'}`}
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
    fontSize: 14,
    color: '#8A97AB',
    marginBottom: 20,
  },
  sectionWrapper: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A97AB',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
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
    borderBottomColor: '#1F3352',
  },
  checkIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentColumn: {
    flex: 1,
    marginRight: 12,
  },
  taskTitleStrikethrough: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8A97AB',
    textDecorationLine: 'line-through',
    lineHeight: 20,
  },
  taskSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  reopenText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0913A',
  },
});

