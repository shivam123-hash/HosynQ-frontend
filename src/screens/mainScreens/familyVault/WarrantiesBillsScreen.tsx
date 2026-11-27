import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { getMyFamilyBasicThunk } from '../../../redux/features/family/familySlice';
import {
  fetchVaultItemsThunk,
  updateVaultItemThunk,
} from '../../../redux/features/vault/vaultSlice';
import { VaultItemApi } from '../../../services/vaultServices';
import { VaultListSkeleton } from '../../../components/SkeletonLoader';
import AddEditVaultItemModal from './AddEditVaultItemModal';
import VaultDialog, {
  INITIAL_VAULT_DIALOG_STATE,
  VaultDialogState,
} from './VaultDialog';
import {
  calculateNextDueDate,
  canEditVaultItem,
  formatInrAmount,
  formatVaultShortDate,
  getCurrentVaultUserContext,
  getDaysRemaining,
  isJestTestEnv,
  scheduleVaultAfterTransition,
} from './vaultApiHelpers';

export interface WarrantiesBillsScreenProps {
  onBack: () => void;
  onSelectItem?: (item: VaultItemApi) => void;
  onAddItem?: (category?: 'UTILITIES' | 'WARRANTY') => void;
  itemsOverride?: VaultItemApi[];
}

const getBillIcon = (kind?: string | null): string => {
  switch (String(kind || '').toUpperCase()) {
    case 'INTERNET':
    case 'BROADBAND':
      return 'wifi';
    case 'WATER':
      return 'droplet';
    case 'GAS':
      return 'flame' as any;
    default:
      return 'zap';
  }
};

