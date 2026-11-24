import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../units/Colors';
import Spacing from '../units/Spacing';
import BorderRadius from '../units/BorderRadius';
import Typography from '../units/Typography';

const { height: screenHeight } = Dimensions.get('window');

export interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  scrollable?: boolean;
  showHandle?: boolean;
  children: React.ReactNode;
  primaryButtonText?: string;
  primaryButtonLoading?: boolean;
  onPrimaryPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  maxHeightRatio?: number;
  accessibilityLabel?: string;
}

const AppBottomSheet: React.FC<AppBottomSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  scrollable = false,
  showHandle = true,
  children,
  primaryButtonText,
  primaryButtonLoading = false,
  onPrimaryPress,
  secondaryButtonText,
  onSecondaryPress,
  containerStyle,
  contentContainerStyle,
  maxHeightRatio = 0.88,
  accessibilityLabel,
}) => {
  const insets = useSafeAreaInsets();
  const maxHeight = screenHeight * maxHeightRatio;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={styles.overlay}
        accessibilityLabel={accessibilityLabel || title}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              maxHeight,
              paddingBottom: Math.max(insets.bottom, 16) + 16,
            },
            containerStyle,
          ]}
        >
          {/* Top Handle Indicator */}
          {showHandle && <View style={styles.handle} />}

          {/* Title and Subtitle */}
          {Boolean(title) && <Text style={styles.title}>{title}</Text>}
          {Boolean(subtitle) && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}

          {/* Content Area */}
          {scrollable ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.fixedContent, contentContainerStyle]}>
              {children}
            </View>
          )}

          {/* Primary Action Button */}
          {Boolean(primaryButtonText) && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onPrimaryPress}
              activeOpacity={0.8}
              disabled={primaryButtonLoading}
            >
              {primaryButtonLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.actionBtnText}>{primaryButtonText}</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Secondary Action Link / Button */}
          {Boolean(secondaryButtonText) && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onSecondaryPress || onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>{secondaryButtonText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default memo(AppBottomSheet);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: BorderRadius.sheet,
    borderTopRightRadius: BorderRadius.sheet,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.handle,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.title,
    fontFamily: 'Roboto-Bold',
    color: Colors.textLightMutedAlt,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.size.body,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  fixedContent: {
    width: '100%',
  },
  actionBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  actionBtnText: {
    fontSize: Typography.size.subtitle,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  cancelBtn: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.primary,
  },
});
