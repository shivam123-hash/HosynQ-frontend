import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface InterestsPickerProps {
  selectedInterests: string[];
  onToggleInterest: (interest: string) => void;
  interestsList?: string[];
}

export const DEFAULT_INTERESTS = [
  'Cricket',
  'Football',
  'Tennis',
  'Badminton',
  'Chess',
  'Running',
  'Cycling',
  'Gym',
  'Swimming',
  'Music',
  'Reading',
  'Gaming',
  'Travel',
  'Cooking',
  'Photography',
];

const InterestsPicker: React.FC<InterestsPickerProps> = ({
  selectedInterests,
  onToggleInterest,
  interestsList = DEFAULT_INTERESTS,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.chipsWrap}>
        {interestsList.map((item) => {
          const isSelected = selectedInterests.includes(item);
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.75}
              onPress={() => onToggleInterest(item)}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default InterestsPicker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#1E2F48',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  chipUnselected: {
    backgroundColor: '#101E31',
    borderWidth: 1,
    borderColor: '#1C2F46',
  },
  chipText: {
    fontSize: RFValue(12.5),
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipTextUnselected: {
    color: '#CBD5E1',
    fontWeight: '400',
  },
});

