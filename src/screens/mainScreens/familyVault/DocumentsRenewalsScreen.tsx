import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { getMyFamilyBasicThunk } from '../../../redux/features/family/familySlice';
import {
  fetchVaultItemsThunk,
  fetchVaultLifeProfileDocsThunk,
} from '../../../redux/features/vault/vaultSlice';
import {
  VaultItemApi,
  VaultLifeProfileDocSummary,
  VaultLifeProfileDocsResponse,
} from '../../../services/vaultServices';
import { VaultListSkeleton } from '../../../components/SkeletonLoader';
import AddEditVaultItemModal from './AddEditVaultItemModal';
import VaultDialog, {
  INITIAL_VAULT_DIALOG_STATE,
  VaultDialogState,
} from './VaultDialog';
import {
  extractVaultMembersFromFamilyState,
  formatDaysRemainingBadge,
  formatLifeProfileDocGroupLabel,
  formatVaultShortDate,
  getDaysRemaining,
  isJestTestEnv,
  maskSecretNumber,
  scheduleVaultAfterTransition,
} from './vaultApiHelpers';

export interface DocumentsRenewalsScreenProps {
  onBack: () => void;
  onSelectDoc?: (item: VaultItemApi) => void;
  onAddDocument?: () => void;
  lifeProfileDocsOverride?: VaultLifeProfileDocsResponse;
  identityItemsOverride?: VaultItemApi[];
}

const getDocIcon = (type?: string | null): string => {
  switch (String(type || '').toUpperCase()) {
    case 'PASSPORT':
      return 'globe';
    case 'AADHAAR':
      return 'credit-card';
    case 'PAN':
      return 'file-text';
    case 'DRIVING_LICENSE':
    case 'DRIVING':
      return 'truck';
    case 'PROPERTY_PAPERS':
      return 'home';
    default:
      return 'file-text';
  }
};

