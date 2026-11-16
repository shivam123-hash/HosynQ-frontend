import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TasksStatusTab } from '../types';

export interface TasksStatusTabsProps {
  status: TasksStatusTab;
  onSelectStatus: (status: TasksStatusTab) => void;
  pendingCount?: number;
  completedCount?: number;
}

const TasksStatusTabs: React.FC<TasksStatusTabsProps> = ({
  status,
  onSelectStatus,
  pendingCount = 0,
  completedCount = 0,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.pill, status === 'pending' ? styles.activePill : styles.inactivePill]}
        onPress={() => onSelectStatus('pending')}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected: status === 'pending' }}
        accessibilityLabel={`Pending tasks ${pendingCount}`}
      >
        <Text
          style={[
            styles.pillText,
            status === 'pending' ? styles.activeText : styles.inactiveText,
          ]}
        >
          {`Pending ${pendingCount}`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.pill, status === 'completed' ? styles.activePill : styles.inactivePill]}
        onPress={() => onSelectStatus('completed')}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected: status === 'completed' }}
        accessibilityLabel={`Completed tasks ${completedCount}`}
      >
        <Text
          style={[
            styles.pillText,
            status === 'completed' ? styles.activeText : styles.inactiveText,
          ]}
        >
          {`Completed ${completedCount}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TasksStatusTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  pill: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePill: {
    backgroundColor: '#F0913A',
  },
  inactivePill: {
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#1F3352',
  },
  pillText: {
    fontSize: 14,
    lineHeight: 18,
  },
  activeText: {
    fontWeight: '700',
    color: '#0B1A2F',
  },
  inactiveText: {
    fontWeight: '500',
    color: '#CAD4DF',
  },
});

