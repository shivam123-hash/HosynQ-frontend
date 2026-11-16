import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RecentlyDoneItem } from '../types';

export interface RecentlyDoneSectionProps {
  items: RecentlyDoneItem[];
  onReopen?: (id: string) => void;
}

const RecentlyDoneSection: React.FC<RecentlyDoneSectionProps> = ({
  items,
  onReopen,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Recently done</Text>

      <View style={styles.list}>
        {items.map((item) => {
          return (
            <View key={item.id} style={styles.doneRow}>
              {/* Checkmark Circle */}
              <View style={styles.checkCircle}>
                <Feather name="check" size={12} color="#0B1A2F" />
              </View>

              {/* Text Info */}
              <View style={styles.textCol}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.completedBy} · {item.timeAgo}
                </Text>
              </View>

              {/* Reopen Action */}
              <TouchableOpacity
                onPress={() => onReopen?.(item.id)}
                activeOpacity={0.7}
                style={styles.reopenTouch}
              >
                <Text style={styles.reopenText}>Reopen</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default memo(RecentlyDoneSection);

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 30,
    gap: 10,
  },
  title: {
    fontFamily: 'Roboto',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  list: {
    gap: 10,
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    height: 64,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#2A3E5E',
    borderRadius: 16,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4CC38A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontFamily: 'Roboto',
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: 0.14,
    textDecorationLine: 'line-through',
    color: '#8A97AB',
  },
  itemMeta: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: '#6E7C92',
  },
  reopenTouch: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  reopenText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    color: '#F0913A',
  },
});
