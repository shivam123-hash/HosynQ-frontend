import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Linking,
  Share,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { getMyFamilyBasicThunk } from '../../../redux/features/family/familySlice';
import {
  deleteVaultItemThunk,
  fetchVaultItemDetailThunk,
  setSelectedVaultItemLocal,
  updateVaultItemThunk,
} from '../../../redux/features/vault/vaultSlice';
import { isUUID } from '../../../redux/features/lists/listsSlice';
import { VaultItemApi } from '../../../services/vaultServices';
import { VaultDetailSkeleton } from '../../../components/SkeletonLoader';
import AppOptionsMenu from '../common/AppOptionsMenu';
import AddEditVaultItemModal from './AddEditVaultItemModal';
import VaultDialog, {
  INITIAL_VAULT_DIALOG_STATE,
  VaultDialogState,
} from './VaultDialog';
import {
  calculateNextDueDate,
  canDeleteVaultItem,
  canEditVaultItem,
  formatCategoryDisplayName,
  formatDaysRemainingBadge,
  formatInrAmount,
  formatVaultShortDate,
  formatVisibilityLabel,
  getCurrentVaultUserContext,
  getDaysRemaining,
  isJestTestEnv,
  maskSecretNumber,
  scheduleVaultAfterTransition,
} from './vaultApiHelpers';

export interface VaultItemDetailScreenProps {
  item?: VaultItemApi | any;
  itemId?: string;
  route?: any;
  onBack?: () => void;
  onSelectItem?: (item: VaultItemApi) => void;
  onDeleted?: (deletedId: string) => void;
  onMenu?: () => void;
  onViewDocument?: () => void;
  onShare?: () => void;
  onRenewNow?: () => void;
  onOpenReminders?: () => void;
  onOpenPermissions?: () => void;
}

