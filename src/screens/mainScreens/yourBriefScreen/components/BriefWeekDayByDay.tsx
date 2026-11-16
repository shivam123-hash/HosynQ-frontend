import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../../../units/Colors';
import { DayWorkload } from '../types';

export interface BriefWeekDayByDayProps {
  days: DayWorkload[];
}

const UNIT_BAR_HEIGHT = 14;

const BriefWeekDayByDay: React.FC<BriefWeekDayByDayProps> = ({ days }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Day by day</Text>

      <View style={styles.card}>
        <View style={styles.columnsRow}>
          {days.map((day) => {
            const isHighlighted = !!day.isHighlighted; // Saturday busiest
            const isToday = !!day.isToday; // Friday 30
            const barHeight = Math.max(UNIT_BAR_HEIGHT, day.taskCount * UNIT_BAR_HEIGHT);

            return (
              <View key={`${day.dayLabel}-${day.dateNum}`} style={styles.column}>
                {/* Task Count on Top */}
                <Text
                  style={[
                    styles.countText,
                    isHighlighted && styles.countTextHighlighted,
                  ]}
                >
                  {day.taskCount}
                </Text>

                {/* Vertical Bar Area */}
                <View style={styles.barArea}>
                  <View
                    style={[
                      styles.barCapsule,
                      { height: barHeight },
                      isHighlighted
                        ? styles.barCapsuleHighlighted
                        : styles.barCapsuleDefault,
                    ]}
                  />
                </View>

                {/* Day Label */}
                <Text
                  style={[
                    styles.dayLabel,
                    isToday && styles.dayLabelToday,
                  ]}
                >
                  {day.dayLabel}
                </Text>

                {/* Date Number */}
                <Text
                  style={[
                    styles.dateNum,
                    isToday ? styles.dateNumToday : styles.dateNumDefault,
                  ]}
                >
                  {day.dateNum}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: '#B6B8B8',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 12,
    minHeight: 174,
  },
  columnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 4,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  countText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#B6B8B8',
  },
  countTextHighlighted: {
    color: Colors.primary, // #F0913A
    fontWeight: '500',
  },
  barArea: {
    width: 22,
    height: 70,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barCapsule: {
    width: 22,
    borderRadius: 6,
  },
  barCapsuleHighlighted: {
    backgroundColor: Colors.primary, // #F0913A
  },
  barCapsuleDefault: {
    backgroundColor: '#2A3E5E',
  },
  dayLabel: {
    fontFamily: 'Roboto',
    fontSize: 10.5,
    lineHeight: 16,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.26,
  },
  dayLabelToday: {
    color: '#B6B8B8',
  },
  dateNum: {
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  dateNumDefault: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#B6B8B8',
  },
  dateNumToday: {
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: '700',
    color: Colors.primary, // #F0913A
  },
});

export default memo(BriefWeekDayByDay);

