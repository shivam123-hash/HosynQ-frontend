import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { getMyFamilyBasicThunk } from '../../../redux/features/family/familySlice';
import {
  fetchVaultHomeThunk,
  fetchVaultItemsThunk,
} from '../../../redux/features/vault/vaultSlice';
import {
  VaultHomeResponse,
  VaultItemApi,
} from '../../../services/vaultServices';
import { VaultHomeSkeleton } from '../../../components/SkeletonLoader';
import AddEditVaultItemModal from './AddEditVaultItemModal';
import {
  extractVaultMembersFromFamilyState,
  formatCategoryDisplayName,
  formatDaysRemainingBadge,
  formatVaultShortDate,
  getDaysRemaining,
  isJestTestEnv,
  scheduleVaultAfterTransition,
} from './vaultApiHelpers';

export interface FamilyVaultScreenProps {
  onBack: () => void;
  onViewAlert?: (item?: VaultItemApi) => void;
  onNavigateToCategory?: (
    category:
      | 'documents'
      | 'insurance'
      | 'warranties'
      | 'assets'
      | 'contacts'
      | 'scans'
  ) => void;
  onSelectItem?: (item: VaultItemApi) => void;
  onAddToVault?: () => void;
  onSearch?: () => void;
  homeOverride?: VaultHomeResponse;
}

const getCategoryVisual = (category?: string): { icon: string; color: string } => {
  switch (String(category || '').toUpperCase()) {
    case 'INSURANCE':
      return { icon: 'shield', color: '#5B9BF1' };
    case 'UTILITIES':
    case 'WARRANTY':
      return { icon: 'zap', color: '#6FD9A6' };
    case 'ASSET':
    case 'PROPERTY':
      return { icon: 'truck', color: '#F0923A' };
    case 'IDENTITY':
    case 'LEGAL':
      return { icon: 'file-text', color: '#5B9BF1' };
    case 'CONTACTS':
      return { icon: 'phone', color: '#E56B9F' };
    case 'FINANCE':
      return { icon: 'credit-card', color: '#F0CA45' };
    default:
      return { icon: 'folder', color: '#8A97AB' };
  }
};

