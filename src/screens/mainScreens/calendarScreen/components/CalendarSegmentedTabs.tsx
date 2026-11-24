import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarViewMode } from '../types';

export interface CalendarSegmentedTabsProps {
  activeTab: CalendarViewMode;
  onTabChange: (tab: CalendarViewMode) => void;
}

const TABS: { id: CalendarViewMode; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

export const CalendarSegmentedTabs: React.FC<CalendarSegmentedTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabsTrack}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} view`}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CalendarSegmentedTabs;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tabsTrack: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#3A4556',
  },
  tabBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#F0913A',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  tabTextActive: {
    color: '#0B1A2F',
    fontFamily: 'Roboto-Bold',
  },
});
