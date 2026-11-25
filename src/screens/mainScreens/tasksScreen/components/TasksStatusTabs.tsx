import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { TasksStatusTab } from '../types';
import Fonts from '../../../../units/FontsStyle';
import Colors from '../../../../units/Colors';
import Typography from '../../../../units/Typography';

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
  const isPending = status === 'pending';
  const [barWidth, setBarWidth] = useState<number>(0);
  const animValue = useRef(new Animated.Value(isPending ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: status === 'pending' ? 0 : 1,
      useNativeDriver: true,
      tension: 68,
      friction: 10,
    }).start();
  }, [status, animValue]);

  const handleBarLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== barWidth) {
      setBarWidth(width);
    }
  };

  const tabWidth = barWidth > 0 ? barWidth / 2 : 0;
  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabBar} onLayout={handleBarLayout}>
        {/* Pending Tab */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onSelectStatus('pending')}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityState={{ selected: isPending }}
          accessibilityLabel={`Pending tasks ${pendingCount}`}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                isPending ? styles.activeText : styles.inactiveText,
              ]}
            >
              Pending
            </Text>
            <View
              style={[
                styles.countBadge,
                isPending ? styles.activeBadge : styles.inactiveBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isPending ? styles.activeBadgeText : styles.inactiveBadgeText,
                ]}
              >
                {pendingCount}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Completed Tab */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onSelectStatus('completed')}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityState={{ selected: !isPending }}
          accessibilityLabel={`Completed tasks ${completedCount}`}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                !isPending ? styles.activeText : styles.inactiveText,
              ]}
            >
              Completed
            </Text>
            <View
              style={[
                styles.countBadge,
                !isPending ? styles.activeBadge : styles.inactiveBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  !isPending ? styles.activeBadgeText : styles.inactiveBadgeText,
                ]}
              >
                {completedCount}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Smooth Animated Indicator Bar */}
        {tabWidth > 0 && (
          <Animated.View
            style={[
              styles.animatedIndicator,
              {
                width: tabWidth - 32, // Padding 16 on each side
                left: 16,
                transform: [{ translateX }],
              },
            ]}
          />
        )}
      </View>
    </View>
  );
};

export default TasksStatusTabs;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.tasksTabBorder,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabText: {
    fontSize: Typography.size.bodyMedium,
    lineHeight: 22,
  },
  activeText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  inactiveText: {
    fontFamily: Fonts.medium,
    color: Colors.tasksTextMuted,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    backgroundColor: Colors.primary,
  },
  inactiveBadge: {
    backgroundColor: Colors.tasksBadgeBg,
  },
  badgeText: {
    fontSize: Typography.size.caption,
    lineHeight: 16,
    fontFamily: Fonts.bold,
  },
  activeBadgeText: {
    color: Colors.background,
  },
  inactiveBadgeText: {
    color: Colors.textSecondaryMuted,
  },
  animatedIndicator: {
    position: 'absolute',
    bottom: -1.5,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});

