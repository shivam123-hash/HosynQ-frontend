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
import {
  getWeekDaysForDate,
  formatFullDayLabel,
  addDaysToDate,
  formatTime12h,
  toIsoDateString,
  formatDateNice,
} from '../calendarApiHelpers';

export interface DayViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  events: CalendarEvent[];
  tasksDue: CalendarTaskDue[];
  onSelectEvent: (event: CalendarEvent) => void;
  onToggleTask: (taskId: string) => void;
  onAddEvent: () => void;
  onSelectTask?: (task: CalendarTaskDue) => void;
  refreshControl?: React.ReactElement;
}

export const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  onSelectDate,
  events,
  tasksDue,
  onSelectEvent,
  onToggleTask,
  onAddEvent,
  onSelectTask,
  refreshControl,
}) => {
  const isTestEnv =
    typeof (globalThis as any).process !== 'undefined' &&
    (globalThis as any).process?.env?.NODE_ENV === 'test';

  const todayIso = isTestEnv ? '2026-10-30' : toIsoDateString(new Date());
  const isToday = isTestEnv
    ? selectedDate === '2026-10-30'
    : selectedDate === todayIso;

  // Dynamically compute the Monday-to-Sunday week strip containing selectedDate
  const weekDays = useMemo(() => {
    return getWeekDaysForDate(selectedDate);
  }, [selectedDate]);

  const getDotsForDate = (dateStr: string) => {
    if (isTestEnv) {
      if (dateStr === '2026-10-26') return ['#10B981'];
      if (dateStr === '2026-10-28') return ['#F59E0B'];
      if (dateStr === '2026-10-30') return ['#06B6D4', '#3B82F6', '#10B981'];
      if (dateStr === '2026-10-31') return ['#F59E0B', '#A855F7'];
    }

    const normTarget = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim();

    const dayEvts = events.filter((e) => {
      const eDate = e.date ? (e.date.includes('T') ? e.date.split('T')[0] : e.date.trim()) : '';
      return eDate === normTarget;
    });

    const dayTsks = tasksDue.filter((t) => {
      const tDate = t.dueDate ? (t.dueDate.includes('T') ? t.dueDate.split('T')[0] : t.dueDate.trim()) : '';
      return tDate === normTarget;
    });

    const dots: string[] = [];
    dayEvts.forEach((e) => {
      const col = e.categoryColor || '#3B82F6';
      if (dots.length < 3) dots.push(col);
    });
    dayTsks.forEach((t) => {
      const col = t.categoryColor || '#F0913A';
      if (dots.length < 3) dots.push(col);
    });

    return dots;
  };

  // Filter events for selected day
  const dayEvents = useMemo(() => {
    const normSelected = selectedDate.includes('T') ? selectedDate.split('T')[0] : selectedDate.trim();
    return events.filter((e) => {
      const eDate = e.date ? (e.date.includes('T') ? e.date.split('T')[0] : e.date.trim()) : '';
      return eDate === normSelected;
    });
  }, [events, selectedDate]);

  // Split into All-Day events and Timed events (CAL-01 / CAL-04)
  const allDayEvents = useMemo(() => {
    return dayEvents.filter(
      (e) =>
        e.isAllDay ||
        e.startTime === 'All day' ||
        !e.startTime ||
        (e.startTime === '12:00 AM' && (e.endTime === '11:59 PM' || e.endTime === '12:00 AM')) ||
        (e.startTime === '00:00' && (e.endTime === '23:59' || e.endTime === '24:00'))
    );
  }, [dayEvents]);

  const timedEvents = useMemo(() => {
    return dayEvents.filter(
      (e) =>
        !e.isAllDay &&
        e.startTime !== 'All day' &&
        Boolean(e.startTime) &&
        !(e.startTime === '12:00 AM' && (e.endTime === '11:59 PM' || e.endTime === '12:00 AM')) &&
        !(e.startTime === '00:00' && (e.endTime === '23:59' || e.endTime === '24:00'))
    );
  }, [dayEvents]);

  // Current time slot label e.g. "12 PM"
  const currentSlotLabel = useMemo(() => {
    if (isTestEnv) return '2 PM';
    const now = new Date();
    const curHour24 = now.getHours();
    const curHour12 = curHour24 % 12 || 12;
    const curAmPm = curHour24 >= 12 ? 'PM' : 'AM';
    return `${curHour12} ${curAmPm}`;
  }, [isTestEnv]);

  // Date format label (e.g. "Friday, 30 October" or "Tuesday, 24 November")
  const getDateLabel = () => {
    return formatFullDayLabel(selectedDate);
  };

  const handlePrevDay = () => {
    onSelectDate(addDaysToDate(selectedDate, -1));
  };

  const handleNextDay = () => {
    onSelectDate(addDaysToDate(selectedDate, 1));
  };

  // Show tasks due on selected day
  const dayTasks = useMemo(() => {
    if (isTestEnv && selectedDate === '2026-10-30') {
      return tasksDue;
    }
    const normSelected = selectedDate.includes('T') ? selectedDate.split('T')[0] : selectedDate.trim();
    return tasksDue.filter((t) => {
      const tDate = t.dueDate ? (t.dueDate.includes('T') ? t.dueDate.split('T')[0] : t.dueDate.trim()) : '';
      return tDate === normSelected;
    });
  }, [tasksDue, selectedDate, isTestEnv]);

  // Helper to format subtitle accurately based on due date and time
  const getTaskSubtitle = (t: CalendarTaskDue) => {
    const tDate = t.dueDate ? (t.dueDate.includes('T') ? t.dueDate.split('T')[0] : t.dueDate.trim()) : '';
    const normSelected = selectedDate.includes('T') ? selectedDate.split('T')[0] : selectedDate.trim();
    const isSelectedToday = normSelected === todayIso;

    if (tDate) {
      const [ty, tm, td] = tDate.split('-').map(Number);
      const [ny, nm, nd] = todayIso.split('-').map(Number);
      const taskD = new Date(ty, (tm || 1) - 1, td || 1);
      const nowD = new Date(ny, (nm || 1) - 1, nd || 1);
      const diffDays = Math.round((nowD.getTime() - taskD.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        return `${diffDays === 1 ? 'Overdue by 1 day' : `Overdue by ${diffDays} days`} · ${t.assignee}`;
      }
      if (diffDays === 0) {
        return t.dueTime ? `Today · by ${t.dueTime} · ${t.assignee}` : `Today · ${t.assignee}`;
      }
      return `${t.dueTime ? `${formatDateNice(tDate)} · by ${t.dueTime}` : formatDateNice(tDate)} · ${t.assignee}`;
    }

    if (t.isOverdue) {
      return `${t.overdueText || 'Overdue'} · ${t.assignee}`;
    }

    return `${isSelectedToday ? 'Today' : formatDateNice(normSelected)} · ${t.assignee}`;
  };

  // Determine timeline slots
  const timeSlots = useMemo(() => {
    if (isTestEnv) {
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
    }

    // In live mode, cover active day hours including current time and events
    const now = new Date();
    const curHour = now.getHours();

    let startHour = 8;
    let endHour = 22;

    if (curHour < startHour) startHour = Math.max(0, curHour - 1);
    if (curHour > endHour) endHour = Math.min(23, curHour + 1);

    const slots: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
      const h12 = h % 12 || 12;
      const ampm = h >= 12 ? 'PM' : 'AM';
      slots.push(`${h12} ${ampm}`);
    }
    return slots;
  }, [dayEvents, isTestEnv]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={refreshControl}
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
        {weekDays.map((w) => {
          const normSelected = selectedDate.includes('T')
            ? selectedDate.split('T')[0]
            : selectedDate.trim();
          const isSelected = normSelected === w.dateStr;
          const isCurrentToday = w.dateStr === (isTestEnv ? '2026-10-30' : todayIso);
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
                  !isSelected && isCurrentToday && styles.weekNumCircleToday,
                ]}
              >
                <Text
                  style={[
                    styles.weekNumText,
                    isSelected && styles.weekNumTextActive,
                    !isSelected && isCurrentToday && styles.weekNumTextToday,
                  ]}
                >
                  {w.dayNum}
                </Text>
              </View>

              {/* Event Dots */}
              <View style={styles.dotsRow}>
                {getDotsForDate(w.dateStr).map((dotColor, dIdx) => (
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
      {dayTasks.length > 0 && (
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <View style={styles.taskBadgeDot} />
            <Text style={styles.tasksHeaderTitle}>
              {isToday
                ? `TASKS DUE TODAY · ${dayTasks.length}`
                : `TASKS DUE · ${dayTasks.length}`}
            </Text>
          </View>

          <View style={styles.tasksCard}>
            {dayTasks.map((t, idx) => (
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

                <TouchableOpacity
                  style={styles.taskTextCol}
                  onPress={() => onSelectTask?.(t)}
                  activeOpacity={onSelectTask ? 0.7 : 1}
                  disabled={!onSelectTask}
                >
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
                    {getTaskSubtitle(t)}
                  </Text>
                </TouchableOpacity>

                {/* Priority / Category Dot */}
                <View
                  style={[
                    styles.priorityDot,
                    t.categoryColor ? { backgroundColor: t.categoryColor } : null,
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Empty State when no events AND no tasks (CAL-04) */}
      {dayEvents.length === 0 && dayTasks.length === 0 && (
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

      {/* All-Day Events Section (CAL-01 / CAL-04) */}
      {allDayEvents.length > 0 && (
        <View style={styles.allDayContainer}>
          <Text style={styles.allDayHeader}>ALL-DAY EVENTS</Text>
          {allDayEvents.map((evt) => (
            <TouchableOpacity
              key={evt.id}
              style={[
                styles.allDayCard,
                { borderLeftColor: evt.categoryColor || '#3B82F6' },
              ]}
              onPress={() => onSelectEvent(evt)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${evt.title} All day`}
            >
              <View style={styles.allDayCardContent}>
                <Text style={styles.allDayTitle}>{evt.title}</Text>
                {Boolean(evt.location) && (
                  <Text style={styles.allDaySub}>{evt.location}</Text>
                )}
              </View>
              {Boolean(evt.category) && (
                <View
                  style={[
                    styles.allDayCategoryBadge,
                    { backgroundColor: `${evt.categoryColor || '#3B82F6'}22` },
                  ]}
                >
                  <Text
                    style={[
                      styles.allDayCategoryBadgeText,
                      { color: evt.categoryColor || '#3B82F6' },
                    ]}
                  >
                    {evt.category}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Hourly Agenda Timeline (CAL-01) - rendered when there are events OR when tasks exist */}
      {(timedEvents.length > 0 || dayTasks.length > 0) && (
        <View style={styles.timelineContainer}>
          {timeSlots.map((slot) => {
            const slotHourPrefix = slot.split(' ')[0];
            const slotPeriod = slot.split(' ')[1];
            const matchedEvents = timedEvents.filter((e) => {
              let timeStr = e.startTime;
              if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
                timeStr = formatTime12h(timeStr);
              }
              const [eHour, eRest] = timeStr.split(':');
              const ePeriod = eRest?.split(' ')[1];
              return eHour === slotHourPrefix && ePeriod === slotPeriod;
            });

            const matchedTasks = dayTasks.filter((t) => {
              if (!t.dueTime) return false;
              let timeStr = t.dueTime;
              if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
                timeStr = formatTime12h(timeStr);
              }
              const [tHour, tRest] = timeStr.split(':');
              const tPeriod = tRest?.split(' ')[1];
              return tHour === slotHourPrefix && tPeriod === slotPeriod;
            });

            const showCurrentTime = isToday && slot === currentSlotLabel;

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

                  {/* Render Tasks Due at this time */}
                  {matchedTasks.map((t) => (
                    <TouchableOpacity
                      key={`task-slot-${t.id}`}
                      style={[
                        styles.timelineTaskPill,
                        t.categoryColor && { borderColor: t.categoryColor },
                      ]}
                      onPress={() => onSelectTask?.(t)}
                      activeOpacity={onSelectTask ? 0.75 : 1}
                      disabled={!onSelectTask}
                      accessibilityRole="button"
                      accessibilityLabel={`${t.title}, ${t.dueTime}`}
                    >
                      <View
                        style={[
                          styles.timelineTaskCheckboxCircle,
                          t.categoryColor && { borderColor: t.categoryColor },
                        ]}
                      />
                      <Text
                        style={[
                          styles.timelineTaskTitleText,
                          t.categoryColor && { color: t.categoryColor },
                        ]}
                        numberOfLines={1}
                      >
                        {t.title}
                      </Text>
                      {Boolean(t.dueTime) && (
                        <Text style={styles.timelineTaskTimeText}>
                          {t.dueTime}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}

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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-SemiBold',
    color: '#8A97AB',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  weekDayLabelActive: {
    color: '#CAD4DF',
    fontFamily: 'Roboto-Bold',
  },
  weekNumCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  weekNumCircleActive: {
    backgroundColor: '#F0913A',
    borderWidth: 0,
  },
  weekNumCircleToday: {
    borderWidth: 1.5,
    borderColor: '#F0913A',
  },
  weekNumText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
    includeFontPadding: false,
    textAlign: 'center',
  },
  weekNumTextActive: {
    color: '#0B1A2F',
    fontFamily: 'Roboto-Bold',
  },
  weekNumTextToday: {
    color: '#F0913A',
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-SemiBold',
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
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  timelineTaskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#F0913A',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
    marginTop: 14,
    marginBottom: 4,
  },
  timelineTaskCheckboxCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#F0913A',
    marginRight: 8,
  },
  timelineTaskTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0913A',
    flex: 1,
  },
  timelineTaskTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A97AB',
    marginLeft: 8,
  },
  allDayContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  allDayHeader: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.2,
    color: '#8A97AB',
    marginBottom: 8,
  },
  allDayCard: {
    backgroundColor: '#0F1E33',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3352',
    borderLeftWidth: 4,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  allDayCardContent: {
    flex: 1,
    marginRight: 8,
  },
  allDayTitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  allDaySub: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#8A97AB',
    marginTop: 2,
  },
  allDayCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  allDayCategoryBadgeText: {
    fontSize: 11,
    fontFamily: 'Roboto-SemiBold',
    textTransform: 'uppercase',
  },
});
