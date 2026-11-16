import React, { useState, useMemo, useCallback } from 'react';
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

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Baseline reference date aligned with app mock date (Friday, 30 October 2026)
const APP_TODAY = new Date(2026, 9, 30);

const parseInitialDate = (dateStr?: string): Date => {
  if (!dateStr) return new Date(2026, 10, 2);

  const s = dateStr.toLowerCase().trim();
  if (s.includes('today')) {
    return new Date(APP_TODAY);
  }
  if (s.includes('tomorrow')) {
    const d = new Date(APP_TODAY);
    d.setDate(d.getDate() + 1);
    return d;
  }
  if (s.includes('weekend')) {
    const d = new Date(APP_TODAY);
    const daysUntilSat = (6 - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilSat);
    return d;
  }

  for (let m = 0; m < 12; m++) {
    const shortName = MONTHS_SHORT[m].toLowerCase();
    const fullName = MONTH_NAMES[m].toLowerCase();
    if (s.includes(shortName) || s.includes(fullName)) {
      const match = s.match(/\b(\d{1,2})\b/);
      const day = match ? parseInt(match[1], 10) : 1;
      const yearMatch = s.match(/\b(20\d\d)\b/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;
      return new Date(year, m, day);
    }
  }

  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(
      parseInt(isoMatch[1], 10),
      parseInt(isoMatch[2], 10) - 1,
      parseInt(isoMatch[3], 10)
    );
  }

  return new Date(2026, 10, 2);
};

