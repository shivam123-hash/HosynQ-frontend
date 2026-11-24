import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EventItem } from '../types';

export interface UpcomingEventsSectionProps {
  events: EventItem[];
  onOpenCalendar?: () => void;
  onEventPress?: (event: EventItem) => void;
}

const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  events,
  onOpenCalendar,
  onEventPress,
}) => {
  if (!events || events.length === 0) return null;

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Upcoming today</Text>
        <TouchableOpacity
          onPress={onOpenCalendar}
          activeOpacity={0.7}
          style={styles.openCalendarBtn}
        >
          <Text style={styles.openCalendarText}>Open calendar</Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <View style={styles.cardsList}>
        {events.map((event) => {
          const isFamily = event.category === 'Family';
          return (
            <TouchableOpacity
              key={event.id}
              onPress={() => onEventPress?.(event)}
              activeOpacity={0.7}
              style={styles.eventCard}
            >
              {/* Time Column */}
              <View style={styles.timeCol}>
                <Text style={styles.timeHour}>{event.time}</Text>
                <Text style={styles.timePeriod}>{event.period}</Text>
              </View>

              {/* Event Details */}
              <View style={styles.detailsCol}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={styles.eventMeta} numberOfLines={1}>
                  {event.location} · {event.attendees}
                </Text>
              </View>

              {/* Category Tag Pill */}
              <View
                style={[
                  styles.tagPill,
                  isFamily ? styles.familyTag : styles.personalTag,
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    isFamily ? styles.familyTagText : styles.personalTagText,
                  ]}
                >
                  {event.category}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default memo(UpcomingEventsSection);

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 30,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 34,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Roboto-SemiBold',
    color: '#CAD4DF',
  },
  openCalendarBtn: {
    height: 32,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(240, 144, 52, 0.16)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openCalendarText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Roboto-Medium',
    color: '#F0913A',
  },
  cardsList: {
    gap: 10,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 14,
    height: 72,
  },
  timeCol: {
    width: 52,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  timeHour: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Roboto-Bold',
    color: '#CAD4DF',
  },
  timePeriod: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  eventTitle: {
    fontSize: 13.5,
    lineHeight: 18,
    fontFamily: 'Roboto-Medium',
    color: '#CAD4DF',
  },
  eventMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Roboto-Regular',
    color: '#8A97AB',
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'Roboto-Medium',
  },
  familyTag: {
    borderWidth: 1,
    borderColor: '#5B9BF0',
    backgroundColor: 'transparent',
  },
  familyTagText: {
    color: '#5B9BF0',
  },
  personalTag: {
    borderWidth: 1,
    borderColor: '#4CC38A',
    backgroundColor: 'transparent',
  },
  personalTagText: {
    color: '#4CC38A',
  },
});
