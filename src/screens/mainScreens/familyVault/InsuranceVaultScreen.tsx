import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { getMyFamilyBasicThunk } from '../../../redux/features/family/familySlice';
import { fetchVaultItemsThunk } from '../../../redux/features/vault/vaultSlice';
import { VaultItemApi } from '../../../services/vaultServices';
import { VaultListSkeleton } from '../../../components/SkeletonLoader';
import AddEditVaultItemModal from './AddEditVaultItemModal';
import {
  canEditVaultItem,
  formatDaysRemainingBadge,
  formatInrAmount,
  formatVaultShortDate,
  getCurrentVaultUserContext,
  getDaysRemaining,
  isJestTestEnv,
  maskSecretNumber,
  scheduleVaultAfterTransition,
} from './vaultApiHelpers';

export interface InsuranceVaultScreenProps {
  onBack: () => void;
  onSelectPolicy?: (item: VaultItemApi) => void;
  onRenewPolicy?: (item: VaultItemApi) => void;
  onAddPolicy?: (kind?: string) => void;
  itemsOverride?: VaultItemApi[];
}

const getKindTheme = (
  kind?: string | null
): { label: string; icon: string; color: string } => {
  switch (String(kind || '').toUpperCase()) {
    case 'MOTOR':
      return { label: 'MOTOR', icon: 'shield', color: '#F0923A' };
    case 'HEALTH':
      return { label: 'HEALTH', icon: 'heart', color: '#6FD9A6' };
    case 'LIFE':
      return { label: 'LIFE', icon: 'users', color: '#5B9BF1' };
    case 'HOME':
      return { label: 'HOME', icon: 'home', color: '#E56B9F' };
    default:
      return {
        label: String(kind || 'POLICY').toUpperCase(),
        icon: 'shield',
        color: '#F0923A',
      };
  }
};

