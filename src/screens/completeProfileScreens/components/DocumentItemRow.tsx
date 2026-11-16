import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface DocumentItemRowProps {
  id: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconBorderColor?: string;
  title: string;
  subtitle: string;
  badgeText?: string | null;
  isLocked?: boolean;
  actionText?: string | null;
  onPress?: () => void;
  showDivider?: boolean;
}

const DocumentItemRow: React.FC<DocumentItemRowProps> = ({
  icon,
  iconBgColor,
  iconBorderColor,
  title,
  subtitle,
  badgeText,
  isLocked,
  actionText,
  onPress,
  showDivider = true,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.rowContainer, showDivider && styles.divider]}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}`}
    >
      {/* Icon Badge */}
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: iconBgColor,
            borderColor: iconBorderColor || 'transparent',
            borderWidth: iconBorderColor ? 1 : 0,
          },
        ]}
      >
        {icon}
      </View>

      {/* Title & Subtitle */}
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          {badgeText ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeText}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.subtitleText} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {/* Right Action / Icons */}
      <View style={styles.rightContainer}>
        {isLocked ? (
          <Feather
            name="lock"
            size={14}
            color="#64748B"
            style={styles.lockIcon}
          />
        ) : null}

        {actionText ? (
          <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
            <Text style={styles.actionText}>{actionText}</Text>
          </TouchableOpacity>
        ) : (
          <Feather name="chevron-right" size={18} color="#64748B" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default DocumentItemRow;

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
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.4)',
    backgroundColor: 'rgba(240, 145, 58, 0.1)',
  },
  badgeText: {
    color: '#F0913A',
    fontSize: RFValue(10),
    fontWeight: '600',
  },
  subtitleText: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    fontWeight: '400',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  lockIcon: {
    marginRight: 6,
  },
  actionText: {
    color: Colors.primary || '#F0913A',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
});

