import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface UserRoleCardProps {
  roleTitle?: string;
  permissions?: string[];
}

const DEFAULT_PERMISSIONS = [
  'Create and assign tasks and events',
  'Confirm AI and scan suggestions',
  'Use family chat and Compass',
];

const UserRoleCard: React.FC<UserRoleCardProps> = ({
  roleTitle = 'Adult member',
  permissions = DEFAULT_PERMISSIONS,
}) => {
  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <Text style={styles.label}>YOUR ROLE</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{roleTitle}</Text>
        </View>
      </View>

      {/* Permissions List */}
      <View style={styles.itemsList}>
        {permissions.map((item) => (
          <View key={item} style={styles.permissionRow}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={12} color={Colors.primary} />
            </View>
            <Text style={styles.permissionText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default UserRoleCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 18,
    marginVertical: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: RFValue(11),
    letterSpacing: 1.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  roleBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: RFValue(11),
    fontWeight: '700',
  },
  itemsList: {
    gap: 12,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  permissionText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: RFValue(13),
    lineHeight: RFValue(18),
  },
});

