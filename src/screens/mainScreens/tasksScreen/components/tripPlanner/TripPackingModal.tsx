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
import {
  addTripPackingItemsThunk,
  createTripPackingListThunk,
  fetchTripPackingListThunk,
  removeTripPackingItemThunk,
  updateTripPackingItemThunk,
} from '../../../../../redux/features/trips/tripsSlice';
import { isUUID } from '../../../../../redux/features/lists/listsSlice';
import { TripPackingSkeleton } from '../../../../../components/SkeletonLoader';
import AddListItemsModal from '../AddListItemsModal';
import AssignListItemModal from '../AssignListItemModal';
import AppOptionsMenu from '../../../common/AppOptionsMenu';
import TripDialog, { INITIAL_TRIP_DIALOG_STATE, TripDialogState } from './TripDialog';
import { ListItemEntry } from '../../types';
import { TripMember, TripPackingItem } from './types';
import {
  extractTripMembersFromFamilyState,
  isJestTestEnv,
  mapApiListDetailToPackingItems,
} from './tripApiHelpers';
import { Colors, Fonts, Typography } from '../../../../../units';

export interface TripPackingModalProps {
  visible?: boolean;
  asModal?: boolean;
  tripId?: string;
  packingListId?: string | null;
  packingItems: TripPackingItem[];
  destination: string;
  tripMembers?: TripMember[];
  onClose: () => void;
  onUpdatePackingItems?: (items: TripPackingItem[]) => void;
  onPackingListLinked?: (listId: string) => void;
}

