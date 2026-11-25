import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { TasksMainTab } from '../types';
import Fonts from '../../../../units/FontsStyle';
import Colors from '../../../../units/Colors';
import Typography from '../../../../units/Typography';

export interface TasksSegmentedTabsProps {
  selectedTab: TasksMainTab;
  onSelectTab: (tab: TasksMainTab) => void;
}

const TasksSegmentedTabs: React.FC<TasksSegmentedTabsProps> = ({
  selectedTab,
  onSelectTab,
}) => {
  const [trackWidth, setTrackWidth] = useState<number>(0);
  const isTasks = selectedTab === 'tasks';
  const animValue = useRef(new Animated.Value(isTasks ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: selectedTab === 'tasks' ? 0 : 1,
      useNativeDriver: true,
      tension: 68,
      friction: 10,
    }).start();
  }, [selectedTab, animValue]);

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== trackWidth) {
      setTrackWidth(width);
    }
  };

  // Track padding is 4 on left and 4 on right = 8
  const pillWidth = trackWidth > 8 ? (trackWidth - 8) / 2 : 0;

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, pillWidth],
  });

  // Cross-fade text & icon layers for seamless 60fps color transition
  const tasksActiveOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const tasksInactiveOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const listsActiveOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const listsInactiveOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.toggleTrack} onLayout={handleTrackLayout}>
        {/* Animated Sliding Pill */}
        {pillWidth > 0 && (
          <Animated.View
            style={[
              styles.animatedSlider,
              {
                width: pillWidth,
                transform: [{ translateX }],
              },
            ]}
          />
        )}

        {/* Tasks Segment */}
        <TouchableOpacity
          style={styles.segment}
          onPress={() => onSelectTab('tasks')}
          activeOpacity={0.85}
          accessibilityRole="tab"
          accessibilityState={{ selected: isTasks }}
          accessibilityLabel="Tasks tab"
        >
          {/* Active Layer (Dark on Orange) */}
          <Animated.View
            style={[styles.contentRow, { opacity: tasksActiveOpacity }]}
            pointerEvents="none"
          >
            <Feather name="check-circle" size={17} color={Colors.background} />
            <Text style={[styles.segmentText, styles.activeText]}>Tasks</Text>
          </Animated.View>

          {/* Inactive Layer (Light on Dark Track) */}
          <Animated.View
            style={[
              styles.contentRow,
              styles.absoluteLayer,
              { opacity: tasksInactiveOpacity },
            ]}
            pointerEvents="none"
          >
            <Feather name="check-circle" size={17} color={Colors.textLightMutedAlt} />
            <Text style={[styles.segmentText, styles.inactiveText]}>Tasks</Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Lists Segment */}
        <TouchableOpacity
          style={styles.segment}
          onPress={() => onSelectTab('lists')}
          activeOpacity={0.85}
          accessibilityRole="tab"
          accessibilityState={{ selected: !isTasks }}
          accessibilityLabel="Lists tab"
        >
          {/* Active Layer (Dark on Orange) */}
          <Animated.View
            style={[
              styles.contentRow,
              styles.absoluteLayer,
              { opacity: listsActiveOpacity },
            ]}
            pointerEvents="none"
          >
            <Feather name="list" size={17} color={Colors.background} />
            <Text style={[styles.segmentText, styles.activeText]}>Lists</Text>
          </Animated.View>

          {/* Inactive Layer (Light on Dark Track) */}
          <Animated.View
            style={[styles.contentRow, { opacity: listsInactiveOpacity }]}
            pointerEvents="none"
          >
            <Feather name="list" size={17} color={Colors.textLightMutedAlt} />
            <Text style={[styles.segmentText, styles.inactiveText]}>Lists</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TasksSegmentedTabs;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  toggleTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tasksTrackBg,
    borderRadius: 24,
    padding: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderBold,
    position: 'relative',
    height: 48,
  },
  animatedSlider: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  segment: {
    flex: 1,
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  absoluteLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
  },
  activeText: {
    color: Colors.background,
  },
  inactiveText: {
    color: Colors.textLightMutedAlt,
    fontFamily: Fonts.medium,
  },
});

