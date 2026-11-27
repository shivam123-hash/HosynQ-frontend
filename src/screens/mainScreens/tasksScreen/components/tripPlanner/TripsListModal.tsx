import React, { useEffect, useState, useCallback } from 'react';
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
  fetchTripsThunk,
  fetchTripDetailThunk,
} from '../../../../../redux/features/trips/tripsSlice';
import { isUUID } from '../../../../../redux/features/lists/listsSlice';
import { TripSummaryApiItem, TripTab } from '../../../../../services/tripServices';
import { TripsListSkeleton } from '../../../../../components/SkeletonLoader';
import { formatCompactBannerDates, isJestTestEnv } from './tripApiHelpers';
import { Colors, Fonts, Typography } from '../../../../../units';

export interface TripsListModalProps {
  visible: boolean;
  initialTab?: TripTab;
  onClose: () => void;
  onSelectTrip: (trip: TripSummaryApiItem) => void;
  onPlanNewTrip: () => void;
}

const AVATAR_PALETTE = [
  Colors.amberBrown,
  Colors.royalBlue,
  Colors.vibrantPurple,
  Colors.amberAccent,
  Colors.emerald,
];

export const TripsListModal: React.FC<TripsListModalProps> = ({
  visible,
  initialTab = 'UPCOMING',
  onClose,
  onSelectTrip,
  onPlanNewTrip,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const tripsState = useAppSelector((state) => state.trips);
  const [activeTab, setActiveTab] = useState<TripTab>(initialTab);
  const [refreshing, setRefreshing] = useState(false);
  const isTestEnv = isJestTestEnv();

  useEffect(() => {
    if (visible && !isTestEnv) {
      dispatch(fetchTripsThunk({ tab: activeTab, page: 1, limit: 20 }));
    }
  }, [visible, activeTab, isTestEnv, dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchTripsThunk({ tab: activeTab, page: 1, limit: 20 })).unwrap();
    } catch {
      // handled in slice
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, dispatch]);

  const trips =
    activeTab === 'PAST' ? tripsState.pastTrips : tripsState.upcomingTrips;
  const showSkeleton = tripsState.loadingList && trips.length === 0 && !refreshing;

  useEffect(() => {
    const firstTrip: any = trips[0];
    if (
      visible &&
      !isTestEnv &&
      firstTrip?.id &&
      isUUID(firstTrip.id) &&
      typeof firstTrip.bookingsCount !== 'number' &&
      tripsState.selectedTrip?.id !== firstTrip.id
    ) {
      dispatch(fetchTripDetailThunk(firstTrip.id));
    }
  }, [visible, isTestEnv, trips, tripsState.selectedTrip?.id, dispatch]);

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

          <Text style={styles.headerTitle}>Trips</Text>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onPlanNewTrip}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Plan new trip"
          >
            <Feather name="plus" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Segmented Upcoming / Past Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'UPCOMING' && styles.tabPillActive]}
            onPress={() => setActiveTab('UPCOMING')}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'UPCOMING' }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'UPCOMING' && styles.tabTextActive,
              ]}
            >
              Upcoming{tripsState.counts.upcoming > 0 ? ` (${tripsState.counts.upcoming})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'PAST' && styles.tabPillActive]}
            onPress={() => setActiveTab('PAST')}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'PAST' }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'PAST' && styles.tabTextActive,
              ]}
            >
              Past{tripsState.counts.past > 0 ? ` (${tripsState.counts.past})` : ''}
            </Text>
          </TouchableOpacity>
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
            <TripsListSkeleton />
          ) : trips.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="airplane-outline" size={28} color={Colors.accentTealMint} />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'UPCOMING' ? 'No upcoming trips' : 'No past trips'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'UPCOMING'
                  ? 'Find common free dates, pick a destination, and track bookings and packing together.'
                  : 'Completed or cancelled family trips will appear here.'}
              </Text>
              {activeTab === 'UPCOMING' && (
                <TouchableOpacity
                  style={styles.dashedPlanBtn}
                  onPress={onPlanNewTrip}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Start a trip"
                >
                  <Feather name="plus" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.dashedPlanText}>Plan new trip</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            trips.map((trip) => {
              const cityLabel =
                trip.destination?.split(',')[0].trim() || trip.name || 'Trip';
              const compactDates = formatCompactBannerDates(trip.startsOn, trip.endsOn);
              const badgeText = trip.cancelledAt
                ? 'Cancelled'
                : trip.isCurrent
                ? 'Now'
                : typeof trip.daysLeft === 'number' && trip.daysLeft >= 0
                ? `${trip.daysLeft}d left`
                : null;

              const detailMatch =
                tripsState.selectedTrip?.id === trip.id ? tripsState.selectedTrip : null;
              const rawTrip: any = trip;
              const detailBookings = Array.isArray(detailMatch?.bookings)
                ? detailMatch!.bookings.filter((b) => b.kind !== 'DOCUMENT')
                : null;
              const bookingsTotal =
                typeof rawTrip.bookingsCount === 'number'
                  ? rawTrip.bookingsCount
                  : typeof rawTrip.bookings?.total === 'number'
                  ? rawTrip.bookings.total
                  : typeof rawTrip.bookingCount === 'number'
                  ? rawTrip.bookingCount
                  : detailBookings
                  ? detailBookings.length
                  : undefined;
              const bookingsDone =
                typeof rawTrip.bookingsDoneCount === 'number'
                  ? rawTrip.bookingsDoneCount
                  : typeof rawTrip.bookings?.done === 'number'
                  ? rawTrip.bookings.done
                  : typeof rawTrip.bookedCount === 'number'
                  ? rawTrip.bookedCount
                  : detailBookings
                  ? detailBookings.filter((b) => b.status === 'DONE').length
                  : undefined;

              const bookingSubtitlePart =
                typeof bookingsTotal === 'number'
                  ? `${bookingsDone ?? 0}/${bookingsTotal} bookings`
                  : null;
              const packingSubtitlePart = trip.hasPackingList ? 'Packing ready' : null;
              const subtitleParts = [bookingSubtitlePart, packingSubtitlePart].filter(Boolean);
              const tripSubtitleText =
                subtitleParts.length > 0
                  ? subtitleParts.join(' · ')
                  : typeof trip.days === 'number' && trip.days > 0
                  ? `${trip.days} day${trip.days === 1 ? '' : 's'}`
                  : 'Trip plan';

              return (
                <TouchableOpacity
                  key={trip.id}
                  style={styles.tripCard}
                  onPress={() => onSelectTrip(trip)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${trip.name || cityLabel} trip`}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.airplaneCircle}>
                      <Ionicons
                        name="airplane-outline"
                        size={22}
                        color={Colors.background}
                      />
                    </View>

                    <View style={styles.cardTitleCol}>
                      <View style={styles.eyebrowRow}>
                        <Text style={styles.eyebrowText}>VACATION PLANNER</Text>
                        {badgeText && (
                          <View
                            style={[
                              styles.statusPill,
                              trip.cancelledAt && styles.statusPillCancelled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                trip.cancelledAt && styles.statusPillTextCancelled,
                              ]}
                            >
                              {badgeText}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.tripTitle} numberOfLines={1}>
                        {`${cityLabel} · ${compactDates}`}
                      </Text>
                      <Text style={styles.tripSubtitle}>{tripSubtitleText}</Text>
                    </View>

                    <Feather name="chevron-right" size={20} color={Colors.accentTealMint} />
                  </View>

                  {trip.goingMembers && trip.goingMembers.length > 0 && (
                    <View style={styles.membersFooter}>
                      <View style={styles.avatarRow}>
                        {trip.goingMembers.slice(0, 5).map((m, idx) => (
                          <View
                            key={m.memberId}
                            style={[
                              styles.memberAvatar,
                              idx > 0 && styles.memberAvatarOverlap,
                              {
                                backgroundColor:
                                  m.avatarColor || AVATAR_PALETTE[idx % AVATAR_PALETTE.length],
                              },
                            ]}
                          >
                            <Text style={styles.memberInitial}>
                              {(m.fullName?.[0] || 'M').toUpperCase()}
                            </Text>
                          </View>
                        ))}
                      </View>
                      <Text style={styles.goingCountText}>
                        {trip.goingCount} going
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
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
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondaryMuted,
  },
  tabTextActive: {
    color: Colors.background,
    fontFamily: Fonts.bold,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  tripCard: {
    backgroundColor: Colors.tripBannerBg,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.accentTealMint,
    padding: 16,
    marginBottom: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airplaneCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.accentTealMint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardTitleCol: {
    flex: 1,
    paddingRight: 8,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eyebrowText: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.accentTealMint,
    letterSpacing: 1.1,
  },
  statusPill: {
    backgroundColor: 'rgba(45, 212, 191, 0.16)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusPillCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
  },
  statusPillText: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.semiBold,
    color: Colors.accentTealMint,
  },
  statusPillTextCancelled: {
    color: Colors.danger,
  },
  tripTitle: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 2,
  },
  tripSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
  },
  membersFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(45, 212, 191, 0.2)',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.tripBannerBg,
  },
  memberAvatarOverlap: {
    marginLeft: -6,
  },
  memberInitial: {
    fontSize: Typography.size.micro,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  goingCountText: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.medium,
    color: Colors.textLightMutedAlt,
    marginLeft: 10,
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.tripBannerBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: Typography.size.titleSmall,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  dashedPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 24,
    paddingHorizontal: 20,
    height: 48,
    backgroundColor: Colors.transparent,
  },
  dashedPlanText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});

export default TripsListModal;