export const WarrantiesBillsScreen: React.FC<WarrantiesBillsScreenProps> = ({
  onBack,
  onSelectItem,
  onAddItem,
  itemsOverride,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const vaultState = useAppSelector((state) => state.vault);
  const familyState = useAppSelector((state) => state.family);
  const currentUserCtx = useMemo(
    () => getCurrentVaultUserContext(familyState),
    [familyState]
  );

  const [refreshing, setRefreshing] = useState(false);
  const [payingItemId, setPayingItemId] = useState<string | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [dialog, setDialog] = useState<VaultDialogState>(INITIAL_VAULT_DIALOG_STATE);

  const loadItems = useCallback(async () => {
    await dispatch(fetchVaultItemsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (itemsOverride || (isJestTestEnv() && vaultState.hasLoadedItems)) return;
    return scheduleVaultAfterTransition(() => {
      loadItems();
      if (!currentUserCtx.memberId && !currentUserCtx.role && !isJestTestEnv()) {
        dispatch(getMyFamilyBasicThunk());
      }
    });
  }, [
    currentUserCtx.memberId,
    currentUserCtx.role,
    dispatch,
    itemsOverride,
    loadItems,
    vaultState.hasLoadedItems,
  ]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadItems();
    } finally {
      setRefreshing(false);
    }
  }, [loadItems]);

  const sourceItems = itemsOverride || vaultState.items;

  const bills = useMemo(
    () =>
      sourceItems.filter((item) => {
        const cat = String(item.category).toUpperCase();
        return cat === 'UTILITIES' || cat === 'WARRANTIES_BILLS';
      }),
    [sourceItems]
  );

  const warranties = useMemo(
    () =>
      sourceItems.filter((item) => {
        const cat = String(item.category).toUpperCase();
        return cat === 'WARRANTY' || cat === 'WARRANTIES_BILLS';
      }),
    [sourceItems]
  );

  const isInitialLoading =
    !itemsOverride &&
    !vaultState.hasLoadedItems &&
    vaultState.loadingItems;

  const isBillPaidThisCycle = (bill: VaultItemApi): boolean => {
    if (!bill.paidOn) return false;
    if (!bill.dueOn) return true;
    return new Date(bill.dueOn).getTime() > new Date(bill.paidOn).getTime() + 5 * 86400000;
  };

  const handleMarkPaid = (bill: VaultItemApi) => {
    const today = new Date().toISOString().slice(0, 10);
    const nextDue = calculateNextDueDate(bill.dueOn, bill.repeatMonths);

    setDialog({
      visible: true,
      type: 'warning',
      iconName: 'check-circle',
      title: `Mark ${bill.title} as paid?`,
      description: `Marks paid on ${formatVaultShortDate(
        today
      )} and rolls next due date to ${formatVaultShortDate(nextDue)}.`,
      primaryButtonText: 'Mark paid',
      secondaryButtonText: 'Cancel',
      onConfirm: async () => {
        setDialog(INITIAL_VAULT_DIALOG_STATE);
        setPayingItemId(bill.id);
        try {
          await dispatch(
            updateVaultItemThunk({
              id: bill.id,
              payload: {
                paidOn: today,
                dueOn: nextDue,
              },
            })
          ).unwrap();
          await loadItems();
        } catch (err: any) {
          setDialog({
            visible: true,
            type: 'danger',
            iconName: 'alert-circle',
            title: 'Could not update bill',
            description: String(err || 'Please try again.'),
            primaryButtonText: 'OK',
          });
        } finally {
          setPayingItemId(null);
        }
      },
    });
  };

  const handleAddPress = () => {
    if (onAddItem) {
      onAddItem('UTILITIES');
      return;
    }
    setAddModalVisible(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Warranties & bills</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {isInitialLoading ? (
        <VaultListSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 100 + insets.bottom },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#F0923A"
              colors={['#F0923A']}
            />
          }
        >
          <Text style={styles.sectionHeading}>HOUSEHOLD BILLS</Text>
          {bills.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No household bills saved yet</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {bills.map((bill, idx) => {
                const days = getDaysRemaining(bill);
                const paid = isBillPaidThisCycle(bill);
                const isDue = !paid && (days === null || days <= 10);
                const subtitleParts = [
                  bill.provider,
                  bill.amount ? formatInrAmount(bill.amount) : null,
                  paid && bill.paidOn
                    ? `Paid ${formatVaultShortDate(bill.paidOn)}${
                        bill.dueOn
                          ? ` · Next ${formatVaultShortDate(bill.dueOn)}`
                          : ''
                      }`
                    : bill.dueOn
                    ? `Due ${formatVaultShortDate(bill.dueOn)}`
                    : null,
                ].filter(Boolean);

                return (
                  <React.Fragment key={bill.id}>
                    {idx > 0 && <View style={styles.divider} />}
                    <TouchableOpacity
                      style={styles.row}
                      activeOpacity={0.75}
                      onPress={() => onSelectItem?.(bill)}
                      accessibilityRole="button"
                    >
                      <View
                        style={[
                          styles.iconBox,
                          {
                            borderColor: paid
                              ? '#5B9BF1'
                              : isDue
                              ? '#F06A6A'
                              : '#F0CA45',
                          },
                        ]}
                      >
                        <Feather
                          name={getBillIcon(bill.kind) as any}
                          size={18}
                          color={
                            paid
                              ? '#5B9BF1'
                              : isDue
                              ? '#F06A6A'
                              : '#F0CA45'
                          }
                        />
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {bill.title}
                        </Text>
                        <Text style={styles.rowSubtitle} numberOfLines={1}>
                          {subtitleParts.join(' · ')}
                        </Text>
                      </View>

                      {paid ? (
                        <View style={styles.badgePaid}>
                          <Text style={styles.badgePaidText}>Paid</Text>
                        </View>
                      ) : (
                        <>
                          {isDue && (
                            <View style={[styles.badgeDue, { marginRight: canEditVaultItem(bill, familyState) ? 8 : 0 }]}>
                              <Text style={styles.badgeDueText}>
                                {days !== null && days < 0 ? 'Overdue' : 'Due'}
                              </Text>
                            </View>
                          )}
                          {canEditVaultItem(bill, familyState) && (
                            <TouchableOpacity
                              activeOpacity={0.7}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              onPress={() => handleMarkPaid(bill)}
                              disabled={payingItemId === bill.id}
                            >
                              {payingItemId === bill.id ? (
                                <ActivityIndicator
                                  size="small"
                                  color="#F0923A"
                                />
                              ) : (
                                <Text style={styles.payText}>Pay</Text>
                              )}
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </View>
          )}

          <Text style={styles.sectionHeading}>WARRANTIES</Text>
          {warranties.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No warranties saved yet</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {warranties.map((w, idx) => {
                const days = getDaysRemaining(w);
                const endsSoon = days !== null && days <= 30;
                const subParts = [
                  w.asset?.title || w.provider,
                  w.dueOn
                    ? `Expires ${formatVaultShortDate(w.dueOn)}`
                    : null,
                ].filter(Boolean);

                return (
                  <React.Fragment key={w.id}>
                    {idx > 0 && <View style={styles.divider} />}
                    <TouchableOpacity
                      style={styles.row}
                      activeOpacity={0.75}
                      onPress={() => onSelectItem?.(w)}
                      accessibilityRole="button"
                    >
                      <View
                        style={[
                          styles.iconBox,
                          { borderColor: endsSoon ? '#F7C08E' : '#6FD9A6' },
                        ]}
                      >
                        <Feather
                          name={endsSoon ? 'monitor' : 'shield'}
                          size={18}
                          color={endsSoon ? '#F7C08E' : '#6FD9A6'}
                        />
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {w.title}
                        </Text>
                        <Text style={styles.rowSubtitle} numberOfLines={1}>
                          {subParts.join(' · ')}
                        </Text>
                      </View>
                      {endsSoon ? (
                        <View style={styles.badgeEndsSoon}>
                          <Text style={styles.badgeEndsSoonText}>
                            {days !== null && days < 0
                              ? 'Expired'
                              : 'Ends soon'}
                          </Text>
                        </View>
                      ) : (
                        <Feather
                          name="chevron-right"
                          size={18}
                          color="#8A97AB"
                        />
                      )}
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add bill or warranty"
        >
          <Feather
            name="plus"
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.addButtonText}>Add bill or warranty</Text>
        </TouchableOpacity>
      </View>

      <AddEditVaultItemModal
        visible={addModalVisible}
        initialCategory="WARRANTIES_BILLS"
        onClose={() => setAddModalVisible(false)}
        onSaved={loadItems}
      />

      <VaultDialog
        dialog={dialog}
        onClose={() => setDialog(INITIAL_VAULT_DIALOG_STATE)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
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
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#233348',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPlaceholder: {
    width: 44,
    height: 44,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 24,
  },
  emptyCard: {
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 18,
    marginBottom: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13.5,
    color: '#8A97AB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rowInfo: {
    flex: 1,
    marginLeft: 14,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  badgeDue: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F06A6A',
  },
  badgeDueText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F06A6A',
  },
  payText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0923A',
  },
  badgePaid: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6FD9A6',
  },
  badgePaidText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#6FD9A6',
  },
  badgeEndsSoon: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F7C08E',
  },
  badgeEndsSoonText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F7C08E',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  addButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
});

export default WarrantiesBillsScreen;
