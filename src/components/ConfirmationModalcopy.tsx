import React, { memo } from 'react';
import AppDialog from './AppDialog';

export interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  cancelColor?: string;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Yes',
  cancelText = 'No',
  confirmColor,
  loading = false,
}) => {
  return (
    <AppDialog
      visible={visible}
      title={title}
      description={message}
      primaryButtonText={confirmText}
      primaryButtonColor={confirmColor}
      primaryButtonLoading={loading}
      onPrimaryPress={onConfirm}
      secondaryButtonText={cancelText}
      onSecondaryPress={onClose}
      onClose={onClose}
    />
  );
};

export default memo(ConfirmationModal);
