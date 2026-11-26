import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { BookingKind, BookingStatus } from '../../../../../services/tripServices';
import { BOOKING_KIND_OPTIONS } from './tripConstants';
import { addDaysIso, formatShortDateLabel, toIsoDateString } from './tripApiHelpers';
import TripDialog, { INITIAL_TRIP_DIALOG_STATE, TripDialogState } from './TripDialog';
import { Colors, Fonts, Typography } from '../../../../../units';

export interface AddTripBookingModalProps {
  visible: boolean;
  tripStartsOn?: string | null;
  saving?: boolean;
  initialValues?: {
    id?: string;
    kind?: BookingKind;
    title?: string;
    details?: string;
    status?: BookingStatus;
    remindOn?: string | null;
  } | null;
  onClose: () => void;
  onSave: (payload: {
    kind: BookingKind;
    title: string;
    details?: string;
    status: BookingStatus;
    remindOn?: string;
  }) => Promise<void> | void;
}

const getKindIcon = (
  kind: BookingKind
): 'train-outline' | 'airplane-outline' | 'bus-outline' | 'car-outline' | 'bed-outline' | 'document-text-outline' | 'bookmark-outline' => {
  switch (kind) {
    case 'TRAIN':
      return 'train-outline';
    case 'FLIGHT':
      return 'airplane-outline';
    case 'BUS':
      return 'bus-outline';
    case 'CAB':
      return 'car-outline';
    case 'HOTEL':
      return 'bed-outline';
    case 'DOCUMENT':
      return 'document-text-outline';
    default:
      return 'bookmark-outline';
  }
};