export const VaultItemDetailScreen: React.FC<VaultItemDetailScreenProps> = ({
  item: itemProp,
  itemId: itemIdProp,
  route,
  onBack,
  onSelectItem,
  onDeleted,
  onMenu,
  onViewDocument,
  onShare,
  onRenewNow,
  onOpenReminders,
  onOpenPermissions,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const vaultState = useAppSelector((state) => state.vault);
  const familyState = useAppSelector((state) => state.family);
  const currentUserCtx = useMemo(
    () => getCurrentVaultUserContext(familyState),
    [familyState]
  );

  const initialItem: VaultItemApi | null =
    itemProp || route?.params?.item || null;
  const resolvedId =
    itemIdProp || initialItem?.id || route?.params?.itemId || '';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [revealNumber, setRevealNumber] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [renewMode, setRenewMode] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [dialog, setDialog] = useState<VaultDialogState>(INITIAL_VAULT_DIALOG_STATE);

  const loadDetail = useCallback(async () => {
    if (!resolvedId || !isUUID(resolvedId)) return;
    await dispatch(fetchVaultItemDetailThunk(resolvedId));
  }, [dispatch, resolvedId]);

  useEffect(() => {
    if (initialItem) {
      dispatch(setSelectedVaultItemLocal(initialItem));
    }
    if (resolvedId && isUUID(resolvedId) && !(isJestTestEnv() && initialItem)) {
      return scheduleVaultAfterTransition(() => {
        loadDetail();
        if (!currentUserCtx.memberId && !currentUserCtx.role && !isJestTestEnv()) {
          dispatch(getMyFamilyBasicThunk());
        }
      });
    }
    return () => {};
  }, [
    currentUserCtx.memberId,
    currentUserCtx.role,
    dispatch,
    initialItem,
    loadDetail,
    resolvedId,
  ]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDetail();
    } finally {
      setRefreshing(false);
    }
  }, [loadDetail]);

  const displayItem: VaultItemApi | null = useMemo(() => {
    if (
      vaultState.selectedItem &&
      (!resolvedId || vaultState.selectedItem.id === resolvedId)
    ) {
      return vaultState.selectedItem;
    }
    return initialItem;
  }, [initialItem, resolvedId, vaultState.selectedItem]);

  const isInitialLoading =
    !displayItem && Boolean(resolvedId) && vaultState.loadingDetail;

  const displayTitle =
    displayItem?.title || formatCategoryDisplayName(displayItem?.category) || 'Vault item';

  const days = getDaysRemaining(displayItem);
  const dueBadge = formatDaysRemainingBadge(days, displayItem?.dueLabel);
  const isWarningDue = Boolean(dueBadge?.isUrgent);
  const userCanEdit = canEditVaultItem(displayItem, familyState);
  const userCanDelete = canDeleteVaultItem(displayItem, familyState);

  const handleMenuPress = () => {
    if (onMenu) {
      onMenu();
    } else {
      setIsMenuOpen((prev) => !prev);
    }
  };

  const isPdfUrlOrName = (url?: string | null, name?: string | null, fmt?: string | null) =>
    Boolean(
      fmt?.toLowerCase() === 'pdf' ||
        (name && /\.pdf$/i.test(name)) ||
        (url && /\.pdf(\?|$)/i.test(url))
    );

  const openAttachedResource = async (
    url?: string | null,
    label?: string,
    fileName?: string | null,
    fileFormat?: string | null
  ) => {
    if (!url) {
      setDialog({
        visible: true,
        type: 'warning',
        iconName: 'upload',
        title: 'File preview unavailable',
        description: 'Pull down to refresh or tap Edit to re-attach this document.',
        primaryButtonText: 'OK',
      });
      return;
    }

    if (!isPdfUrlOrName(url, fileName, fileFormat)) {
      setPreviewImage({ url, title: label || displayTitle });
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      setDialog({
        visible: true,
        type: 'warning',
        iconName: 'file-text',
        title: 'Cannot open document',
        description: 'The attached document link could not be opened on this device.',
        primaryButtonText: 'OK',
      });
    }
  };

  const handleViewDocument = async () => {
    if (onViewDocument) {
      onViewDocument();
      return;
    }
    if (displayItem?.fileUrl) {
      await openAttachedResource(
        displayItem.fileUrl,
        displayItem.fileName || displayTitle,
        displayItem.fileName,
        displayItem.fileFormat
      );
    } else if (displayItem?.backFileUrl) {
      await openAttachedResource(
        displayItem.backFileUrl,
        displayItem.backFileName || `${displayTitle} (Back side)`,
        displayItem.backFileName
      );
    } else {
      setDialog({
        visible: true,
        type: 'warning',
        iconName: 'upload',
        title: 'No file attached yet',
        description: 'Tap Edit to scan or attach a front/back document photo.',
        primaryButtonText: 'OK',
      });
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }
    if (!displayItem) return;
    const summaryLines = [
      displayItem.title,
      displayItem.provider ? `Provider: ${displayItem.provider}` : null,
      displayItem.number ? `Reference: ${displayItem.number}` : null,
      displayItem.dueOn
        ? `Due / Valid till: ${formatVaultShortDate(displayItem.dueOn)}`
        : null,
      displayItem.phone ? `Phone: ${displayItem.phone}` : null,
      displayItem.fileUrl ? `Document: ${displayItem.fileUrl}` : null,
    ].filter(Boolean);

    try {
      await Share.share({
        title: displayItem.title,
        message: summaryLines.join('\n'),
      });
    } catch {
      // cancelled
    }
  };

  const handleDeleteConfirm = () => {
    if (!displayItem || !isUUID(displayItem.id)) return;
    setDialog({
      visible: true,
      type: 'danger',
      iconName: 'trash-2',
      title: `Remove ${displayItem.title}?`,
      description: 'This removes the item and its reminders from your Family Vault.',
      primaryButtonText: 'Remove',
      secondaryButtonText: 'Cancel',
      onConfirm: async () => {
        setDialog((prev) => ({ ...prev, loading: true }));
        try {
          await dispatch(deleteVaultItemThunk(displayItem.id)).unwrap();
          setDialog(INITIAL_VAULT_DIALOG_STATE);
          onDeleted?.(displayItem.id);
          onBack?.();
        } catch (err: any) {
          setDialog({
            visible: true,
            type: 'danger',
            iconName: 'alert-circle',
            title: 'Delete failed',
            description: String(err || 'Could not remove this item.'),
            primaryButtonText: 'OK',
          });
        }
      },
    });
  };

  const handlePrimaryAction = async () => {
    if (onRenewNow) {
      onRenewNow();
      return;
    }
    if (!displayItem) return;

    const cat = String(displayItem.category || '').toUpperCase();
    if (cat === 'UTILITIES' && isUUID(displayItem.id)) {
      const today = new Date().toISOString().slice(0, 10);
      const nextDue = calculateNextDueDate(
        displayItem.dueOn,
        displayItem.repeatMonths
      );
      setDialog({
        visible: true,
        type: 'warning',
        iconName: 'check-circle',
        title: `Mark ${displayItem.title} paid?`,
        description: `Sets paid date to today and rolls due date to ${formatVaultShortDate(
          nextDue
        )}.`,
        primaryButtonText: 'Mark paid',
        secondaryButtonText: 'Cancel',
        onConfirm: async () => {
          setDialog((prev) => ({ ...prev, loading: true }));
          try {
            await dispatch(
              updateVaultItemThunk({
                id: displayItem.id,
                payload: { paidOn: today, dueOn: nextDue },
              })
            ).unwrap();
            setDialog(INITIAL_VAULT_DIALOG_STATE);
          } catch (err: any) {
            setDialog({
              visible: true,
              type: 'danger',
              iconName: 'alert-circle',
              title: 'Update failed',
              description: String(err || 'Could not mark bill paid.'),
              primaryButtonText: 'OK',
            });
          }
        },
      });
      return;
    }

    if (cat === 'INSURANCE' || cat === 'IDENTITY' || cat === 'WARRANTY') {
      setRenewMode(true);
      setEditModalVisible(true);
      return;
    }

    setRenewMode(false);
    setEditModalVisible(true);
  };

  const primaryBtnLabel = useMemo(() => {
    const cat = String(displayItem?.category || '').toUpperCase();
    if (cat === 'UTILITIES') return 'Mark paid';
    if (cat === 'INSURANCE' || cat === 'IDENTITY' || cat === 'WARRANTY') {
      return 'Renew now';
    }
    return 'Edit details';
  }, [displayItem?.category]);

  const reminderSummary = useMemo(() => {
    const daysArr = displayItem?.reminderLeadDays || [];
    if (daysArr.length === 0) return 'Reminders off';
    return daysArr.map((d) => `${d}d`).join(' & ') + ' before due date';
  }, [displayItem?.reminderLeadDays]);

  const holderName =
    displayItem?.member?.fullName ||
    displayItem?.memberName ||
    displayItem?.addedBy?.fullName ||
    displayItem?.addedByName ||
    (displayItem?.coveredMembers && displayItem.coveredMembers[0]?.fullName) ||
    'Family member';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayTitle}
        </Text>

        <TouchableOpacity
          onPress={handleMenuPress}
          activeOpacity={0.7}
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <Feather name="more-horizontal" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <AppOptionsMenu
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        topOffset={insets.top + 60}
        items={[
          ...(userCanEdit
            ? [
                {
                  id: 'edit',
                  label: 'Edit Details',
                  iconName: 'edit-2',
                  onPress: () => {
                    setRenewMode(false);
                    setEditModalVisible(true);
                  },
                },
              ]
            : []),
          {
            id: 'share',
            label: 'Share Document',
            iconName: 'share-2',
            onPress: handleShare,
          },
          {
            id: 'view',
            label: 'View Document',
            iconName: 'file-text',
            onPress: handleViewDocument,
          },
          ...(userCanDelete
            ? [
                {
                  id: 'delete',
                  label: 'Remove from Vault',
                  iconName: 'trash-2' as const,
                  destructive: true,
                  onPress: handleDeleteConfirm,
                },
              ]
            : []),
        ]}
      />

      {isInitialLoading ? (
        <VaultDetailSkeleton />
      ) : !displayItem ? (
        <View style={styles.emptyWrap}>
          <Feather name="alert-circle" size={28} color="#8A97AB" />
          <Text style={styles.emptyTitle}>Vault item not found</Text>
          <TouchableOpacity style={styles.emptyBackBtn} onPress={onBack}>
            <Text style={styles.emptyBackBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 110 + insets.bottom },
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
          {(displayItem.hasFile || displayItem.fileUrl || displayItem.fileName) && (
            <TouchableOpacity
              style={styles.docCard}
              activeOpacity={0.8}
              onPress={handleViewDocument}
              accessibilityRole="button"
            >
              {displayItem.fileUrl &&
              !isPdfUrlOrName(
                displayItem.fileUrl,
                displayItem.fileName,
                displayItem.fileFormat
              ) ? (
                <Image
                  source={{ uri: displayItem.fileUrl }}
                  style={styles.docThumbImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.docThumbnail}>
                  <View style={styles.docThumbLine} />
                  <View style={[styles.docThumbLine, { width: '75%' }]} />
                  <View style={[styles.docThumbLine, { width: '55%' }]} />
                  <View style={[styles.docThumbLine, { width: '80%' }]} />
                </View>
              )}
              <View style={styles.docInfo}>
                <Text style={styles.docTitle} numberOfLines={1}>
                  {displayItem.fileName ||
                    `${displayItem.title}${
                      displayItem.fileFormat
                        ? `.${displayItem.fileFormat.toLowerCase()}`
                        : ''
                    }`}
                </Text>
                <Text style={styles.docSubtitle}>
                  {[
                    displayItem.fileFormat?.toUpperCase() ||
                      (displayItem.backFileUrl || displayItem.backFileName
                        ? 'FRONT FILE'
                        : 'DOCUMENT'),
                    displayItem.filePages
                      ? `${displayItem.filePages} page${
                          displayItem.filePages === 1 ? '' : 's'
                        }`
                      : null,
                    displayItem.fileUrl ? 'Tap to preview' : 'Attached',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
              <Feather
                name={
                  displayItem.fileUrl &&
                  !isPdfUrlOrName(
                    displayItem.fileUrl,
                    displayItem.fileName,
                    displayItem.fileFormat
                  )
                    ? 'maximize-2'
                    : 'external-link'
                }
                size={18}
                color="#8A97AB"
              />
            </TouchableOpacity>
          )}

          {Boolean(displayItem.backFileUrl || displayItem.backFileName) && (
            <TouchableOpacity
              style={styles.docCard}
              activeOpacity={0.8}
              onPress={() =>
                openAttachedResource(
                  displayItem.backFileUrl,
                  displayItem.backFileName || `${displayTitle} (Back side)`,
                  displayItem.backFileName
                )
              }
              accessibilityRole="button"
            >
              {displayItem.backFileUrl &&
              !isPdfUrlOrName(displayItem.backFileUrl, displayItem.backFileName) ? (
                <Image
                  source={{ uri: displayItem.backFileUrl }}
                  style={styles.docThumbImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.docThumbnail, { backgroundColor: '#DCE4EE' }]}>
                  <View style={styles.docThumbLine} />
                  <View style={[styles.docThumbLine, { width: '65%' }]} />
                </View>
              )}
              <View style={styles.docInfo}>
                <Text style={styles.docTitle} numberOfLines={1}>
                  {displayItem.backFileName || `${displayItem.title} (Back side)`}
                </Text>
                <Text style={styles.docSubtitle}>
                  {displayItem.backFileUrl
                    ? 'Back image · Tap to preview'
                    : 'Back image attached'}
                </Text>
              </View>
              <Feather name="maximize-2" size={18} color="#8A97AB" />
            </TouchableOpacity>
          )}

          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <Feather name="layers" size={18} color="#5B9BF1" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Category</Text>
                <Text style={styles.fieldValue}>
                  {formatCategoryDisplayName(displayItem.category)}
                  {displayItem.kind ? ` · ${displayItem.kind}` : ''}
                </Text>
              </View>
            </View>

            {Boolean(displayItem.provider || displayItem.role) && (
              <>
                <View style={styles.divider} />
                <View style={styles.fieldRow}>
                  <View style={styles.fieldIcon}>
                    <Feather name="shield" size={18} color="#F0923A" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>
                      {displayItem.role ? 'Role / Specialty' : 'Provider'}
                    </Text>
                    <Text style={styles.fieldValue}>
                      {displayItem.provider || displayItem.role}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {Boolean(displayItem.phone) && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.fieldRow}
                  activeOpacity={0.75}
                  onPress={() =>
                    Linking.openURL(
                      `tel:${String(displayItem.phone).replace(/[^+\d]/g, '')}`
                    ).catch(() => {})
                  }
                >
                  <View style={styles.fieldIcon}>
                    <Feather name="phone" size={18} color="#6FD9A6" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Phone number</Text>
                    <Text style={styles.fieldValue}>{displayItem.phone}</Text>
                  </View>
                  <Feather name="phone-call" size={16} color="#6FD9A6" />
                </TouchableOpacity>
              </>
            )}

            {Boolean(displayItem.asset) && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.fieldRow}
                  activeOpacity={0.75}
                  disabled={!onSelectItem}
                  onPress={() =>
                    displayItem.asset &&
                    onSelectItem?.({
                      id: displayItem.asset.id,
                      title: displayItem.asset.title,
                      category: 'ASSET',
                      kind: displayItem.asset.kind,
                      number: displayItem.asset.number,
                      visibility: displayItem.visibility,
                    })
                  }
                >
                  <View style={styles.fieldIcon}>
                    <Feather name="truck" size={18} color="#F0923A" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Linked asset</Text>
                    <Text style={styles.fieldValue}>
                      {[displayItem.asset?.title, displayItem.asset?.number]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  {onSelectItem && (
                    <Feather name="chevron-right" size={18} color="#8A97AB" />
                  )}
                </TouchableOpacity>
              </>
            )}

            {Boolean(displayItem.number || displayItem.numberLast4) && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.fieldRow}
                  activeOpacity={0.75}
                  onPress={() => setRevealNumber((prev) => !prev)}
                >
                  <View style={styles.fieldIcon}>
                    <Feather
                      name={revealNumber ? 'unlock' : 'lock'}
                      size={18}
                      color="#F0CA45"
                    />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>
                      Number (tap to {revealNumber ? 'hide' : 'reveal'})
                    </Text>
                    <Text style={styles.fieldValue}>
                      {revealNumber
                        ? displayItem.number ||
                          `•••• •••• ${displayItem.numberLast4}`
                        : displayItem.number
                        ? maskSecretNumber(displayItem.number)
                        : `•••• •••• ${displayItem.numberLast4}`}
                    </Text>
                  </View>
                  <Feather
                    name={revealNumber ? 'eye-off' : 'eye'}
                    size={16}
                    color="#8A97AB"
                  />
                </TouchableOpacity>
              </>
            )}

            {Boolean(displayItem.amount || displayItem.sumInsured) && (
              <>
                <View style={styles.divider} />
                <View style={styles.fieldRow}>
                  <View style={styles.fieldIcon}>
                    <Feather name="credit-card" size={18} color="#6FD9A6" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>
                      {displayItem.sumInsured
                        ? 'Coverage & Premium'
                        : 'Amount'}
                    </Text>
                    <Text style={styles.fieldValue}>
                      {[
                        displayItem.sumInsured
                          ? `${formatInrAmount(displayItem.sumInsured)} cover`
                          : null,
                        displayItem.amount
                          ? `${formatInrAmount(displayItem.amount)}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {Boolean(displayItem.dueOn) && (
              <>
                <View style={styles.divider} />
                <View
                  style={isWarningDue ? styles.alertRow : styles.fieldRow}
                >
                  <View style={styles.fieldIcon}>
                    <Feather
                      name="calendar"
                      size={18}
                      color={isWarningDue ? '#F7C08E' : '#5B9BF1'}
                    />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text
                      style={
                        isWarningDue ? styles.alertLabel : styles.fieldLabel
                      }
                    >
                      {displayItem.dueLabel || 'Valid till / Due date'}
                    </Text>
                    <Text
                      style={
                        isWarningDue ? styles.alertValue : styles.fieldValue
                      }
                    >
                      {formatVaultShortDate(displayItem.dueOn)}
                      {dueBadge ? ` (${dueBadge.text})` : ''}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {Boolean(displayItem.issuedOn) && (
              <>
                <View style={styles.divider} />
                <View style={styles.fieldRow}>
                  <View style={styles.fieldIcon}>
                    <Feather name="file" size={18} color="#8A97AB" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Issued on</Text>
                    <Text style={styles.fieldValue}>
                      {formatVaultShortDate(displayItem.issuedOn)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {Boolean(displayItem.serviceDueOn) && (
              <>
                <View style={styles.divider} />
                <View style={styles.fieldRow}>
                  <View style={styles.fieldIcon}>
                    <Feather name="tool" size={18} color="#F0923A" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Next service due</Text>
                    <Text style={styles.fieldValue}>
                      {formatVaultShortDate(displayItem.serviceDueOn)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {Boolean(displayItem.paidOn || displayItem.repeatMonths) && (
              <>
                <View style={styles.divider} />
                <View style={styles.fieldRow}>
                  <View style={styles.fieldIcon}>
                    <Feather name="repeat" size={18} color="#6FD9A6" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Payment & schedule</Text>
                    <Text style={styles.fieldValue}>
                      {[
                        displayItem.paidOn
                          ? `Last paid ${formatVaultShortDate(displayItem.paidOn)}`
                          : null,
                        displayItem.repeatMonths
                          ? `Repeats every ${displayItem.repeatMonths} mo`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.divider} />
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <Feather name="user" size={18} color="#5B9BF1" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Holder / Owner</Text>
                <View style={styles.holderRow}>
                  <View style={styles.holderAvatar}>
                    <Text style={styles.holderAvatarText}>
                      {holderName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.fieldValue}>{holderName}</Text>
                </View>
              </View>
            </View>

            {Boolean(displayItem.notes) && (
              <>
                <View style={styles.divider} />
                <View style={styles.fieldRow}>
                  <View style={styles.fieldIcon}>
                    <Feather name="align-left" size={18} color="#8A97AB" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Notes</Text>
                    <Text style={styles.fieldValue}>{displayItem.notes}</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {displayItem.linkedItems && displayItem.linkedItems.length > 0 && (
            <>
              <Text style={styles.sectionHeading}>LINKED POLICIES & RECORDS</Text>
              <View style={styles.card}>
                {displayItem.linkedItems.map((child, idx) => (
                  <React.Fragment key={child.id}>
                    {idx > 0 && <View style={styles.divider} />}
                    <TouchableOpacity
                      style={styles.optionRow}
                      activeOpacity={0.75}
                      onPress={() => onSelectItem?.(child)}
                    >
                      <View
                        style={[styles.iconBox, { borderColor: '#5B9BF1' }]}
                      >
                        <Feather name="link" size={16} color="#5B9BF1" />
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={styles.optionTitle}>{child.title}</Text>
                        <Text style={styles.optionSubtitle}>
                          {[
                            formatCategoryDisplayName(child.category),
                            child.dueOn
                              ? `Due ${formatVaultShortDate(child.dueOn)}`
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
            </>
          )}

          <View style={styles.card}>
            <View style={styles.optionRow}>
              <View style={[styles.iconBox, { borderColor: '#F0923A' }]}>
                <Feather name="bell" size={18} color="#F0923A" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Renewal reminders</Text>
                <Text style={styles.optionSubtitle}>{reminderSummary}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.optionRow}>
              <View style={[styles.iconBox, { borderColor: '#5B9BF1' }]}>
                <Feather name="users" size={18} color="#5B9BF1" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Who can see this</Text>
                <Text style={styles.optionSubtitle}>
                  {formatVisibilityLabel(displayItem.visibility)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {displayItem && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.shareBtn,
              !(userCanEdit || onRenewNow) && { marginRight: 0 },
              userCanEdit && primaryBtnLabel !== 'Edit details' && { flex: 0.9, marginRight: 8 },
            ]}
            onPress={handleShare}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Share"
          >
            <Feather
              name="share-2"
              size={17}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>

          {userCanEdit && primaryBtnLabel !== 'Edit details' && (
            <TouchableOpacity
              style={styles.editSecondaryBtn}
              onPress={() => {
                setRenewMode(false);
                setEditModalVisible(true);
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Edit"
            >
              <Feather
                name="edit-2"
                size={16}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.editSecondaryBtnText}>Edit</Text>
            </TouchableOpacity>
          )}

          {(userCanEdit || onRenewNow) && (
            <TouchableOpacity
              style={[
                styles.renewBtn,
                userCanEdit && primaryBtnLabel !== 'Edit details' && { flex: 1.25 },
              ]}
              onPress={handlePrimaryAction}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={primaryBtnLabel}
            >
              <Text style={styles.renewBtnText}>{primaryBtnLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <AddEditVaultItemModal
        visible={editModalVisible}
        itemToEdit={displayItem}
        renewMode={renewMode}
        onClose={() => setEditModalVisible(false)}
        onSaved={(saved) => {
          dispatch(setSelectedVaultItemLocal(saved));
          loadDetail();
        }}
      />

      {previewImage && (
        <View style={styles.previewOverlay}>
          <View style={[styles.previewHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => setPreviewImage(null)}
              accessibilityRole="button"
              accessibilityLabel="Close preview"
            >
              <Feather name="x" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.previewTitle} numberOfLines={1}>
              {previewImage.title}
            </Text>
            <View style={{ width: 44 }} />
          </View>
          <View style={styles.previewImageWrap}>
            <Image
              source={{ uri: previewImage.url }}
              style={styles.previewFullImage}
              resizeMode="contain"
            />
          </View>
        </View>
      )}

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
    paddingBottom: 14,
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyBackBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0923A',
  },
  emptyBackBtnText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0923A',
  },
  sectionHeading: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 16,
  },
  docThumbnail: {
    width: 44,
    height: 52,
    borderRadius: 6,
    backgroundColor: '#EBE6DE',
    padding: 8,
    justifyContent: 'space-around',
    marginRight: 14,
  },
  docThumbImage: {
    width: 48,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#0E1E36',
    marginRight: 14,
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 13, 24, 0.96)',
    zIndex: 1300,
    elevation: 30,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  previewTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  previewImageWrap: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewFullImage: {
    width: '100%',
    height: '100%',
  },
  docThumbLine: {
    height: 2.5,
    backgroundColor: '#8E877D',
    borderRadius: 1,
    width: '100%',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  docSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2418',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  alertLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 3,
  },
  alertValue: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#F7C08E',
  },
  holderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  holderAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1A3359',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  holderAvatarText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: '#5B9BF1',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  optionRow: {
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
  optionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  optionTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareBtn: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4555',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shareBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  editSecondaryBtn: {
    flex: 0.9,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4555',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  editSecondaryBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  renewBtn: {
    flex: 1.4,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  renewBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
});

export default VaultItemDetailScreen;
