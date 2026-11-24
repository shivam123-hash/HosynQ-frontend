import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../../units/Colors';
import { BriefTaskItem } from '../types';

export interface BriefDueTasksProps {
  tasks: BriefTaskItem[];
  onOpenTasks?: () => void;
  onToggleTask?: (taskId: string) => void;
  onTaskPress?: (task: BriefTaskItem) => void;
}

const BriefDueTasks: React.FC<BriefDueTasksProps> = ({
  tasks,
  onOpenTasks,
  onToggleTask,
  onTaskPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Due today</Text>
        <TouchableOpacity
          onPress={onOpenTasks}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.actionText}>Tasks</Text>
        </TouchableOpacity>
      </View>

      {/* Card Container */}
      <View style={styles.card}>
        {tasks.map((task, index) => {
          const isLast = index === tasks.length - 1;
          const isOverdue = !!task.isOverdue;

          return (
            <React.Fragment key={task.id}>
              <View style={styles.taskRow}>
                {/* Circular Checkbox */}
                <TouchableOpacity
                  onPress={() => onToggleTask?.(task.id)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: task.isCompleted }}
                  accessibilityLabel={`Mark ${task.title} as ${task.isCompleted ? 'incomplete' : 'complete'}`}
                >
                  <View
                    style={[
                      styles.checkbox,
                      task.isCompleted && styles.checkboxCompleted,
                    ]}
                  >
                    {task.isCompleted && (
                      <Feather name="check" size={13} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Task Details */}
                <TouchableOpacity
                  style={styles.taskContent}
                  onPress={() => onTaskPress?.(task)}
                  activeOpacity={onTaskPress ? 0.7 : 1}
                  disabled={!onTaskPress}
                >
                  <Text
                    style={[
                      styles.taskTitle,
                      task.isCompleted && styles.taskTitleCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text
                      style={[
                        styles.taskDueDate,
                        isOverdue && styles.overdueText,
                      ]}
                    >
                      {task.dueDate}
                    </Text>
                    <Text style={styles.taskDot}> · </Text>
                    <Text style={styles.taskAssignee}>{task.assignee}</Text>
                  </View>
                </TouchableOpacity>

                {/* Priority Dot */}
                <View
                  style={[
                    styles.priorityDot,
                    task.priority === 'high' && styles.highPriorityDot,
                  ]}
                />
              </View>

              {!isLast && <View style={styles.divider} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    height: 24,
  },
  sectionTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontFamily: 'Roboto-Bold',
    color: '#B6B8B8',
  },
  actionText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Roboto-Medium',
    color: Colors.primary, // #F0913A
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
    gap: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#4A5870',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  taskContent: {
    flex: 1,
    gap: 3,
  },
  taskTitle: {
    fontSize: 15.5,
    lineHeight: 20,
    fontFamily: 'Roboto-Medium',
    color: '#B6B8B8',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8A97AB',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDueDate: {
    fontSize: 13,
    lineHeight: 18,
    color: '#8A97AB',
    fontFamily: 'Roboto-Regular',
  },
  overdueText: {
    color: Colors.primary, // #F0913A
    fontFamily: 'Roboto-Medium',
  },
  taskDot: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    color: '#8A97AB',
  },
  taskAssignee: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    color: '#8A97AB',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8A97AB',
  },
  highPriorityDot: {
    backgroundColor: '#F06A6A',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
});

export default memo(BriefDueTasks);

