import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';

export interface PickTimeModalProps {
  visible: boolean;
  doseTitle?: string;
  onClose: () => void;
  onSetTime: (timeString: string, mealPreset?: string) => void;
}

const MEAL_PRESETS = [
  'After breakfast',
  'After lunch',
  'After dinner',
  'Bedtime',
];

const HOURS = ['7', '8', '9', '10', '11'];
const MINUTES = ['50', '55', '00', '05', '10'];
const PERIODS = ['AM', 'PM'];

const PickTimeModal: React.FC<PickTimeModalProps> = ({
  visible,
  doseTitle = 'Dose 2 · Night',
  onClose,
  onSetTime,
}) => {
  const [selectedMeal, setSelectedMeal] = useState<string>('After dinner');
  const [selectedHour, setSelectedHour] = useState<string>('9');
  const [selectedMinute, setSelectedMinute] = useState<string>('00');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('PM');

  const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

  const handleConfirm = () => {
    onSetTime(formattedTime, selectedMeal);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Drag Handle */}
              <View style={styles.dragHandle} />

              {/* Title & Subtitle */}
              <Text style={styles.doseTitleText}>{doseTitle}</Text>
              <Text style={styles.subtitleText}>
                Pick a time, or tap a meal
              </Text>

              {/* Meal Preset Chips */}
              <View style={styles.mealChipsRow}>
                {MEAL_PRESETS.map((preset) => {
                  const isSelected = preset === selectedMeal;
                  return (
                    <TouchableOpacity
                      key={preset}
                      activeOpacity={0.7}
                      onPress={() => setSelectedMeal(preset)}
                      style={[
                        styles.mealChip,
                        isSelected
                          ? styles.mealChipSelected
                          : styles.mealChipUnselected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.mealChipText,
                          isSelected
                            ? styles.mealChipTextSelected
                            : styles.mealChipTextUnselected,
                        ]}
                      >
                        {preset}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Stylized Time Picker Wheel */}
              <View style={styles.wheelContainer}>
                {/* Active Highlight Band */}
                <View style={styles.highlightBand} />

                {/* Hours Column */}
                <View style={styles.wheelColumn}>
                  {HOURS.map((hour) => {
                    const isSelected = hour === selectedHour;
                    return (
                      <TouchableOpacity
                        key={hour}
                        onPress={() => setSelectedHour(hour)}
                        style={styles.wheelItem}
                      >
                        <Text
                          style={[
                            styles.wheelText,
                            isSelected
                              ? styles.wheelTextSelected
                              : styles.wheelTextMuted,
                          ]}
                        >
                          {hour}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Minute Column */}
                <View style={styles.wheelColumn}>
                  {MINUTES.map((min) => {
                    const isSelected = min === selectedMinute;
                    return (
                      <TouchableOpacity
                        key={min}
                        onPress={() => setSelectedMinute(min)}
                        style={styles.wheelItem}
                      >
                        <Text
                          style={[
                            styles.wheelText,
                            isSelected
                              ? styles.wheelTextSelected
                              : styles.wheelTextMuted,
                          ]}
                        >
                          {min}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Period Column */}
                <View style={styles.wheelColumn}>
                  {PERIODS.map((period) => {
                    const isSelected = period === selectedPeriod;
                    return (
                      <TouchableOpacity
                        key={period}
                        onPress={() => setSelectedPeriod(period)}
                        style={styles.wheelItem}
                      >
                        <Text
                          style={[
                            styles.wheelText,
                            isSelected
                              ? styles.wheelTextSelected
                              : styles.wheelTextMuted,
                          ]}
                        >
                          {period}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Set Time Button */}
              <View style={styles.buttonWrapper}>
                <CommonBtn
                  title={`Set ${formattedTime}`}
                  onPress={handleConfirm}
                  backgroundColor={Colors.primary || '#F0913A'}
                  textColor="#FFFFFF"
                  height={54}
                  borderRadius={27}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default PickTimeModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0D223A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  doseTitleText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitleText: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  mealChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  mealChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  mealChipUnselected: {
    backgroundColor: '#071526',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mealChipSelected: {
    backgroundColor: Colors.primary || '#F0913A',
    borderColor: Colors.primary || '#F0913A',
  },
  mealChipText: {
    fontSize: RFValue(11.5),
  },
  mealChipTextUnselected: {
    color: '#CBD5E1',
    fontWeight: '500',
  },
  mealChipTextSelected: {
    color: '#071526',
    fontWeight: '700',
  },
  wheelContainer: {
    flexDirection: 'row',
    height: 160,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  highlightBand: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  wheelColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItem: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelText: {
    fontSize: RFValue(15),
  },
  wheelTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: RFValue(17),
  },
  wheelTextMuted: {
    color: '#64748B',
    fontWeight: '400',
  },
  buttonWrapper: {
    marginTop: 14,
  },
});

