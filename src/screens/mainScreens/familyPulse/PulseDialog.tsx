import React from 'react';
import AppDialog from '../../../components/AppDialog';
import { Colors } from '../../../units';

export interface PulseDialogState {
  visible: boolean;
  type: 'danger' | 'warning';
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  iconName?: string;
  loading?: boolean;
  onConfirm?: () => Promise<void> | void;
}

export const INITIAL_PULSE_DIALOG_STATE: PulseDialogState = {
  visible: false,
  type: 'danger',
  title: '',
  description: '',
  primaryButtonText: 'OK',
  secondaryButtonText: '',
  loading: false,
};

interface PulseDialogProps {
  dialog: PulseDialogState;
  onClose: () => void;
}

/**
 * Shared themed confirmation & alert dialog for Family Pulse modals,
 * matching AppDialog / DeleteTaskModal styling instead of native OS alerts.
 */
export const PulseDialog: React.FC<PulseDialogProps> = ({ dialog, onClose }) => {
  const isDanger = dialog.type === 'danger';

  return (
    <AppDialog
      asModal={false}
      visible={dialog.visible}
      type={dialog.type}
      iconName={dialog.iconName}
      iconCircleBorderColor={isDanger ? Colors.dangerCoral : undefined}
      iconCircleBgColor={isDanger ? 'transparent' : undefined}
      title={dialog.title}
      description={dialog.description}
      primaryButtonText={dialog.primaryButtonText}
      primaryButtonVariant={isDanger ? 'danger' : 'primary'}
      primaryButtonColor={isDanger ? Colors.dangerCoral : Colors.primary}
      primaryButtonTextColor={isDanger ? Colors.background : Colors.white}
      primaryButtonLoading={dialog.loading}
      onPrimaryPress={dialog.onConfirm || onClose}
      secondaryButtonText={dialog.secondaryButtonText ?? ''}
      secondaryButtonColor={Colors.primary}
      onSecondaryPress={onClose}
      onClose={dialog.loading ? () => {} : onClose}
      closeOnBackdropPress={!dialog.loading}
    />
  );
};

export default PulseDialog;
