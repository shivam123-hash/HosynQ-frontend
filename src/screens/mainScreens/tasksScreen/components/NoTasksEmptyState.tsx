import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { START_SUGGESTIONS } from '../constants';
import CommonBtn from '../../../../components/CommonBtn';
import { Colors, Fonts, Typography } from '../../../../units';

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
            <Feather name="check" size={24} color={Colors.primary} />
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
      <CommonBtn
        title="Add a task"
        onPress={onAddTaskPress}
        backgroundColor={Colors.primary}
        height={52}
        borderRadius={26}
        marginTop={24}
        containerStyle={{ marginBottom: 32 }}
        fontSize={16}
        leftComponent={
          <Feather name="plus" size={20} color={Colors.white} style={{ marginRight: 8 }} />
        }
      />

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
    borderColor: Colors.borderBold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.surfaceMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkSquare: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    fontSize: Typography.size.header,
    fontFamily: Fonts.bold,
    color: Colors.textLightMutedAlt,
    textAlign: 'center',
    marginTop: 28,
  },
  description: {
    fontSize: Typography.size.bodyMedium,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 300,
  },
  addButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  addButtonText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  suggestionEyebrow: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    letterSpacing: 1.2,
    color: Colors.textSecondaryMuted,
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
    backgroundColor: Colors.transparent,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
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
    fontSize: Typography.size.bodySmall,
    color: Colors.textLightMutedAlt,
    fontFamily: Fonts.medium,
  },
});