const formatDisplayDate = (d: Date): string => {
  const dayName = DAYS_SHORT[d.getDay()];
  const dayNum = d.getDate();
  const monthName = MONTHS_SHORT[d.getMonth()];
  return `${dayName}, ${dayNum} ${monthName}`;
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

interface CalendarCell {
  key: string;
  year: number;
  month: number;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const CUSTOM_HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const CUSTOM_MINUTES = ['00', '15', '30', '45'];

const DueDateTimeModal: React.FC<DueDateTimeModalProps> = ({
  visible,
  initialDate = 'Mon, 2 Nov',
  initialTime = '6:00 PM',
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();

  // Selected date state
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    parseInitialDate(initialDate)
  );

  // Month & year currently shown on calendar
  const [displayedYear, setDisplayedYear] = useState<number>(() =>
    parseInitialDate(initialDate).getFullYear()
  );
  const [displayedMonth, setDisplayedMonth] = useState<number>(() =>
    parseInitialDate(initialDate).getMonth()
  );

  // Quick Time state
  const [selectedTimeId, setSelectedTimeId] = useState<string>('evening');
  const [selectedTimeStr, setSelectedTimeStr] = useState<string>(initialTime);
  const [noSpecificTime, setNoSpecificTime] = useState<boolean>(false);

  // Custom Time Picker state
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [customHour, setCustomHour] = useState<number>(8);
  const [customMinute, setCustomMinute] = useState<string>('00');
  const [customPeriod, setCustomPeriod] = useState<'AM' | 'PM'>('PM');

  // Sync state on open
  React.useEffect(() => {
    if (visible) {
      const parsed = parseInitialDate(initialDate);
      setSelectedDate(parsed);
      setDisplayedYear(parsed.getFullYear());
      setDisplayedMonth(parsed.getMonth());

      if (initialTime.includes('9:00')) {
        setSelectedTimeId('morning');
        setSelectedTimeStr('9:00 AM');
      } else if (initialTime.includes('2:00')) {
        setSelectedTimeId('afternoon');
        setSelectedTimeStr('2:00 PM');
      } else if (initialTime.includes('6:00')) {
        setSelectedTimeId('evening');
        setSelectedTimeStr('6:00 PM');
      } else {
        setSelectedTimeId('custom');
        setSelectedTimeStr(initialTime);
      }
      setShowTimePicker(false);
    }
  }, [initialDate, initialTime, visible]);

  // Compute reference dates for quick chips
  const todayDate = useMemo(() => new Date(APP_TODAY), []);
  const tomorrowDate = useMemo(() => {
    const d = new Date(APP_TODAY);
    d.setDate(d.getDate() + 1);
    return d;
  }, []);
  const weekendDate = useMemo(() => {
    const d = new Date(APP_TODAY);
    const daysUntilSat = (6 - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilSat);
    return d;
  }, []);

  const isSelectedToday = isSameDay(selectedDate, todayDate);
  const isSelectedTomorrow = isSameDay(selectedDate, tomorrowDate);
  const isSelectedWeekend = isSameDay(selectedDate, weekendDate);
  const isPresetSelected = isSelectedToday || isSelectedTomorrow || isSelectedWeekend;

  // Generate dynamic calendar matrix for displayedYear and displayedMonth
  const calendarCells = useMemo<CalendarCell[]>(() => {
    const firstDay = new Date(displayedYear, displayedMonth, 1);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday=0..Sunday=6
    const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(displayedYear, displayedMonth, 0).getDate();

    const cells: CalendarCell[] = [];

    // Preceding days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevYear = displayedMonth === 0 ? displayedYear - 1 : displayedYear;
      const prevMonth = displayedMonth === 0 ? 11 : displayedMonth - 1;
      const cellDate = new Date(prevYear, prevMonth, day);
      cells.push({
        key: `prev-${prevYear}-${prevMonth}-${day}`,
        year: prevYear,
        month: prevMonth,
        day,
        isCurrentMonth: false,
        isToday: isSameDay(cellDate, APP_TODAY),
        isSelected: isSameDay(cellDate, selectedDate),
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(displayedYear, displayedMonth, day);
      cells.push({
        key: `curr-${displayedYear}-${displayedMonth}-${day}`,
        year: displayedYear,
        month: displayedMonth,
        day,
        isCurrentMonth: true,
        isToday: isSameDay(cellDate, APP_TODAY),
        isSelected: isSameDay(cellDate, selectedDate),
      });
    }

    // Following days from next month
    const totalRows = Math.ceil(cells.length / 7);
    const totalCells = totalRows * 7;
    const remaining = totalCells - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextYear = displayedMonth === 11 ? displayedYear + 1 : displayedYear;
      const nextMonth = displayedMonth === 11 ? 0 : displayedMonth + 1;
      const cellDate = new Date(nextYear, nextMonth, day);
      cells.push({
        key: `next-${nextYear}-${nextMonth}-${day}`,
        year: nextYear,
        month: nextMonth,
        day,
        isCurrentMonth: false,
        isToday: isSameDay(cellDate, APP_TODAY),
        isSelected: isSameDay(cellDate, selectedDate),
      });
    }

    return cells;
  }, [displayedYear, displayedMonth, selectedDate]);

  // Calendar Navigation
  const handlePrevMonth = useCallback(() => {
    if (displayedMonth === 0) {
      setDisplayedMonth(11);
      setDisplayedYear((y) => y - 1);
    } else {
      setDisplayedMonth((m) => m - 1);
    }
  }, [displayedMonth]);

  const handleNextMonth = useCallback(() => {
    if (displayedMonth === 11) {
      setDisplayedMonth(0);
      setDisplayedYear((y) => y + 1);
    } else {
      setDisplayedMonth((m) => m + 1);
    }
  }, [displayedMonth]);

  // Day Selection
  const handleDayPress = useCallback((cell: CalendarCell) => {
    const newDate = new Date(cell.year, cell.month, cell.day);
    setSelectedDate(newDate);

    // If day from prev/next month was clicked, auto-navigate
    if (cell.month !== displayedMonth || cell.year !== displayedYear) {
      setDisplayedMonth(cell.month);
      setDisplayedYear(cell.year);
    }
  }, [displayedMonth, displayedYear]);

  // Quick Date chip click handlers
  const handleSelectToday = () => {
    setSelectedDate(todayDate);
    setDisplayedMonth(todayDate.getMonth());
    setDisplayedYear(todayDate.getFullYear());
  };

  const handleSelectTomorrow = () => {
    setSelectedDate(tomorrowDate);
    setDisplayedMonth(tomorrowDate.getMonth());
    setDisplayedYear(tomorrowDate.getFullYear());
  };

  const handleSelectWeekend = () => {
    setSelectedDate(weekendDate);
    setDisplayedMonth(weekendDate.getMonth());
    setDisplayedYear(weekendDate.getFullYear());
  };

  const handleSelectCustomPill = () => {
    setDisplayedMonth(selectedDate.getMonth());
    setDisplayedYear(selectedDate.getFullYear());
  };

  // Time Chip Handlers
  const handleQuickTimePress = (id: string, timeString: string) => {
    setSelectedTimeId(id);
    setSelectedTimeStr(timeString);
    setNoSpecificTime(false);
    setShowTimePicker(false);
  };

  const handleOpenTimePicker = () => {
    setSelectedTimeId('custom');
    setShowTimePicker(true);
    setNoSpecificTime(false);
  };

  const handleApplyCustomTime = () => {
    const formattedTime = `${customHour}:${customMinute} ${customPeriod}`;
    setSelectedTimeStr(formattedTime);
    setSelectedTimeId('custom');
    setShowTimePicker(false);
  };

  const handleDone = () => {
    let dateLabel = formatDisplayDate(selectedDate);
    if (isSelectedToday) {
      dateLabel = 'Today';
    } else if (isSelectedTomorrow) {
      dateLabel = 'Tomorrow';
    }

    let finalFormatted = dateLabel;
    let finalTimeStr: string | undefined;

    if (!noSpecificTime) {
      finalTimeStr = selectedTimeStr;
      finalFormatted = `${dateLabel} · by ${finalTimeStr}`;
    }

    onSave(dateLabel, finalFormatted, finalTimeStr);
    onClose();
  };

  const formattedSelectedPill = formatDisplayDate(selectedDate);

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
          accessibilityRole="button"
          accessibilityLabel="Close date picker"
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
            <View style={styles.quickChipsContainer}>
              <View style={styles.quickChipsRow}>
                <TouchableOpacity
                  style={[
                    styles.quickChip,
                    isSelectedToday && styles.quickChipSelected,
                  ]}
                  onPress={handleSelectToday}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Due today"
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      isSelectedToday && styles.quickChipTextSelected,
                    ]}
                  >
                    Today
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.quickChip,
                    isSelectedTomorrow && styles.quickChipSelected,
                  ]}
                  onPress={handleSelectTomorrow}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Due tomorrow"
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      isSelectedTomorrow && styles.quickChipTextSelected,
                    ]}
                  >
                    Tomorrow
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.quickChip,
                    isSelectedWeekend && styles.quickChipSelected,
                  ]}
                  onPress={handleSelectWeekend}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Due this weekend"
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      isSelectedWeekend && styles.quickChipTextSelected,
                    ]}
                  >
                    This weekend
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Row 2: Selected Date Chip (Highlighted Orange when custom date) */}
              <View style={styles.selectedPillRow}>
                <TouchableOpacity
                  style={[
                    styles.quickChip,
                    !isPresetSelected && styles.quickChipSelected,
                  ]}
                  onPress={handleSelectCustomPill}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Selected date: ${formattedSelectedPill}`}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      !isPresetSelected && styles.quickChipTextSelected,
                    ]}
                  >
                    {formattedSelectedPill}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Interactive Calendar Card */}
            <View style={styles.calendarCard}>
              {/* Header with Month / Year and Chevrons */}
              <View style={styles.calendarHeaderRow}>
                <TouchableOpacity
                  style={styles.chevronBtn}
                  onPress={handlePrevMonth}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Previous month"
                >
                  <Feather name="chevron-left" size={20} color="#CAD4DF" />
                </TouchableOpacity>

                <Text style={styles.monthTitle}>
                  {`${MONTH_NAMES[displayedMonth]} ${displayedYear}`}
                </Text>

                <TouchableOpacity
                  style={styles.chevronBtn}
                  onPress={handleNextMonth}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Next month"
                >
                  <Feather name="chevron-right" size={20} color="#CAD4DF" />
                </TouchableOpacity>
              </View>

              {/* Day of Week Labels (M T W T F S S) */}
              <View style={styles.weekHeadersRow}>
                {WEEKDAY_HEADERS.map((letter, idx) => (
                  <Text key={idx} style={styles.weekHeaderText}>
                    {letter}
                  </Text>
                ))}
              </View>

              {/* Fully Dynamic Days Grid */}
              <View style={styles.daysGrid}>
                {calendarCells.map((cell) => {
                  return (
                    <TouchableOpacity
                      key={cell.key}
                      style={styles.dayCell}
                      onPress={() => handleDayPress(cell)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`${cell.day} ${MONTH_NAMES[cell.month]} ${cell.year}`}
                    >
                      <View
                        style={[
                          styles.dayCircle,
                          cell.isToday && styles.todayCircle,
                          cell.isSelected && styles.selectedDayCircle,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            !cell.isCurrentMonth && styles.otherMonthDayText,
                            cell.isSelected && styles.selectedDayText,
                          ]}
                        >
                          {cell.day}
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
              {/* Morning 9:00 */}
              <TouchableOpacity
                style={[
                  styles.quickChip,
                  !noSpecificTime &&
                    selectedTimeId === 'morning' &&
                    styles.quickChipSelected,
                  noSpecificTime && styles.chipDisabled,
                ]}
                onPress={() => handleQuickTimePress('morning', '9:00 AM')}
                disabled={noSpecificTime}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Morning 9:00 AM"
              >
                <Text
                  style={[
                    styles.quickChipText,
                    !noSpecificTime &&
                      selectedTimeId === 'morning' &&
                      styles.quickChipTextSelected,
                    noSpecificTime && styles.chipDisabledText,
                  ]}
                >
                  Morning 9:00
                </Text>
              </TouchableOpacity>

              {/* Afternoon 2:00 */}
              <TouchableOpacity
                style={[
                  styles.quickChip,
                  !noSpecificTime &&
                    selectedTimeId === 'afternoon' &&
                    styles.quickChipSelected,
                  noSpecificTime && styles.chipDisabled,
                ]}
                onPress={() => handleQuickTimePress('afternoon', '2:00 PM')}
                disabled={noSpecificTime}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Afternoon 2:00 PM"
              >
                <Text
                  style={[
                    styles.quickChipText,
                    !noSpecificTime &&
                      selectedTimeId === 'afternoon' &&
                      styles.quickChipTextSelected,
                    noSpecificTime && styles.chipDisabledText,
                  ]}
                >
                  Afternoon 2:00
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickTimeRow}>
              {/* Evening 6:00 */}
              <TouchableOpacity
                style={[
                  styles.quickChip,
                  !noSpecificTime &&
                    selectedTimeId === 'evening' &&
                    styles.quickChipSelected,
                  noSpecificTime && styles.chipDisabled,
                ]}
                onPress={() => handleQuickTimePress('evening', '6:00 PM')}
                disabled={noSpecificTime}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Evening 6:00 PM"
              >
                <Text
                  style={[
                    styles.quickChipText,
                    !noSpecificTime &&
                      selectedTimeId === 'evening' &&
                      styles.quickChipTextSelected,
                    noSpecificTime && styles.chipDisabledText,
                  ]}
                >
                  Evening 6:00
                </Text>
              </TouchableOpacity>

              {/* Pick a time */}
              <TouchableOpacity
                style={[
                  styles.quickChip,
                  !noSpecificTime &&
                    selectedTimeId === 'custom' &&
                    styles.quickChipSelected,
                  noSpecificTime && styles.chipDisabled,
                ]}
                onPress={handleOpenTimePicker}
                disabled={noSpecificTime}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Pick a time"
              >
                <Text
                  style={[
                    styles.quickChipText,
                    !noSpecificTime &&
                      selectedTimeId === 'custom' &&
                      styles.quickChipTextSelected,
                    noSpecificTime && styles.chipDisabledText,
                  ]}
                >
                  {selectedTimeId === 'custom' && selectedTimeStr
                    ? selectedTimeStr
                    : 'Pick a time'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Interactive Custom Time Picker Drawer */}
            {showTimePicker && !noSpecificTime && (
              <View style={styles.timePickerCard}>
                <Text style={styles.timePickerTitle}>Select Custom Time</Text>

                {/* Hours Row */}
                <Text style={styles.timePickerSubLabel}>Hour</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.timePickerScrollRow}
                >
                  {CUSTOM_HOURS.map((hr) => {
                    const isHrActive = customHour === hr;
                    return (
                      <TouchableOpacity
                        key={hr}
                        style={[
                          styles.timeNumberPill,
                          isHrActive && styles.timeNumberPillActive,
                        ]}
                        onPress={() => setCustomHour(hr)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.timeNumberText,
                            isHrActive && styles.timeNumberTextActive,
                          ]}
                        >
                          {hr}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Minutes & AM/PM Row */}
                <View style={styles.minutePeriodRow}>
                  <View style={styles.minuteColumn}>
                    <Text style={styles.timePickerSubLabel}>Minute</Text>
                    <View style={styles.minutePillsRow}>
                      {CUSTOM_MINUTES.map((min) => {
                        const isMinActive = customMinute === min;
                        return (
                          <TouchableOpacity
                            key={min}
                            style={[
                              styles.timeNumberPill,
                              isMinActive && styles.timeNumberPillActive,
                            ]}
                            onPress={() => setCustomMinute(min)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.timeNumberText,
                                isMinActive && styles.timeNumberTextActive,
                              ]}
                            >
                              :{min}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.periodColumn}>
                    <Text style={styles.timePickerSubLabel}>Period</Text>
                    <View style={styles.periodPillsRow}>
                      {(['AM', 'PM'] as const).map((p) => {
                        const isPeriodActive = customPeriod === p;
                        return (
                          <TouchableOpacity
                            key={p}
                            style={[
                              styles.timeNumberPill,
                              isPeriodActive && styles.timeNumberPillActive,
                            ]}
                            onPress={() => setCustomPeriod(p)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.timeNumberText,
                                isPeriodActive && styles.timeNumberTextActive,
                              ]}
                            >
                              {p}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* Set Custom Time Button */}
                <TouchableOpacity
                  style={styles.applyTimeBtn}
                  onPress={handleApplyCustomTime}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyTimeBtnText}>
                    Set {customHour}:{customMinute} {customPeriod}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

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
            accessibilityRole="button"
            accessibilityLabel="Done"
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
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  quickChipsContainer: {
    marginBottom: 16,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  selectedPillRow: {
    flexDirection: 'row',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
    width: '14.28%',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 1,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: '#3A4D6B',
  },
  selectedDayCircle: {
    backgroundColor: '#F0913A',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  otherMonthDayText: {
    color: '#4B5970',
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
    marginBottom: 16,
  },
  timePickerCard: {
    backgroundColor: '#0F1E33',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 14,
    marginBottom: 16,
  },
  timePickerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CAD4DF',
    marginBottom: 8,
  },
  timePickerSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A97AB',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  timePickerScrollRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  minutePeriodRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  minuteColumn: {
    flex: 2,
  },
  minutePillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  periodColumn: {
    flex: 1,
  },
  periodPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  timeNumberPill: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: '#16283E',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeNumberPillActive: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  timeNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  timeNumberTextActive: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  applyTimeBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B3150',
    borderWidth: 1,
    borderColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  applyTimeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F0913A',
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
    color: '#FFFFFF',
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
