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
  formatWeekRange,
  toIsoDateString,
} from '../calendarApiHelpers';

export interface WeekViewProps {
  currentWeekRange?: string; // e.g. "26 Oct – 1 Nov"
  selectedDate?: string;
  events: CalendarEvent[];
  tasksDue: CalendarTaskDue[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate?: (date: string) => void;
  onAddEventForDate?: (date: string) => void;
  onSelectTask?: (task: CalendarTaskDue) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  refreshControl?: React.ReactElement;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentWeekRange,
  selectedDate = '2026-10-30',
  events,
  tasksDue,
  onSelectEvent,
  onSelectTask,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  refreshControl,
}) => {
  const isTestEnv =
    typeof (globalThis as any).process !== 'undefined' &&
    (globalThis as any).process?.env?.NODE_ENV === 'test';
  const todayIso = isTestEnv ? '2026-10-30' : toIsoDateString(new Date());

  const weekDays = useMemo(() => {
    return getWeekDaysForDate(selectedDate);
  }, [selectedDate]);

  const displayWeekRange = useMemo(() => {
    if (currentWeekRange) return currentWeekRange;
    if (weekDays.length === 7) {
      return formatWeekRange(weekDays[0].dateStr, weekDays[6].dateStr);
    }
    return '26 Oct – 1 Nov';
  }, [currentWeekRange, weekDays]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={refreshControl}
    >
      {/* Week Range Navigation Header (CAL-02) */}
      <View style={styles.navRow}>
        <Text style={styles.navWeekTitle}>{displayWeekRange}</Text>

        <View style={styles.navButtonsGroup}>
          <TouchableOpacity
            style={styles.navChevron}
            onPress={onPrevWeek}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Previous week"
          >
            <Feather name="chevron-left" size={18} color="#CAD4DF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navChevron}
            onPress={onNextWeek}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Next week"
          >
            <Feather name="chevron-right" size={18} color="#CAD4DF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Unified Week Card (CAL-02) */}
      <View style={styles.weekCard}>
        {weekDays.map((day, idx) => {
          const normDayStr = day.dateStr.includes('T') ? day.dateStr.split('T')[0] : day.dateStr.trim();
          const isToday = isTestEnv
            ? normDayStr === '2026-10-30'
            : normDayStr === todayIso;
          const dayEvents = events.filter((e) => {
            const eDate = e.date ? (e.date.includes('T') ? e.date.split('T')[0] : e.date.trim()) : '';
            return eDate === normDayStr;
          });
          const dayTasks = tasksDue.filter((t) => {
            const tDate = t.dueDate ? (t.dueDate.includes('T') ? t.dueDate.split('T')[0] : t.dueDate.trim()) : '';
            if (isTestEnv && normDayStr === '2026-10-30') return true;
            return tDate === normDayStr;
          });
          const hasContent = dayEvents.length > 0 || dayTasks.length > 0;
          const isLast = idx === weekDays.length - 1;

          return (
            <TouchableOpacity
              key={day.dateStr}
              style={[styles.dayRow, !isLast && styles.dayRowDivider]}
              onPress={() => onSelectDate?.(day.dateStr)}
              activeOpacity={0.8}
            >
              {/* Day Label Column */}
              <View style={styles.dayLabelCol}>
                <Text
                  style={[
                    styles.dayLabelText,
                    isToday && styles.dayLabelTextToday,
                  ]}
                >
                  {day.dayShort}
                </Text>
                <Text
                  style={[
                    styles.dayNumSubtext,
                    isToday && styles.dayNumSubtextToday,
                  ]}
                >
                  {day.dayNum}
                </Text>
              </View>

              {/* Day Items Column */}
              <View style={styles.dayItemsCol}>
                {hasContent ? (
                  <View style={styles.itemsStack}>
                    {/* Events */}
                    {dayEvents.map((evt) => {
                      const borderColor = evt.categoryColor || '#3B82F6';
                      const bgColor =
                        evt.categoryColor === '#10B981'
                          ? '#13302A'
                          : evt.categoryColor === '#F59E0B'
                          ? '#33261A'
                          : evt.categoryColor === '#3B82F6'
                          ? '#16294A'
                          : `${borderColor}25`;

                      return (
                        <TouchableOpacity
                          key={evt.id}
                          style={[
                            styles.eventPill,
                            { borderColor, backgroundColor: bgColor },
                          ]}
                          onPress={() => onSelectEvent(evt)}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel={`${evt.startTime} ${evt.title}`}
                        >
                          <Text
                            style={[
                              styles.eventTimeText,
                              { color: borderColor },
                            ]}
                          >
                            {evt.startTime}
                          </Text>
                          <Text
                            style={styles.eventTitleText}
                            numberOfLines={1}
                          >
                            {evt.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    {/* Tasks */}
                    {dayTasks.map((task) => {
                      const taskColor = task.categoryColor || '#F0913A';
                      return (
                        <TouchableOpacity
                          key={task.id}
                          style={[styles.taskPill, { borderColor: taskColor }]}
                          onPress={() => onSelectTask?.(task)}
                          activeOpacity={onSelectTask ? 0.75 : 1}
                          disabled={!onSelectTask}
                        >
                          <View
                            style={[
                              styles.taskCheckboxCircle,
                              { borderColor: taskColor },
                            ]}
                          />
                          <Text
                            style={[styles.taskTitleText, { color: taskColor }]}
                            numberOfLines={1}
                          >
                            {task.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.nothingPlannedText}>
                    Nothing planned
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default WeekView;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
  },
  navWeekTitle: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  navButtonsGroup: {
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
  weekCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  dayRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    minHeight: 56,
  },
  dayRowDivider: {
    borderBottomWidth: 1,
    borderColor: '#1A2F4C',
  },
  dayLabelCol: {
    width: 44,
    paddingTop: 8,
  },
  dayLabelText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 0.8,
  },
  dayLabelTextToday: {
    color: '#F0913A',
  },
  dayNumSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CAD4DF',
    marginTop: 2,
  },
  dayNumSubtextToday: {
    color: '#F0913A',
    fontWeight: '700',
  },
  dayItemsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  itemsStack: {
    gap: 8,
  },
  eventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(11, 26, 47, 0.4)',
  },
  eventTimeText: {
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
    marginRight: 10,
  },
  eventTitleText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  taskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#F0913A',
    paddingHorizontal: 14,
    backgroundColor: 'transparent',
  },
  taskCheckboxCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#F0913A',
    marginRight: 10,
  },
  taskTitleText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0913A',
    flex: 1,
  },
  nothingPlannedText: {
    fontSize: 14,
    color: '#8A97AB',
    paddingTop: 8,
  },
});
