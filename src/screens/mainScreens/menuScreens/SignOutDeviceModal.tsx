import React from 'react';
import AppDialog from '../../../components/AppDialog';
import Colors from '../../../units/Colors';

export interface SignOutDeviceModalProps {
  visible: boolean;
  deviceName?: string;
  onClose: () => void;
  onConfirmSignOut: () => void;
}

export const SignOutDeviceModal: React.FC<SignOutDeviceModalProps> = ({
  visible,
  deviceName = 'iPad Air',
  onClose,
  onConfirmSignOut,
}) => {
  return (
    <AppDialog
      visible={visible}
      type="danger"
      iconName="log-out"
      iconColor={Colors.dangerCoral}
      iconCircleBorderColor="#334155"
      iconCircleBgColor="#1E293B"
      title={`Sign out of ${deviceName}?`}
      description={`Anyone using that ${deviceName.split(' ')[0] || 'device'} will need your mobile number and an OTP to sign back in.`}
      primaryButtonText="Sign out"
      primaryButtonVariant="danger"
      primaryButtonAccessibilityLabel={`Confirm sign out of ${deviceName}`}
      onPrimaryPress={onConfirmSignOut}
      secondaryButtonText="Cancel"
      secondaryButtonColor={Colors.primary}
      secondaryButtonAccessibilityLabel="Cancel"
      onSecondaryPress={onClose}
      onClose={onClose}
    />
  );
};

export default SignOutDeviceModal;
