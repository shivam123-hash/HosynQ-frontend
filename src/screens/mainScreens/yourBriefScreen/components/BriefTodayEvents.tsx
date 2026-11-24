import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../../../units/Colors';
import { BriefEventItem } from '../types';

export interface BriefTodayEventsProps {
  events: BriefEventItem[];
  onOpenCalendar?: () => void;
  onEventPress?: (event: BriefEventItem) => void;
}

const BriefTodayEvents: React.FC<BriefTodayEventsProps> = ({
  events,
  onOpenCalendar,
  onEventPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Today’s events</Text>
        <TouchableOpacity
          onPress={onOpenCalendar}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.actionText}>Calendar</Text>
        </TouchableOpacity>
      </View>

      {/* Event Cards */}
      {events.map((event) => {
        const isPersonal = event.category === 'Personal';
        return (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => onEventPress?.(event)}
            activeOpacity={0.7}
          >
            {/* Time Column */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeValue}>{event.time}</Text>
              <Text style={styles.timePeriod}>{event.period}</Text>
            </View>

            {/* Event Info */}
            <View style={styles.infoColumn}>
              <Text style={styles.eventTitle} numberOfLines={1}>
                {event.title}
              </Text>
              <Text style={styles.eventSubtitle} numberOfLines={2}>
                {event.location}
              </Text>
            </View>

            {/* Category Tag */}
            <View
              style={[
                styles.categoryBadge,
                isPersonal ? styles.personalBadge : styles.familyBadge,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  isPersonal ? styles.personalText : styles.familyText,
                ]}
              >
                {event.category}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    height: 24,
  },
  sectionTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontFamily: 'Roboto-Bold',
    color: '#B6B8B8',
  },
  actionText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Roboto-Medium',
    color: Colors.primary, // #F0913A
  },
  eventCard: {
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeColumn: {
    width: 56,
    height: 46,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  timeValue: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'Roboto-Bold',
    color: '#B6B8B8',
  },
  timePeriod: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
  },
  infoColumn: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 15.5,
    lineHeight: 20,
    fontFamily: 'Roboto-Bold',
    color: '#B6B8B8',
  },
  eventSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Roboto-Regular',
    color: '#8A97AB',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  familyBadge: {
    borderColor: '#5B9BF0',
    backgroundColor: 'transparent',
  },
  personalBadge: {
    borderColor: '#4CC38A',
    backgroundColor: 'transparent',
  },
  categoryText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Roboto-Medium',
  },
  familyText: {
    color: '#5B9BF0',
  },
  personalText: {
    color: '#4CC38A',
  },
});

export default memo(BriefTodayEvents);

