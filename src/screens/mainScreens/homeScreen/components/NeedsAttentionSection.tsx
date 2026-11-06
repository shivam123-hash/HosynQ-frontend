import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { AttentionItem } from '../types';

export interface NeedsAttentionSectionProps {
  items: AttentionItem[];
  onViewAll?: () => void;
  onItemPress?: (item: AttentionItem) => void;
}

const NeedsAttentionSection: React.FC<NeedsAttentionSectionProps> = ({
  items,
  onViewAll,
  onItemPress,
}) => {
  if (!items || items.length === 0) return null;

  const renderIcon = (type: AttentionItem['type']) => {
    switch (type) {
      case 'urgent':
        return <Feather name="alert-circle" size={18} color="#F07A5A" />;
      case 'warning':
        return <Feather name="clock" size={18} color="#C9D1DC" />;
      case 'info':
      default:
        return <Feather name="file-text" size={18} color="#C9D1DC" />;
    }
  };

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Needs attention</Text>
        <TouchableOpacity
          onPress={onViewAll}
          activeOpacity={0.7}
          style={styles.viewAllBtn}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {/* Attention List Card */}
      <View style={styles.card}>
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isUrgent = item.type === 'urgent';
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onItemPress?.(item)}
              activeOpacity={0.7}
              style={[styles.itemRow, !isFirst && styles.rowBorder]}
            >
              {/* Type Icon Circle */}
              <View
                style={[
                  styles.iconCircle,
                  isUrgent ? styles.urgentIconCircle : styles.normalIconCircle,
                ]}
              >
                {renderIcon(item.type)}
              </View>

              {/* Text Info */}
              <View style={styles.contentCol}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text
                  style={[
                    styles.itemSubtitle,
                    item.isOverdue ? styles.overdueSubtitle : styles.normalSubtitle,
                  ]}
                >
                  {item.subtitle}
                </Text>
              </View>

              {/* Chevron */}
              <Feather name="chevron-right" size={16} color="#5A6880" />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default memo(NeedsAttentionSection);

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
    fontFamily: 'Roboto',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  viewAllBtn: {
    height: 32,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(240, 144, 52, 0.16)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#F0913A',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentIconCircle: {
    borderWidth: 1.5,
    borderColor: '#6B3A2A',
  },
  normalIconCircle: {
    borderWidth: 1.5,
    borderColor: '#3A4556',
  },
  contentCol: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontFamily: 'Roboto',
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '500',
    color: '#CAD4DF',
  },
  itemSubtitle: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
  },
  overdueSubtitle: {
    fontWeight: '500',
    color: '#F0913A',
  },
  normalSubtitle: {
    fontWeight: '400',
    color: '#8A97AB',
  },
});
