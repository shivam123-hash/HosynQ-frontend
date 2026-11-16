import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface CalendarHeaderProps {
  title?: string;
  hasActiveFilters?: boolean;
  onSearchPress?: () => void;
  onFilterPress?: () => void;
  onImportantDatesPress?: () => void;
  isImportantDatesActive?: boolean;
  showImportantDatesBtn?: boolean;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  title = 'Calendar',
  hasActiveFilters = false,
  onSearchPress,
  onFilterPress,
  onImportantDatesPress,
  isImportantDatesActive = false,
  showImportantDatesBtn = false,
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.actions}>
        {/* Important Dates Star/Gift Icon (Optional) */}
        {showImportantDatesBtn && (
          <TouchableOpacity
            style={[
              styles.iconBtn,
              isImportantDatesActive && styles.iconBtnActive,
            ]}
            onPress={onImportantDatesPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Important dates"
          >
            <Feather
              name="star"
              size={19}
              color={isImportantDatesActive ? '#F0913A' : '#CAD4DF'}
            />
          </TouchableOpacity>
        )}

        {/* Search */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onSearchPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Search events"
        >
          <Feather name="search" size={20} color="#CAD4DF" />
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
          <Feather
            name="sliders"
            size={19}
            color={hasActiveFilters ? '#F0913A' : '#CAD4DF'}
          />
          {hasActiveFilters && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CalendarHeader;

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
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
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconBtnActive: {
    borderColor: '#F0913A',
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
