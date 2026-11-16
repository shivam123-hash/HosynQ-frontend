import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface PendingAlertCardsRowProps {
  overdueCount: number;
  dueThisWeekCount: number;
  isOverdueActive?: boolean;
  isDueThisWeekActive?: boolean;
  onPressOverdue?: () => void;
  onPressDueThisWeek?: () => void;
}

const PendingAlertCardsRow: React.FC<PendingAlertCardsRowProps> = ({
  overdueCount,
  dueThisWeekCount,
  isOverdueActive = false,
  isDueThisWeekActive = false,
  onPressOverdue,
  onPressDueThisWeek,
}) => {
  return (
    <View style={styles.container}>
      {/* Overdue Card */}
      <TouchableOpacity
        style={[
          styles.card,
          styles.overdueCard,
          isOverdueActive && styles.activeCardBorder,
        ]}
        onPress={onPressOverdue}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Overdue tasks, ${overdueCount}`}
      >
        <Feather
          name="alert-circle"
          size={24}
          color="#F0913A"
          style={styles.icon}
        />
        <View style={styles.textColumn}>
          <Text style={styles.cardEyebrow}>OVERDUE</Text>
          <Text style={styles.cardValue}>
            {overdueCount === 1 ? '1 task' : `${overdueCount} tasks`}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Due This Week Card */}
      <TouchableOpacity
        style={[
          styles.card,
          styles.dueThisWeekCard,
          isDueThisWeekActive && styles.activeCardBorder,
        ]}
        onPress={onPressDueThisWeek}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Due this week tasks, ${dueThisWeekCount}`}
      >
        <Feather
          name="clock"
          size={24}
          color="#CAD4DF"
          style={styles.icon}
        />
        <View style={styles.textColumn}>
          <Text style={styles.cardEyebrow}>DUE THIS WEEK</Text>
          <Text style={styles.cardValue}>
            {dueThisWeekCount === 1 ? '1 task' : `${dueThisWeekCount} tasks`}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default PendingAlertCardsRow;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    height: 76,
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  overdueCard: {
    borderColor: '#6B3A2A',
  },
  dueThisWeekCard: {
    borderColor: '#1F3352',
  },
  activeCardBorder: {
    borderColor: '#F0913A',
  },
  icon: {
    marginRight: 12,
  },
  textColumn: {
    justifyContent: 'center',
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#8A97AB',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
