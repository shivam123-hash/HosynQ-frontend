import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';

export type VaccineStatus = 'due' | 'done' | 'upcoming';

export interface VaccineItemRowProps {
  id: string;
  name: string;
  details: string;
  status: VaccineStatus;
  hasCertificate?: boolean;
  onPress?: () => void;
  showDivider?: boolean;
}

const VaccineItemRow: React.FC<VaccineItemRowProps> = ({
  name,
  details,
  status,
  hasCertificate,
  onPress,
  showDivider = true,
}) => {
  const isDone = status === 'done';
  const isDue = status === 'due';
  const isUpcoming = status === 'upcoming';

  const badgeText = isDone ? 'Done' : isDue ? 'Due' : 'Upcoming';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.rowContainer, showDivider && styles.divider]}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${status}`}
    >
      {/* Icon Badge */}
      <View
        style={[
          styles.iconBadge,
          isDone
            ? styles.iconBadgeTeal
            : isDue
            ? styles.iconBadgeDark
            : styles.iconBadgeBlue,
        ]}
      >
        <Ionicons
          name="eyedrop-outline"
          size={16}
          color={isDone ? '#14B8A6' : isDue ? '#8E9BAE' : '#38BDF8'}
        />
      </View>

      {/* Info Container */}
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>{name}</Text>
        <Text style={styles.detailsText}>{details}</Text>
      </View>

      {/* Right Container: Badge & Certificate Pin */}
      <View style={styles.rightContainer}>
        <View
          style={[
            styles.badge,
            isDone
              ? styles.badgeTeal
              : isDue
              ? styles.badgeOrange
              : styles.badgeBlue,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isDone
                ? styles.badgeTextTeal
                : isDue
                ? styles.badgeTextOrange
                : styles.badgeTextBlue,
            ]}
          >
            {badgeText}
          </Text>
        </View>

        {hasCertificate ? (
          <Feather
            name="paperclip"
            size={14}
            color="#F59E0B"
            style={styles.paperclipIcon}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default VaccineItemRow;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBadgeTeal: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.25)',
  },
  iconBadgeDark: {
    backgroundColor: 'rgba(142, 155, 174, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(142, 155, 174, 0.25)',
  },
  iconBadgeBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  textContainer: {
    flex: 1,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  detailsText: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    lineHeight: 16,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeTeal: {
    borderColor: 'rgba(20, 184, 166, 0.4)',
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
  },
  badgeOrange: {
    borderColor: 'rgba(240, 145, 58, 0.4)',
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
  },
  badgeBlue: {
    borderColor: 'rgba(56, 189, 248, 0.4)',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  badgeText: {
    fontSize: RFValue(10.5),
    fontWeight: '600',
  },
  badgeTextTeal: {
    color: '#14B8A6',
  },
  badgeTextOrange: {
    color: '#F0913A',
  },
  badgeTextBlue: {
    color: '#38BDF8',
  },
  paperclipIcon: {
    marginLeft: 8,
  },
});

