import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Pressable,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import ImagePicker from 'react-native-image-crop-picker';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  clearLastVaultScan,
  createVaultItemThunk,
  fetchVaultItemsThunk,
  scanVaultDocumentThunk,
  updateVaultItemThunk,
} from '../../../redux/features/vault/vaultSlice';
import { isUUID } from '../../../redux/features/lists/listsSlice';
import {
  VaultCategory,
  VaultItemApi,
  VaultVisibility,
} from '../../../services/vaultServices';
import DueDateTimeModal from '../tasksScreen/components/DueDateTimeModal';
import VaultDialog, {
  INITIAL_VAULT_DIALOG_STATE,
  VaultDialogState,
} from './VaultDialog';
import {
  extractVaultMembersFromFamilyState,
  filterValidFamilyMemberIds,
  formatVaultDate,
  isJestTestEnv,
} from './vaultApiHelpers';
import { getMyMemberId } from '../../../units/AsyncStorageManager';

export interface AddEditVaultItemModalProps {
  visible: boolean;
  asModal?: boolean;
  onClose: () => void;
  initialCategory?: VaultCategory;
  initialKind?: string;
  itemToEdit?: VaultItemApi | null;
  renewMode?: boolean;
  onSaved?: (item: VaultItemApi) => void;
}

const CATEGORY_OPTIONS: Array<{ id: VaultCategory; label: string }> = [
  { id: 'INSURANCE', label: 'Insurance' },
  { id: 'UTILITIES', label: 'Bill' },
  { id: 'WARRANTY', label: 'Warranty' },
  { id: 'ASSET', label: 'Asset' },
  { id: 'IDENTITY', label: 'Document' },
  { id: 'FINANCE', label: 'Finance' },
  { id: 'MEDICAL', label: 'Medical' },
  { id: 'LEGAL', label: 'Legal' },
  { id: 'CONTACTS', label: 'Contact' },
];

const KIND_PRESETS: Record<string, string[]> = {
  INSURANCE: ['MOTOR', 'HEALTH', 'LIFE', 'HOME'],
  UTILITIES: ['ELECTRICITY', 'INTERNET', 'WATER', 'GAS'],
  WARRANTY: ['APPLIANCE', 'ELECTRONICS', 'VEHICLE'],
  ASSET: ['VEHICLE', 'PROPERTY', 'APPLIANCE'],
  IDENTITY: ['PASSPORT', 'AADHAAR', 'PAN', 'PROPERTY_PAPERS', 'OTHER'],
  FINANCE: ['BANK', 'LOAN', 'INVESTMENT', 'TAX'],
  MEDICAL: ['PRESCRIPTION', 'LAB_REPORT', 'VACCINATION', 'OTHER'],
  LEGAL: ['WILL', 'AGREEMENT', 'DEED', 'OTHER'],
  CONTACTS: ['DOCTOR', 'SCHOOL', 'HOME_HELP', 'EMERGENCY'],
};

const REMINDER_PRESETS: Array<{ label: string; days: number[] }> = [
  { label: '30d & 7d', days: [30, 7] },
  { label: '7d & 1d', days: [7, 1] },
  { label: '3d & 1d', days: [3, 1] },
  { label: 'Off', days: [] },
];

const VISIBILITY_OPTIONS: Array<{ id: VaultVisibility; label: string }> = [
  { id: 'ADULTS', label: 'Adults' },
  { id: 'EVERYONE', label: 'Everyone' },
  { id: 'ONLY_ME', label: 'Only me' },
];