export const DocumentsRenewalsScreen: React.FC<DocumentsRenewalsScreenProps> = ({
  onBack,
  onSelectDoc,
  onAddDocument,
  lifeProfileDocsOverride,
  identityItemsOverride,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const vaultState = useAppSelector((state) => state.vault);
  const familyState = useAppSelector((state) => state.family);

  const [selectedMemberId, setSelectedMemberId] = useState<string>('ALL');
  const [expandedGroupType, setExpandedGroupType] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [dialog, setDialog] = useState<VaultDialogState>(INITIAL_VAULT_DIALOG_STATE);

  const familyMembers = useMemo(
    () => extractVaultMembersFromFamilyState(familyState),
    [familyState]
  );

  const loadData = useCallback(async () => {
    await Promise.all([
      dispatch(fetchVaultLifeProfileDocsThunk()),
      dispatch(fetchVaultItemsThunk({ category: 'IDENTITY' })),
    ]);
  }, [dispatch]);

  useEffect(() => {
    if (
      lifeProfileDocsOverride ||
      identityItemsOverride ||
      (isJestTestEnv() && vaultState.hasLoadedLifeProfileDocs && vaultState.hasLoadedItems)
    ) {
      return;
    }
    const cancel = scheduleVaultAfterTransition(() => {
      loadData();
      if (familyMembers.length === 0 && !isJestTestEnv()) {
        dispatch(getMyFamilyBasicThunk());
      }
    });
    return cancel;
  }, [
    dispatch,
    familyMembers.length,
    identityItemsOverride,
    lifeProfileDocsOverride,
    loadData,
    vaultState.hasLoadedItems,
    vaultState.hasLoadedLifeProfileDocs,
  ]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const lifeProfileData = lifeProfileDocsOverride || vaultState.lifeProfileDocs;
  const identityItems = useMemo(() => {
    if (identityItemsOverride) return identityItemsOverride;
    return vaultState.items.filter(
      (i) => String(i.category).toUpperCase() === 'IDENTITY'
    );
  }, [identityItemsOverride, vaultState.items]);

  const isInitialLoading =
    !lifeProfileDocsOverride &&
    !identityItemsOverride &&
    ((!vaultState.hasLoadedLifeProfileDocs && vaultState.loadingLifeProfileDocs) ||
      (!vaultState.hasLoadedItems && vaultState.loadingItems));

  const memberFilterChips = useMemo(() => {
    const chips: Array<{ id: string; label: string }> = [
      { id: 'ALL', label: 'All' },
    ];
    if (familyMembers.length > 0) {
      familyMembers.forEach((m) =>
        chips.push({ id: m.id, label: m.firstName })
      );
      return chips;
    }
    const seen = new Set<string>();
    (lifeProfileData?.documents || []).forEach((d) => {
      const mId = d.memberId || d.memberName || d.ownerName;
      const mLabel = (d.memberName || d.ownerName || '').split(/\s+/)[0];
      if (mId && mLabel && !seen.has(mId)) {
        seen.add(mId);
        chips.push({ id: mId, label: mLabel });
      }
    });
    return chips;
  }, [familyMembers, lifeProfileData?.documents]);

  const filteredLifeProfileDocs = useMemo(() => {
    const allDocs = lifeProfileData?.documents || [];
    if (selectedMemberId === 'ALL') return allDocs;
    return allDocs.filter(
      (d) =>
        d.memberId === selectedMemberId ||
        d.memberName === selectedMemberId ||
        d.ownerName === selectedMemberId
    );
  }, [lifeProfileData?.documents, selectedMemberId]);

  const filteredIdentityItems = useMemo(() => {
    if (selectedMemberId === 'ALL') return identityItems;
    return identityItems.filter(
      (item) =>
        (item.memberId || item.member?.id) === selectedMemberId ||
        (item.addedByMemberId || item.addedBy?.id) === selectedMemberId ||
        (item.coveredMemberIds &&
          item.coveredMemberIds.includes(selectedMemberId))
    );
  }, [identityItems, selectedMemberId]);

  const renewingItems = useMemo(() => {
    const result: Array<
      | { kind: 'vault'; item: VaultItemApi; badgeText: string; days: number }
      | {
          kind: 'lifeProfile';
          doc: VaultLifeProfileDocSummary;
          badgeText: string;
          days: number;
        }
    > = [];

    filteredLifeProfileDocs.forEach((doc) => {
      const days =
        typeof doc.daysRemaining === 'number'
          ? doc.daysRemaining
          : doc.expiresOn
          ? getDaysRemaining({ dueOn: doc.expiresOn })
          : null;
      if (doc.isExpired || (days !== null && days <= 90)) {
        const safeDays = days ?? 0;
        const badge =
          safeDays < 0
            ? `Expired ${Math.abs(safeDays)}d ago`
            : safeDays === 0
            ? 'Expires today'
            : `${safeDays} days`;
        result.push({
          kind: 'lifeProfile',
          doc,
          badgeText: badge,
          days: safeDays,
        });
      }
    });

    filteredIdentityItems.forEach((item) => {
      const days = getDaysRemaining(item);
      if (days !== null && days <= 90) {
        const badge = formatDaysRemainingBadge(days, item.dueLabel);
        result.push({
          kind: 'vault',
          item,
          badgeText: badge?.text || `${days} days`,
          days,
        });
      }
    });

    return result.sort((a, b) => a.days - b.days);
  }, [filteredIdentityItems, filteredLifeProfileDocs]);

  const groupedLifeProfileDocs = useMemo(() => {
    const map = new Map<
      string,
      { type: string; label: string; docs: VaultLifeProfileDocSummary[] }
    >();

    (lifeProfileData?.groups || []).forEach((g) => {
      if (selectedMemberId === 'ALL') {
        map.set(g.type, {
          type: g.type,
          label: g.label || formatLifeProfileDocGroupLabel(g.type),
          docs: [],
        });
      }
    });

    filteredLifeProfileDocs.forEach((doc) => {
      const key = String(doc.type || 'OTHER').toUpperCase();
      const existing = map.get(key) || {
        type: key,
        label: formatLifeProfileDocGroupLabel(key),
        docs: [],
      };
      existing.docs.push(doc);
      map.set(key, existing);
    });

    return Array.from(map.values()).filter((g) => g.docs.length > 0);
  }, [filteredLifeProfileDocs, lifeProfileData?.groups, selectedMemberId]);

  const handleOpenLifeProfileDoc = (doc: VaultLifeProfileDocSummary) => {
    const owner = doc.memberName || doc.ownerName || 'Family member';
    const expiry = doc.expiresOn
      ? `Expires: ${formatVaultShortDate(doc.expiresOn)}`
      : 'No expiry date';
    const num = doc.number ? `Number: ${maskSecretNumber(doc.number)}` : '';
    const desc = [
      `${formatLifeProfileDocGroupLabel(doc.type)} · ${owner}`,
      num,
      expiry,
      'Stored in Life Profile Documents.',
    ]
      .filter(Boolean)
      .join('\n');

    setDialog({
      visible: true,
      type: doc.isExpired ? 'danger' : 'warning',
      iconName: getDocIcon(doc.type),
      title: doc.title || formatLifeProfileDocGroupLabel(doc.type),
      description: desc,
      primaryButtonText: doc.fileUrl ? 'Open file' : 'OK',
      secondaryButtonText: doc.fileUrl ? 'Close' : '',
      onConfirm: doc.fileUrl
        ? () => {
            setDialog(INITIAL_VAULT_DIALOG_STATE);
            Linking.openURL(doc.fileUrl!).catch(() => {});
          }
        : undefined,
    });
  };

  const handleAddPress = () => {
    if (onAddDocument) {
      onAddDocument();
      return;
    }
    setAddModalVisible(true);
  };

  const totalFamilyDocs =
    filteredLifeProfileDocs.length + filteredIdentityItems.length;

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
        <Text style={styles.headerTitle}>Documents & renewals</Text>
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContainer}
          >
            {memberFilterChips.map((chip) => {
              const active = chip.id === selectedMemberId;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  activeOpacity={0.75}
                  onPress={() => setSelectedMemberId(chip.id)}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {renewingItems.length > 0 && (
            <>
              <Text style={styles.sectionHeading}>RENEWING SOON</Text>
              <View style={styles.card}>
                {renewingItems.map((entry, idx) => {
                  const key =
                    entry.kind === 'vault'
                      ? `v-${entry.item.id}`
                      : `lp-${entry.doc.id}`;
                  const title =
                    entry.kind === 'vault'
                      ? entry.item.title
                      : entry.doc.title ||
                        `${
                          entry.doc.memberName || entry.doc.ownerName || ''
                        }'s ${formatLifeProfileDocGroupLabel(entry.doc.type)}`;
                  const subtitle =
                    entry.kind === 'vault'
                      ? [
                          entry.item.memberName || entry.item.provider,
                          entry.item.dueOn
                            ? `Due ${formatVaultShortDate(entry.item.dueOn)}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')
                      : [
                          entry.doc.memberName || entry.doc.ownerName,
                          entry.doc.expiresOn
                            ? `Expires ${formatVaultShortDate(
                                entry.doc.expiresOn
                              )}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ');

                  return (
                    <React.Fragment key={key}>
                      {idx > 0 && <View style={styles.divider} />}
                      <TouchableOpacity
                        style={styles.row}
                        activeOpacity={0.75}
                        onPress={() =>
                          entry.kind === 'vault'
                            ? onSelectDoc?.(entry.item)
                            : handleOpenLifeProfileDoc(entry.doc)
                        }
                        accessibilityRole="button"
                      >
                        <View
                          style={[
                            styles.iconBox,
                            { borderColor: '#F7C08E' },
                          ]}
                        >
                          <Feather
                            name={
                              getDocIcon(
                                entry.kind === 'vault'
                                  ? entry.item.kind
                                  : entry.doc.type
                              ) as any
                            }
                            size={18}
                            color="#F7C08E"
                          />
                        </View>
                        <View style={styles.rowInfo}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {title}
                          </Text>
                          <Text style={styles.rowSubtitle} numberOfLines={1}>
                            {subtitle}
                          </Text>
                        </View>
                        <View style={styles.renewBadge}>
                          <Text style={styles.renewBadgeText}>
                            {entry.badgeText}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>
            </>
          )}

          <Text style={styles.sectionHeading}>ALL DOCUMENTS</Text>
          {totalFamilyDocs === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="file-text" size={22} color="#5B9BF1" />
              <Text style={styles.emptyTitle}>No documents found</Text>
              <Text style={styles.emptySubtitle}>
                Add passports, Aadhaar, PAN, property papers, or tax records to track renewals here.
              </Text>
            </View>
          ) : (
            <>
              {groupedLifeProfileDocs.length > 0 && (
                <View style={styles.card}>
                  {groupedLifeProfileDocs.map((group, idx) => {
                    const expanded = expandedGroupType === group.type;
                    const names = Array.from(
                      new Set(
                        group.docs
                          .map((d) =>
                            (d.memberName || d.ownerName || 'Member').split(
                              /\s+/
                            )[0]
                          )
                          .filter(Boolean)
                      )
                    ).join(', ');
                    return (
                      <React.Fragment key={group.type}>
                        {idx > 0 && <View style={styles.divider} />}
                        <TouchableOpacity
                          style={styles.row}
                          activeOpacity={0.75}
                          onPress={() =>
                            setExpandedGroupType(expanded ? null : group.type)
                          }
                          accessibilityRole="button"
                        >
                          <View
                            style={[styles.iconBox, { borderColor: '#5B9BF1' }]}
                          >
                            <Feather
                              name={getDocIcon(group.type) as any}
                              size={18}
                              color="#5B9BF1"
                            />
                          </View>
                          <View style={styles.rowInfo}>
                            <Text style={styles.rowTitle}>
                              {group.label} ({group.docs.length})
                            </Text>
                            <Text style={styles.rowSubtitle} numberOfLines={1}>
                              {names || 'Life Profile documents'}
                            </Text>
                          </View>
                          <Feather
                            name={expanded ? 'chevron-down' : 'chevron-right'}
                            size={18}
                            color="#8A97AB"
                          />
                        </TouchableOpacity>
                        {expanded &&
                          group.docs.map((doc) => (
                            <TouchableOpacity
                              key={doc.id}
                              style={styles.subDocRow}
                              activeOpacity={0.75}
                              onPress={() => handleOpenLifeProfileDoc(doc)}
                            >
                              <View style={styles.rowInfo}>
                                <Text style={styles.subDocTitle}>
                                  {doc.title ||
                                    `${
                                      doc.memberName || doc.ownerName || 'Member'
                                    } · ${doc.type}`}
                                </Text>
                                <Text style={styles.rowSubtitle}>
                                  {[
                                    doc.memberName || doc.ownerName,
                                    doc.number
                                      ? maskSecretNumber(doc.number)
                                      : null,
                                    doc.expiresOn
                                      ? `Exp ${formatVaultShortDate(
                                          doc.expiresOn
                                        )}`
                                      : null,
                                  ]
                                    .filter(Boolean)
                                    .join(' · ')}
                                </Text>
                              </View>
                              <Feather
                                name={doc.fileUrl ? 'external-link' : 'info'}
                                size={15}
                                color="#8A97AB"
                              />
                            </TouchableOpacity>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </View>
              )}

              {filteredIdentityItems.length > 0 && (
                <View style={styles.card}>
                  {filteredIdentityItems.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      {idx > 0 && <View style={styles.divider} />}
                      <TouchableOpacity
                        style={styles.row}
                        activeOpacity={0.75}
                        onPress={() => onSelectDoc?.(item)}
                        accessibilityRole="button"
                      >
                        <View
                          style={[styles.iconBox, { borderColor: '#6FD9A6' }]}
                        >
                          <Feather
                            name={getDocIcon(item.kind) as any}
                            size={18}
                            color="#6FD9A6"
                          />
                        </View>
                        <View style={styles.rowInfo}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.rowSubtitle} numberOfLines={1}>
                            {[
                              item.provider || item.kind || 'Document',
                              item.number ? maskSecretNumber(item.number) : null,
                              item.dueOn
                                ? `Valid till ${formatVaultShortDate(
                                    item.dueOn
                                  )}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </Text>
                        </View>
                        <Feather
                          name="chevron-right"
                          size={18}
                          color="#8A97AB"
                        />
                      </TouchableOpacity>
                    </React.Fragment>
                  ))}
                </View>
              )}
            </>
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
          accessibilityLabel="Add document"
        >
          <Feather
            name="plus"
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.addButtonText}>Add document</Text>
        </TouchableOpacity>
      </View>

      <AddEditVaultItemModal
        visible={addModalVisible}
        initialCategory="IDENTITY"
        onClose={() => setAddModalVisible(false)}
        onSaved={loadData}
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
  chipsScroll: {
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#223859',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#F0923A',
    borderColor: '#F0923A',
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#C8D1DC',
  },
  filterChipTextActive: {
    color: '#0B1A2F',
    fontFamily: 'Roboto-Bold',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  subDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingLeft: 58,
    paddingVertical: 11,
    backgroundColor: '#0F1E36',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
  },
  subDocTitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#E7EDF6',
    marginBottom: 2,
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
  renewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F7C08E',
  },
  renewBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F7C08E',
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

export default DocumentsRenewalsScreen;
