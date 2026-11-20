import React from 'react';
import AppDialog from '../../../components/AppDialog';
import Colors from '../../../units/Colors';

export interface LogoutConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirmLogout,
}) => {
  return (
    <AppDialog
      visible={visible}
      type="confirmation"
      iconName="log-out"
      iconColor={Colors.primary}
      iconCircleBorderColor="#2A3A52"
      iconCircleBgColor="#0F1A2C"
      title="Log out of HosynQ?"
      description="You’ll need your mobile number and an OTP to log back in. Your family’s data stays safe."
      primaryButtonText="Log out"
      primaryButtonVariant="primary"
      primaryButtonAccessibilityLabel="Log out"
      onPrimaryPress={onConfirmLogout}
      secondaryButtonText="Cancel"
      secondaryButtonAccessibilityLabel="Cancel"
      onSecondaryPress={onClose}
      onClose={onClose}
    />
  );
};

export default LogoutConfirmationModal;
