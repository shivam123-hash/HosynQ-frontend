import React from 'react';
import { View, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import AppDialog from '../../../components/AppDialog';
import Colors from '../../../units/Colors';

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
      computedPrimaryColor = computedPrimaryColor || Colors.dangerCoral;
      computedSecondaryText = computedSecondaryText || 'Cancel';
      iconRingColor = 'rgba(240, 106, 109, 0.4)';
      iconBgColor = 'rgba(240, 106, 109, 0.08)';
      iconComponent = <Feather name="trash-2" size={22} color={Colors.dangerCoral} />;
      break;

    case 'leave_family':
      computedTitle = computedTitle || `Leave ${familyName}?`;
      computedDescription =
        computedDescription ||
        'You’ll lose access to shared tasks, calendar, chat and Family Vault. Your own Life Profile goes with you.';
      computedPrimaryText = computedPrimaryText || 'Leave family';
      computedPrimaryColor = computedPrimaryColor || Colors.dangerCoral;
      computedSecondaryText = computedSecondaryText || 'Stay';
      iconRingColor = 'rgba(240, 106, 109, 0.4)';
      iconBgColor = 'rgba(240, 106, 109, 0.08)';
      iconComponent = <Feather name="log-out" size={22} color={Colors.dangerCoral} />;
      break;

    case 'transfer_owner_required':
      computedTitle = computedTitle || 'Make someone else Owner first';
      computedDescription =
        computedDescription ||
        `You’re the Owner of ${familyName}. Transfer ownership to another adult before you leave.`;
      computedPrimaryText = computedPrimaryText || 'Transfer ownership';
      computedPrimaryColor = computedPrimaryColor || Colors.primary;
      computedSecondaryText = computedSecondaryText || 'Cancel';
      iconRingColor = 'rgba(238, 147, 58, 0.4)';
      iconBgColor = 'rgba(238, 147, 58, 0.08)';
      iconComponent = <CrownIcon size={22} color={Colors.primary} />;
      break;

    case 'custom':
    default:
      computedTitle = computedTitle || 'Are you sure?';
      computedDescription = computedDescription || '';
      computedPrimaryText = computedPrimaryText || 'Confirm';
      computedPrimaryColor = computedPrimaryColor || Colors.dangerCoral;
      computedSecondaryText = computedSecondaryText || 'Cancel';
      iconComponent = <Feather name="alert-circle" size={22} color={Colors.dangerCoral} />;
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

  const customIcon = (
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
  );

  return (
    <AppDialog
      visible={visible}
      type="custom"
      customIcon={customIcon}
      title={computedTitle}
      description={computedDescription}
      primaryButtonText={computedPrimaryText}
      primaryButtonColor={computedPrimaryColor}
      primaryButtonAccessibilityLabel={computedPrimaryText}
      onPrimaryPress={handleConfirm}
      secondaryButtonText={computedSecondaryText}
      secondaryButtonColor="#8A9BAE"
      secondaryButtonAccessibilityLabel={computedSecondaryText}
      onSecondaryPress={handleSecondary}
      onClose={onClose}
      asModal={!isScreen}
    />
  );
};

const styles = StyleSheet.create({
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});

export default FamilyActionConfirmationModal;
