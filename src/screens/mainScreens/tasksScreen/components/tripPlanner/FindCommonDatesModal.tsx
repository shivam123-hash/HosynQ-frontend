import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { findCommonDatesThunk } from '../../../../../redux/features/trips/tripsSlice';
import { isUUID } from '../../../../../redux/features/lists/listsSlice';
import { CommonDatesResponse, CommonDateOption } from '../../../../../services/tripServices';
import { FindCommonDatesSkeleton } from '../../../../../components/SkeletonLoader';
import {
  addDaysIso,
  formatCompactBannerDates,
  formatTripDateRange,
  isJestTestEnv,
  toIsoDateString,
} from './tripApiHelpers';
import { Colors, Fonts, Typography } from '../../../../../units';

const AVATAR_PALETTE = [
  Colors.amberBrown,
  Colors.royalBlue,
  Colors.vibrantPurple,
  Colors.amberAccent,
  Colors.emerald,
];

const DURATION_CHOICES = [2, 3, 4, 5, 7];
const WINDOW_DAYS = 14;
const TOTAL_WINDOWS = 13; // 13 x 14 days = 182 days (~6 months)

export interface FindCommonDatesModalProps {
  visible?: boolean;
  asModal?: boolean;
  tripId?: string;
  memberIds?: string[];
  initialDays?: number;
  availabilityData?: CommonDatesResponse | null;
  onClose: () => void;
  onSelectDates: (
    selectedOption: string,
    range?: { startsOn: string; endsOn: string; days: number }
  ) => void;
}

