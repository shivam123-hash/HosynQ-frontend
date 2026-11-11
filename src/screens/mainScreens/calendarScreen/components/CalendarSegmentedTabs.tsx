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
    backgroundColor: '#0F2036',
    borderRadius: 22,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  tabBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#F0913A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A97AB',
  },
  tabTextActive: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
});
