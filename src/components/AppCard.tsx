import React, { memo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Colors from '../units/Colors';
import Spacing from '../units/Spacing';
import BorderRadius from '../units/BorderRadius';

export type AppCardVariant = 'default' | 'elevated' | 'inset' | 'selected';

export interface AppCardProps {
  children: React.ReactNode;
  variant?: AppCardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  accessibilityRole?: any;
  accessibilityLabel?: string;
}

const AppCard: React.FC<AppCardProps> = ({
  children,
  variant = 'default',
  style,
  onPress,
  activeOpacity = 0.7,
  accessibilityRole,
  accessibilityLabel,
}) => {
  const variantStyle =
    variant === 'elevated'
      ? styles.elevated
      : variant === 'inset'
      ? styles.inset
      : variant === 'selected'
      ? styles.selected
      : styles.default;

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.base, variantStyle, style]}
        onPress={onPress}
        activeOpacity={activeOpacity}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.base, variantStyle, style]}>{children}</View>;
};

export default memo(AppCard);

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.borderBold,
  },
  elevated: {
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.borderBold,
  },
  inset: {
    backgroundColor: Colors.cardInset,
    borderColor: Colors.borderSubtle,
  },
  selected: {
    backgroundColor: Colors.cardSelected,
    borderColor: Colors.primary,
  },
});
