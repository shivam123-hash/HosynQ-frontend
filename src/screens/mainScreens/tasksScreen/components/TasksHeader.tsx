import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import AppTopBar from '../../../../components/AppTopBar';
import Fonts from '../../../../units/FontsStyle';
import Colors from '../../../../units/Colors';
import Typography from '../../../../units/Typography';

export interface TasksHeaderProps {
  onProfilePress?: () => void;
  onExplorePress?: () => void;
  onNotificationsPress?: () => void;
  onCompassPress?: () => void;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  isSearchVisible?: boolean;
  onToggleSearch?: () => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  onProfilePress,
  onExplorePress,
  onNotificationsPress,
  onCompassPress,
  onFilterPress,
  isFilterActive = false,
  searchQuery = '',
  onSearchChange,
  isSearchVisible = false,
  onToggleSearch,
}) => {
  const hasActiveFilter = Boolean(isFilterActive);

  return (
    <View style={styles.container}>
      {/* Unified Single Top Bar for the entire app */}
      <AppTopBar
        onAvatarPress={onProfilePress}
        onExplorePress={onExplorePress}
        onNotificationsPress={onNotificationsPress}
        onCompassPress={onCompassPress}
      />

      {/* Screen Title & Action Buttons Row */}
      <View style={styles.titleRow}>
        <Text style={styles.screenTitle}>Tasks</Text>

        <View style={styles.titleButtons}>
          <TouchableOpacity
            onPress={onToggleSearch}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Search tasks"
            style={[
              styles.circleButton,
              isSearchVisible && styles.circleButtonActive,
            ]}
          >
            <Feather
              name="search"
              size={18}
              color={isSearchVisible ? Colors.primary : Colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onFilterPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Filter tasks"
            style={[
              styles.circleButton,
              hasActiveFilter && styles.circleButtonActive,
            ]}
          >
            <View style={styles.filterIconContainer}>
              <View
                style={[
                  styles.filterLineTop,
                  hasActiveFilter && styles.filterLineActive,
                ]}
              />
              <View
                style={[
                  styles.filterLineMiddle,
                  hasActiveFilter && styles.filterLineActive,
                ]}
              />
              <View
                style={[
                  styles.filterLineBottom,
                  hasActiveFilter && styles.filterLineActive,
                ]}
              />
            </View>
            {hasActiveFilter && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Inline Search Input (when active) */}
      {isSearchVisible && (
        <View style={styles.searchBarWrapper}>
          <Feather name="search" size={16} color={Colors.textSecondaryMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={Colors.textSecondaryMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange?.('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={16} color={Colors.textSecondaryMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default TasksHeader;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 12,
  },
  screenTitle: {
    fontSize: Typography.size.display,
    fontFamily: Fonts.bold,
    color: Colors.white,
    letterSpacing: -0.3,
  },
  titleButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.borderBold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleButtonActive: {
    borderColor: Colors.primary,
  },
  filterIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3.5,
  },
  filterLineTop: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.white,
  },
  filterLineMiddle: {
    width: 11,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.white,
  },
  filterLineBottom: {
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.white,
  },
  filterLineActive: {
    backgroundColor: Colors.primary,
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  searchBarWrapper: {
    marginTop: 12,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.bodyMedium,
    color: Colors.textLightMutedAlt,
    paddingVertical: 0,
  },
});
