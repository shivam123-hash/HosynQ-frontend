import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface EventDateTimePickerModalProps {
  visible: boolean;
  mode: 'starts' | 'ends';
  initialDate?: string; // e.g. "Fri, 30 Oct"
  initialTime?: string; // e.g. "3:00 PM"
  isAllDay?: boolean;
  onClose: () => void;
  onSave: (dateFormatted: string, timeString: string) => void;
  asModal?: boolean;
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

// Reference baseline date aligned with HosynQ app (Friday, 30 October 2026)
const APP_TODAY = new Date(2026, 9, 30);

const parseDateString = (dateStr?: string): Date => {
  if (!dateStr) return new Date(APP_TODAY);

  const s = dateStr.toLowerCase().trim();
  if (s.includes('today')) return new Date(APP_TODAY);
  if (s.includes('tomorrow')) {
    const d = new Date(APP_TODAY);
    d.setDate(d.getDate() + 1);
    return d;
  }

  for (let m = 0; m < 12; m++) {
    const shortName = MONTHS_SHORT[m].toLowerCase();
    const fullName = MONTH_NAMES[m].toLowerCase();
    if (s.includes(shortName) || s.includes(fullName)) {
      const match = s.match(/\b(\d{1,2})\b/);
      const day = match ? parseInt(match[1], 10) : 30;
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

  return new Date(APP_TODAY);
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

const parseTimeString = (timeStr?: string) => {
  if (!timeStr) {
    return { hour: 3, minute: '00', period: 'PM' as const };
  }
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    let period: 'AM' | 'PM' = 'PM';
    if (match[3]) {
      period = match[3].toUpperCase() as 'AM' | 'PM';
    } else if (hour >= 12) {
      period = 'PM';
      if (hour > 12) hour -= 12;
    }
    if (hour === 0) hour = 12;
    return { hour, minute, period };
  }
  return { hour: 3, minute: '00', period: 'PM' as const };
};

const QUICK_TIMES = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '8:00 PM'];
const HOURS_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES_LIST = ['00', '15', '30', '45'];

export const EventDateTimePickerModal: React.FC<EventDateTimePickerModalProps> = ({
  visible,
  mode,
  initialDate = 'Fri, 30 Oct',
  initialTime = '3:00 PM',
  isAllDay = false,
  onClose,
  onSave,
  asModal = false,
}) => {
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    parseDateString(initialDate)
  );
  const [displayedYear, setDisplayedYear] = useState<number>(() =>
    parseDateString(initialDate).getFullYear()
  );
  const [displayedMonth, setDisplayedMonth] = useState<number>(() =>
    parseDateString(initialDate).getMonth()
  );

  const initialParsedTime = useMemo(
    () => parseTimeString(initialTime),
    [initialTime]
  );
  const [selectedHour, setSelectedHour] = useState<number>(
    initialParsedTime.hour
  );
  const [selectedMinute, setSelectedMinute] = useState<string>(
    initialParsedTime.minute
  );
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(
    initialParsedTime.period
  );

  useEffect(() => {
    if (visible) {
      const parsed = parseDateString(initialDate);
      setSelectedDate(parsed);
      setDisplayedYear(parsed.getFullYear());
      setDisplayedMonth(parsed.getMonth());

      const t = parseTimeString(initialTime);
      setSelectedHour(t.hour);
      setSelectedMinute(t.minute);
      setSelectedPeriod(t.period);
    }
  }, [visible, initialDate, initialTime]);

  if (!visible) return null;

  const currentFormattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

  const handlePrevMonth = () => {
    if (displayedMonth === 0) {
      setDisplayedMonth(11);
      setDisplayedYear((y) => y - 1);
    } else {
      setDisplayedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayedMonth === 11) {
      setDisplayedMonth(0);
      setDisplayedYear((y) => y + 1);
    } else {
      setDisplayedMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number, month: number, year: number) => {
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
  };

  const handleQuickChipPress = (offsetDays: number) => {
    const d = new Date(APP_TODAY);
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d);
    setDisplayedMonth(d.getMonth());
    setDisplayedYear(d.getFullYear());
  };

  const handleQuickTimePress = (timeStr: string) => {
    const t = parseTimeString(timeStr);
    setSelectedHour(t.hour);
    setSelectedMinute(t.minute);
    setSelectedPeriod(t.period);
  };

  const handleDone = () => {
    const formattedDate = formatDisplayDate(selectedDate);
    onSave(formattedDate, currentFormattedTime);
    onClose();
  };

  // Calendar cells generation
  const firstDay = new Date(displayedYear, displayedMonth, 1);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Mon=0..Sun=6
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(displayedYear, displayedMonth, 0).getDate();

  const cells = [];
  // Prev month filler
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevYear = displayedMonth === 0 ? displayedYear - 1 : displayedYear;
    const prevMonth = displayedMonth === 0 ? 11 : displayedMonth - 1;
    cells.push({
      key: `prev-${day}`,
      day,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      key: `curr-${d}`,
      day: d,
      month: displayedMonth,
      year: displayedYear,
      isCurrentMonth: true,
    });
  }
  // Next month filler
  const remaining = Math.ceil(cells.length / 7) * 7 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextYear = displayedMonth === 11 ? displayedYear + 1 : displayedYear;
    const nextMonth = displayedMonth === 11 ? 0 : displayedMonth + 1;
    cells.push({
      key: `next-${d}`,
      day: d,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
    });
  }

  const content = (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Dismiss date time picker"
      />

      <View
        style={[
          styles.sheetContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
      >
        <View style={styles.handle} />

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.sheetTitle}>
              {mode === 'starts' ? 'Starts' : 'Ends'}
            </Text>
            <Text style={styles.sheetSubtitle}>
              {formatDisplayDate(selectedDate)}
              {!isAllDay ? ` · ${currentFormattedTime}` : ' · All day'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close picker"
          >
            <Feather name="x" size={20} color="#8A97AB" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick Date Chips */}
          <View style={styles.chipsRow}>
            <TouchableOpacity
              style={[
                styles.chipBtn,
                isSameDay(selectedDate, APP_TODAY) && styles.chipBtnActive,
              ]}
              onPress={() => handleQuickChipPress(0)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isSameDay(selectedDate, APP_TODAY) && styles.chipTextActive,
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chipBtn}
              onPress={() => handleQuickChipPress(1)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText}>Tomorrow</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chipBtn}
              onPress={() => handleQuickChipPress(3)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText}>In 3 days</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chipBtn}
              onPress={() => handleQuickChipPress(7)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText}>Next week</Text>
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View style={styles.calendarCard}>
            <View style={styles.monthHeaderRow}>
              <Text style={styles.monthTitle}>
                {`${MONTH_NAMES[displayedMonth]} ${displayedYear}`}
              </Text>
              <View style={styles.monthNavBtns}>
                <TouchableOpacity
                  style={styles.navArrowBtn}
                  onPress={handlePrevMonth}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Previous month"
                >
                  <Feather name="chevron-left" size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navArrowBtn}
                  onPress={handleNextMonth}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Next month"
                >
                  <Feather name="chevron-right" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Weekday Labels */}
            <View style={styles.weekdaysRow}>
              {WEEKDAY_HEADERS.map((w, idx) => (
                <Text key={idx} style={styles.weekdayLabel}>
                  {w}
                </Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View style={styles.daysGrid}>
              {cells.map((cell) => {
                const cellDate = new Date(cell.year, cell.month, cell.day);
                const isSelected = isSameDay(cellDate, selectedDate);
                const isToday = isSameDay(cellDate, APP_TODAY);

                return (
                  <TouchableOpacity
                    key={cell.key}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() =>
                      handleSelectDay(cell.day, cell.month, cell.year)
                    }
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${cell.day} ${MONTH_NAMES[cell.month]}`}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        !cell.isCurrentMonth && styles.dayCellTextOtherMonth,
                        isSelected && styles.dayCellTextSelected,
                        isToday && !isSelected && styles.dayCellTextToday,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Time Selector Section (Only when not All-day) */}
          {!isAllDay && (
            <View style={styles.timeSection}>
              <Text style={styles.sectionHeader}>TIME</Text>

              {/* Quick Time Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickTimesRow}
              >
                {QUICK_TIMES.map((qt) => {
                  const isActive = currentFormattedTime === qt;
                  return (
                    <TouchableOpacity
                      key={qt}
                      style={[
                        styles.timeChip,
                        isActive && styles.timeChipActive,
                      ]}
                      onPress={() => handleQuickTimePress(qt)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          isActive && styles.timeChipTextActive,
                        ]}
                      >
                        {qt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Exact Hour / Minute / AM-PM Picker Card */}
              <View style={styles.timePickerCard}>
                {/* Hours row */}
                <Text style={styles.subLabel}>Hour</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.selectorRow}
                >
                  {HOURS_LIST.map((h) => {
                    const isHSelected = selectedHour === h;
                    return (
                      <TouchableOpacity
                        key={h}
                        style={[
                          styles.numPill,
                          isHSelected && styles.numPillSelected,
                        ]}
                        onPress={() => setSelectedHour(h)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.numPillText,
                            isHSelected && styles.numPillTextSelected,
                          ]}
                        >
                          {h}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Minutes & Period row */}
                <View style={styles.minPeriodRow}>
                  <View style={styles.minCol}>
                    <Text style={styles.subLabel}>Minute</Text>
                    <View style={styles.minButtonsRow}>
                      {MINUTES_LIST.map((m) => {
                        const isMSelected = selectedMinute === m;
                        return (
                          <TouchableOpacity
                            key={m}
                            style={[
                              styles.numPill,
                              isMSelected && styles.numPillSelected,
                            ]}
                            onPress={() => setSelectedMinute(m)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.numPillText,
                                isMSelected && styles.numPillTextSelected,
                              ]}
                            >
                              :{m}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.periodCol}>
                    <Text style={styles.subLabel}>Period</Text>
                    <View style={styles.periodSwitch}>
                      <TouchableOpacity
                        style={[
                          styles.periodBtn,
                          selectedPeriod === 'AM' && styles.periodBtnActive,
                        ]}
                        onPress={() => setSelectedPeriod('AM')}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.periodBtnText,
                            selectedPeriod === 'AM' &&
                              styles.periodBtnTextActive,
                          ]}
                        >
                          AM
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.periodBtn,
                          selectedPeriod === 'PM' && styles.periodBtnActive,
                        ]}
                        onPress={() => setSelectedPeriod('PM')}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.periodBtnText,
                            selectedPeriod === 'PM' &&
                              styles.periodBtnTextActive,
                          ]}
                        >
                          PM
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Bottom Done Button */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={handleDone}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Apply date and time"
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  if (asModal) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        {content}
      </Modal>
    );
  }

  return content;
};

export default EventDateTimePickerModal;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 12, 22, 0.7)',
  },
  sheetContainer: {
    backgroundColor: '#122440',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#1F3352',
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334866',
    alignSelf: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#8A97AB',
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A2E4E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#16284A',
    borderWidth: 1,
    borderColor: '#243A5E',
    marginRight: 8,
  },
  chipBtnActive: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  chipText: {
    fontSize: 13,
    color: '#CAD4DF',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarCard: {
    backgroundColor: '#0B1A2F',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 18,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  monthNavBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16284A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  weekdayLabel: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#78869A',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dayCellSelected: {
    backgroundColor: '#F0913A',
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dayCellTextOtherMonth: {
    color: '#3B4E6B',
  },
  dayCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayCellTextToday: {
    color: '#F0913A',
    fontWeight: '700',
  },
  timeSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78869A',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  quickTimesRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#16284A',
    borderWidth: 1,
    borderColor: '#243A5E',
    marginRight: 8,
  },
  timeChipActive: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  timeChipText: {
    fontSize: 13,
    color: '#CAD4DF',
    fontWeight: '600',
  },
  timeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timePickerCard: {
    backgroundColor: '#0B1A2F',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
  },
  subLabel: {
    fontSize: 12,
    color: '#78869A',
    fontWeight: '600',
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  numPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#16284A',
    marginRight: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  numPillSelected: {
    backgroundColor: '#F0913A',
  },
  numPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  numPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  minPeriodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  minCol: {
    flex: 1,
  },
  minButtonsRow: {
    flexDirection: 'row',
  },
  periodCol: {
    marginLeft: 16,
  },
  periodSwitch: {
    flexDirection: 'row',
    backgroundColor: '#16284A',
    borderRadius: 12,
    padding: 3,
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  periodBtnActive: {
    backgroundColor: '#F0913A',
  },
  periodBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A97AB',
  },
  periodBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  doneBtn: {
    height: 48,
    borderRadius: 24,
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
