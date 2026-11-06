import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';

export interface QuickActionsBarProps {
  onAddTask?: () => void;
  onAddEvent?: () => void;
  onHeadingHome?: () => void;
  onScan?: () => void;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onAddTask,
  onAddEvent,
  onHeadingHome,
  onScan,
}) => {
  const actions = [
    {
      id: 'add-task',
      label: 'Add task',
      renderIcon: () => (
        <Feather name="check-square" size={24} color="#F0913A" />
      ),
      onPress: onAddTask,
    },
    {
      id: 'add-event',
      label: 'Add event',
      renderIcon: () => (
        <Feather name="calendar" size={24} color="#F0913A" />
      ),
      onPress: onAddEvent,
    },
    {
      id: 'heading-home',
      label: 'Heading home',
      renderIcon: () => (
        <Feather name="navigation" size={24} color="#F0913A" />
      ),
      onPress: onHeadingHome,
    },
    {
      id: 'scan',
      label: 'Scan',
      renderIcon: () => (
        <Ionicons name="scan-outline" size={24} color="#F0913A" />
      ),
      onPress: onScan,
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          onPress={action.onPress}
          activeOpacity={0.7}
          style={styles.actionItem}
        >
          <View style={styles.ring}>{action.renderIcon()}</View>
          <Text style={styles.label} numberOfLines={2}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default memo(QuickActionsBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 30,
    gap: 8,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  ring: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#C9D1DC',
    textAlign: 'center',
  },
});
