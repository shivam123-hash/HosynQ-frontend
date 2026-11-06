import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { NotificationFilterType } from '../types';

export interface NotificationsFilterPillsProps {
  selectedFilter: NotificationFilterType;
  onSelectFilter: (filter: NotificationFilterType) => void;
  unreadCount?: number;
}

const NotificationsFilterPills: React.FC<NotificationsFilterPillsProps> = ({
  selectedFilter,
  onSelectFilter,
  unreadCount = 0,
}) => {
  const pills: { id: NotificationFilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    {
      id: 'unread',
      label: unreadCount > 0 ? `Unread ${unreadCount}` : 'Unread',
    },
    { id: 'tasks', label: 'Tasks' },
    { id: 'family', label: 'Family' },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {pills.map((pill) => {
          const isActive = selectedFilter === pill.id;
          return (
            <TouchableOpacity
              key={pill.id}
              style={[styles.pill, isActive ? styles.activePill : styles.inactivePill]}
              onPress={() => onSelectFilter(pill.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Filter by ${pill.label}`}
            >
              <Text
                style={[
                  styles.pillText,
                  isActive ? styles.activePillText : styles.inactivePillText,
                ]}
              >
                {pill.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default NotificationsFilterPills;

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  container: {
    paddingHorizontal: 20,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    height: 35,
    borderRadius: 18,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePill: {
    backgroundColor: '#F0913A',
  },
  inactivePill: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3A4556',
  },
  pillText: {
    fontSize: 14,
    lineHeight: 18,
  },
  activePillText: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  inactivePillText: {
    color: '#CAD4DF',
    fontWeight: '500',
  },
});

