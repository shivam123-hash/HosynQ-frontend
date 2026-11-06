import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NotificationItem, NotificationSectionGroup } from '../types';
import NotificationCardItem from './NotificationCardItem';

export interface NotificationSectionCardProps {
  section: NotificationSectionGroup;
  onItemPress?: (item: NotificationItem) => void;
  onApprove?: (item: NotificationItem) => void;
  onDecline?: (item: NotificationItem) => void;
}

const NotificationSectionCard: React.FC<NotificationSectionCardProps> = ({
  section,
  onItemPress,
  onApprove,
  onDecline,
}) => {
  if (!section.items || section.items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>{section.title}</Text>
      <View style={styles.card}>
        {section.items.map((item, index) => (
          <NotificationCardItem
            key={item.id}
            item={item}
            onPress={onItemPress}
            onApprove={onApprove}
            onDecline={onDecline}
            showDivider={index < section.items.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

export default NotificationSectionCard;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 12,
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

