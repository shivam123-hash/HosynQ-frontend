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

export interface TasksHeaderProps {
  onProfilePress?: () => void;
  onExplorePress?: () => void;
  onNotificationsPress?: () => void;
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
  onFilterPress,
  isFilterActive = false,
  searchQuery = '',
  onSearchChange,
  isSearchVisible = false,
  onToggleSearch,
}) => {
  return (
    <View style={styles.container}>
      {/* Unified Single Top Bar for the entire app */}
      <AppTopBar
        onAvatarPress={onProfilePress}
        onExplorePress={onExplorePress}
        onNotificationsPress={onNotificationsPress}
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
              color={isSearchVisible ? '#F0913A' : '#CAD4DF'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onFilterPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Filter tasks"
            style={[
              styles.circleButton,
              isFilterActive && styles.circleButtonActive,
            ]}
          >
            <Feather
              name="sliders"
              size={18}
              color={isFilterActive ? '#F0913A' : '#CAD4DF'}
            />
            {isFilterActive && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Inline Search Input (when active) */}
      {isSearchVisible && (
        <View style={styles.searchBarWrapper}>
          <Feather name="search" size={16} color="#8A97AB" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#8A97AB"
            value={searchQuery}
            onChangeText={onSearchChange}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange?.('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={16} color="#8A97AB" />
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
    fontSize: 30,
    fontWeight: '700',
    color: '#CAD4DF',
    letterSpacing: -0.5,
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
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleButtonActive: {
    borderColor: '#F0913A',
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0913A',
  },
  searchBarWrapper: {
    marginTop: 12,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#CAD4DF',
    paddingVertical: 0,
  },
});
