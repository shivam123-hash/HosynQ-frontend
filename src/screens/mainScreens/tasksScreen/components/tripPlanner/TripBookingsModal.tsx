import React, { useState, useEffect, useCallback } from 'react';
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
  addTripBookingThunk,
  fetchTripDetailThunk,
  removeTripBookingThunk,
  updateTripBookingThunk,
} from '../../../../../redux/features/trips/tripsSlice';
import { isUUID } from '../../../../../redux/features/lists/listsSlice';
import { BookingKind, BookingStatus } from '../../../../../services/tripServices';
import { TripBookingsSkeleton } from '../../../../../components/SkeletonLoader';
import AddTripBookingModal from './AddTripBookingModal';
import TripDialog, { INITIAL_TRIP_DIALOG_STATE, TripDialogState } from './TripDialog';
import { isJestTestEnv, mapUiBookingTypeToApi } from './tripApiHelpers';
import { BookingItem, DocumentItem, UiBookingType } from './types';
import { Colors, Fonts, Typography } from '../../../../../units';

export interface TripBookingsModalProps {
  visible?: boolean;
  asModal?: boolean;
  tripId?: string;
  tripStartsOn?: string | null;
  bookings: BookingItem[];
  documents: DocumentItem[];
  onClose: () => void;
  onUpdateBookings?: (bookings: BookingItem[]) => void;
}

