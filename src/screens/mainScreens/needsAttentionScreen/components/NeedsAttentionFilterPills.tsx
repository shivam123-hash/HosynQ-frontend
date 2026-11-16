import React, { memo } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../../../../units/Colors';
import { AttentionFilterPillItem, AttentionFilterType } from '../types';

export interface NeedsAttentionFilterPillsProps {
  pills: AttentionFilterPillItem[];
  selectedFilter: AttentionFilterType;
  onSelectFilter: (filter: AttentionFilterType) => void;
}

const NeedsAttentionFilterPills: React.FC<NeedsAttentionFilterPillsProps> = ({
  pills,
  selectedFilter,
  onSelectFilter,
}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {pills.map((pill) => {
          const isActive = selectedFilter === pill.id;

          return (
            <TouchableOpacity
              key={pill.id}
              style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
              onPress={() => onSelectFilter(pill.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.pillText,
                  isActive ? styles.pillTextActive : styles.pillTextInactive,
                ]}
              >
                {pill.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    height: 35,
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: Colors.primary, // #F0913A
  },
  pillInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3A4556',
  },
  pillText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
  },
  pillTextActive: {
    fontWeight: '700',
    color: '#0B1A2F',
  },
  pillTextInactive: {
    fontWeight: '500',
    color: '#CAD4DF',
  },
});

export default memo(NeedsAttentionFilterPills);