export const AddEditVaultItemModal: React.FC<AddEditVaultItemModalProps> = ({
  visible,
  asModal = false,
  onClose,
  initialCategory = 'INSURANCE',
  initialKind,
  itemToEdit,
  renewMode = false,
  onSaved,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const familyState = useAppSelector((state) => state.family);
  const vaultState = useAppSelector((state) => state.vault);
  const isTestEnv = isJestTestEnv();

  const members = useMemo(
    () => extractVaultMembersFromFamilyState(familyState),
    [familyState]
  );

  const assetOptions = useMemo(
    () => (vaultState.items || []).filter((it) => String(it.category).toUpperCase() === 'ASSET'),
    [vaultState.items]
  );

  const isEditing = Boolean(itemToEdit?.id);

  const [category, setCategory] = useState<VaultCategory>(initialCategory);
  const [kind, setKind] = useState<string>(initialKind || '');
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [role, setRole] = useState('');
  const [number, setNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [amount, setAmount] = useState('');
  const [sumInsured, setSumInsured] = useState('');
  const [repeatMonths, setRepeatMonths] = useState('');
  const [issuedOn, setIssuedOn] = useState('');
  const [dueOn, setDueOn] = useState('');
  const [dueLabel, setDueLabel] = useState('');
  const [serviceDueOn, setServiceDueOn] = useState('');
  const [notes, setNotes] = useState('');
  const [memberId, setMemberId] = useState<string>('');
  const [coveredMemberIds, setCoveredMemberIds] = useState<string[]>([]);
  const [assetId, setAssetId] = useState<string>('');
  const [reminderLeadDays, setReminderLeadDays] = useState<number[]>([30, 7]);
  const [visibility, setVisibility] = useState<VaultVisibility>('ADULTS');
  const [scanId, setScanId] = useState<string>('');
  const [scanFileLabel, setScanFileLabel] = useState<string>('');
  const [frontPick, setFrontPick] = useState<{
    path: string;
    filename?: string;
    mime?: string;
  } | null>(null);
  const [backPick, setBackPick] = useState<{
    path: string;
    filename?: string;
    mime?: string;
  } | null>(null);
  const [scanSideTarget, setScanSideTarget] = useState<'front' | 'back'>('front');
  const [skipRead, setSkipRead] = useState<boolean>(false);
  const [showScanSheet, setShowScanSheet] = useState(false);
  const [dateTarget, setDateTarget] = useState<'issuedOn' | 'dueOn' | 'serviceDueOn' | null>(
    null
  );
  const [dialog, setDialog] = useState<VaultDialogState>(INITIAL_VAULT_DIALOG_STATE);

  useEffect(() => {
    if (!visible) return;
    dispatch(clearLastVaultScan());

    if (!isTestEnv) {
      dispatch(fetchVaultItemsThunk({ category: 'ASSET' }));
    }

    const myId = members.find((m) => m.isYou)?.id || members[0]?.id || '';

    if (itemToEdit) {
      setCategory(itemToEdit.category);
      setKind(itemToEdit.kind || '');
      setTitle(itemToEdit.title || '');
      setProvider(itemToEdit.provider || '');
      setRole(itemToEdit.role || '');
      setNumber(itemToEdit.number || '');
      setPhone(itemToEdit.phone || '');
      setHours(itemToEdit.hours || '');
      setAmount(
        itemToEdit.amount !== null && itemToEdit.amount !== undefined
          ? String(itemToEdit.amount)
          : ''
      );
      setSumInsured(
        itemToEdit.sumInsured !== null && itemToEdit.sumInsured !== undefined
          ? String(itemToEdit.sumInsured)
          : ''
      );
      setRepeatMonths(
        itemToEdit.repeatMonths !== null && itemToEdit.repeatMonths !== undefined
          ? String(itemToEdit.repeatMonths)
          : ''
      );
      setIssuedOn(itemToEdit.issuedOn ? String(itemToEdit.issuedOn).slice(0, 10) : '');
      if (renewMode) {
        const nextDue = new Date();
        nextDue.setMonth(nextDue.getMonth() + (itemToEdit.repeatMonths || 12));
        setDueOn(nextDue.toISOString().slice(0, 10));
      } else {
        setDueOn(itemToEdit.dueOn ? String(itemToEdit.dueOn).slice(0, 10) : '');
      }
      setDueLabel(itemToEdit.dueLabel || '');
      setServiceDueOn(
        itemToEdit.serviceDueOn ? String(itemToEdit.serviceDueOn).slice(0, 10) : ''
      );
      setNotes(itemToEdit.notes || '');
      setMemberId(itemToEdit.memberId || itemToEdit.member?.id || myId);
      setCoveredMemberIds(itemToEdit.coveredMemberIds || []);
      setAssetId(itemToEdit.assetId || '');
      setReminderLeadDays(
        Array.isArray(itemToEdit.reminderLeadDays)
          ? itemToEdit.reminderLeadDays
          : [30, 7]
      );
      setVisibility(itemToEdit.visibility || 'ADULTS');
      setScanId('');
      setFrontPick(null);
      setBackPick(null);
      setSkipRead(false);
      setScanFileLabel(
        itemToEdit.hasFile
          ? itemToEdit.backFileName || itemToEdit.backFileUrl
            ? 'Front & back files attached (tap to replace)'
            : itemToEdit.fileName
            ? `Attached: ${itemToEdit.fileName}`
            : 'Existing file attached (tap to replace)'
          : ''
      );
      return;
    }

    setCategory(initialCategory);
    const defaultKind = initialKind || KIND_PRESETS[initialCategory]?.[0] || '';
    setKind(defaultKind);
    setTitle('');
    setProvider('');
    setRole('');
    setNumber('');
    setPhone('');
    setHours('');
    setAmount('');
    setSumInsured('');
    setRepeatMonths(initialCategory === 'UTILITIES' ? '1' : initialCategory === 'INSURANCE' ? '12' : '');
    setIssuedOn('');
    setDueOn('');
    setDueLabel(
      initialCategory === 'UTILITIES'
        ? 'Due'
        : initialCategory === 'ASSET'
        ? 'PUC'
        : initialCategory === 'WARRANTY'
        ? 'Warranty'
        : 'Renewal'
    );
    setServiceDueOn('');
    setNotes('');
    setMemberId(myId);
    setCoveredMemberIds(myId && isUUID(myId) ? [myId] : []);
    setAssetId('');
    setReminderLeadDays(initialCategory === 'UTILITIES' ? [3, 1] : [30, 7]);
    setVisibility('ADULTS');
    setScanId('');
    setFrontPick(null);
    setBackPick(null);
    setSkipRead(false);
    setScanFileLabel('');
  }, [visible, itemToEdit, initialCategory, initialKind, renewMode, members, dispatch, isTestEnv]);

  const performScanUpload = async (
    nextFront: { path: string; filename?: string; mime?: string },
    nextBack: { path: string; filename?: string; mime?: string } | null,
    skipOcr: boolean
  ) => {
    const storedMemberId = await getMyMemberId();
    const scanMemberId =
      (memberId && isUUID(memberId) ? memberId : '') ||
      (itemToEdit?.memberId && isUUID(itemToEdit.memberId)
        ? itemToEdit.memberId
        : '') ||
      (itemToEdit?.member?.id && isUUID(itemToEdit.member.id)
        ? itemToEdit.member.id
        : '') ||
      (familyState?.myMemberId && isUUID(familyState.myMemberId)
        ? familyState.myMemberId
        : '') ||
      (familyState?.family?.myMemberId && isUUID(familyState.family.myMemberId)
        ? familyState.family.myMemberId
        : '') ||
      members.find((m) => isUUID(m.id))?.id ||
      (storedMemberId && isUUID(storedMemberId) ? storedMemberId : '') ||
      '';

    if (!scanMemberId) {
      setDialog({
        visible: true,
        type: 'warning',
        title: 'Member required for scan',
        description: 'Select a valid family member before uploading a document.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
      return;
    }

    const normalizeUploadUri = (rawPath: string) =>
      rawPath.startsWith('file://') ||
      rawPath.startsWith('content://') ||
      rawPath.startsWith('http')
        ? rawPath
        : `file://${rawPath}`;

    const VALID_SCAN_TYPES = new Set([
      'PASSPORT',
      'VISA',
      'DRIVING_LICENSE',
      'PAN',
      'AADHAAR',
      'BIRTH_CERTIFICATE',
      'SENIOR_CITIZEN_CARD',
      'BILL',
      'OTHER',
    ]);
    const rawCandidate =
      category === 'UTILITIES' ? 'BILL' : String(kind || 'OTHER').toUpperCase();
    const scanType = VALID_SCAN_TYPES.has(rawCandidate) ? rawCandidate : 'OTHER';

    const formData = new FormData();
    formData.append('file', {
      uri: normalizeUploadUri(nextFront.path),
      name: nextFront.filename || `vault-front-${Date.now()}.jpg`,
      type: nextFront.mime || 'image/jpeg',
    } as any);
    if (nextBack) {
      formData.append('backFile', {
        uri: normalizeUploadUri(nextBack.path),
        name: nextBack.filename || `vault-back-${Date.now()}.jpg`,
        type: nextBack.mime || 'image/jpeg',
      } as any);
    }
    formData.append('type', scanType);
    formData.append('skipRead', skipOcr ? 'true' : 'false');

    try {
      const res: any = await dispatch(
        scanVaultDocumentThunk({ memberId: scanMemberId, formData })
      ).unwrap();
      const resolvedScanId =
        res?.scanId ||
        res?.data?.scanId ||
        res?.document?.scanId ||
        res?.data?.document?.scanId ||
        '';
      if (resolvedScanId) {
        setScanId(resolvedScanId);
        const sideLabel = nextBack ? 'Front & Back uploaded' : 'Front uploaded';
        setScanFileLabel(
          `${sideLabel} (${res?.fileFormat?.toUpperCase() || 'IMAGE'}${res?.pages ? ` · ${res.pages}p` : ''})`
        );
        const extracted = res?.extracted;
        if (!skipOcr && extracted) {
          if (extracted.title && !title.trim()) setTitle(extracted.title);
          if (extracted.provider && !provider.trim()) setProvider(extracted.provider);
          if (extracted.number && !number.trim()) setNumber(extracted.number);
          if (extracted.amount && !amount.trim()) setAmount(String(extracted.amount));
          if (extracted.issuedOn && !issuedOn) setIssuedOn(extracted.issuedOn);
          if (extracted.dueOn && !dueOn) setDueOn(extracted.dueOn);
        }
      } else {
        setDialog({
          visible: true,
          type: 'danger',
          iconName: 'alert-circle',
          title: 'Upload incomplete',
          description: 'The server did not return a scanId for this image. Please try again.',
          primaryButtonText: 'OK',
          secondaryButtonText: '',
        });
      }
    } catch (err: any) {
      setDialog({
        visible: true,
        type: 'danger',
        iconName: 'alert-circle',
        title: 'Scan failed',
        description: typeof err === 'string' ? err : 'Unable to scan this file.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
    }
  };

  const applyPickedFile = async (picked: {
    path: string;
    filename?: string;
    mime?: string;
  }) => {
    if (scanSideTarget === 'front') {
      setFrontPick(picked);
      await performScanUpload(picked, backPick, skipRead);
    } else {
      setBackPick(picked);
      if (frontPick) {
        await performScanUpload(frontPick, picked, skipRead);
      } else {
        setScanFileLabel('Back side selected — now attach Front side');
      }
    }
  };

  const handleClearSide = async (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontPick(null);
      setScanId('');
      setScanFileLabel(backPick ? 'Back side selected — attach Front side' : '');
    } else {
      setBackPick(null);
      if (frontPick) {
        await performScanUpload(frontPick, null, skipRead);
      } else {
        setScanId('');
        setScanFileLabel('');
      }
    }
  };

  const handleCameraScan = async () => {
    try {
      setShowScanSheet(false);
      const image = await ImagePicker.openCamera({
        width: 1200,
        height: 1600,
        compressImageQuality: 0.85,
        mediaType: 'photo',
        cropping: false,
      });
      if (image?.path) {
        await applyPickedFile({
          path: image.path,
          filename: image.filename,
          mime: image.mime,
        });
      }
    } catch (err: any) {
      if (err?.code !== 'E_PICKER_CANCELLED') {
        setDialog({
          visible: true,
          type: 'danger',
          title: 'Camera unavailable',
          description: 'Could not capture a document photo.',
          primaryButtonText: 'OK',
          secondaryButtonText: '',
        });
      }
    }
  };

  const handleGalleryScan = async () => {
    try {
      setShowScanSheet(false);
      const res = await ImagePicker.openPicker({
        width: 1200,
        height: 1600,
        compressImageQuality: 0.85,
        mediaType: 'photo',
        cropping: false,
      });
      const picked = Array.isArray(res) ? res[0] : res;
      if (picked?.path) {
        await applyPickedFile({
          path: picked.path,
          filename: picked.filename,
          mime: picked.mime,
        });
      }
    } catch (err: any) {
      if (err?.code !== 'E_PICKER_CANCELLED') {
        setDialog({
          visible: true,
          type: 'danger',
          title: 'Gallery unavailable',
          description: 'Could not select a document image.',
          primaryButtonText: 'OK',
          secondaryButtonText: '',
        });
      }
    }
  };

  const toggleCoveredMember = (id: string) => {
    setCoveredMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setDialog({
        visible: true,
        type: 'warning',
        title: 'Title required',
        description: 'Enter a name for this Vault record.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
      return;
    }

    if (backPick && !frontPick) {
      setDialog({
        visible: true,
        type: 'warning',
        title: 'Front file required',
        description: 'Please attach the Front file as well so both images can be uploaded together.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
      return;
    }

    const validOwnerId = memberId && isUUID(memberId) ? memberId : null;
    const validCovered = filterValidFamilyMemberIds(coveredMemberIds, members);
    const validRemindIds =
      validCovered.length > 0
        ? validCovered
        : validOwnerId
        ? [validOwnerId]
        : [];
    const parsedAmount = amount.trim() ? parseInt(amount.trim(), 10) : null;
    const parsedSumInsured = sumInsured.trim() ? parseInt(sumInsured.trim(), 10) : null;
    const parsedRepeat = repeatMonths.trim() ? parseInt(repeatMonths.trim(), 10) : null;

    try {
      if (isEditing && itemToEdit) {
        const updated = await dispatch(
          updateVaultItemThunk({
            id: itemToEdit.id,
            payload: {
              title: cleanTitle.slice(0, 120),
              kind: kind.trim() || null,
              provider: provider.trim() || null,
              role: role.trim() || null,
              number: number.trim() || null,
              phone: phone.trim() || null,
              hours: hours.trim() || null,
              amount: Number.isNaN(parsedAmount as any) ? null : parsedAmount,
              sumInsured: Number.isNaN(parsedSumInsured as any) ? null : parsedSumInsured,
              repeatMonths: Number.isNaN(parsedRepeat as any) ? null : parsedRepeat,
              issuedOn: issuedOn || null,
              dueOn: dueOn || null,
              dueLabel: dueLabel.trim() || null,
              serviceDueOn: serviceDueOn || null,
              ...(scanId ? { scanId } : {}),
              memberId: validOwnerId,
              coveredMemberIds: validCovered,
              assetId: assetId && isUUID(assetId) ? assetId : null,
              notes: notes.trim() ? notes.trim().slice(0, 1000) : null,
              reminderLeadDays,
              remindMemberIds: validRemindIds,
              visibility,
            },
          })
        ).unwrap();
        onSaved?.(updated);
        onClose();
        return;
      }

      const created = await dispatch(
        createVaultItemThunk({
          category: category.slice(0, 40),
          title: cleanTitle.slice(0, 120),
          kind: kind.trim() || null,
          provider: provider.trim() || null,
          role: role.trim() || null,
          number: number.trim() || null,
          phone: phone.trim() || null,
          hours: hours.trim() || null,
          amount: Number.isNaN(parsedAmount as any) ? null : parsedAmount,
          sumInsured: Number.isNaN(parsedSumInsured as any) ? null : parsedSumInsured,
          repeatMonths: Number.isNaN(parsedRepeat as any) ? null : parsedRepeat,
          issuedOn: issuedOn || null,
          dueOn: dueOn || null,
          dueLabel: dueLabel.trim() || null,
          serviceDueOn: serviceDueOn || null,
          ...(scanId ? { scanId } : {}),
          memberId: validOwnerId,
          coveredMemberIds: validCovered,
          assetId: assetId && isUUID(assetId) ? assetId : null,
          notes: notes.trim() ? notes.trim().slice(0, 1000) : null,
          reminderLeadDays,
          remindMemberIds: validRemindIds,
          visibility,
        })
      ).unwrap();
      onSaved?.(created);
      onClose();
    } catch (err: any) {
      setDialog({
        visible: true,
        type: 'danger',
        iconName: 'alert-circle',
        title: 'Save failed',
        description: typeof err === 'string' ? err : 'Could not save Vault item.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
    }
  };

  const kindChoices = KIND_PRESETS[category] || [];

  if (!asModal && !visible) {
    return null;
  }

  const content = (
      <View
        style={[
          styles.container,
          !asModal && styles.inlineOverlayContainer,
          { paddingTop: Math.max(insets.top, 16) },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Feather name="x" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {renewMode ? 'Renew item' : isEditing ? 'Edit item' : 'Add to Vault'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 96 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Scan / Attach Front & Back Document Files (#3) */}
          <View style={styles.scanSectionCard}>
            <View style={styles.scanHeaderRow}>
              <View style={styles.scanIconCircle}>
                {vaultState.scanningDocument ? (
                  <ActivityIndicator size="small" color="#F0923A" />
                ) : (
                  <Feather name="camera" size={18} color="#F0923A" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.scanTitle}>
                  {vaultState.scanningDocument
                    ? 'Uploading & scanning...'
                    : scanFileLabel || 'Scan or attach document'}
                </Text>
                <Text style={styles.scanSubtitle}>
                  Add front image (required to attach) & optional back image
                </Text>
              </View>
            </View>

            <View style={styles.fileSlotsRow}>
              <TouchableOpacity
                style={[styles.fileSlotCard, frontPick && styles.fileSlotCardActive]}
                onPress={() => {
                  setScanSideTarget('front');
                  setShowScanSheet(true);
                }}
                disabled={vaultState.scanningDocument}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Attach front file"
              >
                {frontPick ? (
                  <>
                    <Image source={{ uri: frontPick.path }} style={styles.fileSlotThumb} />
                    <Text style={styles.fileSlotTitle} numberOfLines={1}>
                      Front added
                    </Text>
                    <TouchableOpacity
                      style={styles.clearSlotBtn}
                      onPress={() => handleClearSide('front')}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      accessibilityLabel="Remove front file"
                    >
                      <Feather name="x" size={13} color="#FFFFFF" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Feather name="upload-cloud" size={18} color="#F0923A" />
                    <Text style={styles.fileSlotTitle}>Front file</Text>
                    <Text style={styles.fileSlotHint}>
                      {itemToEdit?.hasFile ? 'Replace front' : 'Tap to add'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.fileSlotCard, backPick && styles.fileSlotCardActive]}
                onPress={() => {
                  setScanSideTarget('back');
                  setShowScanSheet(true);
                }}
                disabled={vaultState.scanningDocument}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Attach back file"
              >
                {backPick ? (
                  <>
                    <Image source={{ uri: backPick.path }} style={styles.fileSlotThumb} />
                    <Text style={styles.fileSlotTitle} numberOfLines={1}>
                      Back added
                    </Text>
                    <TouchableOpacity
                      style={styles.clearSlotBtn}
                      onPress={() => handleClearSide('back')}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      accessibilityLabel="Remove back file"
                    >
                      <Feather name="x" size={13} color="#FFFFFF" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Feather name="copy" size={18} color="#5B9BF1" />
                    <Text style={styles.fileSlotTitle}>Back file</Text>
                    <Text style={styles.fileSlotHint}>
                      {itemToEdit?.backFileUrl ? 'Replace back' : 'Optional'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.skipReadRow}
              onPress={() => {
                const nextSkip = !skipRead;
                setSkipRead(nextSkip);
                if (frontPick) {
                  performScanUpload(frontPick, backPick, nextSkip);
                }
              }}
              activeOpacity={0.75}
              accessibilityRole="button"
            >
              <View style={[styles.skipReadCheck, !skipRead && styles.skipReadCheckActive]}>
                {!skipRead && <Feather name="check" size={12} color="#0B1A2F" />}
              </View>
              <Text style={styles.skipReadLabel}>
                Auto-read details from file (OCR)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category selector (locked during edit per API rule #7) */}
          {!isEditing && (
            <>
              <Text style={styles.sectionLabel}>CATEGORY</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {CATEGORY_OPTIONS.map((c) => {
                  const active = category === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => {
                        setCategory(c.id);
                        setKind(KIND_PRESETS[c.id]?.[0] || '');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* Sub-type Kind chips */}
          {kindChoices.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>TYPE</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {kindChoices.map((k) => {
                  const active = kind === k;
                  return (
                    <TouchableOpacity
                      key={k}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setKind(k)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {k.replace(/_/g, ' ')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Car insurance, Hyundai Creta, BSES"
            placeholderTextColor="#6E8096"
            maxLength={120}
          />

          <Text style={styles.fieldLabel}>
            {category === 'CONTACTS' ? 'Organization / Hospital' : 'Provider / Brand'}
          </Text>
          <TextInput
            style={styles.input}
            value={provider}
            onChangeText={setProvider}
            placeholder="e.g. HDFC ERGO, Hyundai, Apollo Cradle"
            placeholderTextColor="#6E8096"
          />

          {category === 'CONTACTS' ? (
            <>
              <Text style={styles.fieldLabel}>Role / Specialty</Text>
              <TextInput
                style={styles.input}
                value={role}
                onChangeText={setRole}
                placeholder="e.g. Paediatrician, Plumber, Gate Security"
                placeholderTextColor="#6E8096"
              />
              <Text style={styles.fieldLabel}>Phone number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. +91 98100 00000"
                placeholderTextColor="#6E8096"
                keyboardType="phone-pad"
              />
              <Text style={styles.fieldLabel}>Hours / Availability</Text>
              <TextInput
                style={styles.input}
                value={hours}
                onChangeText={setHours}
                placeholder="e.g. Mon to Fri, 8 AM to 3 PM"
                placeholderTextColor="#6E8096"
              />
            </>
          ) : (
            <>
              <Text style={styles.fieldLabel}>Policy / Account / Reg. Number</Text>
              <TextInput
                style={styles.input}
                value={number}
                onChangeText={setNumber}
                placeholder="e.g. POL-2025-99887732 or DL3CAB1234"
                placeholderTextColor="#6E8096"
              />

              <View style={styles.rowTwoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Amount / Premium (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="e.g. 14250"
                    placeholderTextColor="#6E8096"
                    keyboardType="numeric"
                  />
                </View>
                {category === 'INSURANCE' && (
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Sum Insured (₹)</Text>
                    <TextInput
                      style={styles.input}
                      value={sumInsured}
                      onChangeText={setSumInsured}
                      placeholder="e.g. 650000"
                      placeholderTextColor="#6E8096"
                      keyboardType="numeric"
                    />
                  </View>
                )}
              </View>

              {/* Dates */}
              <View style={styles.rowTwoCol}>
                <TouchableOpacity
                  style={styles.dateBox}
                  onPress={() => setDateTarget('issuedOn')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.dateSub}>Issued on</Text>
                  <Text style={styles.dateVal}>
                    {issuedOn ? formatVaultDate(issuedOn) : 'Optional'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateBox}
                  onPress={() => setDateTarget('dueOn')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.dateSub}>{dueLabel || 'Due / Expiry'}</Text>
                  <Text style={styles.dateVal}>
                    {dueOn ? formatVaultDate(dueOn) : 'Pick date'}
                  </Text>
                </TouchableOpacity>
              </View>

              {category === 'ASSET' && (
                <TouchableOpacity
                  style={styles.dateBoxFull}
                  onPress={() => setDateTarget('serviceDueOn')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.dateSub}>Next service due date</Text>
                  <Text style={styles.dateVal}>
                    {serviceDueOn ? formatVaultDate(serviceDueOn) : 'Optional'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Linked Asset (#9) */}
              {(category === 'INSURANCE' || category === 'WARRANTY') &&
                assetOptions.length > 0 && (
                  <>
                    <Text style={styles.sectionLabel}>LINKED ASSET (OPTIONAL)</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chipsRow}
                    >
                      <TouchableOpacity
                        style={[styles.chip, !assetId && styles.chipActive]}
                        onPress={() => setAssetId('')}
                      >
                        <Text style={[styles.chipText, !assetId && styles.chipTextActive]}>
                          None
                        </Text>
                      </TouchableOpacity>
                      {assetOptions.map((a) => {
                        const active = assetId === a.id;
                        return (
                          <TouchableOpacity
                            key={a.id}
                            style={[styles.chip, active && styles.chipActive]}
                            onPress={() => setAssetId(a.id)}
                          >
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                              {a.title}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </>
                )}

              {/* Reminders */}
              <Text style={styles.sectionLabel}>REMINDERS</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {REMINDER_PRESETS.map((preset) => {
                  const active =
                    JSON.stringify(reminderLeadDays) === JSON.stringify(preset.days);
                  return (
                    <TouchableOpacity
                      key={preset.label}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setReminderLeadDays(preset.days)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* Member Owner & Covered */}
          {members.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>OWNER / PRIMARY MEMBER</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {members.map((m) => {
                  const active = memberId === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setMemberId(m.id)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {m.firstName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {category === 'INSURANCE' && (
                <>
                  <Text style={styles.sectionLabel}>COVERED MEMBERS</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                  >
                    {members.map((m) => {
                      const active = coveredMemberIds.includes(m.id);
                      return (
                        <TouchableOpacity
                          key={m.id}
                          style={[styles.chip, active && styles.chipActive]}
                          onPress={() => toggleCoveredMember(m.id)}
                        >
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>
                            {m.firstName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              )}
            </>
          )}

          {/* Visibility */}
          <Text style={styles.sectionLabel}>WHO CAN SEE THIS</Text>
          <View style={styles.visRow}>
            {VISIBILITY_OPTIONS.map((v) => {
              const active = visibility === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.visBtn, active && styles.visBtnActive]}
                  onPress={() => setVisibility(v.id)}
                >
                  <Text style={[styles.visBtnText, active && styles.visBtnTextActive]}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional details or renewal instructions"
            placeholderTextColor="#6E8096"
            multiline
            maxLength={1000}
          />
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSubmit}
            disabled={vaultState.submitting || vaultState.scanningDocument}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Save Vault item"
          >
            {vaultState.submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>
                {renewMode ? 'Confirm renewal' : isEditing ? 'Save changes' : 'Save to Vault'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <DueDateTimeModal
          asModal={false}
          visible={Boolean(dateTarget)}
          initialDate={
            (dateTarget === 'issuedOn'
              ? issuedOn
              : dateTarget === 'serviceDueOn'
              ? serviceDueOn
              : dueOn) || undefined
          }
          onClose={() => setDateTarget(null)}
          onSave={(_dateLabel, _formatted, _time, isoDate) => {
            if (isoDate && dateTarget === 'issuedOn') setIssuedOn(isoDate);
            else if (isoDate && dateTarget === 'serviceDueOn') setServiceDueOn(isoDate);
            else if (isoDate && dateTarget === 'dueOn') setDueOn(isoDate);
            setDateTarget(null);
          }}
        />

        {/* Scan Picker Action Sheet (non-modal overlay to avoid nested Modal issues on iOS) */}
        {showScanSheet && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 1100, elevation: 22 }]}>
            <Pressable
              style={styles.sheetOverlay}
              onPress={() => setShowScanSheet(false)}
            >
              <Pressable style={styles.sheetContent} onPress={(e) => e.stopPropagation()}>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>
                  {scanSideTarget === 'back' ? 'Add Back File' : 'Add Front File'}
                </Text>
                <Text style={styles.sheetSubtitle}>
                  {scanSideTarget === 'back'
                    ? 'Select the back side of your card or document'
                    : 'Choose an image to attach & optionally scan fields'}
                </Text>
                <View style={styles.sheetActionsRow}>
                  <TouchableOpacity
                    style={styles.sheetActionBtn}
                    onPress={handleCameraScan}
                  >
                    <Feather name="camera" size={20} color="#F0923A" />
                    <Text style={styles.sheetActionText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sheetActionBtn}
                    onPress={handleGalleryScan}
                  >
                    <Feather name="image" size={20} color="#F0923A" />
                    <Text style={styles.sheetActionText}>Library</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </View>
        )}

        <VaultDialog
          dialog={dialog}
          onClose={() => setDialog(INITIAL_VAULT_DIALOG_STATE)}
        />
      </View>
  );

  if (!asModal) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1A2F' },
  inlineOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 20,
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
  headerTitle: {
    fontSize: 19,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  headerSpacer: { width: 44, height: 44 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  scanSectionCard: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#6D4325',
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  scanHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTitle: {
    fontSize: 14.5,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  scanSubtitle: {
    fontSize: 12,
    color: '#8A97AB',
  },
  fileSlotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fileSlotCard: {
    flex: 1,
    minHeight: 84,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#2E4363',
    backgroundColor: '#0E1E36',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 4,
  },
  fileSlotCardActive: {
    borderStyle: 'solid',
    borderColor: '#F0923A',
  },
  fileSlotThumb: {
    width: 34,
    height: 34,
    borderRadius: 6,
  },
  fileSlotTitle: {
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  fileSlotHint: {
    fontSize: 11.5,
    color: '#8A97AB',
  },
  clearSlotBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#263854',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipReadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
  },
  skipReadCheck: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#6E8096',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipReadCheckActive: {
    backgroundColor: '#F0923A',
    borderColor: '#F0923A',
  },
  skipReadLabel: {
    fontSize: 12.5,
    color: '#C8D1DC',
  },
  sectionLabel: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 0.7,
    marginBottom: 8,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#253957',
  },
  chipActive: {
    borderColor: '#F0923A',
    backgroundColor: 'rgba(240, 146, 58, 0.16)',
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    color: '#CAD4DF',
  },
  chipTextActive: {
    color: '#F0923A',
    fontFamily: 'Roboto-Bold',
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    color: '#A7B4C4',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    color: '#FFFFFF',
    fontSize: 14.5,
    marginBottom: 14,
  },
  notesInput: {
    height: 84,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  rowTwoCol: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dateBoxFull: {
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  dateSub: { fontSize: 11.5, color: '#8A97AB', marginBottom: 3 },
  dateVal: { fontSize: 13.5, fontFamily: 'Roboto-SemiBold', color: '#FFFFFF' },
  visRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  visBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#253957',
    backgroundColor: '#122440',
    alignItems: 'center',
  },
  visBtnActive: {
    borderColor: '#F0923A',
    backgroundColor: 'rgba(240, 146, 58, 0.16)',
  },
  visBtnText: { fontSize: 13, fontFamily: 'Roboto-Medium', color: '#CAD4DF' },
  visBtnTextActive: { color: '#F0923A', fontFamily: 'Roboto-Bold' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0B1A2F',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#192A44',
  },
  saveBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF' },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#122440',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontFamily: 'Roboto-Bold', color: '#FFFFFF', marginBottom: 4 },
  sheetSubtitle: { fontSize: 13, color: '#8A97AB', marginBottom: 18 },
  sheetActionsRow: { flexDirection: 'row', gap: 14, width: '100%' },
  sheetActionBtn: {
    flex: 1,
    backgroundColor: '#1A2D47',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  sheetActionText: { fontSize: 13.5, fontFamily: 'Roboto-SemiBold', color: '#FFFFFF' },
});

export default AddEditVaultItemModal;
