import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Switch } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import AppDialog from '../../../../components/AppDialog';
import Colors from '../../../../units/Colors';
import { CalendarEvent } from '../types';

export interface CancelEventModalProps {
  visible: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onConfirmCancel: (eventId: string, cancelReason?: string) => void;
  asModal?: boolean;
}

export const CancelEventModal: React.FC<CancelEventModalProps> = ({
  visible,
  event: eventProp,
  onClose,
  onConfirmCancel,
  asModal = true,
}) => {
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState('');
  const [cachedEvent, setCachedEvent] = useState<CalendarEvent | null>(
    eventProp
  );

  React.useEffect(() => {
    if (eventProp) {
      setCachedEvent(eventProp);
    }
  }, [eventProp]);

  const event = eventProp || cachedEvent;

  if (!visible || !event) return null;

  const handleCancel = () => {
    onConfirmCancel(event.id, reason.trim() || undefined);
    onClose();
  };

  const otherNames = event.forMemberName
    ? `Rohan and ${event.forMemberName}`
    : 'Everyone invited';
  const subtitleText = `${otherNames} will be told that ${event.title} on ${event.formattedDate} is cancelled.`;

  const customIcon = (
    <View style={styles.iconCircle}>
      <Feather name="calendar" size={26} color={Colors.dangerCoral} />
      <View style={styles.xBadgeOverlay}>
        <Feather name="x" size={11} color={Colors.dangerCoral} />
      </View>
    </View>
  );

  return (
    <AppDialog
      visible={visible}
      type="danger"
      customIcon={customIcon}
      title="Cancel this event?"
      description={subtitleText}
      primaryButtonText="Cancel event"
      primaryButtonVariant="danger"
      primaryButtonAccessibilityLabel="Confirm cancel event"
      onPrimaryPress={handleCancel}
      secondaryButtonText="Keep event"
      secondaryButtonColor={Colors.primary}
      secondaryButtonAccessibilityLabel="Keep event"
      onSecondaryPress={onClose}
      onClose={onClose}
      asModal={asModal}
    >
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Add a note for them</Text>
        <Switch
          value={showReason}
          onValueChange={setShowReason}
          trackColor={{ false: '#243A5E', true: Colors.primary }}
          thumbColor={Colors.chipInactive}
          ios_backgroundColor="#243A5E"
        />
      </View>

      {showReason && (
        <View style={styles.reasonInputContainer}>
          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={setReason}
            placeholder="Add a note for them..."
            placeholderTextColor={Colors.textSecondaryMuted}
            selectionColor={Colors.primary}
            autoFocus
          />
        </View>
      )}
    </AppDialog>
  );
};

export default CancelEventModal;

const styles = StyleSheet.create({
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  xBadgeOverlay: {
    position: 'absolute',
    top: 27,
    left: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  toggleLabel: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.chipInactive,
  },
  reasonInputContainer: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  reasonInput: {
    fontSize: 14,
    color: Colors.white,
    padding: 0,
  },
});
