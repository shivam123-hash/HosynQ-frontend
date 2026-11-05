import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface NotificationPreviewCardProps {
  category: string;
  timestamp: string;
  title: string;
  description: string;
  icon: ReactNode;
}

const NotificationPreviewCard: React.FC<NotificationPreviewCardProps> = ({
  category,
  timestamp,
  title,
  description,
  icon,
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Orange Icon Container */}
      <View style={styles.iconContainer}>{icon}</View>

      {/* Notification Text Content */}
      <View style={styles.contentContainer}>
        {/* Category & Timestamp Row */}
        <View style={styles.headerRow}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {category}
          </Text>
          <Text style={styles.timestampText}>{timestamp}</Text>
        </View>

        {/* Title */}
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>

        {/* Description */}
        <Text style={styles.descriptionText} numberOfLines={1}>
          {description}
        </Text>
      </View>
    </View>
  );
};

export default NotificationPreviewCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: '#101E31',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1C2E46',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  categoryText: {
    fontSize: RFValue(10.5),
    fontWeight: '600',
    color: '#8E9AA8',
    letterSpacing: 0.5,
  },
  timestampText: {
    fontSize: RFValue(10.5),
    color: '#8E9AA8',
    fontWeight: '500',
  },
  titleText: {
    fontSize: RFValue(13.5),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: RFValue(11.5),
    color: Colors.textSecondary,
  },
});

