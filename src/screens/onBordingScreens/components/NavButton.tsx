import React, { memo } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

const BG = Colors.background || '#0E1A2E';
const DISABLED = '#3A4A60';

export interface NavButtonProps {
  direction: 'prev' | 'next';
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'outline' | 'filled';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const NavButton: React.FC<NavButtonProps> = ({
  direction,
  onPress,
  disabled = false,
  variant = 'outline',
  accessibilityLabel,
  style,
}) => {
  const isFilled = variant === 'filled';
  const chevronChar = direction === 'prev' ? '‹' : '›';

  const chevronColor = disabled
    ? 'rgba(58, 74, 96, 0.4)'
    : isFilled
      ? BG
      : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        isFilled ? styles.btnFilled : styles.btnOutline,
        disabled && styles.btnDisabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.iconCenter}>
        <Text style={[styles.chevron, { color: chevronColor }]}>
          {chevronChar}
        </Text>
      </View>
    </Pressable>
  );
};

export default memo(NavButton);

const styles = StyleSheet.create({
  btn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFilled: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  btnOutline: {
    borderWidth: 1.2,
    borderColor: DISABLED,
    backgroundColor: 'transparent',
  },
  btnDisabled: {
    borderColor: 'rgba(58, 74, 96, 0.35)',
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.75,
  },
  iconCenter: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: RFValue(30),
    lineHeight: RFValue(30),
    fontFamily: 'Roboto-Regular',
  },
});
