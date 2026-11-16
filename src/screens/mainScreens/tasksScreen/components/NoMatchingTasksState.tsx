import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface ActiveFilterTag {
  id: string;
  label: string;
  onRemove: () => void;
}

export interface NoMatchingTasksStateProps {
  activeTags: ActiveFilterTag[];
  onClearAll?: () => void;
}

const NoMatchingTasksState: React.FC<NoMatchingTasksStateProps> = ({
  activeTags,
}) => {
  return (
    <View style={styles.container}>
      {/* Active Filter Chips */}
      {activeTags.length > 0 && (
        <View style={styles.activeFiltersRow}>
          <Text style={styles.filtersLabel}>Filters</Text>
          <View style={styles.tagsContainer}>
            {activeTags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={styles.tagPill}
                onPress={tag.onRemove}
                activeOpacity={0.7}
              >
                <Text style={styles.tagText}>{tag.label}</Text>
                <Feather name="x" size={14} color="#0B1A2F" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Concentric Circle Funnel Graphic */}
      <View style={styles.outerCircle}>
        <View style={styles.innerCircle}>
          <View style={styles.filterLines}>
            <View style={[styles.filterBar, styles.filterBarWide]} />
            <View style={[styles.filterBar, styles.filterBarMedium]} />
            <View style={[styles.filterBar, styles.filterBarNarrow]} />
          </View>
        </View>
      </View>

      {/* Main Headline */}
      <Text style={styles.headline}>No tasks match these filters</Text>

      {/* Explanatory Subtitle */}
      <Text style={styles.description}>
        Try removing a filter, or choose someone else in the family.
      </Text>
    </View>
  );
};

export default NoMatchingTasksState;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 40,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 48,
    alignSelf: 'stretch',
    flexWrap: 'wrap',
  },
  filtersLabel: {
    fontSize: 14,
    color: '#8A97AB',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0913A',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1A2F',
  },
  outerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#2A3E5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterLines: {
    alignItems: 'center',
    gap: 5,
  },
  filterBar: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#F0913A',
  },
  filterBarWide: {
    width: 28,
  },
  filterBarMedium: {
    width: 20,
  },
  filterBarNarrow: {
    width: 12,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#CAD4DF',
    textAlign: 'center',
    marginTop: 28,
    lineHeight: 30,
  },
  description: {
    fontSize: 15,
    color: '#8A97AB',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 280,
  },
});
