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
import { fetchVaultItemsThunk } from '../../../redux/features/vault/vaultSlice';
import { VaultItemApi } from '../../../services/vaultServices';
import { VaultListSkeleton } from '../../../components/SkeletonLoader';
import AddEditVaultItemModal from './AddEditVaultItemModal';
import {
  formatDaysRemainingBadge,
  formatVaultShortDate,
  getDaysRemaining,
  isJestTestEnv,
  scheduleVaultAfterTransition,
} from './vaultApiHelpers';

export interface HomeAssetsScreenProps {
  onBack: () => void;
  onSelectAsset?: (item: VaultItemApi) => void;
  onAddAsset?: () => void;
  itemsOverride?: VaultItemApi[];
}

const getAssetVisual = (kind?: string | null): { icon: string; color: string } => {
  switch (String(kind || '').toUpperCase()) {
    case 'VEHICLE':
      return { icon: 'truck', color: '#F0923A' };
    case 'PROPERTY':
      return { icon: 'home', color: '#5B9BF1' };
    case 'APPLIANCE':
      return { icon: 'cpu', color: '#6FD9A6' };
    default:
      return { icon: 'box', color: '#E56B9F' };
  }
};

export const HomeAssetsScreen: React.FC<HomeAssetsScreenProps> = ({
  onBack,
  onSelectAsset,
  onAddAsset,
  itemsOverride,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const vaultState = useAppSelector((state) => state.vault);

  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const loadAssets = useCallback(async () => {
    await dispatch(fetchVaultItemsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (itemsOverride || (isJestTestEnv() && vaultState.hasLoadedItems)) return;
    return scheduleVaultAfterTransition(() => {
      loadAssets();
    });
  }, [itemsOverride, loadAssets, vaultState.hasLoadedItems]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAssets();
    } finally {
      setRefreshing(false);
    }
  }, [loadAssets]);

  const assets = useMemo(() => {
    const source = itemsOverride || vaultState.items;
    return source.filter((item) => {
      const cat = String(item.category).toUpperCase();
      return cat === 'ASSET' || cat === 'PROPERTY' || cat === 'HOME_ASSETS';
    });
  }, [itemsOverride, vaultState.items]);

  const isInitialLoading =
    !itemsOverride &&
    !vaultState.hasLoadedItems &&
    vaultState.loadingItems;

  const handleAddPress = () => {
    if (onAddAsset) {
      onAddAsset();
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
        <Text style={styles.headerTitle}>Home assets</Text>
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
          {assets.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="home" size={22} color="#5B9BF1" />
              <Text style={styles.emptyTitle}>No home assets added</Text>
              <Text style={styles.emptySubtitle}>
                Add vehicles, properties, or major appliances to link policies and warranties directly to them.
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              {assets.map((asset, idx) => {
                const vis = getAssetVisual(asset.kind);
                const days = getDaysRemaining(asset);
                const badge = formatDaysRemainingBadge(days, asset.dueLabel);

                const line1 = [
                  asset.number,
                  asset.provider,
                  asset.dueOn
                    ? `${asset.dueLabel || 'Due'} ${formatVaultShortDate(asset.dueOn)}`
                    : null,
                  asset.serviceDueOn
                    ? `Service ${formatVaultShortDate(asset.serviceDueOn)}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ');

                const linkedCount = asset.linkedItems?.length || 0;
                const line2 =
                  linkedCount > 0
                    ? `${linkedCount} linked policy/document${
                        linkedCount === 1 ? '' : 's'
                      }`
                    : asset.notes || null;

                return (
                  <React.Fragment key={asset.id}>
                    {idx > 0 && <View style={styles.divider} />}
                    <TouchableOpacity
                      style={styles.row}
                      activeOpacity={0.75}
                      onPress={() => onSelectAsset?.(asset)}
                      accessibilityRole="button"
                    >
                      <View
                        style={[styles.iconBox, { borderColor: vis.color }]}
                      >
                        <Feather
                          name={vis.icon as any}
                          size={18}
                          color={vis.color}
                        />
                      </View>
                      <View style={styles.rowInfo}>
                        <View style={styles.titleRow}>
                          <Text
                            style={[styles.titleRowText, { flex: 1 }]}
                            numberOfLines={1}
                          >
                            {asset.title}
                          </Text>
                          {badge && (
                            <View style={styles.badgePucDue}>
                              <Text style={styles.badgePucDueText}>
                                {badge.text}
                              </Text>
                            </View>
                          )}
                        </View>
                        {line1 ? (
                          <Text style={styles.rowSubtitle}>{line1}</Text>
                        ) : null}
                        {line2 ? (
                          <Text style={styles.rowSubtitle}>{line2}</Text>
                        ) : null}
                      </View>
                      <Feather
                        name="chevron-right"
                        size={18}
                        color="#8A97AB"
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            style={styles.tipCard}
            activeOpacity={0.8}
            onPress={handleAddPress}
          >
            <View style={styles.tipIcon}>
              <Feather name="zap" size={18} color="#F7C08E" />
            </View>
            <Text style={styles.tipText}>
              Tip: Scan an RC book, deed, or appliance invoice to create an asset and link policies to it automatically.
            </Text>
          </TouchableOpacity>
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
          accessibilityLabel="Add asset"
        >
          <Feather
            name="plus"
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.addButtonText}>Add asset</Text>
        </TouchableOpacity>
      </View>

      <AddEditVaultItemModal
        visible={addModalVisible}
        initialCategory="HOME_ASSETS"
        onClose={() => setAddModalVisible(false)}
        onSaved={loadAssets}
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
    overflow: 'hidden',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 18,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  titleRowText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    lineHeight: 18,
  },
  badgePucDue: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F7C08E',
  },
  badgePucDueText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F7C08E',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13.5,
    color: '#C8D1DC',
    lineHeight: 19,
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

export default HomeAssetsScreen;
