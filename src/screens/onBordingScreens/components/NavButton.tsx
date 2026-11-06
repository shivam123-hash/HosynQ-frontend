import React, { memo } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';

export interface NavButtonProps {
  iconName: any;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
  iconSize?: number;
  iconColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  hasShadow?: boolean;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  disabledBorderColor?: string;
  disabledIconColor?: string;
  accessibilityLabel?: string;
}

const NavButton: React.FC<NavButtonProps> = ({
  iconName,
  onPress,
  disabled = false,
  size = 52,
  iconSize = 22,
  iconColor,
  backgroundColor = 'transparent',
  borderColor = Colors.border,
  hasShadow = false,
  style,
  activeOpacity = 0.7,
  disabledBorderColor = '#192A44',
  disabledIconColor = '#3A4D67',
  accessibilityLabel,
}) => {
  const isTransparent = backgroundColor === 'transparent';
  const resolvedBorderColor = disabled ? disabledBorderColor : borderColor;
  const resolvedIconColor = disabled
    ? disabledIconColor
    : iconColor || (isTransparent ? Colors.text : Colors.buttonText);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        isTransparent ? styles.outlined : styles.filled,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderColor: resolvedBorderColor,
        },
        hasShadow && styles.shadow,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Feather name={iconName} size={iconSize} color={resolvedIconColor} />
    </TouchableOpacity>
  );
};

export default memo(NavButton);

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlined: {
    borderWidth: 1.5,
  },
  filled: {
    borderWidth: 0,
  },
  shadow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: {
    opacity: 0.6,
  },
});