export const FamilyVaultScreen: React.FC<FamilyVaultScreenProps> = ({
  onBack,
  onViewAlert,
  onNavigateToCategory,
  onSelectItem,
  onAddToVault,
  onSearch,
  homeOverride,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const vaultState = useAppSelector((state) => state.vault);
  const familyState = useAppSelector((state) => state.family);

  const [refreshing, setRefreshing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const members = useMemo(
    () => extractVaultMembersFromFamilyState(familyState),
    [familyState]
  );

  useEffect(() => {
    if (homeOverride || (isJestTestEnv() && vaultState.hasLoadedHome)) return;
    const cancel = scheduleVaultAfterTransition(() => {
      dispatch(fetchVaultHomeThunk(30));
      if (members.length === 0 && !isJestTestEnv()) {
        dispatch(getMyFamilyBasicThunk());
      }
    });
    return cancel;
  }, [dispatch, homeOverride, members.length, vaultState.hasLoadedHome]);

  useEffect(() => {
    if (!searchOpen) return;
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(fetchVaultItemsThunk({ q: trimmed }));
    }, 280);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [dispatch, searchOpen, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchVaultHomeThunk(30));
      if (searchOpen && searchQuery.trim()) {
        await dispatch(fetchVaultItemsThunk({ q: searchQuery.trim() }));
      }
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, searchOpen, searchQuery]);

  const home = homeOverride || vaultState.home;
  const isInitialLoading =
    !homeOverride &&
    !home &&
    (!vaultState.hasLoadedHome || vaultState.loadingHome);

  const categoryCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    (home?.categories || []).forEach((c) => {
      map[String(c.category).toUpperCase()] = Number(c.count || 0);
    });
    return map;
  }, [home?.categories]);

  const urgentItem = useMemo(() => {
    if (!home) return null;
    if (home.overdue && home.overdue.length > 0) return home.overdue[0];
    if (home.upcoming && home.upcoming.length > 0) return home.upcoming[0];
    return null;
  }, [home]);

  const urgentBannerText = useMemo(() => {
    if (!urgentItem) return '';
    const days = getDaysRemaining(urgentItem);
    const badge = formatDaysRemainingBadge(days, urgentItem.dueLabel);
    if (badge) {
      return `${urgentItem.title} · ${badge.text}`;
    }
    return urgentItem.dueOn
      ? `${urgentItem.title} · Due ${formatVaultShortDate(urgentItem.dueOn)}`
      : urgentItem.title;
  }, [urgentItem]);

  const docCount =
    (home?.lifeProfileDocuments?.length || 0) + (categoryCountMap.IDENTITY || 0);
  const docExpiringCount = useMemo(() => {
    const lpExpiring = (home?.lifeProfileDocuments || []).filter(
      (d) => d.isExpired || (typeof d.daysRemaining === 'number' && d.daysRemaining <= 90)
    ).length;
    const identityExpiring = [
      ...(home?.overdue || []),
      ...(home?.upcoming || []),
    ].filter((i) => String(i.category).toUpperCase() === 'IDENTITY').length;
    return lpExpiring + identityExpiring;
  }, [home]);

  const insuranceCount = categoryCountMap.INSURANCE || 0;
  const utilitiesCount = categoryCountMap.UTILITIES || 0;
  const warrantiesCount = categoryCountMap.WARRANTY || 0;
  const assetsCount =
    (categoryCountMap.ASSET || 0) + (categoryCountMap.PROPERTY || 0);
  const contactsCount = categoryCountMap.CONTACTS || 0;
  const uploadedFilesCount = useMemo(() => {
    const recentFiles = (home?.recent || []).filter((i) => i.hasFile).length;
    const lpFiles = (home?.lifeProfileDocuments || []).filter((d) => d.hasFile).length;
    return recentFiles + lpFiles;
  }, [home]);

  const categoryCards = useMemo(
    () => [
      {
        key: 'documents' as const,
        icon: 'file-text',
        color: '#5B9BF1',
        title: 'Documents &\nrenewals',
        subtitle:
          docCount === 0
            ? 'No documents yet'
            : docExpiringCount > 0
            ? `${docCount} doc${docCount === 1 ? '' : 's'} · ${docExpiringCount} renewing`
            : `${docCount} doc${docCount === 1 ? '' : 's'} saved`,
        row1: true,
      },
      {
        key: 'insurance' as const,
        icon: 'shield',
        color: '#F0923A',
        title: 'Insurance',
        subtitle:
          insuranceCount === 0
            ? 'No policies yet'
            : `${insuranceCount} active ${insuranceCount === 1 ? 'policy' : 'policies'}`,
        row1: true,
      },
      {
        key: 'warranties' as const,
        icon: 'zap',
        color: '#6FD9A6',
        title: 'Warranties & bills',
        subtitle:
          utilitiesCount + warrantiesCount === 0
            ? 'No bills or warranties'
            : `${utilitiesCount} bill${utilitiesCount === 1 ? '' : 's'} · ${warrantiesCount} warrant${
                warrantiesCount === 1 ? 'y' : 'ies'
              }`,
      },
      {
        key: 'assets' as const,
        icon: 'home',
        color: '#E56B9F',
        title: 'Home assets',
        subtitle:
          assetsCount === 0
            ? 'No assets added'
            : `${assetsCount} asset${assetsCount === 1 ? '' : 's'} tracked`,
      },
      {
        key: 'contacts' as const,
        icon: 'phone',
        color: '#F0CA45',
        title: 'Important contacts',
        subtitle:
          contactsCount === 0
            ? 'Doctors & emergency'
            : `${contactsCount} saved contact${contactsCount === 1 ? '' : 's'}`,
      },
      {
        key: 'scans' as const,
        icon: 'upload',
        color: '#8A97AB',
        title: 'Scans and uploads',
        subtitle:
          uploadedFilesCount > 0
            ? `${uploadedFilesCount} file${uploadedFilesCount === 1 ? '' : 's'} attached`
            : 'Documents & photos',
      },
    ],
    [
      assetsCount,
      contactsCount,
      docCount,
      docExpiringCount,
      insuranceCount,
      uploadedFilesCount,
      utilitiesCount,
      warrantiesCount,
    ]
  );

  const recentItems = home?.recent || [];
  const searchResults = searchQuery.trim() ? vaultState.items : [];

  const handleSearchToggle = () => {
    if (onSearch) {
      onSearch();
    }
    setSearchOpen((prev) => {
      if (prev) {
        setSearchQuery('');
      }
      return !prev;
    });
  };

  const handleAddPress = () => {
    if (onAddToVault) {
      onAddToVault();
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
        <Text style={styles.headerTitle}>Family Vault</Text>
        <TouchableOpacity
          style={[styles.circleBtn, searchOpen && styles.circleBtnActive]}
          onPress={handleSearchToggle}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Search vault"
        >
          <Feather name={searchOpen ? 'x' : 'search'} size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isInitialLoading ? (
        <VaultHomeSkeleton />
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
          {searchOpen && (
            <View style={styles.searchWrap}>
              <View style={styles.searchBar}>
                <Feather
                  name="search"
                  size={17}
                  color="#8A97AB"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search policies, docs, assets, contacts..."
                  placeholderTextColor="#7A89A0"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                  >
                    <Feather name="x-circle" size={16} color="#8A97AB" />
                  </TouchableOpacity>
                )}
              </View>

              {searchQuery.trim().length > 0 && (
                <View style={styles.searchResultsCard}>
                  {vaultState.loadingItems ? (
                    <View style={styles.searchStateRow}>
                      <ActivityIndicator size="small" color="#F0923A" />
                      <Text style={styles.searchStateText}>Searching vault...</Text>
                    </View>
                  ) : searchResults.length === 0 ? (
                    <View style={styles.searchStateRow}>
                      <Feather name="inbox" size={16} color="#8A97AB" />
                      <Text style={styles.searchStateText}>
                        No matching items for "{searchQuery.trim()}"
                      </Text>
                    </View>
                  ) : (
                    searchResults.map((item, idx) => {
                      const vis = getCategoryVisual(item.category);
                      return (
                        <React.Fragment key={item.id}>
                          {idx > 0 && <View style={styles.divider} />}
                          <TouchableOpacity
                            style={styles.recentRow}
                            activeOpacity={0.75}
                            onPress={() => onSelectItem?.(item)}
                          >
                            <View style={[styles.iconBox, { borderColor: vis.color, marginBottom: 0 }]}>
                              <Feather name={vis.icon as any} size={18} color={vis.color} />
                            </View>
                            <View style={styles.recentInfo}>
                              <Text style={styles.recentTitle} numberOfLines={1}>
                                {item.title}
                              </Text>
                              <Text style={styles.recentSubtitle} numberOfLines={1}>
                                {[
                                  formatCategoryDisplayName(item.category),
                                  item.provider,
                                  item.dueOn ? `Due ${formatVaultShortDate(item.dueOn)}` : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </Text>
                            </View>
                            <Feather name="chevron-right" size={18} color="#8A97AB" />
                          </TouchableOpacity>
                        </React.Fragment>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          )}

          {urgentItem && (
            <View style={styles.alertBanner}>
              <Feather name="alert-triangle" size={18} color="#F7C08E" />
              <Text style={styles.alertText} numberOfLines={1}>
                {urgentBannerText}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  onViewAlert
                    ? onViewAlert(urgentItem)
                    : onSelectItem?.(urgentItem)
                }
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="View"
              >
                <Text style={styles.alertAction}>View</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.grid}>
            {categoryCards.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.gridCard, cat.row1 && styles.row1Card]}
                activeOpacity={0.78}
                onPress={() => onNavigateToCategory?.(cat.key)}
                accessibilityRole="button"
                accessibilityLabel={cat.title.replace('\n', ' ')}
              >
                <View style={[styles.iconBox, { borderColor: cat.color }]}>
                  <Feather name={cat.icon as any} size={20} color={cat.color} />
                </View>
                <Text style={styles.cardTitle}>{cat.title}</Text>
                <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionHeading}>RECENTLY ADDED</Text>
          {recentItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="lock" size={22} color="#5B9BF1" />
              <Text style={styles.emptyTitle}>Your Family Vault is ready</Text>
              <Text style={styles.emptySubtitle}>
                Store insurance policies, household bills, home assets, documents, and emergency contacts securely.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={handleAddPress}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyBtnText}>Add first item</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.recentCard}>
              {recentItems.map((item, idx) => {
                const vis = getCategoryVisual(item.category);
                const sub = [
                  item.provider || formatCategoryDisplayName(item.category),
                  item.dueOn
                    ? `Due ${formatVaultShortDate(item.dueOn)}`
                    : item.createdAt
                    ? formatVaultShortDate(item.createdAt)
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <React.Fragment key={item.id}>
                    {idx > 0 && <View style={styles.divider} />}
                    <TouchableOpacity
                      style={styles.recentRow}
                      activeOpacity={0.75}
                      onPress={() => onSelectItem?.(item)}
                      accessibilityRole="button"
                    >
                      <View
                        style={[
                          styles.iconBox,
                          { borderColor: vis.color, marginBottom: 0 },
                        ]}
                      >
                        <Feather
                          name={vis.icon as any}
                          size={20}
                          color={vis.color}
                        />
                      </View>
                      <View style={styles.recentInfo}>
                        <Text style={styles.recentTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.recentSubtitle} numberOfLines={1}>
                          {sub}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={18} color="#8A97AB" />
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
          accessibilityLabel="Add to Vault"
        >
          <Feather
            name="plus"
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.addButtonText}>Add to Vault</Text>
        </TouchableOpacity>
      </View>

      <AddEditVaultItemModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSaved={() => {
          dispatch(fetchVaultHomeThunk(30));
        }}
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
  circleBtnActive: {
    backgroundColor: '#122440',
    borderColor: '#F0923A',
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
  searchWrap: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 23,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#3A4555',
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  searchResultsCard: {
    marginTop: 10,
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  searchStateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchStateText: {
    fontSize: 13.5,
    color: '#8A97AB',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2236',
    borderWidth: 1,
    borderColor: '#6E4924',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 16,
  },
  alertText: {
    flex: 1,
    color: '#F7C08E',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    marginHorizontal: 10,
  },
  alertAction: {
    color: '#F7C08E',
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  gridCard: {
    width: '48.2%',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    minHeight: 126,
  },
  row1Card: {
    minHeight: 146,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    lineHeight: 17,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 12,
  },
  recentCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  recentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  recentTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  recentSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  emptyCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 22,
    alignItems: 'center',
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
    marginBottom: 14,
  },
  emptyBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0923A',
  },
  emptyBtnText: {
    fontSize: 13.5,
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

export default FamilyVaultScreen;
