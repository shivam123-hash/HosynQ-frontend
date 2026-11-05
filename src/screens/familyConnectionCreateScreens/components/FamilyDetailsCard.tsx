import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface FamilyDetailsCardProps {
  familyId?: string;
  memberCount?: string;
  invitedBy?: string;
  sentTime?: string;
}

const FamilyDetailsCard: React.FC<FamilyDetailsCardProps> = ({
  familyId = 'HSQ-4821',
  memberCount = '5 people',
  invitedBy = 'Priya Sharma · Owner',
  sentTime = 'Today, 10:48 AM',
}) => {
  const items = [
    { label: 'Family ID', value: familyId },
    { label: 'Members', value: memberCount },
    { label: 'Invited by', value: invitedBy },
    { label: 'Sent', value: sentTime },
  ];

  return (
    <View style={styles.cardContainer}>
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          <View style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value} numberOfLines={1}>
              {item.value}
            </Text>
          </View>
          {index < items.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
};

export default FamilyDetailsCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    marginVertical: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: RFValue(13),
  },
  value: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 16,
  },
});

