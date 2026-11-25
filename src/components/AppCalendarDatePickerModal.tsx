import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface AppCalendarDatePickerModalProps {
  visible: boolean;
  initialDate?: string | Date;
  title?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  confirmText?: string;
  onClose: () => void;
  onConfirm: (selectedDate: Date, formattedDate: string, isoDate: string) => void;
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

const WEEKDAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const parseInputDate = (val?: string | Date): Date => {
  if (!val) return new Date();
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? new Date() : val;
  }

  const s = val.trim();

  // YYYY-MM-DD
  const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return new Date(
      parseInt(isoMatch[1], 10),
      parseInt(isoMatch[2], 10) - 1,
      parseInt(isoMatch[3], 10)
    );
  }

  // DD MMM YYYY (e.g. "14 Mar 2022")
  const dayMonthYearMatch = s.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
  if (dayMonthYearMatch) {
    const day = parseInt(dayMonthYearMatch[1], 10);
    const mStr = dayMonthYearMatch[2].toLowerCase();
    const monthIdx = MONTHS_SHORT.findIndex(
      (m) => m.toLowerCase() === mStr.slice(0, 3)
    );
    const year = parseInt(dayMonthYearMatch[3], 10);
    if (monthIdx >= 0) {
      return new Date(year, monthIdx, day);
    }
  }

  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatToDisplayDate = (d: Date): string => {
  const day = d.getDate();
  const month = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatToIsoDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  isDisabled: boolean;
}

export const AppCalendarDatePickerModal: React.FC<
  AppCalendarDatePickerModalProps
