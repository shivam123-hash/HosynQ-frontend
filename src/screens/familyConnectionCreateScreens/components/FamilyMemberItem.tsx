import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface FamilyMemberItemProps {
  name: string;
  relationRole: string;
  initial?: string;
  badge?: string;
  avatarColor?: string;
  onPress?: () => void;
}

const FamilyMemberItem: React.FC<FamilyMemberItemProps> = ({
  name,
  relationRole,
  initial = 'P',
  badge = 'Owner',
  avatarColor = '#6E4327',
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={styles.card}
    >
      {/* Left Avatar Initial */}
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      {/* Middle Details */}
      <View style={styles.details}>
        <Text style={styles.nameText} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.roleText} numberOfLines={1}>
          {relationRole}
        </Text>
      </View>

      {/* Right Badge */}
      {Boolean(badge) && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default FamilyMemberItem;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontWeight: '700',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '600',
    marginBottom: 3,
  },
  roleText: {
    color: Colors.textSecondary,
    fontSize: RFValue(12),
  },
  badgeContainer: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  badgeText: {
    color: Colors.primary,
    fontSize: RFValue(11),
    fontWeight: '600',
  },
});

