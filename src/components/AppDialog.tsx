import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../units/Colors';
import Spacing from '../units/Spacing';
import BorderRadius from '../units/BorderRadius';
import Typography from '../units/Typography';

const { width } = Dimensions.get('window');

export type AppDialogType =
  | 'confirmation'
  | 'danger'
  | 'warning'
  | 'info'
  | 'success'
  | 'custom';

export interface AppDialogProps {
  visible: boolean;
  type?: AppDialogType;
  title: string;
  description?: string;
  iconName?: string;
  iconColor?: string;
  iconCircleBorderColor?: string;
  iconCircleBgColor?: string;
  customIcon?: React.ReactNode;
  children?: React.ReactNode;
  primaryButtonText?: string;
  primaryButtonVariant?: 'primary' | 'danger';
  primaryButtonColor?: string;
  primaryButtonTextColor?: string;
  primaryButtonLoading?: boolean;
  onPrimaryPress?: () => void;
  secondaryButtonText?: string;
  secondaryButtonColor?: string;
  onSecondaryPress?: () => void;
  onClose: () => void;
  closeOnBackdropPress?: boolean;
  accessibilityLabel?: string;
  primaryButtonAccessibilityLabel?: string;
  secondaryButtonAccessibilityLabel?: string;
  asModal?: boolean;
}

const TYPE_CONFIGS: Record<
  AppDialogType,
  {
    iconName: string;
    iconColor: string;
    circleBorder: string;
    circleBg: string;
    variant: 'primary' | 'danger';
  }
> = {
  confirmation: {
    iconName: 'help-circle',
    iconColor: Colors.primary,
    circleBorder: '#2A3A52',
    circleBg: Colors.cardInset,
    variant: 'primary',
  },
  danger: {
    iconName: 'trash-2',
    iconColor: Colors.dangerCoral,
    circleBorder: Colors.dangerCoral,
    circleBg: 'transparent',
    variant: 'danger',
  },
  warning: {
    iconName: 'alert-circle',
    iconColor: Colors.primary,
    circleBorder: '#6B3A2A',
    circleBg: Colors.cardBackground,
    variant: 'primary',
  },
  info: {
    iconName: 'info',
    iconColor: Colors.info,
    circleBorder: Colors.borderBold,
    circleBg: Colors.cardBackground,
    variant: 'primary',
  },
  success: {
    iconName: 'check',
    iconColor: Colors.successMint,
    circleBorder: '#1A3D2D',
    circleBg: Colors.cardBackground,
    variant: 'primary',
  },
  custom: {
    iconName: 'info',
    iconColor: Colors.primary,
    circleBorder: Colors.borderBold,
    circleBg: Colors.cardBackground,
    variant: 'primary',
  },
};

const AppDialog: React.FC<AppDialogProps> = ({
  visible,
  type = 'confirmation',
  title,
  description,
  iconName,
  iconColor,
  iconCircleBorderColor,
  iconCircleBgColor,
  customIcon,
  children,
  primaryButtonText,
  primaryButtonVariant,
  primaryButtonColor,
  primaryButtonTextColor,
  primaryButtonLoading = false,
  onPrimaryPress,
  secondaryButtonText = 'Cancel',
  secondaryButtonColor = Colors.primary,
  onSecondaryPress,
  onClose,
  closeOnBackdropPress = true,
  accessibilityLabel,
  primaryButtonAccessibilityLabel,
  secondaryButtonAccessibilityLabel,
  asModal = true,
}) => {
  const config = TYPE_CONFIGS[type];
  const activeIconName = iconName || config.iconName;
  const activeIconColor = iconColor || config.iconColor;
  const activeBorderColor = iconCircleBorderColor || config.circleBorder;
  const activeCircleBg = iconCircleBgColor || config.circleBg;
  const activeVariant = primaryButtonVariant || config.variant;

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  if (!visible) {
    return null;
  }

  const dialogContent = (
    <View
      style={[
        styles.overlay,
        !asModal && styles.overlayAbsolute,
      ]}
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel || title}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      />

      <View style={styles.cardContainer}>
        {/* Top Emblem Circle */}
        {customIcon ? (
          customIcon
        ) : (
          <View
            style={[
              styles.iconCircle,
              {
                borderColor: activeBorderColor,
                backgroundColor: activeCircleBg,
              },
            ]}
          >
            <Feather
              name={activeIconName as any}
              size={24}
              color={activeIconColor}
            />
          </View>
        )}

        {/* Dialog Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Optional Subtitle / Description */}
        {Boolean(description) && (
          <Text style={styles.description}>{description}</Text>
        )}

        {/* Optional Children / Custom Form Content */}
        {children}

        {/* Primary Action Button */}
        {Boolean(primaryButtonText) && (
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              activeVariant === 'danger'
                ? styles.dangerBtn
                : styles.brandBtn,
              primaryButtonColor ? { backgroundColor: primaryButtonColor } : null,
            ]}
            onPress={onPrimaryPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={primaryButtonAccessibilityLabel || primaryButtonText}
            disabled={primaryButtonLoading}
          >
            {primaryButtonLoading ? (
              <ActivityIndicator
                color={Colors.white}
              />
            ) : (
              <Text
                style={[
                  styles.primaryBtnText,
                  activeVariant === 'danger'
                    ? styles.dangerBtnText
                    : styles.brandBtnText,
                  primaryButtonTextColor ? { color: primaryButtonTextColor } : null,
                ]}
              >
                {primaryButtonText}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Secondary Action Button */}
        {Boolean(secondaryButtonText) && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onSecondaryPress || onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={secondaryButtonAccessibilityLabel || secondaryButtonText}
          >
            <Text
              style={[
                styles.secondaryBtnText,
                { color: secondaryButtonColor },
              ]}
            >
              {secondaryButtonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (!asModal) {
    return dialogContent;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {dialogContent}
    </Modal>
  );
};

export default memo(AppDialog);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  overlayAbsolute: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  cardContainer: {
    width: Math.min(width * 0.88, 340),
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.dialog,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    zIndex: 10,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size.title,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: Typography.size.body,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.normal,
    marginBottom: Spacing.xxl,
  },
  primaryBtn: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandBtn: {
    backgroundColor: Colors.primary,
  },
  dangerBtn: {
    backgroundColor: Colors.dangerCoral,
  },
  primaryBtnText: {
    fontSize: Typography.size.subtitle,
    fontFamily: 'Roboto-Bold',
  },
  brandBtnText: {
    color: Colors.white,
  },
  dangerBtnText: {
    color: '#0B1A2F',
    fontFamily: 'Roboto-Bold',
  },
  secondaryBtn: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: 'Roboto-SemiBold',
  },
});
