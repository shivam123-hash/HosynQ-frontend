import React from 'react';
import { Colors } from '../../../../units';
import AppDialog from '../../../../components/AppDialog';

export interface DeleteTaskModalProps {
  visible: boolean;
  taskTitle: string;
  isRepeating?: boolean;
  repeatText?: string;
  onClose: () => void;
  onConfirmDelete: () => void;
}

const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  visible,
  taskTitle,
  isRepeating = true,
  repeatText = 'monthly',
  onClose,
  onConfirmDelete,
}) => {
  const formatReminder = (text?: string) => {
    if (!text) return 'Future reminders stop too.';
    const lower = text.toLowerCase();
    if (lower.includes('month')) return 'Future monthly reminders stop too.';
    if (lower.includes('week')) return 'Future weekly reminders stop too.';
    if (lower.includes('day') || lower.includes('daily')) return 'Future daily reminders stop too.';
    return `Future ${lower} reminders stop too.`;
  };

  const reminderText = isRepeating
    ? formatReminder(repeatText)
    : 'Future reminders stop too.';

  return (
    <AppDialog
      visible={visible}
      type="danger"
      iconCircleBorderColor={Colors.dangerCoral}
      iconCircleBgColor="transparent"
      title="Delete this task?"
      description={`“${taskTitle}” and its comments will be removed for everyone. ${reminderText}`}
      primaryButtonText="Delete task"
      primaryButtonVariant="danger"
      primaryButtonColor={Colors.dangerCoral}
      primaryButtonTextColor={Colors.background}
      primaryButtonAccessibilityLabel="Delete task"
      onPrimaryPress={onConfirmDelete}
      secondaryButtonText="Cancel"
      secondaryButtonColor={Colors.primary}
      secondaryButtonAccessibilityLabel="Cancel"
      onSecondaryPress={onClose}
      onClose={onClose}
    />
  );
};

export default DeleteTaskModal;