export const TripBookingsModal: React.FC<TripBookingsModalProps> = ({
  visible = true,
  asModal = true,
  tripId,
  tripStartsOn,
  bookings: initialBookings,
  documents,
  onClose,
  onUpdateBookings,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const tripsState = useAppSelector((state) => state.trips);
  const isTestEnv = isJestTestEnv();

  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [dialog, setDialog] = useState<TripDialogState>(INITIAL_TRIP_DIALOG_STATE);
  const [editingBooking, setEditingBooking] = useState<{
    id?: string;
    kind?: BookingKind;
    title?: string;
    details?: string;
    status?: BookingStatus;
    remindOn?: string | null;
  } | null>(null);

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  const showNoticeDialog = (
    noticeTitle: string,
    noticeDesc: string,
    type: 'warning' | 'danger' = 'danger'
  ) => {
    setDialog({
      visible: true,
      type,
      iconName: 'alert-circle',
      title: noticeTitle,
      description: noticeDesc,
      primaryButtonText: 'OK',
      secondaryButtonText: '',
    });
  };

  const handleRefresh = useCallback(async () => {
    if (!tripId || !isUUID(tripId)) return;
    setRefreshing(true);
    try {
      await dispatch(fetchTripDetailThunk(tripId)).unwrap();
    } catch {
      // handled cleanly
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, tripId]);

  const toggleBooked = async (booking: BookingItem) => {
    const nextBooked = !booking.isBooked;
    const nextStatus: BookingStatus = nextBooked ? 'DONE' : 'PENDING';
    const updated = bookings.map((b) =>
      b.id === booking.id ? { ...b, isBooked: nextBooked, status: nextStatus } : b
    );
    setBookings(updated);
    onUpdateBookings?.(updated);

    if (!isTestEnv && tripId && isUUID(tripId) && isUUID(booking.id)) {
      try {
        await dispatch(
          updateTripBookingThunk({
            tripId,
            bookingId: booking.id,
            patch: { status: nextStatus },
          })
        ).unwrap();
      } catch (err: any) {
        setBookings(bookings);
        onUpdateBookings?.(bookings);
        showNoticeDialog('Update failed', typeof err === 'string' ? err : 'Could not update booking.');
      }
    }
  };

  const handleRemoveBooking = (booking: BookingItem) => {
    setDialog({
      visible: true,
      type: 'danger',
      title: 'Remove booking?',
      description: `Remove “${booking.title}” from this trip?`,
      primaryButtonText: 'Remove',
      secondaryButtonText: 'Cancel',
      onConfirm: async () => {
        const updated = bookings.filter((b) => b.id !== booking.id);
        setBookings(updated);
        onUpdateBookings?.(updated);

        if (!isTestEnv && tripId && isUUID(tripId) && isUUID(booking.id)) {
          setDialog((prev) => ({ ...prev, loading: true }));
          try {
            await dispatch(
              removeTripBookingThunk({ tripId, bookingId: booking.id })
            ).unwrap();
          } catch (err: any) {
            setBookings(bookings);
            onUpdateBookings?.(bookings);
            showNoticeDialog('Delete failed', typeof err === 'string' ? err : 'Could not remove booking.');
            return;
          }
        }
        setDialog(INITIAL_TRIP_DIALOG_STATE);
      },
    });
  };

  const handleSaveBookingForm = async (payload: {
    kind: BookingKind;
    title: string;
    details?: string;
    status: BookingStatus;
    remindOn?: string;
  }) => {
    if (!tripId || !isUUID(tripId)) {
      showNoticeDialog(
        'Save trip first',
        'Please save Destination and dates in Trip details before adding bookings.',
        'warning'
      );
      return;
    }

    try {
      if (editingBooking?.id && isUUID(editingBooking.id)) {
        await dispatch(
          updateTripBookingThunk({
            tripId,
            bookingId: editingBooking.id,
            patch: payload,
          })
        ).unwrap();
      } else {
        await dispatch(
          addTripBookingThunk({
            tripId,
            booking: payload,
          })
        ).unwrap();
      }
      setShowAddBooking(false);
      setEditingBooking(null);
    } catch (err: any) {
      showNoticeDialog('Could not save booking', typeof err === 'string' ? err : 'Please try again.');
    }
  };

  const renderBookingIcon = (type: UiBookingType, hasOrangeBorder: boolean) => {
    let iconName:
      | 'train-outline'
      | 'bed-outline'
      | 'car-outline'
      | 'airplane-outline'
      | 'bus-outline'
      | 'document-text-outline'
      | 'bookmark-outline' = 'bookmark-outline';
    if (type === 'train') iconName = 'train-outline';
    else if (type === 'hotel') iconName = 'bed-outline';
    else if (type === 'cab') iconName = 'car-outline';
    else if (type === 'flight') iconName = 'airplane-outline';
    else if (type === 'bus') iconName = 'bus-outline';
    else if (type === 'document') iconName = 'document-text-outline';

    return (
      <View
        style={[
          styles.iconCircle,
          hasOrangeBorder && styles.iconCircleOrange,
        ]}
      >
        <Ionicons
          name={iconName}
          size={18}
          color={hasOrangeBorder ? Colors.primary : Colors.textSecondaryMuted}
        />
      </View>
    );
  };

  const renderDocIcon = (type: DocumentItem['type']) => {
    let iconName: 'card-outline' | 'globe-outline' | 'document-text-outline' = 'document-text-outline';
    if (type === 'id') iconName = 'card-outline';
    else if (type === 'visa') iconName = 'globe-outline';

    return (
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={18} color={Colors.textSecondaryMuted} />
      </View>
    );
  };

  const showSkeleton =
    !isTestEnv &&
    tripsState.loadingDetail &&
    bookings.length === 0 &&
    documents.length === 0 &&
    !refreshing;

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

        <Text style={styles.headerTitle}>Bookings</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {showSkeleton ? (
          <TripBookingsSkeleton />
        ) : (
          <>
            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Track what’s booked. We’ll remind you about the rest.
            </Text>

            {/* Bookings Card */}
            {bookings.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="train-outline"
                  size={28}
                  color={Colors.primary}
                  style={{ marginBottom: 8 }}
                />
                <Text style={styles.emptyTitle}>No bookings yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add trains, flights, hotel stays, cabs or reminders below.
                </Text>
              </View>
            ) : (
              <View style={styles.groupedCard}>
                {bookings.map((booking, index) => {
                  const isPendingHighlight =
                    (booking.type === 'train' || booking.type === 'flight') &&
                    !booking.isBooked;
                  return (
                    <View key={booking.id}>
                      {index > 0 && <View style={styles.itemDivider} />}
                      <View style={styles.bookingItemRow}>
                        {renderBookingIcon(booking.type, isPendingHighlight)}

                        <TouchableOpacity
                          style={styles.itemContent}
                          onPress={() => {
                            if (tripId && isUUID(tripId) && isUUID(booking.id)) {
                              setEditingBooking({
                                id: booking.id,
                                kind: mapUiBookingTypeToApi(booking.type),
                                title: booking.title,
                                details: booking.subtitle,
                                status: booking.status || (booking.isBooked ? 'DONE' : 'PENDING'),
                                remindOn: booking.remindOn || null,
                              });
                              setShowAddBooking(true);
                            }
                          }}
                          activeOpacity={0.75}
                        >
                          <Text style={styles.itemTitle}>{booking.title}</Text>
                          {Boolean(booking.subtitle) && (
                            <Text style={styles.itemSubtitle}>{booking.subtitle}</Text>
                          )}

                          {booking.reminder ? (
                            <View style={styles.reminderRow}>
                              <Ionicons
                                name="notifications-outline"
                                size={12}
                                color={Colors.textSecondaryMuted}
                                style={styles.bellIcon}
                              />
                              <Text style={styles.reminderText}>{booking.reminder}</Text>
                            </View>
                          ) : null}
                        </TouchableOpacity>

                        {/* Right column: Status badge & Toggle/Remove actions */}
                        <View style={styles.rightActionCol}>
                          <TouchableOpacity
                            onPress={() => toggleBooked(booking)}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={`Toggle ${booking.title} status`}
                          >
                            {booking.isBooked ? (
                              <View style={styles.bookedBadge}>
                                <Text style={styles.bookedBadgeText}>Booked</Text>
                              </View>
                            ) : booking.status === 'NOT_NEEDED' ? (
                              <View style={styles.bookedBadge}>
                                <Text style={styles.bookedBadgeText}>Not needed</Text>
                              </View>
                            ) : isPendingHighlight ? (
                              <View style={styles.orangeNotBookedBadge}>
                                <Text style={styles.orangeNotBookedText}>Not booked</Text>
                              </View>
                            ) : (
                              <View style={styles.slateNotBookedBadge}>
                                <Text style={styles.slateNotBookedText}>Not booked</Text>
                              </View>
                            )}
                          </TouchableOpacity>

                          <View style={styles.rowMiniActions}>
                            {!booking.isBooked && (
                              <TouchableOpacity
                                style={styles.markBookedBtn}
                                onPress={() => toggleBooked(booking)}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={`Mark ${booking.title} booked`}
                              >
                                <Text style={styles.markBookedText}>Mark booked</Text>
                              </TouchableOpacity>
                            )}
                            {tripId && isUUID(tripId) && isUUID(booking.id) && (
                              <TouchableOpacity
                                style={styles.trashBtn}
                                onPress={() => handleRemoveBooking(booking)}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={`Remove ${booking.title}`}
                              >
                                <Feather
                                  name="trash-2"
                                  size={14}
                                  color={Colors.dangerCoral}
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* DOCUMENTS Section */}
            {documents.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>DOCUMENTS</Text>

                <View style={styles.groupedCard}>
                  {documents.map((doc, index) => (
                    <View key={doc.id}>
                      {index > 0 && <View style={styles.itemDivider} />}
                      <View style={styles.bookingItemRow}>
                        {renderDocIcon(doc.type)}

                        <View style={styles.itemContent}>
                          <Text style={styles.itemTitle}>{doc.title}</Text>
                          <Text style={styles.itemSubtitle}>{doc.subtitle}</Text>
                        </View>

                        <View style={styles.rightActionCol}>
                          {doc.status === 'not_needed' ? (
                            <View style={styles.notNeededBadge}>
                              <Text style={styles.notNeededBadgeText}>Not needed</Text>
                            </View>
                          ) : doc.status === 'ready' ? (
                            <View style={styles.notNeededBadge}>
                              <Text style={styles.notNeededBadgeText}>Ready</Text>
                            </View>
                          ) : (
                            <View style={styles.checkBadge}>
                              <Text style={styles.checkBadgeText}>Check</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Dashed Add Booking Button */}
            <TouchableOpacity
              style={styles.dashedAddBtn}
              activeOpacity={0.75}
              onPress={() => {
                setEditingBooking(null);
                setShowAddBooking(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Add a booking or reminder"
            >
              <Feather name="plus" size={18} color={Colors.primary} style={styles.plusIcon} />
              <Text style={styles.dashedAddText}>Add a booking or reminder</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <AddTripBookingModal
        visible={showAddBooking}
        tripStartsOn={tripStartsOn}
        saving={tripsState.actionLoading}
        initialValues={editingBooking}
        onClose={() => {
          setShowAddBooking(false);
          setEditingBooking(null);
        }}
        onSave={handleSaveBookingForm}
      />

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
  subtitle: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.light,
    color: Colors.textSecondaryMuted,
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
  },
  groupedCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    overflow: 'hidden',
  },
  bookingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  itemDivider: {
    height: 1,
    backgroundColor: Colors.borderBold,
    marginHorizontal: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tripBookingCardBg,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconCircleOrange: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  itemContent: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  itemSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
    marginTop: 2,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  bellIcon: {
    marginRight: 4,
  },
  reminderText: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
  },
  rightActionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rowMiniActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  bookedBadge: {
    borderWidth: 1,
    borderColor: Colors.accentTealMint,
    borderRadius: 14,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bookedBadgeText: {
    color: Colors.accentTealMint,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  orangeNotBookedBadge: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 14,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  orangeNotBookedText: {
    color: Colors.primary,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  slateNotBookedBadge: {
    borderWidth: 1,
    borderColor: Colors.tripItemBorder,
    borderRadius: 14,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  slateNotBookedText: {
    color: Colors.textLightMutedAlt,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  markBookedBtn: {
    paddingVertical: 2,
  },
  markBookedText: {
    color: Colors.primary,
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.bold,
  },
  trashBtn: {
    padding: 4,
  },
  sectionHeader: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
  },
  checkBadge: {
    borderWidth: 1,
    borderColor: Colors.tripItemBorder,
    borderRadius: 14,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  checkBadgeText: {
    color: Colors.textLightMutedAlt,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  notNeededBadge: {
    borderWidth: 1,
    borderColor: Colors.accentTealMint,
    borderRadius: 14,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  notNeededBadgeText: {
    color: Colors.accentTealMint,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  dashedAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 28,
    height: 56,
    marginTop: 22,
    backgroundColor: Colors.transparent,
  },
  plusIcon: {
    marginRight: 8,
  },
  dashedAddText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});

export default TripBookingsModal;
