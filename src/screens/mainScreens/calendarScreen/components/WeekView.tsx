import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { CalendarEvent, CalendarTaskDue } from '../types';

export interface WeekViewProps {
  currentWeekRange?: string; // e.g. "26 Oct – 1 Nov"
  events: CalendarEvent[];
  tasksDue: CalendarTaskDue[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate?: (date: string) => void;
  onAddEventForDate?: (date: string) => void;
}

interface WeekDayRowConfig {
  dateStr: string;
  dayShort: string;
  isToday: boolean;
}

const WEEK_DAYS: WeekDayRowConfig[] = [
  { dateStr: '2026-10-26', dayShort: 'MON', isToday: false },
  { dateStr: '2026-10-27', dayShort: 'TUE', isToday: false },
  { dateStr: '2026-10-28', dayShort: 'WED', isToday: false },
  { dateStr: '2026-10-29', dayShort: 'THU', isToday: false },
  { dateStr: '2026-10-30', dayShort: 'FRI', isToday: true },
  { dateStr: '2026-10-31', dayShort: 'SAT', isToday: false },
  { dateStr: '2026-11-01', dayShort: 'SUN', isToday: false },
];

export const WeekView: React.FC<WeekViewProps> = ({
  currentWeekRange = '26 Oct – 1 Nov',
  events,
  tasksDue,
  onSelectEvent,
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Week Range Navigation Header (CAL-02) */}
      <View style={styles.navRow}>
        <Text style={styles.navWeekTitle}>{currentWeekRange}</Text>

        <View style={styles.navButtonsGroup}>
          <TouchableOpacity
            style={styles.navChevron}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Previous week"
          >
            <Feather name="chevron-left" size={18} color="#CAD4DF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navChevron}
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
        {WEEK_DAYS.map((day, idx) => {
          const dayEvents = events.filter((e) => e.date === day.dateStr);
          const dayTasks = tasksDue.filter((t) => t.dueDate === day.dateStr);
          const hasContent = dayEvents.length > 0 || dayTasks.length > 0;
          const isLast = idx === WEEK_DAYS.length - 1;

          return (
            <View
              key={day.dateStr}
              style={[styles.dayRow, !isLast && styles.dayRowDivider]}
            >
              {/* Day Label Column */}
              <View style={styles.dayLabelCol}>
                <Text
                  style={[
                    styles.dayLabelText,
                    day.isToday && styles.dayLabelTextToday,
                  ]}
                >
                  {day.dayShort}
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
                    {dayTasks.map((task) => (
                      <View key={task.id} style={styles.taskPill}>
                        <View style={styles.taskCheckboxCircle} />
                        <Text style={styles.taskTitleText} numberOfLines={1}>
                          {task.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.nothingPlannedText}>
                    Nothing planned
                  </Text>
                )}
              </View>
            </View>
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 0.8,
  },
  dayLabelTextToday: {
    color: '#F0913A',
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
    fontWeight: '700',
    marginRight: 10,
  },
  eventTitleText: {
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#F0913A',
    flex: 1,
  },
  nothingPlannedText: {
    fontSize: 14,
    color: '#8A97AB',
    paddingTop: 8,
  },
});