export const FindCommonDatesModal: React.FC<FindCommonDatesModalProps> = ({
  visible = true,
  asModal = true,
  tripId,
  memberIds,
  initialDays = 4,
  availabilityData,
  onClose,
  onSelectDates,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const tripsState = useAppSelector((state) => state.trips);
  const [daysCount, setDaysCount] = useState<number>(initialDays || 4);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const dateWindows = useMemo(() => {
    const todayIso = toIsoDateString(new Date());
    const windows: Array<{ key: string; label: string; from: string; to: string }> = [];

    for (let i = 0; i < TOTAL_WINDOWS; i++) {
      const from = addDaysIso(todayIso, i * WINDOW_DAYS);
      const to = addDaysIso(from, WINDOW_DAYS - 1);
      windows.push({
        key: `${from}_${to}`,
        label: i === 0 ? 'Next 14 days' : formatCompactBannerDates(from, to),
        from,
        to,
      });
    }
    return windows;
  }, []);

  const activeWindow = dateWindows[selectedMonthIdx] || dateWindows[0];

  const isTestEnv = isJestTestEnv();
  const memberIdsKey = useMemo(
    () =>
      (memberIds || [])
        .filter((id) => isUUID(id))
        .slice()
        .sort()
        .join(','),
    [memberIds]
  );
  const lastRequestKeyRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const loadCommonDates = useCallback(
    async (numDays: number, win: { from: string; to: string }, force = false) => {
      if (availabilityData) return;
      const tripKey = tripId && isUUID(tripId) ? tripId : '';
      const requestKey = `${numDays}|${win.from}|${win.to}|${memberIdsKey}|${tripKey}`;
      if (!force && (isFetchingRef.current || lastRequestKeyRef.current === requestKey)) {
        return;
      }
      isFetchingRef.current = true;
      lastRequestKeyRef.current = requestKey;

      const validMemberIds = memberIdsKey ? memberIdsKey.split(',') : [];
      try {
        await dispatch(
          findCommonDatesThunk({
            from: win.from,
            to: win.to,
            days: numDays,
            ...(validMemberIds.length > 0 ? { memberIds: validMemberIds } : {}),
            ...(tripKey ? { tripId: tripKey } : {}),
          })
        ).unwrap();
      } catch {
        // Error surfaced in tripsState.error / empty fallback
      } finally {
        isFetchingRef.current = false;
      }
    },
    [availabilityData, dispatch, memberIdsKey, tripId]
  );

  useEffect(() => {
    if (!visible) {
      lastRequestKeyRef.current = null;
      isFetchingRef.current = false;
      return;
    }
    if (!availabilityData && !isTestEnv && activeWindow) {
      loadCommonDates(daysCount, activeWindow);
    }
  }, [visible, daysCount, activeWindow, availabilityData, isTestEnv, loadCommonDates]);

  const handleRefresh = useCallback(async () => {
    if (!activeWindow) return;
    setRefreshing(true);
    await loadCommonDates(daysCount, activeWindow, true);
    setRefreshing(false);
  }, [daysCount, activeWindow, loadCommonDates]);

  const data = availabilityData ?? tripsState.commonDates;
  const visibleDays = useMemo(() => (data?.days || []).slice(0, 14), [data]);
  const options: CommonDateOption[] = useMemo(() => data?.options || [], [data]);
  const selectedOption = options[selectedIndex] || options[0] || null;

  useEffect(() => {
    if (!visible || isTestEnv) return;
    console.log('[FindCommonDatesModal] Section Data:', {
      activeWindow,
      daysCount,
      selectedIndex,
      selectedOption,
      daysCountReturned: data?.days?.length || 0,
      membersCount: data?.members?.length || 0,
      optionsCount: options.length,
      data,
      error: tripsState.commonDatesError,
    });
  }, [
    visible,
    isTestEnv,
    activeWindow,
    daysCount,
    selectedIndex,
    selectedOption,
    data,
    options.length,
    tripsState.commonDatesError,
  ]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [options.length, daysCount]);

  const getCellColor = (dayIso: string, busyOn: string[]) => {
    if (busyOn?.includes(dayIso)) {
      return Colors.avatarPlaceholderBg;
    }
    if (
      selectedOption &&
      dayIso >= selectedOption.startsOn &&
      dayIso <= selectedOption.endsOn
    ) {
      return Colors.accentTealMint;
    }
    return Colors.tripAvailableGreen;
  };

  const handleUseDates = () => {
    if (!selectedOption) {
      onClose();
      return;
    }
    const label = formatTripDateRange(selectedOption.startsOn, selectedOption.endsOn);
    onSelectDates(label, {
      startsOn: selectedOption.startsOn,
      endsOn: selectedOption.endsOn,
      days: selectedOption.days,
    });
  };

  const formatBusySubtitle = (opt: CommonDateOption): string => {
    if (opt.everyoneFree) {
      return `Everyone is free · ${opt.days} day${opt.days === 1 ? '' : 's'}`;
    }
    const names = (opt.busy || [])
      .map((b) => (typeof b === 'string' ? b : b.fullName || b.name || 'Member'))
      .filter(Boolean);
    if (names.length > 0) {
      return `${names.join(', ')} busy · ${opt.days} day${opt.days === 1 ? '' : 's'}`;
    }
    return `Some members busy · ${opt.days} day${opt.days === 1 ? '' : 's'}`;
  };

  const showSkeleton =
    tripsState.loadingCommonDates && !data && !refreshing;

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

        <Text style={styles.headerTitle}>Find common dates</Text>

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
        {/* 14-day Date Window Selector across next ~6 months */}
        <View style={styles.durationRow}>
          <Text style={styles.durationLabel}>Date window</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.durationChipsRow}
          >
            {dateWindows.map((win, idx) => {
              const active = selectedMonthIdx === idx;
              return (
                <TouchableOpacity
                  key={win.key}
                  style={[styles.durationChip, active && styles.monthChipActive]}
                  onPress={() => setSelectedMonthIdx(idx)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.durationChipText,
                      active && styles.monthChipTextActive,
                    ]}
                  >
                    {win.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Duration selector */}
        <View style={styles.durationRow}>
          <Text style={styles.durationLabel}>Trip length</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.durationChipsRow}
          >
            {DURATION_CHOICES.map((d) => {
              const active = daysCount === d;
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationChip, active && styles.durationChipActive]}
                  onPress={() => setDaysCount(d)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.durationChipText,
                      active && styles.durationChipTextActive,
                    ]}
                  >
                    {d} days
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {showSkeleton ? (
          <FindCommonDatesSkeleton />
        ) : !data || visibleDays.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="calendar-outline"
              size={30}
              color={Colors.accentTealMint}
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.emptyTitle}>No availability data</Text>
            <Text style={styles.emptySubtitle}>
              {tripsState.commonDatesError?.includes('Cannot GET')
                ? 'Common dates availability service is not available on the server yet. Pick dates directly in Trip details or try another date window.'
                : tripsState.commonDatesError ||
                  'Pull down to refresh family availability or pick dates manually in Trip details.'}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              We checked everyone’s calendar. Green days are free.
            </Text>

            {/* Availability Heatmap Card */}
            <View style={styles.heatmapCard}>
              {/* Days header */}
              <View style={styles.daysHeaderRow}>
                <View style={styles.avatarSpacer} />
                <View style={styles.daysNumbersRow}>
                  {visibleDays.map((dayIso) => {
                    const dayNum = Number(dayIso.split('-')[2] || 0);
                    const isBest =
                      Boolean(selectedOption) &&
                      dayIso >= selectedOption!.startsOn &&
                      dayIso <= selectedOption!.endsOn;
                    return (
                      <View key={dayIso} style={styles.dayCol}>
                        <Text
                          style={[
                            styles.dayNumberText,
                            isBest && styles.dayNumberBest,
                          ]}
                        >
                          {dayNum}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Member rows */}
              {(data.members || []).map((member, idx) => {
                const initial = (member.fullName?.[0] || 'M').toUpperCase();
                const bg =
                  member.avatarColor ||
                  AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
                return (
                  <View key={member.memberId} style={styles.memberRow}>
                    <View
                      style={[styles.memberAvatar, { backgroundColor: bg }]}
                    >
                      <Text style={styles.memberInitial}>{initial}</Text>
                    </View>

                    <View style={styles.daysNumbersRow}>
                      {visibleDays.map((dayIso) => (
                        <View key={dayIso} style={styles.dayCol}>
                          <View
                            style={[
                              styles.heatmapCell,
                              {
                                backgroundColor: getCellColor(
                                  dayIso,
                                  member.busyOn || []
                                ),
                              },
                            ]}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}

              {/* Legend */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, styles.legendFree]} />
                  <Text style={styles.legendText}>Free</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, styles.legendBusy]} />
                  <Text style={styles.legendText}>Busy</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, styles.legendBest]} />
                  <Text style={styles.legendText}>Best window</Text>
                </View>
              </View>
            </View>

            {/* Section: Best options */}
            <Text style={styles.sectionHeader}>BEST OPTIONS</Text>

            {options.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No matching date windows</Text>
                <Text style={styles.emptySubtitle}>
                  Try selecting a shorter trip length above.
                </Text>
              </View>
            ) : (
              options.map((opt, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <TouchableOpacity
                    key={`${opt.startsOn}-${opt.endsOn}-${idx}`}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => setSelectedIndex(idx)}
                    activeOpacity={0.8}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <View style={styles.optionIconContainer}>
                      <Ionicons
                        name={
                          opt.everyoneFree
                            ? 'checkmark-circle-outline'
                            : 'alert-circle-outline'
                        }
                        size={24}
                        color={
                          opt.everyoneFree ? Colors.tripGreenMint : Colors.primary
                        }
                      />
                    </View>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>
                        {formatTripDateRange(opt.startsOn, opt.endsOn)}
                      </Text>
                      <Text
                        style={
                          opt.everyoneFree
                            ? styles.optionSubtitle
                            : styles.optionSubtitleAlert
                        }
                      >
                        {formatBusySubtitle(opt)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.bottomButton,
            !selectedOption && styles.bottomButtonDisabled,
          ]}
          onPress={handleUseDates}
          activeOpacity={0.85}
          disabled={!selectedOption}
          accessibilityRole="button"
          accessibilityLabel="Use selected dates"
        >
          <Text style={styles.bottomButtonText}>
            {selectedOption
              ? `Use ${formatCompactBannerDates(
                  selectedOption.startsOn,
                  selectedOption.endsOn
                )}`
              : 'Select dates'}
          </Text>
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
    paddingTop: 4,
    paddingBottom: 24,
  },
  durationRow: {
    marginBottom: 16,
  },
  durationLabel: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  durationChipsRow: {
    gap: 8,
  },
  durationChip: {
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Colors.transparent,
  },
  durationChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  monthChipActive: {
    backgroundColor: 'rgba(45, 212, 191, 0.16)',
    borderColor: Colors.accentTealMint,
  },
  durationChipText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
  durationChipTextActive: {
    color: Colors.background,
    fontFamily: Fonts.bold,
  },
  monthChipTextActive: {
    color: Colors.accentTealMint,
    fontFamily: Fonts.bold,
  },
  subtitle: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.light,
    color: Colors.textSecondaryMuted,
    lineHeight: 22,
    marginBottom: 18,
  },
  heatmapCard: {
    backgroundColor: Colors.transparent,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    padding: 16,
  },
  daysHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarSpacer: {
    width: 28,
    marginRight: 8,
  },
  daysNumbersRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondaryMuted,
  },
  dayNumberBest: {
    color: Colors.accentTealMint,
    fontFamily: Fonts.bold,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  memberInitial: {
    color: Colors.white,
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
  },
  heatmapCell: {
    width: '85%',
    height: 20,
    borderRadius: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 6,
  },
  legendFree: {
    backgroundColor: Colors.tripAvailableGreen,
  },
  legendBusy: {
    backgroundColor: Colors.avatarPlaceholderBg,
  },
  legendBest: {
    backgroundColor: Colors.accentTealMint,
  },
  legendText: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
  },
  sectionHeader: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
  },
  optionCard: {
    backgroundColor: Colors.transparent,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionCardSelected: {
    backgroundColor: Colors.cardSelected,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  optionIconContainer: {
    marginRight: 14,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  optionSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
    marginTop: 3,
  },
  optionSubtitleAlert: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.primary,
    marginTop: 3,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: Typography.size.subtitle,
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
  bottomButtonDisabled: {
    opacity: 0.45,
  },
  bottomButtonText: {
    color: Colors.white,
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
  },
});

export default FindCommonDatesModal;
