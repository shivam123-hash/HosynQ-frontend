import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface WaitingDetailsCardProps {
  familyName?: string;
  familyId?: string;
  requestedTime?: string;
  statusText?: string;
}

const WaitingDetailsCard: React.FC<WaitingDetailsCardProps> = ({
  familyName = 'The Sharma Family',
  familyId = 'HSQ-4821',
  requestedTime = 'Today, 11:02 AM',
  statusText = 'Pending',
}) => {
  return (
    <View style={styles.card}>
      {/* Row 1: Family */}
      <View style={styles.row}>
        <Text style={styles.label}>Family</Text>
        <Text style={styles.value} numberOfLines={1}>
          {familyName}
        </Text>
      </View>
      <View style={styles.divider} />

      {/* Row 2: Family ID */}
      <View style={styles.row}>
        <Text style={styles.label}>Family ID</Text>
        <Text style={styles.value}>{familyId}</Text>
      </View>
      <View style={styles.divider} />

      {/* Row 3: Requested */}
      <View style={styles.row}>
        <Text style={styles.label}>Requested</Text>
        <Text style={styles.value}>{requestedTime}</Text>
      </View>
      <View style={styles.divider} />

      {/* Row 4: Status */}
      <View style={styles.row}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>
    </View>
  );
};

export default WaitingDetailsCard;

const styles = StyleSheet.create({
  card: {
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
    paddingVertical: 14,
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
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.35)',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  statusText: {
    color: Colors.primary,
    fontSize: RFValue(11.5),
    fontWeight: '600',
  },
});

