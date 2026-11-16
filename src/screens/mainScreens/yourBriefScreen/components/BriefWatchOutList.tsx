import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { BriefWatchOutItem } from '../types';

export interface BriefWatchOutListProps {
  items: BriefWatchOutItem[];
  onItemPress?: (item: BriefWatchOutItem) => void;
}

const BriefWatchOutList: React.FC<BriefWatchOutListProps> = ({
  items,
  onItemPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Watch out for</Text>

      <View style={styles.card}>
        {items.map((item, index) => {
          const isNotFirst = index > 0;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemRow, isNotFirst && styles.itemRowBorder]}
              onPress={() => onItemPress?.(item)}
              activeOpacity={0.7}
            >
              {/* Icon Circle */}
              <View style={styles.iconCircle}>
                <Feather
                  name={(item.iconName as any) || 'alert-circle'}
                  size={20}
                  color="#C9D1DC"
                />
              </View>

              {/* Details */}
              <View style={styles.contentColumn}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>

              {/* Right Chevron */}
              <Feather name="chevron-right" size={18} color="#5A6880" />
            </TouchableOpacity>
          );
        })}
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
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 69,
    gap: 14,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderColor: '#1F3352',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentColumn: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontFamily: 'Roboto',
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: '500',
    color: '#B6B8B8',
  },
  itemSubtitle: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#8A97AB',
  },
});

export default memo(BriefWatchOutList);

