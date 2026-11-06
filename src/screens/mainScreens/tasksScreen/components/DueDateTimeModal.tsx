import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface DueDateTimeModalProps {
  visible: boolean;
  initialDate?: string;
  initialTime?: string;
  onClose: () => void;
  onSave: (dueDate: string, dueFormatted: string, dueTime?: string) => void;
}

const QUICK_DATES = [
  { id: 'today', label: 'Today', dateStr: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow', dateStr: 'Tomorrow' },
  { id: 'this_weekend', label: 'This weekend', dateStr: 'Sat, 7 Nov' },
  { id: 'nov2', label: 'Mon, 2 Nov', dateStr: 'Mon, 2 Nov' },
];

const QUICK_TIMES = [
  { id: 'morning', label: 'Morning 9:00', timeStr: '9:00 AM' },
  { id: 'afternoon', label: 'Afternoon 2:00', timeStr: '2:00 PM' },
  { id: 'evening', label: 'Evening 6:00', timeStr: '6:00 PM' },
  { id: 'custom', label: 'Pick a time', timeStr: '8:00 PM' },
];

// Days matrix for November 2026 (matching TSK-16 screenshot)
const CALENDAR_DAYS: { day: number; isCurrentMonth: boolean; isToday?: boolean }[] = [
  { day: 26, isCurrentMonth: false },
  { day: 27, isCurrentMonth: false },
  { day: 28, isCurrentMonth: false },
  { day: 29, isCurrentMonth: false },
  { day: 30, isCurrentMonth: false, isToday: true },
  { day: 31, isCurrentMonth: false },
  { day: 1, isCurrentMonth: true },
  { day: 2, isCurrentMonth: true },
  { day: 3, isCurrentMonth: true },
  { day: 4, isCurrentMonth: true },
  { day: 5, isCurrentMonth: true },
  { day: 6, isCurrentMonth: true },
  { day: 7, isCurrentMonth: true },
  { day: 8, isCurrentMonth: true },
  { day: 9, isCurrentMonth: true },
  { day: 10, isCurrentMonth: true },
  { day: 11, isCurrentMonth: true },
  { day: 12, isCurrentMonth: true },
  { day: 13, isCurrentMonth: true },
  { day: 14, isCurrentMonth: true },
  { day: 15, isCurrentMonth: true },
  { day: 16, isCurrentMonth: true },
  { day: 17, isCurrentMonth: true },
  { day: 18, isCurrentMonth: true },
  { day: 19, isCurrentMonth: true },
  { day: 20, isCurrentMonth: true },
  { day: 21, isCurrentMonth: true },
  { day: 22, isCurrentMonth: true },
  { day: 23, isCurrentMonth: true },
  { day: 24, isCurrentMonth: true },
  { day: 25, isCurrentMonth: true },
  { day: 26, isCurrentMonth: true },
  { day: 27, isCurrentMonth: true },
  { day: 28, isCurrentMonth: true },
  { day: 29, isCurrentMonth: true },
];

const DueDateTimeModal: React.FC<DueDateTimeModalProps> = ({
  visible,
  initialDate = 'Mon, 2 Nov',
  initialTime = '6:00 PM',
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(2);
  const [selectedTimeId, setSelectedTimeId] = useState<string>('evening');
  const [noSpecificTime, setNoSpecificTime] = useState<boolean>(false);

  React.useEffect(() => {
    setSelectedDate(initialDate);
  }, [initialDate, visible]);

  const handleDayPress = (dayItem: typeof CALENDAR_DAYS[0]) => {
    setSelectedDayNumber(dayItem.day);
    if (dayItem.isCurrentMonth) {
      setSelectedDate(`${dayItem.day} Nov`);
    } else {
      setSelectedDate(`${dayItem.day} Oct`);
    }
  };

  const handleQuickDatePress = (item: typeof QUICK_DATES[0]) => {
    setSelectedDate(item.dateStr);
    if (item.id === 'nov2') {
      setSelectedDayNumber(2);
    }
  };

  const handleDone = () => {
    let finalFormatted = selectedDate;
    let chosenTimeStr: string | undefined;

    if (!noSpecificTime) {
      const match = QUICK_TIMES.find((t) => t.id === selectedTimeId);
      chosenTimeStr = match ? match.timeStr : initialTime;
      finalFormatted = `${selectedDate} · by ${chosenTimeStr}`;
    }

    onSave(selectedDate, finalFormatted, chosenTimeStr);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
        >
          {/* Top Handle */}
          <View style={styles.handle} />

          <Text style={styles.title}>When is it due?</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Quick Date Chips */}
            <View style={styles.quickChipsRow}>
              {QUICK_DATES.map((chip) => {
                const isSelected = selectedDate === chip.dateStr;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[
                      styles.quickChip,
                      isSelected && styles.quickChipSelected,
                    ]}
                    onPress={() => handleQuickDatePress(chip)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        isSelected && styles.quickChipTextSelected,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Interactive Calendar Card */}
            <View style={styles.calendarCard}>
              {/* Header */}
              <View style={styles.calendarHeaderRow}>
                <TouchableOpacity
                  style={styles.chevronBtn}
                  activeOpacity={0.7}
                >
                  <Feather name="chevron-left" size={18} color="#CAD4DF" />
                </TouchableOpacity>

                <Text style={styles.monthTitle}>November 2026</Text>

                <TouchableOpacity
                  style={styles.chevronBtn}
                  activeOpacity={0.7}
                >
                  <Feather name="chevron-right" size={18} color="#CAD4DF" />
                </TouchableOpacity>
              </View>

              {/* Day of Week Labels */}
              <View style={styles.weekHeadersRow}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((letter, idx) => (
                  <Text key={idx} style={styles.weekHeaderText}>
                    {letter}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {CALENDAR_DAYS.map((item, idx) => {
                  const isSelected =
                    item.isCurrentMonth && item.day === selectedDayNumber;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.dayCell}
                      onPress={() => handleDayPress(item)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.dayCircle,
                          item.isToday && styles.todayCircle,
                          isSelected && styles.selectedDayCircle,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            !item.isCurrentMonth && styles.otherMonthDayText,
                            isSelected && styles.selectedDayText,
                          ]}
                        >
                          {item.day}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* TIME Section */}
            <Text style={styles.sectionHeader}>TIME</Text>

            {/* Quick Time Chips */}
            <View style={styles.quickTimeRow}>
              {QUICK_TIMES.map((timeItem) => {
                const isSelected =
                  !noSpecificTime && selectedTimeId === timeItem.id;
                return (
                  <TouchableOpacity
                    key={timeItem.id}
                    style={[
                      styles.quickChip,
                      isSelected && styles.quickChipSelected,
                      noSpecificTime && styles.chipDisabled,
                    ]}
                    onPress={() => {
                      setSelectedTimeId(timeItem.id);
                      setNoSpecificTime(false);
                    }}
                    disabled={noSpecificTime}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        isSelected && styles.quickChipTextSelected,
                        noSpecificTime && styles.chipDisabledText,
                      ]}
                    >
                      {timeItem.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Toggle: No specific time */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>No specific time</Text>
              <Switch
                value={noSpecificTime}
                onValueChange={setNoSpecificTime}
                trackColor={{ false: '#3A4556', true: '#F0913A' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          {/* Done Button */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DueDateTimeModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#0B1A2F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#CAD4DF',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickChip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    backgroundColor: '#122440',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickChipSelected: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  quickChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  quickChipTextSelected: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipDisabledText: {
    color: '#8A97AB',
  },
  calendarCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 20,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  chevronBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CAD4DF',
  },
  weekHeadersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#8A97AB',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: '#3A4556',
  },
  selectedDayCircle: {
    backgroundColor: '#F0913A',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  otherMonthDayText: {
    color: '#475569',
  },
  selectedDayText: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A97AB',
    marginBottom: 12,
  },
  quickTimeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  doneBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
