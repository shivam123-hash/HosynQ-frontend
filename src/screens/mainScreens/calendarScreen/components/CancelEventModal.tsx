import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Switch,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
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

  const content = (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Dismiss cancel dialog"
      />

      <View style={styles.cardContainer}>
        {/* Calendar X Badge (CAL-08) */}
        <View style={styles.iconCircle}>
          <Feather name="calendar" size={26} color="#F06A6A" />
          <View style={styles.xBadgeOverlay}>
            <Feather name="x" size={11} color="#F06A6A" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Cancel this event?</Text>
        <Text style={styles.subtitle}>{subtitleText}</Text>

        {/* Toggle: Add a note for them */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Add a note for them</Text>
          <Switch
            value={showReason}
            onValueChange={setShowReason}
            trackColor={{ false: '#243A5E', true: '#F0913A' }}
            thumbColor="#CAD4DF"
            ios_backgroundColor="#243A5E"
          />
        </View>

        {/* Expanded Note Input */}
        {showReason && (
          <View style={styles.reasonInputContainer}>
            <TextInput
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              placeholder="Add a note for them..."
              placeholderTextColor="#8A97AB"
              selectionColor="#F0913A"
              autoFocus
            />
          </View>
        )}

        {/* Coral/Red Cancel Event Button */}
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleCancel}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Confirm cancel event"
        >
          <Text style={styles.confirmBtnText}>Cancel event</Text>
        </TouchableOpacity>

        {/* Orange Keep Event Link */}
        <TouchableOpacity
          style={styles.keepBtn}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Keep event"
        >
          <Text style={styles.keepBtnText}>Keep event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!asModal) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

export default CancelEventModal;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 10, 20, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#122440',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#78363C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  xBadgeOverlay: {
    position: 'absolute',
    top: 31,
    left: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#CAD4DF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
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
    fontWeight: '600',
    color: '#CAD4DF',
  },
  reasonInputContainer: {
    width: '100%',
    backgroundColor: '#0B1A2F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  reasonInput: {
    fontSize: 14,
    color: '#FFFFFF',
    padding: 0,
  },
  confirmBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F06A6A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0B1A2F',
  },
  keepBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  keepBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F0913A',
  },
});
