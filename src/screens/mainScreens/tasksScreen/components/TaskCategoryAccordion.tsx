import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { TaskItem } from '../types';
import { PRIORITY_META } from '../constants';
import Fonts from '../../../../units/FontsStyle';
import Colors from '../../../../units/Colors';
import Typography from '../../../../units/Typography';

export interface TaskCategoryAccordionProps {
  categoryTitle: string;
  categoryColor: string;
  items: TaskItem[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleComplete: (task: TaskItem) => void;
  onSelectTask: (task: TaskItem) => void;
}

const TaskCategoryAccordion: React.FC<TaskCategoryAccordionProps> = ({
  categoryTitle,
  categoryColor,
  items,
  isExpanded,
  onToggleExpand,
  onToggleComplete,
  onSelectTask,
}) => {
  if (items.length === 0) return null;

  return (
    <View style={styles.card}>
      {/* Category Header */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={onToggleExpand}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${categoryTitle} section, ${items.length} tasks`}
      >
        <View style={styles.headerLeft}>
          <View
            style={[styles.categorySquare, { backgroundColor: categoryColor }]}
          />
          <Text style={styles.categoryTitle}>{categoryTitle}</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{items.length}</Text>
          </View>
          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.textSecondaryMuted}
          />
        </View>
      </TouchableOpacity>

      {/* Task Rows */}
      {isExpanded && (
        <View style={styles.itemsList}>
          {items.map((task, index) => {
            const priorityColor =
              PRIORITY_META[task.priority]?.color || Colors.slateLight;
            const isLast = index === items.length - 1;

            return (
              <View
                key={task.id}
                style={[styles.taskRow, !isLast && styles.rowDivider]}
              >
                {/* Complete Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxTouchable}
                  onPress={() => onToggleComplete(task)}
                  activeOpacity={0.6}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: task.isCompleted }}
                  accessibilityLabel={`Mark ${task.title} as completed`}
                >
                  <View style={styles.checkboxCircle} />
                </TouchableOpacity>

                {/* Task Details (Tap to open details) */}
                <TouchableOpacity
                  style={styles.taskDetailsTouchable}
                  onPress={() => onSelectTask(task)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.taskTitleText}>{task.title}</Text>
                  <Text style={styles.taskSubtitleText}>
                    {`${task.dueDate} · ${task.assignee}`}
                  </Text>
                </TouchableOpacity>

                {/* Priority Dot */}
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: priorityColor },
                  ]}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default TaskCategoryAccordion;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.tasksCardBg,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.tasksCardBorder,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categorySquare: {
    width: 12,
    height: 12,
    borderRadius: 3.5,
  },
  categoryTitle: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.tasksBadgeDarkBg,
    borderWidth: 1,
    borderColor: Colors.tasksBadgeBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: Colors.tasksCardDivider,
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
  checkboxTouchable: {
    paddingRight: 12,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.tasksCheckboxBorder,
    backgroundColor: Colors.transparent,
  },
  taskDetailsTouchable: {
    flex: 1,
    marginRight: 10,
  },
  taskTitleText: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
    lineHeight: 20,
  },
  taskSubtitleText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textSecondaryMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

