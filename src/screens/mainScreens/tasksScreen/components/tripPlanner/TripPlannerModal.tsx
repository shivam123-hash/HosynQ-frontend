import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAppDispatch, useAppSelector } from '../../../../../redux';
import {
  cancelTripThunk,
  fetchTripDetailThunk,
  fetchTripPackingListThunk,
} from '../../../../../redux/features/trips/tripsSlice';
import { isUUID } from '../../../../../redux/features/lists/listsSlice';
import { TripOverviewSkeleton } from '../../../../../components/SkeletonLoader';
import { TripData } from './types';
import {
  extractTripMembersFromFamilyState,
  formatShortDateLabel,
  isJestTestEnv,
  mapApiListDetailToPackingItems,
  mapApiTripToUiTrip,
} from './tripApiHelpers';
import FindCommonDatesModal from './FindCommonDatesModal';
import TripDetailsModal from './TripDetailsModal';
import TripBookingsModal from './TripBookingsModal';
import TripPackingModal from './TripPackingModal';
import TripDialog, { INITIAL_TRIP_DIALOG_STATE, TripDialogState } from './TripDialog';
import AppOptionsMenu from '../../../common/AppOptionsMenu';
import { Colors, Fonts, Typography } from '../../../../../units';

export type TripScreenName = 'overview' | 'dates' | 'details' | 'bookings' | 'packing';

