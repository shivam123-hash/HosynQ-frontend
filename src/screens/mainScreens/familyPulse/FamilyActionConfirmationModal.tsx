import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export type FamilyActionModalType =
  | 'remove_member'
  | 'leave_family'
  | 'transfer_owner_required'
  | 'custom';

export interface FamilyActionConfirmationModalProps {
  visible: boolean;
  type?: FamilyActionModalType;
  memberName?: string;
  memberGender?: 'female' | 'male' | 'other';
  familyName?: string;
  onClose: () => void;
  onConfirm?: () => void;
  onSecondary?: () => void;
  // Custom overrides
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonColor?: string;
  secondaryButtonText?: string;
  iconName?: string;
  iconColor?: string;
  isScreen?: boolean;
}

// Geometric Crown Icon matching Figma 3-peak outline
const CrownIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = '#EE933A',
}) => {
  const s = size / 24;
  return (
    <View
      style={{
        width: 24 * s,
        height: 18 * s,
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <View
        style={{
          width: 22 * s,
          height: 13 * s,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View
          style={{
            width: 1.8 * s,
            height: 11 * s,
            backgroundColor: color,
            borderRadius: 0.8 * s,
            transform: [{ rotate: '-18deg' }],
          }}
        />
        <View
          style={{
            width: 1.8 * s,
            height: 13.5 * s,
            backgroundColor: color,
            borderRadius: 0.8 * s,
            transform: [{ rotate: '19deg' }],
          }}
        />
        <View
          style={{
            width: 1.8 * s,
            height: 13.5 * s,
            backgroundColor: color,
            borderRadius: 0.8 * s,
            transform: [{ rotate: '-19deg' }],
          }}
        />
        <View
          style={{
            width: 1.8 * s,
            height: 11 * s,
            backgroundColor: color,
            borderRadius: 0.8 * s,
            transform: [{ rotate: '18deg' }],
          }}
        />
      </View>
      <View
        style={{
          width: 22 * s,
          height: 2 * s,
          backgroundColor: color,
          borderRadius: 1 * s,
          marginTop: 1 * s,
        }}
      />
    </View>
  );
};

export const FamilyActionConfirmationModal: React.FC<
  FamilyActionConfirmationModalProps
> = ({
  visible,
  type = 'remove_member',
  memberName = 'Dadi',
  memberGender,
  familyName = 'The Sharma Family',
  onClose,
  onConfirm,
  onSecondary,
  title,
  description,
  primaryButtonText,
  primaryButtonColor,
  secondaryButtonText,
  isScreen = false,
}) => {
  // Determine pronoun: default to 'she' for common female names/relations, else 'they'
  const isFemale =
    memberGender === 'female' ||
    ['dadi', 'priya', 'anaya', 'meera', 'mom', 'mother', 'sister', 'grandmother'].some((w) =>
      memberName.toLowerCase().includes(w)
    );
  const pronoun = memberGender ? (memberGender === 'female' ? 'she' : 'he') : isFemale ? 'she' : 'they';

  // Config based on type
  let computedTitle = title;
  let computedDescription = description;
  let computedPrimaryText = primaryButtonText;
  let computedPrimaryColor = primaryButtonColor;
  let computedSecondaryText = secondaryButtonText;
  let iconComponent: React.ReactNode = null;
  let iconRingColor = 'rgba(240, 106, 109, 0.4)';
  let iconBgColor = 'rgba(240, 106, 109, 0.08)';

  switch (type) {
    case 'remove_member':
      computedTitle = computedTitle || `Remove ${memberName} from the family?`;
      computedDescription =
        computedDescription ||
        `${memberName} will lose access to shared tasks, calendar, chat and Family Vault. Things ${pronoun} added will stay.`;
      computedPrimaryText = computedPrimaryText || `Remove ${memberName}`;
      computedPrimaryColor = computedPrimaryColor || '#F06A6D';
      computedSecondaryText = computedSecondaryText || 'Cancel';
      iconRingColor = 'rgba(240, 106, 109, 0.4)';
      iconBgColor = 'rgba(240, 106, 109, 0.08)';
      iconComponent = <Feather name="trash-2" size={22} color="#F06A6D" />;
      break;

    case 'leave_family':
      computedTitle = computedTitle || `Leave ${familyName}?`;
      computedDescription =
        computedDescription ||
        'You’ll lose access to shared tasks, calendar, chat and Family Vault. Your own Life Profile goes with you.';
      computedPrimaryText = computedPrimaryText || 'Leave family';
      computedPrimaryColor = computedPrimaryColor || '#F06A6D';
      computedSecondaryText = computedSecondaryText || 'Stay';
      iconRingColor = 'rgba(240, 106, 109, 0.4)';
      iconBgColor = 'rgba(240, 106, 109, 0.08)';
      iconComponent = <Feather name="log-out" size={22} color="#F06A6D" />;
      break;

    case 'transfer_owner_required':
      computedTitle = computedTitle || 'Make someone else Owner first';
      computedDescription =
        computedDescription ||
        `You’re the Owner of ${familyName}. Transfer ownership to another adult before you leave.`;
      computedPrimaryText = computedPrimaryText || 'Transfer ownership';
      computedPrimaryColor = computedPrimaryColor || '#EE933A';
      computedSecondaryText = computedSecondaryText || 'Cancel';
      iconRingColor = 'rgba(238, 147, 58, 0.4)';
      iconBgColor = 'rgba(238, 147, 58, 0.08)';
      iconComponent = <CrownIcon size={22} color="#EE933A" />;
      break;

    case 'custom':
    default:
      computedTitle = computedTitle || 'Are you sure?';
      computedDescription = computedDescription || '';
      computedPrimaryText = computedPrimaryText || 'Confirm';
      computedPrimaryColor = computedPrimaryColor || '#F06A6D';
      computedSecondaryText = computedSecondaryText || 'Cancel';
      iconComponent = <Feather name="alert-circle" size={22} color="#F06A6D" />;
      break;
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleSecondary = () => {
    if (onSecondary) {
      onSecondary();
    }
    onClose();
  };

  const modalContent = (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss modal">
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.cardContainer}>
        {/* Top Icon Badge */}
        <View
          style={[
            styles.iconBadge,
            {
              borderColor: iconRingColor,
              backgroundColor: iconBgColor,
            },
          ]}
        >
          {iconComponent}
        </View>

        {/* Modal Title */}
        <Text style={styles.title}>{computedTitle}</Text>

        {/* Modal Description */}
        <Text style={styles.description}>{computedDescription}</Text>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: computedPrimaryColor },
          ]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={computedPrimaryText}
        >
          <Text style={styles.primaryButtonText}>{computedPrimaryText}</Text>
        </TouchableOpacity>

        {/* Secondary Action Button / Cancel / Stay */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSecondary}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={computedSecondaryText}
        >
          <Text style={styles.secondaryButtonText}>
            {computedSecondaryText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isScreen) {
    return modalContent;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {modalContent}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 22, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#122440',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 22,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#8A9BAE',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#8A9BAE',
  },
});

export default FamilyActionConfirmationModal;