export const InsuranceVaultScreen: React.FC<InsuranceVaultScreenProps> = ({
  onBack,
  onSelectPolicy,
  onRenewPolicy,
  onAddPolicy,
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalKind, setModalKind] = useState<string>('MOTOR');
  const [modalEditItem, setModalEditItem] = useState<VaultItemApi | null>(null);
  const [modalRenewMode, setModalRenewMode] = useState(false);

  const loadPolicies = useCallback(async () => {
    await dispatch(fetchVaultItemsThunk({ category: 'INSURANCE' }));
  }, [dispatch]);

  useEffect(() => {
    if (itemsOverride || (isJestTestEnv() && vaultState.hasLoadedItems)) return;
    return scheduleVaultAfterTransition(() => {
      loadPolicies();
      if (!currentUserCtx.memberId && !currentUserCtx.role && !isJestTestEnv()) {
        dispatch(getMyFamilyBasicThunk());
      }
    });
  }, [
    currentUserCtx.memberId,
    currentUserCtx.role,
    dispatch,
    itemsOverride,
    loadPolicies,
    vaultState.hasLoadedItems,
  ]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPolicies();
    } finally {
      setRefreshing(false);
    }
  }, [loadPolicies]);

  const policies = useMemo(() => {
    const source = itemsOverride || vaultState.items;
    return source.filter(
      (item) => String(item.category).toUpperCase() === 'INSURANCE'
    );
  }, [itemsOverride, vaultState.items]);

  const isInitialLoading =
    !itemsOverride &&
    !vaultState.hasLoadedItems &&
    vaultState.loadingItems;

  const hasHomePolicy = useMemo(
    () => policies.some((p) => String(p.kind || '').toUpperCase() === 'HOME'),
    [policies]
  );

  const openAddPolicy = (kind = 'MOTOR') => {
    if (onAddPolicy) {
      onAddPolicy(kind);
      return;
    }
    setModalEditItem(null);
    setModalRenewMode(false);
    setModalKind(kind);
    setModalVisible(true);
  };

  const openRenewPolicy = (policy: VaultItemApi) => {
    if (onRenewPolicy) {
      onRenewPolicy(policy);
      return;
    }
    setModalEditItem(policy);
    setModalRenewMode(true);
    setModalKind(policy.kind || 'MOTOR');
    setModalVisible(true);
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
        <Text style={styles.headerTitle}>Insurance vault</Text>
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
          {policies.length === 0 ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.tagRow}>
                  <Feather name="shield" size={14} color="#F0923A" />
                  <Text style={[styles.tagText, { color: '#F0923A' }]}>
                    INSURANCE
                  </Text>
                </View>
              </View>
              <Text style={styles.policyTitle}>No insurance policies yet</Text>
              <Text style={styles.policySubtitle}>
                Add motor, health, life, or home insurance to track renewal reminders and policy documents.
              </Text>
              <TouchableOpacity
                style={styles.dashedAddBtn}
                activeOpacity={0.75}
                onPress={() => openAddPolicy('MOTOR')}
                accessibilityRole="button"
              >
                <Feather
                  name="plus"
                  size={16}
                  color="#F0923A"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.dashedAddBtnText}>Add first policy</Text>
              </TouchableOpacity>
            </View>
          ) : (
            policies.map((policy) => {
              const theme = getKindTheme(policy.kind);
              const days = getDaysRemaining(policy);
              const badge = formatDaysRemainingBadge(days, policy.dueLabel);
              const showRenewAction =
                days !== null &&
                days <= 30 &&
                (canEditVaultItem(policy, familyState) || Boolean(onRenewPolicy));

              const line1Parts = [
                policy.asset?.title,
                policy.provider,
                policy.number ? `Policy ${maskSecretNumber(policy.number)}` : null,
                policy.sumInsured
                  ? `${formatInrAmount(policy.sumInsured)} cover`
                  : null,
              ].filter(Boolean);

              const coveredNames = (policy.coveredMembers || [])
                .map((m) => m.fullName.split(/\s+/)[0])
                .join(' · ');

              const line2Parts = [
                coveredNames || null,
                policy.dueOn
                  ? `Valid till ${formatVaultShortDate(policy.dueOn)}`
                  : null,
                policy.amount
                  ? `${formatInrAmount(policy.amount)}/yr`
                  : null,
              ].filter(Boolean);

              return (
                <TouchableOpacity
                  key={policy.id}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => onSelectPolicy?.(policy)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.tagRow}>
                      <Feather
                        name={theme.icon as any}
                        size={14}
                        color={theme.color}
                      />
                      <Text style={[styles.tagText, { color: theme.color }]}>
                        {theme.label}
                      </Text>
                    </View>
                    {badge && (
                      <View
                        style={[
                          styles.badgeOrange,
                          badge.isOverdue && styles.badgeDanger,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeOrangeText,
                            badge.isOverdue && styles.badgeDangerText,
                          ]}
                        >
                          {badge.text}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.policyTitle}>{policy.title}</Text>
                  {line1Parts.length > 0 && (
                    <Text style={styles.policySubtitle}>
                      {line1Parts.join(' · ')}
                    </Text>
                  )}
                  {line2Parts.length > 0 && (
                    <Text style={styles.policySubtitle}>
                      {line2Parts.join(' · ')}
                    </Text>
                  )}

                  {showRenewAction && (
                    <TouchableOpacity
                      style={styles.renewNowBtn}
                      activeOpacity={0.8}
                      onPress={() => openRenewPolicy(policy)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.renewNowBtnText}>Renew now</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })
          )}

          {!hasHomePolicy && (
            <View style={styles.dashedCard}>
              <View style={styles.cardHeader}>
                <View style={styles.tagRow}>
                  <Feather name="home" size={14} color="#8A97AB" />
                  <Text style={[styles.tagText, { color: '#8A97AB' }]}>HOME</Text>
                </View>
              </View>
              <Text style={styles.policyTitle}>No home insurance yet</Text>
              <Text style={styles.policySubtitle}>
                Protects structure & contents
              </Text>
              <TouchableOpacity
                style={styles.dashedAddBtn}
                activeOpacity={0.75}
                onPress={() => openAddPolicy('HOME')}
                accessibilityRole="button"
              >
                <Feather
                  name="plus"
                  size={16}
                  color="#F0923A"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.dashedAddBtnText}>Add home policy</Text>
              </TouchableOpacity>
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
          onPress={() => openAddPolicy('MOTOR')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add policy"
        >
          <Feather
            name="plus"
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.addButtonText}>Add policy</Text>
        </TouchableOpacity>
      </View>

      <AddEditVaultItemModal
        visible={modalVisible}
        initialCategory="INSURANCE"
        initialKind={modalKind}
        itemToEdit={modalEditItem}
        renewMode={modalRenewMode}
        onClose={() => setModalVisible(false)}
        onSaved={loadPolicies}
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
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 18,
    marginBottom: 14,
  },
  dashedCard: {
    backgroundColor: '#0F1E36',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#26374D',
    padding: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.2,
    marginLeft: 6,
  },
  badgeOrange: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F7C08E',
  },
  badgeOrangeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F7C08E',
  },
  badgeDanger: {
    borderColor: '#F06A6A',
  },
  badgeDangerText: {
    color: '#F06A6A',
  },
  policyTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  policySubtitle: {
    fontSize: 13.5,
    color: '#8A97AB',
    lineHeight: 19,
    marginBottom: 2,
  },
  renewNowBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#344154',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  renewNowBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  dashedAddBtn: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#3D4F66',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  dashedAddBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0923A',
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

export default InsuranceVaultScreen;