export interface TripPlannerModalProps {
  visible: boolean;
  tripData: TripData;
  initialScreen?: TripScreenName;
  onClose: () => void;
  onUpdateTripData?: (updated: TripData) => void;
  onOpenDates?: () => void;
  onOpenDetails?: () => void;
  onOpenBookings?: () => void;
  onOpenPacking?: () => void;
}

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  visible,
  tripData: tripDataProp,
  initialScreen,
  onClose,
  onUpdateTripData,
  onOpenDates,
  onOpenDetails,
  onOpenBookings,
  onOpenPacking,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const tripsState = useAppSelector((state) => state.trips);
  const familyState = useAppSelector((state) => state.family);
  const isTestEnv = isJestTestEnv();

  const [localTripData, setLocalTripData] = useState<TripData>(tripDataProp);
  const [currentScreen, setCurrentScreen] = useState<TripScreenName>(
    initialScreen || (tripDataProp.step1Done ? 'overview' : 'dates')
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dialog, setDialog] = useState<TripDialogState>(INITIAL_TRIP_DIALOG_STATE);
  const wasVisibleRef = useRef(false);
  const fetchedPackingListIdRef = useRef<string | null>(null);

  useEffect(() => {
    setLocalTripData(tripDataProp);
  }, [tripDataProp]);

  useEffect(() => {
    if (!visible) {
      setIsMenuOpen(false);
      wasVisibleRef.current = false;
      fetchedPackingListIdRef.current = null;
      return;
    }

    if (!wasVisibleRef.current) {
      wasVisibleRef.current = true;
      if (initialScreen) {
        setCurrentScreen(initialScreen);
      } else {
        setCurrentScreen(tripDataProp.step1Done ? 'overview' : 'dates');
      }

      if (!isTestEnv && tripDataProp.id && isUUID(tripDataProp.id)) {
        dispatch(fetchTripDetailThunk(tripDataProp.id));
      }
      if (!isTestEnv && tripDataProp.packingListId && isUUID(tripDataProp.packingListId)) {
        fetchedPackingListIdRef.current = tripDataProp.packingListId;
        dispatch(fetchTripPackingListThunk(tripDataProp.packingListId));
      }
    }
  }, [visible, initialScreen, tripDataProp.step1Done, tripDataProp.id, tripDataProp.packingListId, dispatch, isTestEnv]);

  // Sync Redux selectedTrip & packingList -> localTripData when detail returns from server
  useEffect(() => {
    if (
      !isTestEnv &&
      visible &&
      tripsState.selectedTrip &&
      localTripData.id &&
      tripsState.selectedTrip.id === localTripData.id
    ) {
      const resolvedPackingListId =
        tripsState.selectedTrip.packingList?.id ||
        tripsState.selectedTrip.packingListId ||
        localTripData.packingListId;

      if (
        resolvedPackingListId &&
        isUUID(resolvedPackingListId) &&
        tripsState.packingList?.id !== resolvedPackingListId &&
        fetchedPackingListIdRef.current !== resolvedPackingListId
      ) {
        fetchedPackingListIdRef.current = resolvedPackingListId;
        dispatch(fetchTripPackingListThunk(resolvedPackingListId));
      }

      const famMembers = extractTripMembersFromFamilyState(familyState);
      const packingItems =
        tripsState.packingList &&
        resolvedPackingListId &&
        tripsState.packingList.id === resolvedPackingListId
          ? mapApiListDetailToPackingItems(tripsState.packingList)
          : localTripData.packingItems;
      const mapped = mapApiTripToUiTrip(
        tripsState.selectedTrip,
        famMembers,
        packingItems
      );
      setLocalTripData(mapped);
      onUpdateTripData?.(mapped);
    }
  }, [tripsState.selectedTrip, tripsState.packingList, visible, isTestEnv, dispatch]);

  const handleRefreshOverview = useCallback(async () => {
    if (!localTripData.id || !isUUID(localTripData.id)) return;
    setRefreshing(true);
    try {
      const tasks: Array<Promise<any>> = [
        dispatch(fetchTripDetailThunk(localTripData.id)).unwrap(),
      ];
      if (localTripData.packingListId && isUUID(localTripData.packingListId)) {
        tasks.push(dispatch(fetchTripPackingListThunk(localTripData.packingListId)).unwrap());
      }
      await Promise.all(tasks);
    } catch {
      // handled in slice
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, localTripData.id, localTripData.packingListId]);

  const tripData = localTripData;

  const selectedMemberIds = useMemo(
    () => tripData.members.filter((m) => m.selected !== false).map((m) => m.id),
    [tripData.members]
  );

  const commitTripUpdate = (updated: TripData) => {
    setLocalTripData(updated);
    onUpdateTripData?.(updated);
  };

  const handleOpenDates = () => {
    if (onOpenDates) onOpenDates();
    setCurrentScreen('dates');
  };

  const handleOpenDetails = () => {
    if (onOpenDetails) onOpenDetails();
    setCurrentScreen('details');
  };

  const handleOpenBookings = () => {
    if (onOpenBookings) onOpenBookings();
    setCurrentScreen('bookings');
  };

  const handleOpenPacking = () => {
    if (onOpenPacking) onOpenPacking();
    setCurrentScreen('packing');
  };

  // Sub-screens rendered seamlessly inside the single root modal
  if (currentScreen === 'dates') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <FindCommonDatesModal
          asModal={false}
          visible={true}
          tripId={tripData.id}
          memberIds={selectedMemberIds}
          initialDays={tripData.days || 4}
          onClose={() => setCurrentScreen('overview')}
          onSelectDates={(chosenDates, range) => {
            const updated: TripData = {
              ...tripData,
              datesText: chosenDates,
              startsOn: range?.startsOn || tripData.startsOn,
              endsOn: range?.endsOn || tripData.endsOn,
              days: range?.days || tripData.days,
              durationText: range?.days ? `${range.days} days` : tripData.durationText,
              leaveDate: range?.startsOn ? formatShortDateLabel(range.startsOn) : tripData.leaveDate,
              returnDate: range?.endsOn ? formatShortDateLabel(range.endsOn) : tripData.returnDate,
              step1Done: true,
            };
            commitTripUpdate(updated);
            setCurrentScreen('details');
          }}
        />
      </Modal>
    );
  }

  if (currentScreen === 'details') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TripDetailsModal
          asModal={false}
          visible={true}
          tripData={tripData}
          onClose={() => setCurrentScreen('overview')}
          onOpenFindDates={() => setCurrentScreen('dates')}
          onSaveTrip={(updatedFields) => {
            const updated: TripData = {
              ...tripData,
              ...updatedFields,
              step2Done: true,
            };
            commitTripUpdate(updated);
            setCurrentScreen('overview');
          }}
          onTripSavedFromApi={(apiTrip) => {
            const famMembers = extractTripMembersFromFamilyState(familyState);
            const mapped = mapApiTripToUiTrip(apiTrip, famMembers, tripData.packingItems);
            commitTripUpdate(mapped);
          }}
          onTripCancelled={() => {
            onClose();
          }}
        />
      </Modal>
    );
  }

  if (currentScreen === 'bookings') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TripBookingsModal
          asModal={false}
          visible={true}
          tripId={tripData.id}
          tripStartsOn={tripData.startsOn}
          bookings={tripData.bookings}
          documents={tripData.documents}
          onClose={() => setCurrentScreen('overview')}
          onUpdateBookings={(updatedBookings) => {
            commitTripUpdate({
              ...tripData,
              bookings: updatedBookings,
            });
          }}
        />
      </Modal>
    );
  }

  if (currentScreen === 'packing') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TripPackingModal
          asModal={false}
          visible={true}
          tripId={tripData.id}
          packingListId={tripData.packingListId}
          destination={tripData.destination || tripData.name || 'Trip'}
          tripMembers={tripData.members}
          packingItems={tripData.packingItems}
          onClose={() => setCurrentScreen('overview')}
          onUpdatePackingItems={(updatedItems) => {
            commitTripUpdate({
              ...tripData,
              packingItems: updatedItems,
              packingTotalItems: updatedItems.length,
              packingPackedItems: updatedItems.filter((p) => p.isPacked).length,
            });
          }}
          onPackingListLinked={(listId) => {
            commitTripUpdate({
              ...tripData,
              hasPackingList: true,
              packingListId: listId,
            });
          }}
        />
      </Modal>
    );
  }

  const selectedMembers = tripData.members.filter((m) => m.selected !== false);
  const isStep1Done = Boolean(tripData.step1Done);
  const isStep2Done = Boolean(tripData.step2Done);
  const bookedCount = tripData.bookings.filter((b) => b.isBooked).length;
  const totalBookings = tripData.bookings.length;
  const isStep3Done = bookedCount === totalBookings && totalBookings > 0;
  const packedCount = tripData.packingItems.length > 0
    ? tripData.packingItems.filter((p) => p.isPacked).length
    : tripData.packingPackedItems || 0;
  const totalPacking = tripData.packingItems.length > 0
    ? tripData.packingItems.length
    : tripData.packingTotalItems || 0;
  const isStep4Done = packedCount === totalPacking && totalPacking > 0;

  let completedStepsCount = 0;
  if (isStep1Done) completedStepsCount += 1;
  if (isStep2Done) completedStepsCount += 1;
  if (isStep3Done) completedStepsCount += 1;
  if (isStep4Done) completedStepsCount += 1;

  const nextPendingBooking = tripData.bookings.find((b) => !b.isBooked);
  const showOverviewSkeleton =
    !isTestEnv &&
    !refreshing &&
    Boolean(tripData.id && isUUID(tripData.id)) &&
    (tripsState.loadingDetail ||
      (tripsState.loadingPackingList &&
        Boolean(tripData.packingListId) &&
        tripData.packingItems.length === 0 &&
        !tripData.packingTotalItems));

  const getFillStyle = (count: number) => {
    switch (count) {
      case 1:
        return styles.progressFillQuarter;
      case 2:
        return styles.progressFillHalf;
      case 3:
        return styles.progressFillThreeQuarters;
      case 4:
        return styles.progressFillFull;
      default:
        return styles.progressFill0;
    }
  };

  const getBottomButtonConfig = () => {
    if (!isStep1Done) {
      return {
        label: 'Find common dates',
        icon: <Ionicons name="calendar-outline" size={20} color={Colors.white} style={styles.trainIcon} />,
        action: handleOpenDates,
      };
    }
    if (!isStep2Done) {
      return {
        label: 'Set trip details',
        icon: <Ionicons name="location-outline" size={20} color={Colors.white} style={styles.trainIcon} />,
        action: handleOpenDetails,
      };
    }
    if (!isStep3Done) {
      return {
        label: totalBookings > 0 && nextPendingBooking ? 'Manage bookings' : 'Add bookings',
        icon: <Ionicons name="train-outline" size={20} color={Colors.white} style={styles.trainIcon} />,
        action: handleOpenBookings,
      };
    }
    if (!isStep4Done) {
      return {
        label: 'Open packing list',
        icon: <Ionicons name="briefcase-outline" size={20} color={Colors.white} style={styles.trainIcon} />,
        action: handleOpenPacking,
      };
    }
    return null;
  };

  const bottomBtn = getBottomButtonConfig();

  const handleDeleteOrCancelTrip = () => {
    const label = tripData.destination || tripData.name || 'this trip';
    setDialog({
      visible: true,
      type: 'danger',
      title: 'Cancel trip?',
      description: `“${label}” will be cancelled for everyone and its linked calendar event will be removed.`,
      primaryButtonText: 'Cancel trip',
      secondaryButtonText: 'Keep trip',
      onConfirm: async () => {
        if (!isTestEnv && tripData.id && isUUID(tripData.id)) {
          setDialog((prev) => ({ ...prev, loading: true }));
          try {
            await dispatch(cancelTripThunk({ tripId: tripData.id })).unwrap();
          } catch (err: any) {
            setDialog({
              visible: true,
              type: 'danger',
              iconName: 'alert-circle',
              title: 'Cancel failed',
              description: typeof err === 'string' ? err : 'Could not cancel this trip. Please try again.',
              primaryButtonText: 'OK',
              secondaryButtonText: '',
            });
            return;
          }
        }
        setDialog(INITIAL_TRIP_DIALOG_STATE);
        onClose();
      },
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

          <Text style={styles.headerTitle}>Trip plan</Text>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setIsMenuOpen((prev) => !prev)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Trip options"
          >
            <Feather name="more-horizontal" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Dropdown Options Menu */}
        <AppOptionsMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          topOffset={insets.top + 58}
          items={[
            {
              id: 'edit-trip',
              label: 'Edit Trip Details',
              iconName: 'edit-2',
              onPress: () => setCurrentScreen('details'),
              showDividerAfter: true,
            },
            {
              id: 'delete-trip',
              label: 'Cancel Trip',
              iconName: 'trash-2',
              destructive: true,
              onPress: handleDeleteOrCancelTrip,
            },
          ]}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefreshOverview}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          {showOverviewSkeleton ? (
            <TripOverviewSkeleton />
          ) : (
            <>
              {/* Main Vacation Planner Card */}
              <View style={styles.heroCard}>
                <Text style={styles.heroTag}>VACATION PLANNER</Text>
                <Text style={styles.destinationTitle}>
                  {tripData.destination || tripData.name || 'New family trip'}
                </Text>

                {/* Date row */}
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.accentTealMint} style={styles.calIcon} />
                  <Text style={styles.dateText}>
                    {`${tripData.datesText || 'Pick dates'} · ${tripData.durationText || 'Flexible'}`}
                  </Text>
                </View>

                {/* Avatar Stack Row */}
                {tripData.members.length > 0 && (
                  <View style={styles.avatarRow}>
                    <View style={styles.avatarStack}>
                      {tripData.members.map((member, index) => (
                        <View
                          key={member.id}
                          style={[
                            styles.avatarCircle,
                            index > 0 && styles.avatarCircleOverlap,
                            {
                              backgroundColor: member.color,
                              zIndex: 10 - index,
                            },
                          ]}
                        >
                          <Text style={styles.avatarInitial}>{member.initial}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.membersGoingText}>
                      {selectedMembers.length === tripData.members.length
                        ? `All ${selectedMembers.length} going`
                        : `${selectedMembers.length} going`}
                    </Text>
                  </View>
                )}

                {/* Progress bar */}
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, getFillStyle(completedStepsCount)]} />
                  </View>
                  <Text style={styles.progressLabel}>{`${completedStepsCount} of 4 done`}</Text>
                </View>
              </View>

              {/* Steps section */}
              <Text style={styles.sectionHeader}>STEPS</Text>

              <View style={styles.stepsCard}>
                {/* Step 1: Find common dates */}
                <TouchableOpacity
                  style={styles.stepRow}
                  onPress={handleOpenDates}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Find common dates"
                >
                  {isStep1Done ? (
                    <View style={styles.stepCheckCircle}>
                      <Feather name="check" size={16} color={Colors.background} />
                    </View>
                  ) : (
                    <View style={styles.stepNumberCircleOrange}>
                      <Text style={styles.stepNumberTextOrange}>1</Text>
                    </View>
                  )}
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepTitle}>Find common dates</Text>
                    <Text style={styles.stepSubtitle}>
                      {isStep1Done
                        ? `Selected ${tripData.datesText}`
                        : 'Check everyone’s calendar for free dates'}
                    </Text>
                  </View>
                  {isStep1Done ? (
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>Done</Text>
                    </View>
                  ) : (
                    <View style={styles.orangeBadge}>
                      <Text style={styles.orangeBadgeText}>Start</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.stepDivider} />

                {/* Step 2: Destination and trip event */}
                <TouchableOpacity
                  style={styles.stepRow}
                  onPress={handleOpenDetails}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Destination and trip event"
                >
                  {isStep2Done ? (
                    <View style={styles.stepCheckCircle}>
                      <Feather name="check" size={16} color={Colors.background} />
                    </View>
                  ) : (
                    <View style={styles.stepNumberCircleMuted}>
                      <Text style={styles.stepNumberTextMuted}>2</Text>
                    </View>
                  )}
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepTitle}>Destination and trip event</Text>
                    <Text style={styles.stepSubtitle}>
                      {isStep2Done
                        ? tripData.addToCalendar
                          ? 'Added to the family calendar'
                          : 'Destination and dates saved'
                        : 'Set destination & calendar event'}
                    </Text>
                  </View>
                  {isStep2Done ? (
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>Done</Text>
                    </View>
                  ) : (
                    <View style={styles.startedBadge}>
                      <Text style={styles.startedBadgeText}>Pending</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.stepDivider} />

                {/* Step 3: Bookings and reminders */}
                <TouchableOpacity
                  style={styles.stepRow}
                  onPress={handleOpenBookings}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Bookings and reminders"
                >
                  {isStep3Done ? (
                    <View style={styles.stepCheckCircle}>
                      <Feather name="check" size={16} color={Colors.background} />
                    </View>
                  ) : isStep1Done && isStep2Done ? (
                    <View style={styles.stepNumberCircleOrange}>
                      <Text style={styles.stepNumberTextOrange}>3</Text>
                    </View>
                  ) : (
                    <View style={styles.stepNumberCircleMuted}>
                      <Text style={styles.stepNumberTextMuted}>3</Text>
                    </View>
                  )}
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepTitle}>Bookings and reminders</Text>
                    <Text
                      style={
                        isStep1Done && isStep2Done && !isStep3Done
                          ? styles.stepSubtitleOrange
                          : styles.stepSubtitle
                      }
                    >
                      {totalBookings > 0
                        ? isStep3Done
                          ? 'All bookings done'
                          : `${totalBookings - bookedCount} booking${totalBookings - bookedCount === 1 ? '' : 's'} remaining`
                        : 'Train tickets, stays & reminders'}
                    </Text>
                  </View>
                  {totalBookings > 0 ? (
                    isStep3Done ? (
                      <View style={styles.doneBadge}>
                        <Text style={styles.doneBadgeText}>Done</Text>
                      </View>
                    ) : (
                      <View style={styles.orangeBadge}>
                        <Text style={styles.orangeBadgeText}>
                          {`${bookedCount} of ${totalBookings}`}
                        </Text>
                      </View>
                    )
                  ) : (
                    <View style={styles.startedBadge}>
                      <Text style={styles.startedBadgeText}>Pending</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.stepDivider} />

                {/* Step 4: Packing list */}
                <TouchableOpacity
                  style={styles.stepRow}
                  onPress={handleOpenPacking}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Packing list"
                >
                  {isStep4Done ? (
                    <View style={styles.stepCheckCircle}>
                      <Feather name="check" size={16} color={Colors.background} />
                    </View>
                  ) : (
                    <View style={styles.stepNumberCircleMuted}>
                      <Text style={styles.stepNumberTextMuted}>4</Text>
                    </View>
                  )}
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepTitle}>Packing list</Text>
                    <Text style={styles.stepSubtitle}>
                      {totalPacking > 0
                        ? `${packedCount} of ${totalPacking} items packed`
                        : tripData.hasPackingList
                        ? 'Tap to add items'
                        : 'Creates shared packing list automatically'}
                    </Text>
                  </View>
                  {isStep4Done ? (
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>Done</Text>
                    </View>
                  ) : (
                    <View style={styles.startedBadge}>
                      <Text style={styles.startedBadgeText}>
                        {packedCount > 0 ? 'Started' : 'Pending'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Next Pending Booking Reminder Note */}
              {nextPendingBooking && (
                <View style={styles.dashedCard}>
                  <Ionicons name="sparkles" size={18} color={Colors.primary} style={styles.sparkleIcon} />
                  <Text style={styles.dashedCardText}>
                    {nextPendingBooking.reminder
                      ? `${nextPendingBooking.title}: ${nextPendingBooking.reminder}`
                      : `Next up: ${nextPendingBooking.title} is still not booked.`}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Bottom CTA Button */}
        {bottomBtn && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={bottomBtn.action}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={bottomBtn.label}
            >
              {bottomBtn.icon}
              <Text style={styles.ctaButtonText}>{bottomBtn.label}</Text>
            </TouchableOpacity>
          </View>
        )}

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: Colors.tripBannerBg,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.accentTealMint,
    padding: 20,
  },
  heroTag: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.accentTealMint,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  destinationTitle: {
    fontSize: Typography.size.titleLarge,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.medium,
    color: Colors.textLightMutedAlt,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.tripBannerBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircleOverlap: {
    marginLeft: -8,
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
  },
  membersGoingText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textLightMutedAlt,
    marginLeft: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.tripTealBorder,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accentTealMint,
  },
  progressFill0: {
    width: 0,
  },
  progressFillQuarter: {
    width: '25%',
  },
  progressFillHalf: {
    width: '50%',
  },
  progressFillThreeQuarters: {
    width: '75%',
  },
  progressFillFull: {
    width: '100%',
  },
  progressLabel: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
    marginLeft: 12,
  },
  sectionHeader: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
  },
  stepsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  stepDivider: {
    height: 1,
    backgroundColor: Colors.borderBold,
    marginHorizontal: 16,
  },
  stepCheckCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.tripGreenMint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberCircleOrange: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.transparent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberTextOrange: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  stepNumberCircleMuted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    backgroundColor: Colors.transparent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberTextMuted: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
  },
  stepInfo: {
    flex: 1,
    paddingRight: 8,
  },
  stepTitle: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  stepSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textSecondaryMuted,
    marginTop: 2,
  },
  stepSubtitleOrange: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.primary,
    marginTop: 2,
  },
  doneBadge: {
    borderWidth: 1,
    borderColor: Colors.tripGreenMint,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.transparent,
  },
  doneBadgeText: {
    color: Colors.tripGreenMint,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  orangeBadge: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.transparent,
  },
  orangeBadgeText: {
    color: Colors.primary,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  startedBadge: {
    borderWidth: 1,
    borderColor: Colors.borderMutedAlt,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.transparent,
  },
  startedBadgeText: {
    color: Colors.textSecondaryMuted,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.medium,
  },
  dashedCard: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    backgroundColor: Colors.transparent,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleIcon: {
    marginRight: 12,
  },
  dashedCardText: {
    flex: 1,
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textLightMutedAlt,
    lineHeight: 20,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trainIcon: {
    marginRight: 8,
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
  },
});

export default TripPlannerModal;
