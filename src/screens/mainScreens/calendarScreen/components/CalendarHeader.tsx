import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface CalendarHeaderProps {
  title?: string;
  hasActiveFilters?: boolean;
  onSearchPress?: () => void;
  onFilterPress?: () => void;
  onAddPress?: () => void;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  isSearchVisible?: boolean;
  onToggleSearch?: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  title = 'Calendar',
  hasActiveFilters = false,
  onSearchPress,
  onFilterPress,
  onAddPress,
  searchQuery = '',
  onSearchChange,
  isSearchVisible = false,
  onToggleSearch,
}) => {
  const handleSearchPress = onToggleSearch || onSearchPress;

  return (
    <View style={styles.container}>
      <View style={[styles.header, isSearchVisible && styles.headerWithSearch]}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.actions}>
          {/* Search */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              isSearchVisible && styles.iconBtnActive,
            ]}
            onPress={handleSearchPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Search events"
          >
            <Feather
              name="search"
              size={18}
              color={isSearchVisible ? '#F0913A' : '#FFFFFF'}
            />
          </TouchableOpacity>

          {/* Filter with active dot */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              hasActiveFilters && styles.iconBtnActive,
            ]}
            onPress={onFilterPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Filter calendar"
          >
            <View style={styles.filterIconContainer}>
              <View
                style={[
                  styles.filterLineTop,
                  hasActiveFilters && styles.filterLineActive,
                ]}
              />
              <View
                style={[
                  styles.filterLineMiddle,
                  hasActiveFilters && styles.filterLineActive,
                ]}
              />
              <View
                style={[
                  styles.filterLineBottom,
                  hasActiveFilters && styles.filterLineActive,
                ]}
              />
            </View>
            {hasActiveFilters && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Inline Search Input Bar (when active) */}
      {isSearchVisible && (
        <View style={styles.searchBarWrapper}>
          <Feather name="search" size={16} color="#8A97AB" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, tasks..."
            placeholderTextColor="#8A97AB"
            value={searchQuery}
            onChangeText={onSearchChange}
            autoFocus
          />
          {Boolean(searchQuery && searchQuery.length > 0) && (
            <TouchableOpacity
              onPress={() => onSearchChange?.('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Feather name="x" size={16} color="#8A97AB" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default CalendarHeader;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerWithSearch: {
    marginBottom: 12,
  },
  searchBarWrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
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
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconBtnActive: {
    borderColor: '#F0913A',
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
    backgroundColor: '#FFFFFF',
  },
  filterLineMiddle: {
    width: 11,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  filterLineBottom: {
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  filterLineActive: {
    backgroundColor: '#F0913A',
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F0913A',
  },
});
