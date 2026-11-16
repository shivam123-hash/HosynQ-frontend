import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../../units/Colors';
import { AttentionItem } from '../types';

export interface AttentionCardItemProps {
  item: AttentionItem;
  isNotFirst?: boolean;
  onPress?: (item: AttentionItem) => void;
  onRemindPress?: (item: AttentionItem) => void;
}

const AttentionCardItem: React.FC<AttentionCardItemProps> = ({
  item,
  isNotFirst = false,
  onPress,
  onRemindPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.itemRow, isNotFirst && styles.rowBorder]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      {/* Icon Circle */}
      <View
        style={[
          styles.iconCircle,
          item.iconBorderColor ? { borderColor: item.iconBorderColor } : null,
        ]}
      >
        <Feather
          name={(item.iconName as any) || 'alert-circle'}
          size={20}
          color={item.iconColor || '#CAD4DF'}
        />
      </View>

      {/* Content Info */}
      <View style={styles.contentColumn}>
        <Text style={styles.titleText} numberOfLines={1}>
          {item.title}
        </Text>
        <Text
          style={[
            styles.subtitleText,
            item.isOverdue ? styles.overdueSubtitle : styles.normalSubtitle,
          ]}
          numberOfLines={1}
        >
          {item.subtitle}
        </Text>
      </View>

      {/* Right Action: Remind Pill Button or Chevron */}
      {item.hasRemindButton ? (
        <TouchableOpacity
          style={styles.remindButton}
          onPress={() => onRemindPress?.(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.remindButtonText}>Remind</Text>
        </TouchableOpacity>
      ) : (
        <Feather name="chevron-right" size={18} color="#5A6880" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 70,
    gap: 14,
  },
  rowBorder: {
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
  titleText: {
    fontFamily: 'Roboto',
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: '500',
    color: '#CAD4DF',
  },
  subtitleText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
  },
  normalSubtitle: {
    fontWeight: '400',
    color: '#8A97AB',
  },
  overdueSubtitle: {
    fontWeight: '500',
    color: Colors.primary, // #F0913A
  },
  remindButton: {
    height: 34,
    minWidth: 82,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remindButtonText: {
    fontFamily: 'Roboto',
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '500',
    color: '#CAD4DF',
  },
});

export default memo(AttentionCardItem);

