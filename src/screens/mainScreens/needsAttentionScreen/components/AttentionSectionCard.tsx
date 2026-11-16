import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AttentionItem, AttentionSectionGroup } from '../types';
import AttentionCardItem from './AttentionCardItem';

export interface AttentionSectionCardProps {
  section: AttentionSectionGroup;
  onItemPress?: (item: AttentionItem) => void;
  onRemindPress?: (item: AttentionItem) => void;
}

const AttentionSectionCard: React.FC<AttentionSectionCardProps> = ({
  section,
  onItemPress,
  onRemindPress,
}) => {
  if (!section.items || section.items.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Section Eyebrow Title */}
      <Text style={styles.sectionEyebrow}>{section.title}</Text>

      {/* Card with Items */}
      <View style={styles.card}>
        {section.items.map((item, index) => (
          <AttentionCardItem
            key={item.id}
            item={item}
            isNotFirst={index > 0}
            onPress={onItemPress}
            onRemindPress={onRemindPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  sectionEyebrow: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A97AB',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
});

export default memo(AttentionSectionCard);

