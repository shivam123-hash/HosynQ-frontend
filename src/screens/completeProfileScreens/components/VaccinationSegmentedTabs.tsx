import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export type VaccinationTab = 'vaccines' | 'growth' | 'milestones';

export interface VaccinationSegmentedTabsProps {
  activeTab: VaccinationTab;
  onTabChange: (tab: VaccinationTab) => void;
}

const TABS: { id: VaccinationTab; label: string }[] = [
  { id: 'vaccines', label: 'Vaccines' },
  { id: 'growth', label: 'Growth' },
  { id: 'milestones', label: 'Milestones' },
];

const VaccinationSegmentedTabs: React.FC<VaccinationSegmentedTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            onPress={() => onTabChange(tab.id)}
            style={[
              styles.tabButton,
              isActive ? styles.tabButtonActive : styles.tabButtonInactive,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <Text
              style={[
                styles.tabText,
                isActive ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default VaccinationSegmentedTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0F2238',
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: Colors.primary || '#F0913A',
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: RFValue(12.5),
  },
  tabTextActive: {
    color: '#071526',
    fontWeight: '700',
  },
  tabTextInactive: {
    color: '#8E9BAE',
    fontWeight: '500',
  },
});

