import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TasksMainTab } from '../types';

export interface TasksSegmentedTabsProps {
  selectedTab: TasksMainTab;
  onSelectTab: (tab: TasksMainTab) => void;
}

const TasksSegmentedTabs: React.FC<TasksSegmentedTabsProps> = ({
  selectedTab,
  onSelectTab,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.pillTrack}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'tasks' && styles.activeTab]}
          onPress={() => onSelectTab('tasks')}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityState={{ selected: selectedTab === 'tasks' }}
          accessibilityLabel="Tasks tab"
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'tasks' ? styles.activeText : styles.inactiveText,
            ]}
          >
            Tasks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'lists' && styles.activeTab]}
          onPress={() => onSelectTab('lists')}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityState={{ selected: selectedTab === 'lists' }}
          accessibilityLabel="Lists tab"
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'lists' ? styles.activeText : styles.inactiveText,
            ]}
          >
            Lists
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TasksSegmentedTabs;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  pillTrack: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#122440',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  tabButton: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#F0913A',
  },
  tabText: {
    fontSize: 15,
    lineHeight: 20,
  },
  activeText: {
    fontWeight: '700',
    color: '#0B1A2F',
  },
  inactiveText: {
    fontWeight: '500',
    color: '#8A97AB',
  },
});

