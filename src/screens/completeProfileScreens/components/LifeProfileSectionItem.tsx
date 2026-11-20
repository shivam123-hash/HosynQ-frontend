import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export type SectionBadgeType = 'done' | 'due' | 'soon' | 'pending' | 'none';

export interface LifeProfileSectionItemProps {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  iconBgColor?: string;
  iconBorderColor?: string;
  badgeText?: string | null;
  badgeType?: SectionBadgeType;
  onPress?: () => void;
  showDivider?: boolean;
}

const LifeProfileSectionItem: React.FC<LifeProfileSectionItemProps> = ({
  title,
  subtitle,
  icon,
  iconBgColor = 'rgba(56, 189, 248, 0.1)',
  iconBorderColor = 'rgba(56, 189, 248, 0.3)',
  badgeText,
  badgeType = 'none',
  onPress,
  showDivider = true,
}) => {
  const isDone = badgeType === 'done' || badgeText?.toLowerCase() === 'done';
  const isPending =
    badgeType === 'pending' || badgeText?.toLowerCase().includes('pending');
  const isWarning =
    badgeType === 'due' ||
    badgeType === 'soon' ||
    badgeText?.toLowerCase().includes('due') ||
    badgeText?.toLowerCase().includes('soon');

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.rowContainer}
      >
        {/* Left Icon Square */}
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: iconBgColor,
              borderColor: iconBorderColor,
            },
          ]}
        >
          {icon}
        </View>

        {/* Center Text Details */}
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.subtitleText}>{subtitle}</Text>
        </View>

        {/* Right Badge (if any) */}
        {badgeText ? (
          <View
            style={[
              styles.badgePill,
              isDone && styles.badgePillDone,
              isWarning && styles.badgePillWarning,
              isPending && styles.badgePillPending,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isDone && styles.badgeTextDone,
                isWarning && styles.badgeTextWarning,
                isPending && styles.badgeTextPending,
              ]}
            >
              {badgeText}
            </Text>
          </View>
        ) : null}

        {/* Right Chevron */}
        <Feather
          name="chevron-right"
          size={16}
          color="rgba(255, 255, 255, 0.3)"
          style={styles.chevronIcon}
        />
      </TouchableOpacity>

      {showDivider && <View style={styles.divider} />}
    </View>
  );
};

export default LifeProfileSectionItem;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: RFValue(12),
    fontWeight: '600',
    lineHeight: RFValue(16.5),
  },
  subtitleText: {
    color: Colors.textSecondary,
    fontSize: RFValue(10.5),
    lineHeight: RFValue(14.5),
    marginTop: 2.5,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 6,
  },
  badgePillDone: {
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    borderColor: 'rgba(45, 212, 191, 0.6)',
  },
  badgePillWarning: {
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    borderColor: 'rgba(240, 145, 58, 0.6)',
  },
  badgePillPending: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  badgeText: {
    fontSize: RFValue(10),
    fontWeight: '600',
  },
  badgeTextDone: {
    color: '#2DD4BF',
  },
  badgeTextWarning: {
    color: '#F0913A',
  },
  badgeTextPending: {
    color: '#94A3B8',
  },
  chevronIcon: {
    marginLeft: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 14,
  },
});