> = ({
  visible,
  initialDate,
  title = 'Date of birth',
  maximumDate = new Date(),
  minimumDate,
  confirmText = 'Done',
  onClose,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    parseInputDate(initialDate)
  );
  const [displayedYear, setDisplayedYear] = useState<number>(() =>
    parseInputDate(initialDate).getFullYear()
  );
  const [displayedMonth, setDisplayedMonth] = useState<number>(() =>
    parseInputDate(initialDate).getMonth()
  );
  const [viewMode, setViewMode] = useState<'calendar' | 'yearMonth'>('calendar');

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  useEffect(() => {
    if (visible) {
      const parsed = parseInputDate(initialDate);
      setSelectedDate(parsed);
      setDisplayedYear(parsed.getFullYear());
      setDisplayedMonth(parsed.getMonth());
      setViewMode('calendar');
    }
  }, [initialDate, visible]);

  // Year list for quick Year selector (from current year down to 1980)
  const availableYears = useMemo(() => {
    const currentYear = maximumDate ? maximumDate.getFullYear() : new Date().getFullYear();
    const minYear = minimumDate ? minimumDate.getFullYear() : 1980;
    const years: number[] = [];
    for (let y = currentYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [maximumDate, minimumDate]);

  // Navigation chevrons
  const handlePrevMonth = useCallback(() => {
    if (displayedMonth === 0) {
      setDisplayedMonth(11);
      setDisplayedYear((y) => y - 1);
    } else {
      setDisplayedMonth((m) => m - 1);
    }
  }, [displayedMonth]);

  const handleNextMonth = useCallback(() => {
    // If next month would exceed maximumDate
    if (maximumDate) {
      const nextDate =
        displayedMonth === 11
          ? new Date(displayedYear + 1, 0, 1)
          : new Date(displayedYear, displayedMonth + 1, 1);
      if (
        nextDate.getFullYear() > maximumDate.getFullYear() ||
        (nextDate.getFullYear() === maximumDate.getFullYear() &&
          nextDate.getMonth() > maximumDate.getMonth())
      ) {
        return;
      }
    }

    if (displayedMonth === 11) {
      setDisplayedMonth(0);
      setDisplayedYear((y) => y + 1);
    } else {
      setDisplayedMonth((m) => m + 1);
    }
  }, [displayedMonth, displayedYear, maximumDate]);

  // Calendar cells matrix
  const calendarCells = useMemo<CalendarCell[]>(() => {
    const firstDay = new Date(displayedYear, displayedMonth, 1);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
    const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(displayedYear, displayedMonth, 0).getDate();

    const cells: CalendarCell[] = [];

    // Preceding days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevYear = displayedMonth === 0 ? displayedYear - 1 : displayedYear;
      const prevMonth = displayedMonth === 0 ? 11 : displayedMonth - 1;
      const cellDate = new Date(prevYear, prevMonth, day);
      const isPastMax = maximumDate ? cellDate > maximumDate : false;
      const isBeforeMin = minimumDate ? cellDate < minimumDate : false;

      cells.push({
        key: `prev-${prevYear}-${prevMonth}-${day}`,
        year: prevYear,
        month: prevMonth,
        day,
        isCurrentMonth: false,
        isToday: isSameDay(cellDate, today),
        isSelected: isSameDay(cellDate, selectedDate),
        isDisabled: isPastMax || isBeforeMin,
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(displayedYear, displayedMonth, day);
      const isPastMax = maximumDate ? cellDate > maximumDate : false;
      const isBeforeMin = minimumDate ? cellDate < minimumDate : false;

      cells.push({
        key: `curr-${displayedYear}-${displayedMonth}-${day}`,
        year: displayedYear,
        month: displayedMonth,
        day,
        isCurrentMonth: true,
        isToday: isSameDay(cellDate, today),
        isSelected: isSameDay(cellDate, selectedDate),
        isDisabled: isPastMax || isBeforeMin,
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
      const isPastMax = maximumDate ? cellDate > maximumDate : false;
      const isBeforeMin = minimumDate ? cellDate < minimumDate : false;

      cells.push({
        key: `next-${nextYear}-${nextMonth}-${day}`,
        year: nextYear,
        month: nextMonth,
        day,
        isCurrentMonth: false,
        isToday: isSameDay(cellDate, today),
        isSelected: isSameDay(cellDate, selectedDate),
        isDisabled: isPastMax || isBeforeMin,
      });
    }

    return cells;
  }, [displayedYear, displayedMonth, selectedDate, today, maximumDate, minimumDate]);

  const handleDayPress = useCallback(
    (cell: CalendarCell) => {
      if (cell.isDisabled) return;

      const newDate = new Date(cell.year, cell.month, cell.day);
      setSelectedDate(newDate);

      // Auto-navigate if day is from adjacent month
      if (cell.month !== displayedMonth || cell.year !== displayedYear) {
        setDisplayedMonth(cell.month);
        setDisplayedYear(cell.year);
      }
    },
    [displayedMonth, displayedYear]
  );

  const handleDone = () => {
    const formatted = formatToDisplayDate(selectedDate);
    const iso = formatToIsoDate(selectedDate);
    onConfirm(selectedDate, formatted, iso);
    onClose();
  };

  const formattedSelectedPill = formatToDisplayDate(selectedDate);

  const isNextDisabled = useMemo(() => {
    if (!maximumDate) return false;
    const nextDate =
      displayedMonth === 11
        ? new Date(displayedYear + 1, 0, 1)
        : new Date(displayedYear, displayedMonth + 1, 1);
    return (
      nextDate.getFullYear() > maximumDate.getFullYear() ||
      (nextDate.getFullYear() === maximumDate.getFullYear() &&
        nextDate.getMonth() > maximumDate.getMonth())
    );
  }, [displayedMonth, displayedYear, maximumDate]);

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
          accessibilityLabel="Close date of birth picker"
        />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
        >
          {/* Top Drag Handle */}
          <View style={styles.handle} />

          {/* Modal Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Selected Date Chip */}
          <View style={styles.selectedPillRow}>
            <TouchableOpacity
              style={styles.selectedChip}
              onPress={() => setViewMode('calendar')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Selected date: ${formattedSelectedPill}`}
            >
              <Text style={styles.selectedChipText}>{formattedSelectedPill}</Text>
            </TouchableOpacity>
          </View>

          {/* View Mode: Calendar Matrix */}
          {viewMode === 'calendar' ? (
            <View style={styles.calendarCard}>
              {/* Month & Year Navigation Header */}
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

                <TouchableOpacity
                  style={styles.monthTitleButton}
                  onPress={() => setViewMode('yearMonth')}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`Select year or month, currently ${MONTH_NAMES[displayedMonth]} ${displayedYear}`}
                >
                  <Text style={styles.monthTitle}>
                    {`${MONTH_NAMES[displayedMonth]} ${displayedYear}`}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={16}
                    color="#F0913A"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chevronBtn, isNextDisabled && styles.chevronDisabled]}
                  onPress={handleNextMonth}
                  disabled={isNextDisabled}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Next month"
                >
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={isNextDisabled ? '#3A4D6B' : '#CAD4DF'}
                  />
                </TouchableOpacity>
              </View>

              {/* Day of Week Headers (M T W T F S S) */}
              <View style={styles.weekHeadersRow}>
                {WEEKDAY_HEADERS.map((letter, idx) => (
                  <Text key={idx} style={styles.weekHeaderText}>
                    {letter}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {calendarCells.map((cell) => {
                  return (
                    <TouchableOpacity
                      key={cell.key}
                      style={styles.dayCell}
                      onPress={() => handleDayPress(cell)}
                      disabled={cell.isDisabled}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`${cell.day} ${MONTH_NAMES[cell.month]} ${cell.year}`}
                    >
                      <View
                        style={[
                          styles.dayCircle,
                          !cell.isSelected && cell.isToday && styles.todayCircle,
                          cell.isSelected && styles.selectedDayCircle,
                          cell.isDisabled && styles.disabledDayCircle,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            !cell.isCurrentMonth && styles.otherMonthDayText,
                            cell.isSelected && styles.selectedDayText,
                            cell.isDisabled && styles.disabledDayText,
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
          ) : (
            /* View Mode: Fast Year & Month Picker */
            <View style={styles.yearMonthCard}>
              <View style={styles.yearMonthHeader}>
                <Text style={styles.yearMonthTitle}>Select Year & Month</Text>
                <TouchableOpacity
                  onPress={() => setViewMode('calendar')}
                  style={styles.yearMonthCloseBtn}
                >
                  <Text style={styles.yearMonthDoneText}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* Months Grid */}
              <Text style={styles.selectorSectionLabel}>MONTH</Text>
              <View style={styles.monthsGrid}>
                {MONTHS_SHORT.map((mName, mIdx) => {
                  const isSelectedMonth = displayedMonth === mIdx;
                  return (
                    <TouchableOpacity
                      key={mName}
                      style={[
                        styles.monthChip,
                        isSelectedMonth && styles.monthChipSelected,
                      ]}
                      onPress={() => setDisplayedMonth(mIdx)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.monthChipText,
                          isSelectedMonth && styles.monthChipTextSelected,
                        ]}
                      >
                        {mName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Years Scrollable Row */}
              <Text style={styles.selectorSectionLabel}>YEAR</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.yearsScrollRow}
              >
                {availableYears.map((yr) => {
                  const isSelectedYear = displayedYear === yr;
                  return (
                    <TouchableOpacity
                      key={yr}
                      style={[
                        styles.yearChip,
                        isSelectedYear && styles.yearChipSelected,
                      ]}
                      onPress={() => setDisplayedYear(yr)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.yearChipText,
                          isSelectedYear && styles.yearChipTextSelected,
                        ]}
                      >
                        {yr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Bottom Pinned Done Button */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={handleDone}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={confirmText}
          >
            <Text style={styles.doneBtnText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AppCalendarDatePickerModal;

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
    backgroundColor: '#122440',
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
    marginBottom: 14,
  },
  selectedPillRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  selectedChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1A2F',
  },
  calendarCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    padding: 14,
    marginBottom: 18,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chevronBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronDisabled: {
    opacity: 0.35,
  },
  monthTitleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weekHeadersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 1,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: '#3A4D6B',
  },
  selectedDayCircle: {
    backgroundColor: '#F0913A',
    borderWidth: 0,
  },
  disabledDayCircle: {
    opacity: 0.25,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    includeFontPadding: false,
    textAlign: 'center',
  },
  otherMonthDayText: {
    color: '#4B5970',
  },
  selectedDayText: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  disabledDayText: {
    color: '#4B5970',
  },
  yearMonthCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    padding: 14,
    marginBottom: 18,
  },
  yearMonthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  yearMonthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  yearMonthCloseBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  yearMonthDoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F0913A',
  },
  selectorSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#8A97AB',
    marginBottom: 8,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  monthChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: '#2A3C55',
    backgroundColor: '#162842',
  },
  monthChipSelected: {
    borderColor: '#F0913A',
    backgroundColor: '#F0913A',
  },
  monthChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  monthChipTextSelected: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  yearsScrollRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: '#2A3C55',
    backgroundColor: '#162842',
  },
  yearChipSelected: {
    borderColor: '#F0913A',
    backgroundColor: '#F0913A',
  },
  yearChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  yearChipTextSelected: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  doneBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1A2F',
  },
});
