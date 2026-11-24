import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
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
  const activeIndex = Math.max(
    0,
    TABS.findIndex((tab) => tab.id === activeTab),
  );

  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isFirstLayout = useRef(true);

  // Tab width inside container (padding is 4 on each side = 8)
  const tabWidth = containerWidth > 0 ? (containerWidth - 8) / TABS.length : 0;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
      const calculatedTabWidth = (width - 8) / TABS.length;
      if (isFirstLayout.current) {
        isFirstLayout.current = false;
        slideAnim.setValue(activeIndex * calculatedTabWidth);
      }
    }
  };

  useEffect(() => {
    if (tabWidth > 0) {
      Animated.spring(slideAnim, {
        toValue: activeIndex * tabWidth,
        damping: 24,
        stiffness: 280,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    }
  }, [activeIndex, tabWidth, slideAnim]);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Smooth Sliding Active Indicator Pill */}
      {tabWidth > 0 && (
        <Animated.View
          style={[
            styles.slidingIndicator,
            {
              width: tabWidth,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        />
      )}

      {/* Tab Buttons */}
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab.id)}
            style={styles.tabButton}
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
    position: 'relative',
  },
  slidingIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 20,
    backgroundColor: Colors.primary || '#F0913A',
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: RFValue(12.5),
  },
  tabTextActive: {
    color: '#071526',
    fontFamily: 'Roboto-Bold',
  },
  tabTextInactive: {
    color: '#8E9BAE',
    fontFamily: 'Roboto-Medium',
  },
});
