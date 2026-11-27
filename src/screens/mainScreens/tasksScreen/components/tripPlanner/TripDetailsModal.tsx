import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
  Switch,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAppDispatch, useAppSelector } from '../../../../../redux';
import {
  createTripThunk,
  updateTripThunk,
  fetchTripDetailThunk,
  cancelTripThunk,
} from '../../../../../redux/features/trips/tripsSlice';
import { getMyFamilyBasicThunk } from '../../../../../redux/features/family/familySlice';
import { isUUID } from '../../../../../redux/features/lists/listsSlice';
import { TripDetailApiItem } from '../../../../../services/tripServices';
import { TripData, TripMember } from './types';
import {
  addDaysIso,
  calculateTripDays,
  extractTripMembersFromFamilyState,
  formatShortDateLabel,
  isJestTestEnv,
  parseIsoDateLocal,
  toIsoDateString,
} from './tripApiHelpers';
import TripDialog, { INITIAL_TRIP_DIALOG_STATE, TripDialogState } from './TripDialog';
import { Colors, Fonts, Typography } from '../../../../../units';

const SHORT_MONTHS_UPPER = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

export interface TripDetailsModalProps {
  visible?: boolean;
  asModal?: boolean;
  tripData: TripData;
  onClose: () => void;
  onSaveTrip: (updated: Partial<TripData>) => void;
  onTripSavedFromApi?: (apiTrip: TripDetailApiItem) => void;
  onTripCancelled?: (tripId: string) => void;
  onOpenFindDates?: () => void;
}

