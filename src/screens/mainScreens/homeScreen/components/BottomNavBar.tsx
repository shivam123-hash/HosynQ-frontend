import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImagePath from '../../../../units/ImagePath';
import { NavigationTab } from '../types';

export interface BottomNavBarProps {
  activeTab?: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
  onAddPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Maintaining exact 442:133 aspect ratio from clean Figma dock asset
const DOCK_WIDTH = Math.min(SCREEN_WIDTH - 24, 356);
const DOCK_HEIGHT = Math.round((133 / 442) * DOCK_WIDTH);

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = 'home',
  onTabChange,
  onAddPress,
}) => {
  const insets = useSafeAreaInsets();

  const getNavImage = () => {
    switch (activeTab) {
      case 'calendar':
        return ImagePath.bottomNavCalendar;
      case 'chat':
        return ImagePath.bottomNavChat;
      case 'tasks':
        return ImagePath.bottomNavTasks;
      case 'home':
      default:
        return ImagePath.bottomNavHome;
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {/* Dock Bar Container */}
      <View style={[styles.dockContainer, { width: DOCK_WIDTH, height: DOCK_HEIGHT }]}>
        {/* Pixel-perfect authentic Figma render */}
        <Image
          source={getNavImage()}
          style={styles.dockImage}
          resizeMode="contain"
        />

        {/* Interactive Touch Overlay */}
        <View style={styles.touchOverlay}>
          {/* Home Tab */}
          <TouchableOpacity
            onPress={() => onTabChange?.('home')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Home tab"
            style={styles.homeTouch}
          />

          {/* Calendar Tab */}
          <TouchableOpacity
            onPress={() => onTabChange?.('calendar')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Calendar tab"
            style={styles.calendarTouch}
          />

          {/* Center FAB '+' Button */}
          <TouchableOpacity
            onPress={onAddPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add new item"
            style={styles.fabTouch}
          />

          {/* Chat Tab */}
          <TouchableOpacity
            onPress={() => onTabChange?.('chat')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Chat tab"
            style={styles.chatTouch}
          />

          {/* Tasks Tab */}
          <TouchableOpacity
            onPress={() => onTabChange?.('tasks')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Tasks tab"
            style={styles.tasksTouch}
          />
        </View>
      </View>
    </View>
  );
};

export default memo(BottomNavBar);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dockContainer: {
    position: 'relative',
  },
  dockImage: {
    width: '100%',
    height: '100%',
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  homeTouch: {
    flex: 1.1,
    height: '100%',
  },
  calendarTouch: {
    flex: 0.9,
    height: '100%',
  },
  fabTouch: {
    flex: 1,
    height: '100%',
  },
  chatTouch: {
    flex: 0.9,
    height: '100%',
  },
  tasksTouch: {
    flex: 1.1,
    height: '100%',
  },
});