export const AddTripBookingModal: React.FC<AddTripBookingModalProps> = ({
  visible,
  tripStartsOn,
  saving = false,
  initialValues,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [kind, setKind] = useState<BookingKind>(initialValues?.kind || 'TRAIN');
  const [title, setTitle] = useState(initialValues?.title || '');
  const [details, setDetails] = useState(initialValues?.details || '');
  const [status, setStatus] = useState<BookingStatus>(initialValues?.status || 'PENDING');
  const [remindOn, setRemindOn] = useState<string>(initialValues?.remindOn || '');
  const [dialog, setDialog] = useState<TripDialogState>(INITIAL_TRIP_DIALOG_STATE);

  useEffect(() => {
    if (visible) {
      setKind(initialValues?.kind || 'TRAIN');
      setTitle(initialValues?.title || '');
      setDetails(initialValues?.details || '');
      setStatus(initialValues?.status || 'PENDING');
      setRemindOn(initialValues?.remindOn || '');
    }
  }, [visible, initialValues]);

  const todayIso = toIsoDateString(new Date());
  const quickReminders = [
    { label: 'No reminder', value: '' },
    { label: 'Today', value: todayIso },
    { label: 'In 3 days', value: addDaysIso(todayIso, 3) },
    ...(tripStartsOn && tripStartsOn > todayIso
      ? [{ label: '2 days before trip', value: addDaysIso(tripStartsOn, -2) >= todayIso ? addDaysIso(tripStartsOn, -2) : todayIso }]
      : []),
  ];

  const handleSubmit = async () => {
    const cleanTitle = title.trim();
    const showWarning = (warnTitle: string, warnDesc: string) =>
      setDialog({
        visible: true,
        type: 'warning',
        title: warnTitle,
        description: warnDesc,
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });

    if (!cleanTitle) {
      showWarning('Title required', 'Please enter a title (up to 60 characters).');
      return;
    }
    if (remindOn && !/^\d{4}-\d{2}-\d{2}$/.test(remindOn.trim())) {
      showWarning('Invalid reminder date', 'Please enter reminder date as YYYY-MM-DD.');
      return;
    }
    if (remindOn && remindOn.trim() < todayIso) {
      showWarning('Invalid reminder date', 'Reminder date cannot be in the past.');
      return;
    }

    await onSave({
      kind,
      title: cleanTitle.slice(0, 60),
      details: details.trim() ? details.trim().slice(0, 120) : undefined,
      status,
      remindOn: remindOn.trim() ? remindOn.trim() : undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom || 16 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {initialValues?.id ? 'Edit booking' : 'Add booking'}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Kind Chips */}
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <View style={styles.chipWrap}>
            {BOOKING_KIND_OPTIONS.map((opt) => {
              const active = kind === opt.kind;
              return (
                <TouchableOpacity
                  key={opt.kind}
                  style={[styles.kindChip, active && styles.kindChipActive]}
                  onPress={() => setKind(opt.kind)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={getKindIcon(opt.kind)}
                    size={15}
                    color={active ? Colors.background : Colors.textLightMutedAlt}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.kindChipText,
                      active && styles.kindChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Title */}
          <Text style={styles.fieldLabel}>TITLE</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
              placeholder="e.g., Kalka-Shimla train, Hotel stay"
              placeholderTextColor={Colors.textSecondaryMuted}
              accessibilityLabel="Booking title"
            />
          </View>

          {/* Details */}
          <Text style={styles.fieldLabel}>DETAILS (OPTIONAL)</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              value={details}
              onChangeText={setDetails}
              maxLength={120}
              placeholder="e.g., Dec 10 · 3 seats, or 4 nights"
              placeholderTextColor={Colors.textSecondaryMuted}
              accessibilityLabel="Booking details"
            />
          </View>

          {/* Status */}
          <Text style={styles.fieldLabel}>STATUS</Text>
          <View style={styles.statusRow}>
            {(
              [
                { value: 'PENDING', label: 'Not booked' },
                { value: 'DONE', label: 'Booked' },
                { value: 'NOT_NEEDED', label: 'Not needed' },
              ] as Array<{ value: BookingStatus; label: string }>
            ).map((opt) => {
              const active = status === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.statusChip, active && styles.statusChipActive]}
                  onPress={() => setStatus(opt.value)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      active && styles.statusChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Reminder */}
          <Text style={styles.fieldLabel}>REMINDER DATE (OPTIONAL)</Text>
          <View style={styles.chipWrap}>
            {quickReminders.map((q) => {
              const active = remindOn === q.value;
              return (
                <TouchableOpacity
                  key={q.label}
                  style={[styles.kindChip, active && styles.kindChipActive]}
                  onPress={() => setRemindOn(q.value)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.kindChipText,
                      active && styles.kindChipTextActive,
                    ]}
                  >
                    {q.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.inputBox}>
            <Ionicons
              name="notifications-outline"
              size={18}
              color={Colors.primary}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.textInput}
              value={remindOn}
              onChangeText={setRemindOn}
              placeholder="YYYY-MM-DD (e.g., 2026-12-01)"
              placeholderTextColor={Colors.textSecondaryMuted}
              accessibilityLabel="Reminder date"
            />
          </View>
          {Boolean(remindOn) && /^\d{4}-\d{2}-\d{2}$/.test(remindOn.trim()) && (
            <Text style={styles.helperText}>
              Reminder set for {formatShortDateLabel(remindOn.trim())}
            </Text>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSubmit}
            disabled={saving}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Save booking"
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>
                {initialValues?.id ? 'Save changes' : 'Add booking'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TripDialog
          dialog={dialog}
          onClose={() => setDialog(INITIAL_TRIP_DIALOG_STATE)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.size.titleSmall,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  headerPlaceholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  fieldLabel: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    letterSpacing: 1.1,
    marginTop: 18,
    marginBottom: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  kindChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.transparent,
  },
  kindChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  kindChipText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
  kindChipTextActive: {
    color: Colors.background,
    fontFamily: Fonts.bold,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderBold,
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    height: 52,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.medium,
    color: Colors.white,
    paddingVertical: 0,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statusChipActive: {
    borderColor: Colors.accentTealMint,
    backgroundColor: 'rgba(45, 212, 191, 0.14)',
  },
  statusChipText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
  statusChipTextActive: {
    color: Colors.accentTealMint,
    fontFamily: Fonts.bold,
  },
  helperText: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.medium,
    color: Colors.accentTealMint,
    marginTop: 8,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
});

export default AddTripBookingModal;
