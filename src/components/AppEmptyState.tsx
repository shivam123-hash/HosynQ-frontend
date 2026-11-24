import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../units/Colors';
import Spacing from '../units/Spacing';
import BorderRadius from '../units/BorderRadius';
import Typography from '../units/Typography';

export interface AppEmptyStateProps {
  iconName?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
  customIcon?: React.ReactNode;
}

const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  iconName = 'inbox',
  iconColor = Colors.primary,
  title,
  subtitle,
  actionText,
  onActionPress,
  style,
  customIcon,
}) => {
  return (
    <View style={[styles.container, style]}>
      {customIcon ? (
        customIcon
      ) : (
        <View style={styles.iconCircle}>
          <Feather name={iconName as any} size={28} color={iconColor} />
        </View>
      )}

      <Text style={styles.title}>{title}</Text>

      {Boolean(subtitle) && <Text style={styles.subtitle}>{subtitle}</Text>}

      {Boolean(actionText && onActionPress) && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onActionPress}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default memo(AppEmptyState);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.borderBold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size.titleSmall,
    fontFamily: 'Roboto-Bold',
    color: Colors.textLightMutedAlt,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.body,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.normal,
    maxWidth: 280,
  },
  actionBtn: {
    marginTop: Spacing.xl,
    height: 44,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
});
