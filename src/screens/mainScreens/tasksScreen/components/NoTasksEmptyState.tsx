import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { START_SUGGESTIONS } from '../mockData';

export interface NoTasksEmptyStateProps {
  onAddTaskPress: () => void;
  onSelectSuggestion?: (title: string) => void;
}

const NoTasksEmptyState: React.FC<NoTasksEmptyStateProps> = ({
  onAddTaskPress,
  onSelectSuggestion,
}) => {
  return (
    <View style={styles.container}>
      {/* Concentric Circle Illustration */}
      <View style={styles.outerCircle}>
        <View style={styles.innerCircle}>
          <View style={styles.checkSquare}>
            <Feather name="check" size={24} color="#F0913A" />
          </View>
        </View>
      </View>

      {/* Main Headline */}
      <Text style={styles.headline}>No tasks yet</Text>

      {/* Description */}
      <Text style={styles.description}>
        Add chores, bills and errands, and give each one to someone in the
        family.
      </Text>

      {/* Add a task CTA */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddTaskPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Add a task"
      >
        <Feather name="plus" size={20} color="#0B1A2F" />
        <Text style={styles.addButtonText}>Add a task</Text>
      </TouchableOpacity>

      {/* Start with one of these */}
      <Text style={styles.suggestionEyebrow}>OR START WITH ONE OF THESE</Text>

      <View style={styles.suggestionsGrid}>
        {START_SUGGESTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.suggestionPill}
            onPress={() => onSelectSuggestion?.(item.title)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.suggestionDot, { backgroundColor: item.dotColor }]}
            />
            <Text style={styles.suggestionText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default NoTasksEmptyState;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
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
  checkSquare: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: '#CAD4DF',
    textAlign: 'center',
    marginTop: 28,
  },
  description: {
    fontSize: 15,
    color: '#8A97AB',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 300,
  },
  addButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1A2F',
  },
  suggestionEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A97AB',
    marginTop: 36,
    marginBottom: 16,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  suggestionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  suggestionText: {
    fontSize: 13,
    color: '#CAD4DF',
    fontWeight: '500',
  },
});

