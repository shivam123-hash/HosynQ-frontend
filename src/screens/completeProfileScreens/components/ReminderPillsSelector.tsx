import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface ReminderPillsSelectorProps {
  sectionTitle?: string;
  options?: string[];
  selectedOptions?: string[];
  onToggleOption?: (option: string) => void;
}

const DEFAULT_OPTIONS = ['6 months', '3 months', '1 month', '1 week'];

const ReminderPillsSelector: React.FC<ReminderPillsSelectorProps> = ({
  sectionTitle = 'REMIND ME BEFORE IT EXPIRES',
  options = DEFAULT_OPTIONS,
  selectedOptions = ['6 months', '1 month'],
  onToggleOption,
}) => {
  return (
    <View style={styles.container}>
      {sectionTitle ? (
        <Text style={styles.sectionHeader}>{sectionTitle}</Text>
      ) : null}

      <View style={styles.chipsContainer}>
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option);
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.7}
              onPress={() => onToggleOption?.(option)}
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

export default ReminderPillsSelector;

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

