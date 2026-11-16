import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { CalendarEvent, CalendarTaskDue } from '../types';

export interface DayViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  events: CalendarEvent[];
  tasksDue: CalendarTaskDue[];
  onSelectEvent: (event: CalendarEvent) => void;
  onToggleTask: (taskId: string) => void;
  onAddEvent: () => void;
}

const WEEK_DAYS = [
  { dayName: 'MON', dayNum: 26, dateStr: '2026-10-26', dots: ['#10B981'] },
  { dayName: 'TUE', dayNum: 27, dateStr: '2026-10-27', dots: [] },
  { dayName: 'WED', dayNum: 28, dateStr: '2026-10-28', dots: ['#F59E0B'] },
  { dayName: 'THU', dayNum: 29, dateStr: '2026-10-29', dots: [] },
  {
    dayName: 'FRI',
    dayNum: 30,
    dateStr: '2026-10-30',
    dots: ['#06B6D4', '#3B82F6', '#10B981'],
  },
  {
    dayName: 'SAT',
    dayNum: 31,
    dateStr: '2026-10-31',
    dots: ['#F59E0B', '#A855F7'],
  },
  { dayName: 'SUN', dayNum: 1, dateStr: '2026-11-01', dots: [] },
];

export const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  onSelectDate,
  events,
  tasksDue,
  onSelectEvent,
  onToggleTask,
  onAddEvent,
}) => {
  // Filter events for selected day
  const dayEvents = events.filter((e) => e.date === selectedDate);
  const isToday = selectedDate === '2026-10-30';

  // Date format label
  const getDateLabel = () => {
    switch (selectedDate) {
      case '2026-10-26':
        return 'Monday, 26 October';
      case '2026-10-27':
        return 'Tuesday, 27 October';
      case '2026-10-28':
        return 'Wednesday, 28 October';
      case '2026-10-29':
        return 'Thursday, 29 October';
      case '2026-10-30':
        return 'Friday, 30 October';
      case '2026-10-31':
        return 'Saturday, 31 October';
      case '2026-11-01':
        return 'Sunday, 1 November';
      case '2026-11-02':
        return 'Monday, 2 November';
      default:
        return 'Friday, 30 October';
    }
  };

  const handlePrevDay = () => {
    const idx = WEEK_DAYS.findIndex((d) => d.dateStr === selectedDate);
    if (idx > 0) {
      onSelectDate(WEEK_DAYS[idx - 1].dateStr);
    }
  };

  const handleNextDay = () => {
    const idx = WEEK_DAYS.findIndex((d) => d.dateStr === selectedDate);
    if (idx >= 0 && idx < WEEK_DAYS.length - 1) {
      onSelectDate(WEEK_DAYS[idx + 1].dateStr);
    }
  };

  // Determine timeline slots
  const timeSlots = useMemo(() => {
    const hasMorningEvents = dayEvents.some((e) => e.startTime.includes('AM'));
    if (hasMorningEvents) {
      return [
        '9 AM',
        '10 AM',
        '11 AM',
        '12 PM',
        '1 PM',
        '2 PM',
        '3 PM',
        '4 PM',
        '5 PM',
        '6 PM',
        '7 PM',
        '8 PM',
        '9 PM',
        '10 PM',
      ];
    }
    return [
      '1 PM',
      '2 PM',
      '3 PM',
      '4 PM',
      '5 PM',
      '6 PM',
      '7 PM',
      '8 PM',
      '9 PM',
      '10 PM',
    ];
  }, [dayEvents]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Date Navigation Row: "Friday, 30 October" on left, "<" & ">" on right */}
      <View style={styles.navRow}>
        <Text style={styles.navDateTitle}>{getDateLabel()}</Text>

        <View style={styles.chevronsGroup}>
          <TouchableOpacity
            style={styles.navChevron}
            onPress={handlePrevDay}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Previous day"
          >
            <Feather name="chevron-left" size={18} color="#CAD4DF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navChevron}
            onPress={handleNextDay}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Next day"
          >
            <Feather name="chevron-right" size={18} color="#CAD4DF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mini Week Strip (MON – SUN) */}
      <View style={styles.weekStrip}>
        {WEEK_DAYS.map((w) => {
          const isSelected = selectedDate === w.dateStr;
          return (
            <TouchableOpacity
              key={w.dateStr}
              style={styles.weekDayCol}
              onPress={() => onSelectDate(w.dateStr)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${w.dayName} ${w.dayNum}`}
            >
              <Text
                style={[
                  styles.weekDayLabel,
                  isSelected && styles.weekDayLabelActive,
                ]}
              >
                {w.dayName}
              </Text>
              <View
                style={[
                  styles.weekNumCircle,
                  isSelected && styles.weekNumCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.weekNumText,
                    isSelected && styles.weekNumTextActive,
                  ]}
                >
                  {w.dayNum}
                </Text>
              </View>

              {/* Event Dots */}
              <View style={styles.dotsRow}>
                {w.dots.map((dotColor, dIdx) => (
                  <View
                    key={dIdx}
                    style={[styles.eventDot, { backgroundColor: dotColor }]}
                  />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tasks Due Today (CAL-01) */}
      {tasksDue.length > 0 && isToday && (
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <View style={styles.taskBadgeDot} />
            <Text style={styles.tasksHeaderTitle}>
              {`TASKS DUE TODAY · ${tasksDue.length}`}
            </Text>
          </View>

          <View style={styles.tasksCard}>
            {tasksDue.map((t, idx) => (
              <View
                key={t.id}
                style={[styles.taskRow, idx > 0 && styles.taskRowDivider]}
              >
                <TouchableOpacity
                  style={styles.taskCheckTouch}
                  onPress={() => onToggleTask(t.id)}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: t.isCompleted }}
                  accessibilityLabel={`${t.title}, ${
                    t.isCompleted ? 'completed' : 'incomplete'
                  }`}
                >
                  <View
                    style={[
                      styles.taskCheckbox,
                      t.isCompleted && styles.taskCheckboxCompleted,
                    ]}
                  >
                    {t.isCompleted && (
                      <Feather name="check" size={12} color="#0B1A2F" />
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.taskTextCol}>
                  <Text
                    style={[
                      styles.taskTitle,
                      t.isCompleted && styles.taskTitleCompleted,
                    ]}
                  >
                    {t.title}
                  </Text>
                  <Text
                    style={[
                      styles.taskSubtitle,
                      t.isOverdue && styles.taskSubtitleOverdue,
                    ]}
                  >
                    {t.isOverdue
                      ? `${t.overdueText || 'Overdue by 2 days'} · ${t.assignee}`
                      : `Today · ${t.assignee}`}
                  </Text>
                </View>

                {/* Priority Red Dot */}
                <View style={styles.priorityDot} />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Empty State when no events (CAL-04) */}
      {dayEvents.length === 0 && (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Feather name="calendar" size={32} color="#F0913A" />
          </View>
          <Text style={styles.emptyTitle}>
            {`Nothing planned for ${getDateLabel()}`}
          </Text>
          <Text style={styles.emptySubtitle}>
            Enjoy your free time or add an event to keep everyone in sync.
          </Text>
          <TouchableOpacity
            style={styles.addEventBtn}
            onPress={onAddEvent}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add an event"
          >
            <Feather
              name="plus"
              size={18}
              color="#FFFFFF"
              style={styles.addBtnIcon}
            />
            <Text style={styles.addEventBtnText}>Add an event</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hourly Agenda Timeline (CAL-01) */}
      {dayEvents.length > 0 && (
        <View style={styles.timelineContainer}>
          {timeSlots.map((slot) => {
            const slotHourPrefix = slot.split(' ')[0];
            const slotPeriod = slot.split(' ')[1];
            const matchedEvents = dayEvents.filter((e) => {
              const [eHour, eRest] = e.startTime.split(':');
              const ePeriod = eRest?.split(' ')[1];
              return eHour === slotHourPrefix && ePeriod === slotPeriod;
            });

            const showCurrentTime = isToday && slot === '2 PM';

            return (
              <View key={slot} style={styles.slotRow}>
                {/* Time Label Column */}
                <View style={styles.timeLabelCol}>
                  <Text style={styles.slotTimeText}>{slot}</Text>
                </View>

                {/* Slot Content Column (Dividers & Event Cards) */}
                <View style={styles.slotContentCol}>
                  {showCurrentTime ? (
                    <View style={styles.currentTimeRow}>
                      <View style={styles.currentTimeDot} />
                      <View style={styles.currentTimeLine} />
                    </View>
                  ) : (
                    <View style={styles.slotLine} />
                  )}

                  {/* Render Event Cards */}
                  {matchedEvents.map((evt) => (
                    <TouchableOpacity
                      key={evt.id}
                      style={[
                        styles.eventCard,
                        { borderLeftColor: evt.categoryColor || '#3B82F6' },
                      ]}
                      onPress={() => onSelectEvent(evt)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`${evt.title}, ${evt.formattedTime}`}
                    >
                      <View style={styles.eventTopRow}>
                        <Text style={styles.eventTitle}>{evt.title}</Text>
                        {evt.forMemberInitial && (
                          <View
                            style={[
                              styles.memberChip,
                              {
                                backgroundColor:
                                  evt.forMemberColor || '#9333EA',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.memberChipInitial,
                                { color: evt.forMemberTextColor || '#FFFFFF' },
                              ]}
                            >
                              {evt.forMemberInitial}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.eventTimeText}>
                        {evt.formattedTime}
                      </Text>

                      {Boolean(evt.location) && (
                        <View style={styles.eventLocationRow}>
                          <Feather name="map-pin" size={12} color="#8A97AB" />
                          <Text
                            style={styles.eventLocationText}
                            numberOfLines={1}
                          >
                            {evt.location}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

export default DayView;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 150,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  navDateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  chevronsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navChevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#122440',
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    marginBottom: 20,
  },
  weekDayCol: {
    alignItems: 'center',
    width: 42,
  },
  weekDayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A97AB',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  weekDayLabelActive: {
    color: '#CAD4DF',
    fontWeight: '700',
  },
  weekNumCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  weekNumCircleActive: {
    backgroundColor: '#F0913A',
  },
  weekNumText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  weekNumTextActive: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 6,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  tasksSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 2,
  },
  taskBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0913A',
    marginRight: 8,
  },
  tasksHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
  },
  tasksCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  taskRowDivider: {
    borderTopWidth: 1,
    borderColor: '#1F3352',
  },
  taskCheckTouch: {
    marginRight: 12,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#2E415E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxCompleted: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  taskTextCol: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8A97AB',
  },
  taskSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    marginTop: 3,
  },
  taskSubtitleOverdue: {
    color: '#F0913A',
    fontWeight: '500',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F43F5E',
    marginLeft: 12,
  },
  timelineContainer: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  slotRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timeLabelCol: {
    width: 54,
    paddingTop: 0,
  },
  slotTimeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8A97AB',
  },
  slotContentCol: {
    flex: 1,
    position: 'relative',
    paddingBottom: 16,
  },
  slotLine: {
    position: 'absolute',
    top: 7,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#1F3352',
  },
  currentTimeRow: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  currentTimeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F0913A',
    marginLeft: -4,
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#F0913A',
  },
  eventCard: {
    backgroundColor: '#122440',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3352',
    borderLeftWidth: 4,
    padding: 12,
    marginTop: 14,
    marginBottom: 4,
  },
  eventTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  memberChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  memberChipInitial: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventTimeText: {
    fontSize: 13,
    color: '#CAD4DF',
    marginTop: 3,
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  eventLocationText: {
    fontSize: 12,
    color: '#8A97AB',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    marginTop: 12,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  addEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0913A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addBtnIcon: {
    marginRight: 6,
  },
  addEventBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
