import React from 'react';
import AppDialog from '../../../../components/AppDialog';

export interface DiscardChangesModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

const DiscardChangesModal: React.FC<DiscardChangesModalProps> = ({
  visible,
  title = 'Discard this task?',
  subtitle = 'You haven’t saved it yet. If you leave now, what you typed will be lost.',
  onKeepEditing,
  onDiscard,
}) => {
  return (
    <AppDialog
      visible={visible}
      type="danger"
      iconName="alert-circle"
      iconColor="#F06A6A"
      iconCircleBorderColor="#F06A6A"
      iconCircleBgColor="transparent"
      title={title}
      description={subtitle}
      primaryButtonText="Keep editing"
      primaryButtonVariant="primary"
      primaryButtonColor="#F0913A"
      primaryButtonTextColor="#FFFFFF"
      primaryButtonAccessibilityLabel="Keep editing"
      onPrimaryPress={onKeepEditing}
      secondaryButtonText="Discard"
      secondaryButtonColor="#F06A6A"
      secondaryButtonAccessibilityLabel="Discard"
      onSecondaryPress={onDiscard}
      onClose={onKeepEditing}
    />
  );
};

export default DiscardChangesModal;