export const TripPackingModal: React.FC<TripPackingModalProps> = ({
  visible = true,
  asModal = true,
  tripId,
  packingListId: initialPackingListId,
  packingItems: initialItems,
  destination,
  tripMembers = [],
  onClose,
  onUpdatePackingItems,
  onPackingListLinked,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const tripsState = useAppSelector((state) => state.trips);
  const familyState = useAppSelector((state) => state.family);
  const isTestEnv = isJestTestEnv();

  const [activeListId, setActiveListId] = useState<string | null>(
    initialPackingListId || tripsState.selectedTrip?.packingList?.id || null
  );
  const [items, setItems] = useState<TripPackingItem[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState('Everyone');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddItems, setShowAddItems] = useState(false);
  const [assignTarget, setAssignTarget] = useState<ListItemEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dialog, setDialog] = useState<TripDialogState>(INITIAL_TRIP_DIALOG_STATE);
  const initializedKeyRef = useRef<string | null>(null);

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

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    if (initialPackingListId) {
      setActiveListId(initialPackingListId);
    }
  }, [initialPackingListId]);

  useEffect(() => {
    if (!visible) {
      setIsMenuOpen(false);
      initializedKeyRef.current = null;
      return;
    }

    if (isTestEnv) return;

    const existingListId =
      initialPackingListId ||
      activeListId ||
      tripsState.selectedTrip?.packingList?.id ||
      tripsState.selectedTrip?.packingListId ||
      null;

    const initKey = existingListId ? `list:${existingListId}` : tripId ? `trip:${tripId}` : '';
    if (!initKey || initializedKeyRef.current === initKey) return;
    initializedKeyRef.current = initKey;

    if (existingListId && isUUID(existingListId)) {
      setActiveListId(existingListId);
      dispatch(fetchTripPackingListThunk(existingListId));
    } else if (tripId && isUUID(tripId)) {
      // Automatically create a packing list if none exists yet for this trip (API #7)
      dispatch(createTripPackingListThunk(tripId))
        .unwrap()
        .then((res) => {
          if (res.listId) {
            initializedKeyRef.current = `list:${res.listId}`;
            setActiveListId(res.listId);
            onPackingListLinked?.(res.listId);
          }
        })
        .catch(() => {
          // handled in tripsState.error
        });
    }
  }, [visible, tripId, initialPackingListId, isTestEnv]);

  useEffect(() => {
    if (!isTestEnv && tripsState.packingList && (!activeListId || tripsState.packingList.id === activeListId)) {
      setActiveListId(tripsState.packingList.id);
      const mapped = mapApiListDetailToPackingItems(tripsState.packingList);
      setItems(mapped);
      onUpdatePackingItems?.(mapped);
    }
  }, [tripsState.packingList, activeListId, isTestEnv]);

  const handleRefresh = useCallback(async () => {
    if (!activeListId || !isUUID(activeListId)) return;
    setRefreshing(true);
    try {
      await dispatch(fetchTripPackingListThunk(activeListId)).unwrap();
    } catch {
      // handled cleanly
    } finally {
      setRefreshing(false);
    }
  }, [activeListId, dispatch]);

  const familyMembers = useMemo(() => {
    if (tripMembers.length > 0) return tripMembers;
    return extractTripMembersFromFamilyState(familyState);
  }, [tripMembers, familyState]);

  const filterOptions = useMemo(() => {
    const names = Array.from(
      new Set([
        ...familyMembers.map((m) => m.name).filter(Boolean),
        ...items
          .map((it) => it.assignedTo)
          .filter((name) => Boolean(name) && name !== 'Shared'),
      ])
    );
    return ['Everyone', 'Shared', ...names];
  }, [familyMembers, items]);

  const ensureListReady = async (): Promise<string | null> => {
    if (activeListId && isUUID(activeListId)) return activeListId;
    if (tripId && isUUID(tripId)) {
      const created = await dispatch(createTripPackingListThunk(tripId)).unwrap();
      if (created.listId) {
        setActiveListId(created.listId);
        onPackingListLinked?.(created.listId);
        return created.listId;
      }
    }
    return null;
  };

  const toggleItemPacked = async (itemId: string) => {
    const current = items.find((i) => i.id === itemId);
    const nextPacked = !current?.isPacked;
    const updated = items.map((it) =>
      it.id === itemId ? { ...it, isPacked: nextPacked } : it
    );
    setItems(updated);
    onUpdatePackingItems?.(updated);

    if (!isTestEnv && activeListId && isUUID(activeListId) && isUUID(itemId)) {
      try {
        await dispatch(
          updateTripPackingItemThunk({
            listId: activeListId,
            itemId,
            tripId,
            patch: { done: nextPacked },
          })
        ).unwrap();
      } catch (err: any) {
        setItems(items);
        onUpdatePackingItems?.(items);
        showNoticeDialog('Update failed', typeof err === 'string' ? err : 'Could not update item.');
      }
    }
  };

  const handleAddItems = async (entries: ListItemEntry[]) => {
    if (!entries || entries.length === 0) return;

    if (isTestEnv) {
      const localNew: TripPackingItem[] = entries.map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: e.quantity,
        category: 'shared',
        assignedTo: 'Shared',
        assignedInitial: '',
        assignedBg: Colors.primary,
        isPacked: false,
      }));
      const merged = [...items, ...localNew];
      setItems(merged);
      onUpdatePackingItems?.(merged);
      return;
    }

    try {
      const listId = await ensureListReady();
      if (!listId) {
        showNoticeDialog(
          'Save trip first',
          'Please save Destination and dates in Trip details before creating a packing list.',
          'warning'
        );
        return;
      }
      await dispatch(
        addTripPackingItemsThunk({
          listId,
          tripId,
          items: entries.map((e) => ({
            name: e.title,
            note: e.quantity || null,
          })),
        })
      ).unwrap();
    } catch (err: any) {
      showNoticeDialog('Add failed', typeof err === 'string' ? err : 'Could not add packing items.');
    }
  };

  const handleAssignMember = async (
    itemId: string,
    assigneeName?: string,
    initial?: string,
    bg?: string,
    memberId?: string
  ) => {
    const cleanName = assigneeName
      ? assigneeName.replace(/\s*\(you\)\s*$/i, '').trim()
      : 'Shared';
    const updated = items.map((it) =>
      it.id === itemId
        ? {
            ...it,
            assignedTo: cleanName,
            assignedMemberId: memberId || null,
            assignedInitial: initial || (assigneeName ? cleanName[0].toUpperCase() : ''),
            assignedBg: bg || it.assignedBg,
            category: assigneeName ? ('personal' as const) : ('shared' as const),
          }
        : it
    );
    setItems(updated);
    onUpdatePackingItems?.(updated);

    if (!isTestEnv && activeListId && isUUID(activeListId) && isUUID(itemId)) {
      try {
        await dispatch(
          updateTripPackingItemThunk({
            listId: activeListId,
            itemId,
            tripId,
            patch: { assignedMemberId: memberId || null },
          })
        ).unwrap();
      } catch (err: any) {
        setItems(items);
        onUpdatePackingItems?.(items);
        showNoticeDialog('Assign failed', typeof err === 'string' ? err : 'Could not assign item.');
      }
    }
  };

  const handleRemoveItem = (item: TripPackingItem) => {
    setDialog({
      visible: true,
      type: 'danger',
      title: 'Remove item?',
      description: `Delete “${item.title}” from packing list?`,
      primaryButtonText: 'Remove',
      secondaryButtonText: 'Cancel',
      onConfirm: async () => {
        const updated = items.filter((it) => it.id !== item.id);
        setItems(updated);
        onUpdatePackingItems?.(updated);

        if (!isTestEnv && activeListId && isUUID(activeListId) && isUUID(item.id)) {
          setDialog((prev) => ({ ...prev, loading: true }));
          try {
            await dispatch(
              removeTripPackingItemThunk({
                listId: activeListId,
                itemId: item.id,
                tripId,
              })
            ).unwrap();
          } catch (err: any) {
            setItems(items);
            onUpdatePackingItems?.(items);
            showNoticeDialog('Delete failed', typeof err === 'string' ? err : 'Could not remove item.');
            return;
          }
        }
        setDialog(INITIAL_TRIP_DIALOG_STATE);
      },
    });
  };

  // Filter items
  const filteredItems = items.filter((it) => {
    if (activeFilter === 'Everyone') return true;
    if (activeFilter === 'Shared') return it.category === 'shared';
    return it.assignedTo.toLowerCase() === activeFilter.toLowerCase();
  });

  const sharedItems = filteredItems.filter((i) => i.category === 'shared');
  const kidsItems = filteredItems.filter((i) => i.category === 'kids');
  const personalItems = filteredItems.filter((i) => i.category === 'personal');

  const sharedLeft = sharedItems.filter((i) => !i.isPacked).length;
  const kidsLeft = kidsItems.filter((i) => !i.isPacked).length;
  const personalLeft = personalItems.filter((i) => !i.isPacked).length;

  const totalPacked = items.filter((i) => i.isPacked).length;
  const totalCount = items.length;
  const progressRatio = totalCount > 0 ? totalPacked / totalCount : 0;

  const cityName = destination.split(',')[0].trim() || 'Trip';
  const showSkeleton =
    !isTestEnv && tripsState.loadingPackingList && items.length === 0 && !refreshing;

  const renderItemRow = (it: TripPackingItem, isLast: boolean) => (
    <View key={it.id}>
      <View style={styles.itemRow}>
        <TouchableOpacity
          style={styles.itemCheckTap}
          onPress={() => toggleItemPacked(it.id)}
          activeOpacity={0.7}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: it.isPacked }}
        >
          {it.isPacked ? (
            <View style={styles.checkedCircle}>
              <Feather name="check" size={14} color={Colors.background} />
            </View>
          ) : (
            <View style={styles.uncheckedCircle} />
          )}

          <View style={styles.itemContent}>
            <Text
              style={[
                styles.itemTitle,
                it.isPacked && styles.itemTitleDone,
              ]}
            >
              {it.title}
            </Text>
            {it.subtitle ? (
              <Text
                style={[
                  styles.itemSubtitle,
                  it.isPacked && styles.itemSubtitleDone,
                ]}
              >
                {it.subtitle}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>

        <View style={styles.itemRightActions}>
          <TouchableOpacity
            onPress={() =>
              setAssignTarget({
                id: it.id,
                title: it.title,
                quantity: it.subtitle,
                isCompleted: it.isPacked,
                assignedTo: it.assignedTo === 'Shared' ? undefined : it.assignedTo,
                assignedInitial: it.assignedInitial,
                assignedAvatarBg: it.assignedBg,
              })
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Assign ${it.title}`}
          >
            {it.assignedInitial ? (
              <View
                style={[
                  styles.assigneeAvatar,
                  { backgroundColor: it.assignedBg },
                ]}
              >
                <Text style={styles.assigneeInitial}>{it.assignedInitial}</Text>
              </View>
            ) : (
              <View style={styles.unassignedAvatar}>
                <Feather name="user-plus" size={12} color={Colors.textSecondaryMuted} />
              </View>
            )}
          </TouchableOpacity>

          {activeListId && isUUID(activeListId) && isUUID(it.id) && (
            <TouchableOpacity
              onPress={() => handleRemoveItem(it)}
              activeOpacity={0.7}
              style={styles.removeItemBtn}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${it.title}`}
            >
              <Feather name="trash-2" size={14} color={Colors.dangerCoral} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {!isLast && <View style={styles.itemDivider} />}
    </View>
  );

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

        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => setIsMenuOpen((prev) => !prev)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Packing options"
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
            id: 'add-items',
            label: 'Add Packing Items',
            iconName: 'plus-circle',
            onPress: () => setShowAddItems(true),
          },
          {
            id: 'clear-all',
            label: 'Unpack All Items',
            iconName: 'rotate-ccw',
            onPress: async () => {
              const updated = items.map((it) => ({ ...it, isPacked: false }));
              setItems(updated);
              onUpdatePackingItems?.(updated);
              if (!isTestEnv && activeListId && isUUID(activeListId)) {
                await Promise.all(
                  items
                    .filter((it) => it.isPacked && isUUID(it.id))
                    .map((it) =>
                      dispatch(
                        updateTripPackingItemThunk({
                          listId: activeListId,
                          itemId: it.id,
                          tripId,
                          patch: { done: false },
                        })
                      )
                    )
                );
              }
            },
          },
          {
            id: 'pack-all',
            label: 'Pack All Items',
            iconName: 'check-square',
            onPress: async () => {
              const updated = items.map((it) => ({ ...it, isPacked: true }));
              setItems(updated);
              onUpdatePackingItems?.(updated);
              if (!isTestEnv && activeListId && isUUID(activeListId)) {
                await Promise.all(
                  items
                    .filter((it) => !it.isPacked && isUUID(it.id))
                    .map((it) =>
                      dispatch(
                        updateTripPackingItemThunk({
                          listId: activeListId,
                          itemId: it.id,
                          tripId,
                          patch: { done: true },
                        })
                      )
                    )
                );
              }
            },
          },
        ]}
      />

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
          <TripPackingSkeleton />
        ) : (
          <>
            {/* Packing Tag Pill */}
            <View style={styles.categoryPill}>
              <Ionicons
                name="bag-handle-outline"
                size={14}
                color={Colors.accentTealMint}
                style={styles.bagIcon}
              />
              <Text style={styles.categoryPillText}>{`Packing · ${cityName} trip`}</Text>
            </View>

            {/* Title */}
            <Text style={styles.titleText}>{`${cityName} trip packing`}</Text>

            {/* Progress bar */}
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round(progressRatio * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {`${totalPacked} of ${totalCount} packed`}
              </Text>
            </View>

            {/* Member Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {filterOptions.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      isActive && styles.filterChipActive,
                    ]}
                    onPress={() => setActiveFilter(filter)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by ${filter}`}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isActive && styles.filterChipTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {filteredItems.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="bag-handle-outline"
                  size={28}
                  color={Colors.accentTealMint}
                  style={{ marginBottom: 10 }}
                />
                <Text style={styles.emptyTitle}>
                  {items.length === 0 ? 'No packing items yet' : 'No matching items'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {tripId && !isUUID(tripId) && !activeListId
                    ? 'Save Destination and dates in Trip details first, then add items here.'
                    : 'Add clothes, chargers, medicines, or snacks and assign them to family members.'}
                </Text>
              </View>
            ) : (
              <>
                {sharedItems.length > 0 && (
                  <>
                    <Text style={styles.sectionHeader}>
                      SHARED · {sharedLeft} LEFT
                    </Text>
                    <View style={styles.groupedCard}>
                      {sharedItems.map((it, idx) =>
                        renderItemRow(it, idx === sharedItems.length - 1)
                      )}
                    </View>
                  </>
                )}

                {kidsItems.length > 0 && (
                  <>
                    <Text style={styles.sectionHeader}>
                      KIDS · {kidsLeft} LEFT
                    </Text>
                    <View style={styles.groupedCard}>
                      {kidsItems.map((it, idx) =>
                        renderItemRow(it, idx === kidsItems.length - 1)
                      )}
                    </View>
                  </>
                )}

                {personalItems.length > 0 && (
                  <>
                    <Text style={styles.sectionHeader}>
                      PERSONAL · {personalLeft} LEFT
                    </Text>
                    <View style={styles.groupedCard}>
                      {personalItems.map((it, idx) =>
                        renderItemRow(it, idx === personalItems.length - 1)
                      )}
                    </View>
                  </>
                )}
              </>
            )}

            {/* Add items dashed CTA */}
            <TouchableOpacity
              style={styles.dashedAddBtn}
              onPress={() => setShowAddItems(true)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Add packing items"
            >
              <Feather name="plus" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.dashedAddText}>Add packing items</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <AddListItemsModal
        visible={showAddItems}
        listId={activeListId || undefined}
        onClose={() => setShowAddItems(false)}
        onAddItems={handleAddItems}
      />

      <AssignListItemModal
        visible={Boolean(assignTarget)}
        item={assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssign={handleAssignMember}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accentTealMint,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  bagIcon: {
    marginRight: 6,
  },
  categoryPillText: {
    color: Colors.accentTealMint,
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.semiBold,
  },
  titleText: {
    fontSize: Typography.size.header,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginTop: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.borderBold,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accentTealMint,
  },
  progressLabel: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textLightMutedAlt,
    marginLeft: 12,
  },
  filterScroll: {
    paddingVertical: 18,
    gap: 10,
  },
  filterChip: {
    height: 36,
    backgroundColor: Colors.transparent,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
  filterChipTextActive: {
    color: Colors.background,
    fontFamily: Fonts.bold,
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
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
  sectionHeader: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    letterSpacing: 1.2,
    marginTop: 10,
    marginBottom: 10,
  },
  groupedCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    overflow: 'hidden',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemCheckTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.tripItemBorder,
    backgroundColor: Colors.transparent,
    marginRight: 14,
  },
  checkedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.tripGreenMint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  itemTitleDone: {
    color: Colors.textSecondaryMuted,
    textDecorationLine: 'line-through',
  },
  itemSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textSecondaryMuted,
    marginTop: 2,
  },
  itemSubtitleDone: {
    color: Colors.textPlaceholder,
  },
  itemRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  assigneeAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unassignedAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeInitial: {
    color: Colors.white,
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
  },
  removeItemBtn: {
    padding: 4,
  },
  itemDivider: {
    height: 1,
    backgroundColor: Colors.borderBold,
    marginHorizontal: 16,
  },
  dashedAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 28,
    height: 54,
    marginTop: 8,
    backgroundColor: Colors.transparent,
  },
  dashedAddText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});

export default TripPackingModal;