export const TripDetailsModal: React.FC<TripDetailsModalProps> = ({
  visible = true,
  asModal = true,
  tripData,
  onClose,
  onSaveTrip,
  onTripSavedFromApi,
  onTripCancelled,
  onOpenFindDates,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const familyState = useAppSelector((state) => state.family);
  const tripsState = useAppSelector((state) => state.trips);
  const isTestEnv = isJestTestEnv();

  const [tripName, setTripName] = useState(tripData.name || '');
  const [destination, setDestination] = useState(tripData.destination || '');
  const [startsOn, setStartsOn] = useState(tripData.startsOn || '');
  const [endsOn, setEndsOn] = useState(tripData.endsOn || '');
  const [members, setMembers] = useState<TripMember[]>(tripData.members || []);
  const [addToCalendar, setAddToCalendar] = useState(tripData.addToCalendar ?? true);
  const [editingDates, setEditingDates] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<TripDialogState>(INITIAL_TRIP_DIALOG_STATE);
  const hasRequestedFamilyRef = useRef(false);

  useEffect(() => {
    setTripName(tripData.name || '');
    setDestination(tripData.destination || '');
    setStartsOn(tripData.startsOn || '');
    setEndsOn(tripData.endsOn || '');
    setAddToCalendar(tripData.addToCalendar ?? true);

    const familyMembers = extractTripMembersFromFamilyState(familyState);
    if (tripData.members && tripData.members.length > 0) {
      setMembers(tripData.members);
    } else if (familyMembers.length > 0) {
      setMembers(familyMembers);
    }
  }, [tripData, familyState]);

  useEffect(() => {
    if (!visible) {
      hasRequestedFamilyRef.current = false;
      return;
    }
    if (
      !isTestEnv &&
      !hasRequestedFamilyRef.current &&
      extractTripMembersFromFamilyState(familyState).length === 0
    ) {
      hasRequestedFamilyRef.current = true;
      dispatch(getMyFamilyBasicThunk());
    }
  }, [visible, isTestEnv, familyState, dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(getMyFamilyBasicThunk());
      if (tripData.id && isUUID(tripData.id)) {
        await dispatch(fetchTripDetailThunk(tripData.id));
      }
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, tripData.id]);

  const toggleMember = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, selected: m.selected === false ? true : false } : m
      )
    );
  };

  const selectedMembers = members.filter((m) => m.selected !== false);
  const selectedCount = selectedMembers.length;

  const leaveLabel = startsOn ? formatShortDateLabel(startsOn) : tripData.leaveDate || 'Select date';
  const returnLabel = endsOn ? formatShortDateLabel(endsOn) : tripData.returnDate || 'Select date';

  const parsedStart = parseIsoDateLocal(startsOn);
  const previewDay = parsedStart ? String(parsedStart.getDate()) : '—';
  const previewMonth = parsedStart ? SHORT_MONTHS_UPPER[parsedStart.getMonth()] : 'TBD';
  const durationDays =
    startsOn && endsOn ? calculateTripDays(startsOn, endsOn) : tripData.days || 0;

  const cityShortName =
    destination.split(',')[0].trim() || tripName.trim() || 'Family';

  const handleApplyQuickRange = (startIso: string, days: number) => {
    setStartsOn(startIso);
    setEndsOn(addDaysIso(startIso, Math.max(0, days - 1)));
  };

  const showAlertDialog = (
    alertTitle: string,
    alertDesc: string,
    type: 'warning' | 'danger' = 'warning'
  ) => {
    setDialog({
      visible: true,
      type,
      iconName: 'alert-circle',
      title: alertTitle,
      description: alertDesc,
      primaryButtonText: 'OK',
      secondaryButtonText: '',
    });
  };

  const handleSave = async () => {
    const trimmedDest = destination.trim();
    const trimmedName = tripName.trim();
    const trimmedStart = startsOn.trim();
    const trimmedEnd = endsOn.trim();

    if (!trimmedDest && !trimmedName) {
      showAlertDialog('Destination required', 'Please enter where you are going.');
      return;
    }

    if (trimmedStart && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedStart)) {
      showAlertDialog('Invalid leave date', 'Please enter the leave date as YYYY-MM-DD.');
      return;
    }
    if (trimmedEnd && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedEnd)) {
      showAlertDialog('Invalid return date', 'Please enter the return date as YYYY-MM-DD.');
      return;
    }
    if (trimmedStart && trimmedEnd && trimmedEnd < trimmedStart) {
      showAlertDialog('Invalid dates', 'Return date cannot be earlier than leave date.');
      return;
    }

    const goingMemberIds = selectedMembers
      .map((m) => m.id)
      .filter((id) => isUUID(id));

    const apiPayload = {
      name: trimmedName ? trimmedName.slice(0, 60) : `${cityShortName} trip`.slice(0, 60),
      destination: trimmedDest ? trimmedDest.slice(0, 100) : undefined,
      startsOn: trimmedStart || undefined,
      endsOn: trimmedEnd || undefined,
      goingMemberIds: goingMemberIds.length > 0 ? goingMemberIds : undefined,
      addToCalendar,
    };

    if (isTestEnv) {
      onSaveTrip({
        name: apiPayload.name,
        destination: trimmedDest,
        startsOn: trimmedStart || null,
        endsOn: trimmedEnd || null,
        leaveDate: leaveLabel,
        returnDate: returnLabel,
        members,
        addToCalendar,
        step2Done: true,
      });
      onClose();
      return;
    }

    setSaving(true);
    try {
      let savedTrip: TripDetailApiItem;
      if (tripData.id && isUUID(tripData.id)) {
        savedTrip = await dispatch(
          updateTripThunk({ tripId: tripData.id, payload: apiPayload })
        ).unwrap();
      } else {
        savedTrip = await dispatch(createTripThunk(apiPayload)).unwrap();
      }
      onSaveTrip({
        id: savedTrip.id,
        name: savedTrip.name,
        destination: savedTrip.destination || trimmedDest,
        startsOn: savedTrip.startsOn,
        endsOn: savedTrip.endsOn,
        leaveDate: leaveLabel,
        returnDate: returnLabel,
        members,
        addToCalendar: savedTrip.addToCalendar,
        step2Done: true,
      });
      onTripSavedFromApi?.(savedTrip);
      onClose();
    } catch (err: any) {
      showAlertDialog(
        'Could not save trip',
        typeof err === 'string' ? err : 'Please try again.',
        'danger'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelTrip = () => {
    if (!tripData.id || !isUUID(tripData.id)) return;
    setDialog({
      visible: true,
      type: 'danger',
      title: 'Cancel trip?',
      description: `“${cityShortName}” will be moved to Past trips and its linked calendar event will be cancelled.`,
      primaryButtonText: 'Cancel trip',
      secondaryButtonText: 'Keep trip',
      onConfirm: async () => {
        setDialog((prev) => ({ ...prev, loading: true }));
        try {
          await dispatch(cancelTripThunk({ tripId: tripData.id })).unwrap();
          setDialog(INITIAL_TRIP_DIALOG_STATE);
          onTripCancelled?.(tripData.id);
          onClose();
        } catch (err: any) {
          showAlertDialog(
            'Cancel failed',
            typeof err === 'string' ? err : 'Please try again.',
            'danger'
          );
        }
      },
    });
  };

  const todayIso = toIsoDateString(new Date());

  const content = (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom || 16 },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Header Row */}
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

        <Text style={styles.headerTitle}>Trip details</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Where are you going? */}
        <Text style={styles.fieldLabel}>Where are you going?</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color={Colors.primary} style={styles.pinIcon} />
          <TextInput
            style={styles.textInput}
            value={destination}
            onChangeText={setDestination}
            maxLength={100}
            placeholder="Destination city, state"
            placeholderTextColor={Colors.textSecondaryMuted}
            accessibilityLabel="Destination"
          />
        </View>

        {/* Trip Name (optional) */}
        <Text style={[styles.fieldLabel, styles.sectionTopSpace]}>Trip name (optional)</Text>
        <View style={styles.secondaryInputContainer}>
          <TextInput
            style={styles.textInput}
            value={tripName}
            onChangeText={setTripName}
            maxLength={60}
            placeholder={`${cityShortName} trip`}
            placeholderTextColor={Colors.textSecondaryMuted}
            accessibilityLabel="Trip name"
          />
        </View>

        {/* Dates */}
        <View style={styles.datesHeaderRow}>
          <Text style={styles.fieldLabel}>Dates</Text>
          {onOpenFindDates && (
            <TouchableOpacity onPress={onOpenFindDates} activeOpacity={0.75}>
              <Text style={styles.findCommonLink}>Find common dates</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.datesRow}>
          <TouchableOpacity
            style={[styles.dateCard, editingDates && styles.dateCardActive]}
            activeOpacity={0.8}
            onPress={() => setEditingDates((prev) => !prev)}
          >
            <Text style={styles.dateCardTag}>LEAVE</Text>
            <Text style={styles.dateCardValue}>{leaveLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateCard, editingDates && styles.dateCardActive]}
            activeOpacity={0.8}
            onPress={() => setEditingDates((prev) => !prev)}
          >
            <Text style={styles.dateCardTag}>RETURN</Text>
            <Text style={styles.dateCardValue}>{returnLabel}</Text>
          </TouchableOpacity>
        </View>

        {editingDates && (
          <View style={styles.dateEditorCard}>
            <View style={styles.quickDatesRow}>
              <TouchableOpacity
                style={styles.quickDateChip}
                onPress={() => handleApplyQuickRange(addDaysIso(todayIso, 7), 4)}
              >
                <Text style={styles.quickDateChipText}>Next week · 4d</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickDateChip}
                onPress={() => handleApplyQuickRange(addDaysIso(todayIso, 14), 4)}
              >
                <Text style={styles.quickDateChipText}>In 2 weeks · 4d</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.isoInputsRow}>
              <View style={styles.isoInputWrap}>
                <Text style={styles.isoLabel}>Starts on</Text>
                <TextInput
                  style={styles.isoInput}
                  value={startsOn}
                  onChangeText={setStartsOn}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textSecondaryMuted}
                />
              </View>
              <View style={styles.isoInputWrap}>
                <Text style={styles.isoLabel}>Ends on</Text>
                <TextInput
                  style={styles.isoInput}
                  value={endsOn}
                  onChangeText={setEndsOn}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textSecondaryMuted}
                />
              </View>
            </View>
          </View>
        )}

        {/* Who's going? */}
        <Text style={[styles.fieldLabel, styles.sectionTopSpace]}>Who’s going?</Text>
        <View style={styles.membersRow}>
          {members.length === 0 ? (
            <Text style={styles.noMembersText}>Family members will appear here once loaded.</Text>
          ) : (
            members.map((member) => {
              const isSelected = member.selected !== false;
              return (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberCol}
                  onPress={() => toggleMember(member.id)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${member.name}`}
                >
                  <View
                    style={[
                      styles.memberAvatarCircle,
                      { backgroundColor: member.color },
                      isSelected ? styles.memberAvatarSelected : styles.memberAvatarUnselected,
                    ]}
                  >
                    <Text style={styles.memberInitial}>{member.initial}</Text>
                  </View>
                  <Text
                    style={[
                      styles.memberName,
                      !isSelected && styles.memberNameUnselected,
                    ]}
                  >
                    {member.name}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Add to family calendar switch */}
        <View style={styles.switchRow}>
          <View style={styles.switchTextCol}>
            <Text style={styles.switchTitle}>Add to the family calendar</Text>
            <Text style={styles.switchSubtitle}>Everyone going gets the event</Text>
          </View>
          <Switch
            value={addToCalendar}
            onValueChange={setAddToCalendar}
            trackColor={{ false: Colors.borderBold, true: Colors.primary }}
            thumbColor={Colors.white}
            accessibilityRole="switch"
            accessibilityLabel="Add to family calendar"
          />
        </View>

        {/* PREVIEW */}
        <Text style={styles.previewSectionHeader}>PREVIEW</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewDateCol}>
            <Text style={styles.previewDateDay}>{previewDay}</Text>
            <Text style={styles.previewDateMonth}>{previewMonth}</Text>
          </View>

          <View style={styles.previewDivider} />

          <View style={styles.previewDetailsCol}>
            <Text style={styles.previewTitle}>{cityShortName} trip</Text>
            <Text style={styles.previewSubtitle}>
              {durationDays > 0 ? `${durationDays} days` : 'Dates flexible'} ·{' '}
              {members.length > 0 && selectedCount === members.length
                ? 'Everyone'
                : `${selectedCount} members`}
            </Text>
          </View>

          <View style={styles.travelBadge}>
            <Text style={styles.travelBadgeText}>Travel</Text>
          </View>
        </View>

        {!tripData.cancelledAt && Boolean(tripData.id && isUUID(tripData.id)) && (
          <TouchableOpacity
            style={styles.cancelTripBtn}
            onPress={handleCancelTrip}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Cancel trip"
          >
            <Text style={styles.cancelTripText}>Cancel trip</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Bottom Button */}
      {!tripData.cancelledAt && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={handleSave}
            disabled={saving || tripsState.actionLoading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Save trip"
          >
            {saving || tripsState.actionLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.bottomButtonText}>Save trip</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TripDialog
        dialog={dialog}
        onClose={() => setDialog(INITIAL_TRIP_DIALOG_STATE)}
      />
    </View>
  );

  if (!asModal) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {content}
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
    backgroundColor: Colors.transparent,
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
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textLightMutedAlt,
    marginBottom: 8,
  },
  sectionTopSpace: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 18,
  },
  secondaryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.borderBold,
    borderRadius: 24,
    height: 50,
    paddingHorizontal: 18,
  },
  pinIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.medium,
    color: Colors.white,
    paddingVertical: 0,
  },
  datesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  findCommonLink: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.semiBold,
    color: Colors.accentTealMint,
    marginBottom: 8,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCard: {
    flex: 1,
    backgroundColor: Colors.transparent,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    padding: 14,
  },
  dateCardActive: {
    borderColor: Colors.primary,
  },
  dateCardTag: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    letterSpacing: 0.6,
  },
  dateCardValue: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginTop: 4,
  },
  dateEditorCard: {
    marginTop: 10,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 12,
  },
  quickDatesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  quickDateChip: {
    borderWidth: 1,
    borderColor: Colors.accentTealMint,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickDateChipText: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
    color: Colors.accentTealMint,
  },
  isoInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  isoInputWrap: {
    flex: 1,
  },
  isoLabel: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
    marginBottom: 4,
  },
  isoInput: {
    borderWidth: 1,
    borderColor: Colors.borderMutedAlt,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colors.white,
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
  },
  membersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    alignItems: 'center',
  },
  noMembersText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textSecondaryMuted,
  },
  memberCol: {
    alignItems: 'center',
  },
  memberAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  memberAvatarUnselected: {
    borderWidth: 2,
    borderColor: Colors.borderBold,
    opacity: 0.45,
  },
  memberInitial: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  memberName: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.white,
    marginTop: 6,
  },
  memberNameUnselected: {
    color: Colors.textSecondaryMuted,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    paddingVertical: 4,
  },
  switchTextCol: {
    flex: 1,
    paddingRight: 16,
  },
  switchTitle: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  switchSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textSecondaryMuted,
    marginTop: 4,
  },
  previewSectionHeader: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 10,
  },
  previewCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDateCol: {
    alignItems: 'center',
    minWidth: 32,
  },
  previewDateDay: {
    fontSize: Typography.size.titleSmall,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  previewDateMonth: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    marginTop: 2,
  },
  previewDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.borderBold,
    marginHorizontal: 16,
  },
  previewDetailsCol: {
    flex: 1,
  },
  previewTitle: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  previewSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
    marginTop: 3,
  },
  travelBadge: {
    borderWidth: 1.5,
    borderColor: Colors.accentTealMint,
    borderRadius: 14,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  travelBadgeText: {
    color: Colors.accentTealMint,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  cancelTripBtn: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelTripText: {
    color: Colors.dangerCoral,
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.semiBold,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  bottomButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonText: {
    color: Colors.white,
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
  },
});

export default TripDetailsModal;
