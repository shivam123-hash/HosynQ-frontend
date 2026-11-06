import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../../units/Colors';
import { ChecklistItem } from '../types';

export interface BriefEmptyStateProps {
  checklist: ChecklistItem[];
  onAddTaskPress?: () => void;
  onChecklistItemPress?: (item: ChecklistItem) => void;
}

const BriefEmptyState: React.FC<BriefEmptyStateProps> = ({
  checklist,
  onAddTaskPress,
  onChecklistItemPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Dashed Orange Circle Ring with Sparkle */}
      <View style={styles.dashedRing}>
        <Text style={styles.sparkleIcon}>✦</Text>
      </View>

      {/* Title & Description */}
      <Text style={styles.title}>Your brief isn’t ready yet</Text>
      <Text style={styles.description}>
        HosynQ writes your brief from your family’s tasks and events. Add a few things and check back.
      </Text>

      {/* Progress Checklist Card */}
      <View style={styles.card}>
        {checklist.map((item, index) => {
          const isLast = index === checklist.length - 1;

          return (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => onChecklistItemPress?.(item)}
                activeOpacity={item.isActionable ? 0.7 : 1}
              >
                {/* Status Indicator Icon */}
                <View
                  style={[
                    styles.checkCircle,
                    item.isCompleted ? styles.completedCircle : styles.pendingCircle,
                  ]}
                >
                  {item.isCompleted ? (
                    <Feather name="check" size={13} color="#FFFFFF" />
                  ) : (
                    <View style={styles.innerDot} />
                  )}
                </View>

                {/* Item Label */}
                <Text style={styles.itemLabel}>{item.label}</Text>

                {/* Status Text & Chevron */}
                <View style={styles.statusGroup}>
                  <Text
                    style={[
                      styles.statusText,
                      item.isCompleted ? styles.doneStatusText : styles.pendingStatusText,
                    ]}
                  >
                    {item.statusText}
                  </Text>
                  {item.isActionable && (
                    <Feather name="chevron-right" size={16} color="#8A97AB" />
                  )}
                </View>
              </TouchableOpacity>

              {!isLast && <View style={styles.divider} />}
            </React.Fragment>
          );
        })}
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onAddTaskPress}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Add a task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 40,
  },
  dashedRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: Colors.primary, // #F0913A
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
  },
  sparkleIcon: {
    fontSize: 26,
    color: Colors.primary, // #F0913A
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#8A97AB',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  card: {
    width: '100%',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 28,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  completedCircle: {
    backgroundColor: '#10B981',
  },
  pendingCircle: {
    borderWidth: 1.5,
    borderColor: '#3A4B68',
    borderStyle: 'dashed',
  },
  innerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4B68',
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
  },
  doneStatusText: {
    color: '#34D399',
    fontWeight: '600',
  },
  pendingStatusText: {
    color: '#8A97AB',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary, // #F0913A
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1A2F',
  },
});

export default memo(BriefEmptyState);

