import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface OccupationSelectorProps {
  sectionTitle?: string;
  questionTitle?: string;
  options?: string[];
  selectedOccupation?: string;
  onSelectOccupation?: (occupation: string) => void;
}

const DEFAULT_OPTIONS = [
  'Student',
  'College',
  'Working',
  'Business owner',
  'Homemaker',
  'Retired',
];

const OccupationSelector: React.FC<OccupationSelectorProps> = ({
  sectionTitle = 'EDUCATION / CAREER',
  questionTitle = 'What Best Describes You',
  options = DEFAULT_OPTIONS,
  selectedOccupation = 'Working',
  onSelectOccupation,
}) => {
  return (
    <View style={styles.container}>
      {sectionTitle ? (
        <Text style={styles.sectionHeader}>{sectionTitle}</Text>
      ) : null}

      {questionTitle ? (
        <Text style={styles.questionHeader}>{questionTitle}</Text>
      ) : null}

      <View style={styles.chipsContainer}>
        {options.map((option) => {
          const isSelected = option === selectedOccupation;
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.7}
              onPress={() => onSelectOccupation?.(option)}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected
                    ? styles.chipTextSelected
                    : styles.chipTextUnselected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default OccupationSelector;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  questionHeader: {
    color: '#94A3B8',
    fontSize: RFValue(13),
    fontWeight: '500',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: '#0C1E34',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipSelected: {
    backgroundColor: Colors.primary || '#F0913A',
    borderColor: Colors.primary || '#F0913A',
  },
  chipText: {
    fontSize: RFValue(12.5),
  },
  chipTextUnselected: {
    color: '#CBD5E1',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#071526',
    fontWeight: '700',
  },
});

