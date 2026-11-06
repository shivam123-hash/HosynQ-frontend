import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../../../units/Colors';
import { BriefTimeframe } from '../types';

export interface BriefTimeframeSelectorProps {
  selectedTimeframe: BriefTimeframe;
  onSelectTimeframe: (timeframe: BriefTimeframe) => void;
}

const TIMEFRAMES: { key: BriefTimeframe; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

const BriefTimeframeSelector: React.FC<BriefTimeframeSelectorProps> = ({
  selectedTimeframe,
  onSelectTimeframe,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.segmentedControl}>
        {TIMEFRAMES.map(({ key, label }) => {
          const isActive = selectedTimeframe === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onSelectTimeframe(key)}
              activeOpacity={0.8}
              style={[styles.segment, isActive && styles.activeSegment]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive ? styles.activeSegmentText : styles.inactiveSegmentText,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 14,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    padding: 4,
    gap: 4,
    height: 53,
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  activeSegment: {
    backgroundColor: Colors.primary, // #F0913A
  },
  segmentText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 18,
  },
  activeSegmentText: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  inactiveSegmentText: {
    color: '#C9D1DC',
    fontWeight: '400',
  },
});

export default memo(BriefTimeframeSelector);

