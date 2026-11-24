import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Switch,
  Modal,
  Pressable,
  Keyboard,
  findNodeHandle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import {
  useAppDispatch,
  useAppSelector,
  getMyFamilyThunk,
  fetchLifeProfileSectionThunk,
} from '../../../redux';
import {
  AppDateTimePicker,
  formatDate,
  parseDateTimeString,
} from '../../../components';
import {
  PersonalInfoHeader,
  DocumentPhotoUploadField,
  formatIsoToDisplayDate,
} from '../components';
import {
  normalizeVisaType,
  normalizeVisaEntries,
} from './documentPayloadUtils';

export interface VisaFormData {
  country: string;
  visaType: string;
  visaNumber: string;
  linkedPassport: string;
  linkedPassportId?: string;
  validFrom: string;
  validUntil: string;
  entries: 'Single' | 'Multiple';
  reminders: string[];
  assignees: string;
  remindMemberIds?: string[];
  autoRenewal: boolean;
  frontImageAdded: boolean;
  scanId?: string;
  frontImageUri?: string;
  fileUrl?: string;
}

export interface AddVisaScreenProps {
  initialData?: Partial<VisaFormData>;
  userName?: string;
  memberId?: string;
  documentId?: string;
  isSaving?: boolean;
  onClose?: () => void;
  onSave?: (data: VisaFormData, documentId?: string) => void;
  onSelectPassport?: () => void;
}

export const DEFAULT_VISA_DATA: VisaFormData = {
  country: '',
  visaType: '',
  visaNumber: '',
  linkedPassport: '',
  linkedPassportId: '',
  validFrom: '',
  validUntil: '',
  entries: 'Multiple',
  reminders: ['6 months', '1 month'],
  assignees: '',
  remindMemberIds: [],
  autoRenewal: true,
  frontImageAdded: false,
  scanId: '',
  frontImageUri: '',
  fileUrl: '',
};

const VISA_TYPES = ['Tourist or business', 'Student', 'Work', 'Other'];
const REMINDER_OPTIONS = ['6 months', '3 months', '1 month', '1 week'];

const AddVisaScreen: React.FC<AddVisaScreenProps> = ({
  initialData,
  userName = 'Priya',
  memberId,
  documentId,
  isSaving = false,
  onClose,
  onSave,
  onSelectPassport,
}) => {
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<VisaFormData>({
    ...DEFAULT_VISA_DATA,
    ...initialData,
    visaType: initialData?.visaType
      ? normalizeVisaType(initialData.visaType)
      : DEFAULT_VISA_DATA.visaType,
    entries: initialData?.entries
      ? normalizeVisaEntries(initialData.entries)
      : DEFAULT_VISA_DATA.entries,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        visaType: initialData.visaType
          ? normalizeVisaType(initialData.visaType)
          : prev.visaType,
        entries: initialData.entries
          ? normalizeVisaEntries(initialData.entries)
          : prev.entries,
      }));
    }
  }, [initialData]);

  const dispatch = useAppDispatch();
  const familyState = useAppSelector((state: any) => state.family);
  const myFamilyData = familyState?.myFamilyData;
  const rawMembers: any[] =
    myFamilyData?.family?.members ||
    familyState?.family?.members ||
    [];

  const familyMembers = rawMembers;

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    formData.remindMemberIds && Array.isArray(formData.remindMemberIds)
      ? formData.remindMemberIds
      : []
  );

  // Passport Selection Modal State
  const [showPassportModal, setShowPassportModal] = useState(false);

  const authUser = useAppSelector((state: any) => state.auth?.user);
  const lifeProfileDocuments = useAppSelector(
    (state: any) => state.lifeProfile?.documents
  );
  const lifeProfileFull = useAppSelector(
    (state: any) => state.lifeProfile?.fullProfile
  );

  const resolvedMemberId =
    memberId ||
    authUser?.memberId ||
    authUser?.myMemberId ||
    authUser?.id ||
    authUser?._id ||
    'me';

  // Fetch Family Status and Life Profile Documents on screen mount
  React.useEffect(() => {
    dispatch(getMyFamilyThunk());
    if (resolvedMemberId) {
      dispatch(
        fetchLifeProfileSectionThunk({
          memberId: resolvedMemberId,
          section: 'documents',
        })
      );
    }
  }, [dispatch, resolvedMemberId]);

  // Extract uploaded documents and filter for Passports
  const documentsData = lifeProfileDocuments?.data || lifeProfileDocuments;
  const rawDocs: any[] =
    (Array.isArray(documentsData) ? documentsData : null) ||
    (Array.isArray(documentsData?.documents) ? documentsData.documents : null) ||
    (Array.isArray(lifeProfileFull?.data?.documents) ? lifeProfileFull.data.documents : null) ||
    [];

  const uploadedPassports = rawDocs.filter((d: any) => d.type === 'PASSPORT');

  // Helper to format passport display label
  const formatPassportLabel = (p: any): string => {
    const num = p.number || p.passportNumber || p.docNumber || '';
    const last4 = p.last4 || (num && num.length >= 4 ? num.slice(-4) : num);
    if (last4) {
      return `Passport ending ${last4}`;
    }
    return p.country ? `${p.country} Passport` : 'Passport';
  };

  // Synchronize passport label if linkedPassportId is present
  React.useEffect(() => {
    if (formData.linkedPassportId && uploadedPassports.length > 0) {
      const matched = uploadedPassports.find(
        (p: any) => p.id === formData.linkedPassportId
      );
      if (matched) {
        const label = formatPassportLabel(matched);
        if (formData.linkedPassport !== label) {
          setFormData((prev) => ({ ...prev, linkedPassport: label }));
        }
      }
    } else if (formData.linkedPassport && formData.linkedPassport.includes('Passport ID:')) {
      setFormData((prev) => ({ ...prev, linkedPassport: 'Passport' }));
    }
  }, [formData.linkedPassportId, uploadedPassports]);

  React.useEffect(() => {
    if (formData.remindMemberIds && Array.isArray(formData.remindMemberIds)) {
      setSelectedMemberIds(formData.remindMemberIds);
    }
  }, [formData.remindMemberIds]);

  React.useEffect(() => {
    if (
      familyMembers.length > 0 &&
      (!formData.remindMemberIds || formData.remindMemberIds.length === 0)
    ) {
      const currentMember =
        familyMembers.find((m: any) => (m.memberId || m.id) === memberId) ||
        familyMembers[0];
      const validId = currentMember ? currentMember.memberId || currentMember.id : null;
      const validName = currentMember ? currentMember.fullName || currentMember.name : '';

      if (validId) {
        setFormData((prev) => ({
          ...prev,
          remindMemberIds: [validId],
          assignees: prev.assignees || validName,
        }));
        setSelectedMemberIds([validId]);
      }
    }
  }, [familyMembers, memberId]);

  const toggleMemberSelection = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleApplyMembers = () => {
    const selected = familyMembers.filter((m: any) =>
      selectedMemberIds.includes(m.memberId || m.id)
    );
    const names = selected.map((m: any) => m.fullName || m.name).join(', ');
    setFormData((prev) => ({
      ...prev,
      remindMemberIds: selectedMemberIds,
      assignees: names,
    }));
    setShowMembersModal(false);
  };

  const selectedMembersList = familyMembers.filter((m: any) =>
    (formData.remindMemberIds || []).includes(m.memberId || m.id)
  );

  const firstMemberName =
    selectedMembersList[0]?.fullName ||
    selectedMembersList[0]?.name ||
    '';

  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    target: 'validFrom' | 'validUntil' | null;
    title: string;
  }>({
    visible: false,
    target: null,
    title: '',
  });

  const scrollViewRef = useRef<any>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates ? e.endCoordinates.height : 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleInputFocus = (event: any) => {
    if (scrollViewRef.current) {
      const nodeHandle = findNodeHandle(event.target);
      if (nodeHandle) {
        setTimeout(() => {
          (scrollViewRef.current as any)
            ?.getScrollResponder?.()
            ?.scrollResponderScrollNativeHandleToKeyboard(nodeHandle, 120, true);
        }, 120);
      }
    }
  };

  const toggleReminder = (rem: string) => {
    setFormData((prev) => {
      const exists = prev.reminders.includes(rem);
      const updated = exists
        ? prev.reminders.filter((r) => r !== rem)
        : [...prev.reminders, rem];
      return { ...prev, reminders: updated };
    });
  };

  const isFormValid = Boolean(
    formData.country?.trim() &&
    formData.visaType?.trim() &&
    formData.visaNumber?.trim() &&
    formData.validFrom?.trim() &&
    formData.validUntil?.trim()
  );

  const handleSave = () => {
    if (isFormValid && onSave) {
      onSave(formData, documentId);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header with Circular ( X ) Close Button */}
      <PersonalInfoHeader
        title={documentId ? 'Edit visa' : 'Add visa'}
        subtitle={`For ${userName}`}
        onBack={onClose}
        icon="close"
      />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardHeight > 0
              ? { paddingBottom: keyboardHeight + 80 }
              : null,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onFocus={handleInputFocus}
        >
          {/* Top Field: Upload & Scan Document Photo */}
          <DocumentPhotoUploadField
            documentType="VISA"
            documentTitle="Visa"
            memberId={memberId}
            scanId={formData.scanId}
            hasFrontImage={formData.frontImageAdded}
            onScanSuccess={(scanned, newScanId) => {
              const rawIssued =
                scanned.issuedOn ||
                scanned.validFrom ||
                scanned.issueDate ||
                scanned.dateOfIssue;
              const rawExpiry =
                scanned.expiresOn ||
                scanned.validUntil ||
                scanned.expiryDate ||
                scanned.dateOfExpiry;

              setFormData((prev) => ({
                ...prev,
                scanId: newScanId || scanned.scanId || prev.scanId,
                visaNumber: (
                  scanned.number ||
                  scanned.visaNumber ||
                  prev.visaNumber
                ).toUpperCase(),
                country: scanned.country || prev.country,
                validFrom: rawIssued
                  ? formatIsoToDisplayDate(rawIssued)
                  : prev.validFrom,
                validUntil: rawExpiry
                  ? formatIsoToDisplayDate(rawExpiry)
                  : prev.validUntil,
                visaType: scanned.visaType
                  ? normalizeVisaType(scanned.visaType)
                  : prev.visaType,
                entries:
                  scanned.visaEntries || scanned.entries
                    ? normalizeVisaEntries(scanned.visaEntries || scanned.entries)
                    : prev.entries,
                frontImageAdded: true,
              }));
            }}
            onPhotosChange={(front) => {
              setFormData((prev) => ({
                ...prev,
                frontImageAdded: Boolean(front),
              }));
            }}
          />

          {/* Country */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Country</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.selectorBox}>
              <Text style={styles.selectorText}>{formData.country}</Text>
              <Feather name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* VISA TYPE */}
          <View style={styles.fieldGroup}>
            <Text style={styles.sectionHeader}>VISA TYPE</Text>
            <View style={styles.pillsRow}>
              {VISA_TYPES.slice(0, 3).map((vt) => {
                const isSelected = normalizeVisaType(formData.visaType) === vt;
                return (
                  <TouchableOpacity
                    key={vt}
                    activeOpacity={0.7}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, visaType: vt }))
                    }
                    style={[
                      styles.pillButton,
                      isSelected && styles.pillButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        isSelected && styles.pillTextSelected,
                      ]}
                    >
                      {vt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={[styles.pillsRow, { marginTop: 8 }]}>
              {VISA_TYPES.slice(3).map((vt) => {
                const isSelected = normalizeVisaType(formData.visaType) === vt;
                return (
                  <TouchableOpacity
                    key={vt}
                    activeOpacity={0.7}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, visaType: vt }))
                    }
                    style={[
                      styles.pillButton,
                      isSelected && styles.pillButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        isSelected && styles.pillTextSelected,
                      ]}
                    >
                      {vt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Visa number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Visa number</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.visaNumber}
              onChangeText={(t) =>
                setFormData((prev) => ({ ...prev, visaNumber: t }))
              }
              placeholder="e.g. H1234567"
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
            />
          </View>

          {/* On passport (linked passport) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassportModal(true)}
            style={styles.linkedPassportCard}
          >
            <View style={styles.passportIconBox}>
              <Feather name="book-open" size={17} color="#38BDF8" />
            </View>
            <View style={styles.passportTextContainer}>
              <Text style={styles.passportLabel}>On passport</Text>
              <Text
                style={[
                  styles.passportValue,
                  !formData.linkedPassport && styles.passportPlaceholder,
                ]}
              >
                {formData.linkedPassport || 'None (optional) · Tap to link'}
              </Text>
            </View>
            <Feather name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>

          {/* Valid from & Valid until (Side-by-side) */}
          <View style={styles.sideBySideRow}>
            {/* Valid from */}
            <View style={styles.sideColumn}>
              <Text style={styles.fieldLabel}>Valid from</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.selectorBox}
                onPress={() => {
                  setPickerConfig({
                    visible: true,
                    target: 'validFrom',
                    title: 'Valid From',
                  });
                }}
              >
                <Text style={styles.selectorText}>{formData.validFrom}</Text>
                <Feather name="calendar" size={17} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Valid until */}
            <View style={styles.sideColumn}>
              <Text style={styles.fieldLabel}>Valid until</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.selectorBox}
                onPress={() => {
                  setPickerConfig({
                    visible: true,
                    target: 'validUntil',
                    title: 'Valid Until',
                  });
                }}
              >
                <Text style={styles.selectorText}>{formData.validUntil}</Text>
                <Feather name="calendar" size={17} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ENTRIES */}
          <View style={styles.fieldGroup}>
            <Text style={styles.sectionHeader}>ENTRIES</Text>
            <View style={styles.entriesContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, entries: 'Single' }))
                }
                style={[
                  styles.entrySegment,
                  normalizeVisaEntries(formData.entries) === 'Single' &&
                    styles.entrySegmentSelected,
                ]}
              >
                <Text
                  style={[
                    styles.entryText,
                    normalizeVisaEntries(formData.entries) === 'Single' &&
                      styles.entryTextSelected,
                  ]}
                >
                  Single
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, entries: 'Multiple' }))
                }
                style={[
                  styles.entrySegment,
                  normalizeVisaEntries(formData.entries) === 'Multiple' &&
                    styles.entrySegmentSelected,
                ]}
              >
                <Text
                  style={[
                    styles.entryText,
                    normalizeVisaEntries(formData.entries) === 'Multiple' &&
                      styles.entryTextSelected,
                  ]}
                >
                  Multiple
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* REMIND BEFORE IT EXPIRES */}
          <Text style={styles.sectionHeader}>REMIND BEFORE IT EXPIRES</Text>
          <View style={styles.pillsRow}>
            {REMINDER_OPTIONS.slice(0, 3).map((opt) => {
              const isSelected = formData.reminders.includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  onPress={() => toggleReminder(opt)}
                  style={[
                    styles.pillButton,
                    isSelected && styles.pillButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isSelected && styles.pillTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={[styles.pillsRow, { marginTop: 8 }]}>
            {REMINDER_OPTIONS.slice(3).map((opt) => {
              const isSelected = formData.reminders.includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  onPress={() => toggleReminder(opt)}
                  style={[
                    styles.pillButton,
                    isSelected && styles.pillButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isSelected && styles.pillTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Remind Target Card */}
          <View style={styles.cardContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.remindRow}
              onPress={() => setShowMembersModal(true)}
            >
              <Feather name="bell" size={17} color="#8E9BAE" />
              <Text style={styles.remindLabel}>Remind</Text>
              <View style={styles.avatarGroup}>
                {selectedMembersList.slice(0, 2).map((m: any, idx: number) => (
                  <View
                    key={m.memberId || idx}
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor:
                          m.avatarColor || (idx === 0 ? '#7C3AED' : '#2563EB'),
                        marginLeft: idx > 0 ? -6 : 0,
                      },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {(m.fullName || m.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.remindAssigneeText} numberOfLines={1}>
                {formData.assignees || 'Priya, Rohan'}
              </Text>
              <Feather name="chevron-right" size={17} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            {/* Auto Renewal Task Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>
                  Add a renewal task automatically
                </Text>
                <Text style={styles.switchSubtitle}>
                  Assigned to {firstMemberName || userName}, 6 months before
                </Text>
              </View>
              <Switch
                value={formData.autoRenewal}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, autoRenewal: v }))
                }
                trackColor={{ false: '#334155', true: '#F0913A' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Save Visa Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title={documentId ? 'Update visa' : 'Save visa'}
            onPress={handleSave}
            loading={isSaving}
            disabled={!isFormValid || isSaving}
            backgroundColor={
              isFormValid ? Colors.primary || '#F0913A' : '#5C381E'
            }
            textColor={isFormValid ? '#FFFFFF' : '#8E9BAE'}
            height={52}
            borderRadius={26}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      <AppDateTimePicker
        visible={pickerConfig.visible}
        mode="date"
        title={pickerConfig.title}
        date={parseDateTimeString(
          pickerConfig.target === 'validFrom'
            ? formData.validFrom
            : formData.validUntil,
        )}
        onConfirm={(date) => {
          if (pickerConfig.target === 'validFrom') {
            setFormData((prev) => ({ ...prev, validFrom: formatDate(date) }));
          } else if (pickerConfig.target === 'validUntil') {
            setFormData((prev) => ({ ...prev, validUntil: formatDate(date) }));
          }
          setPickerConfig((prev) => ({ ...prev, visible: false }));
        }}
        onCancel={() =>
          setPickerConfig((prev) => ({ ...prev, visible: false }))
        }
      />

      {/* Family Member Remind Selection Modal */}
      <Modal
        visible={showMembersModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMembersModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowMembersModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Remind family members</Text>
            <Text style={styles.modalSubtitle}>
              Select members who should be reminded before expiry
            </Text>

            <View style={styles.membersListContainer}>
              {familyMembers.map((member: any) => {
                const id = member.memberId || member.id;
                const isSelected = selectedMemberIds.includes(id);
                const initial = (member.fullName || member.name || 'U')
                  .charAt(0)
                  .toUpperCase();

                return (
                  <TouchableOpacity
                    key={id}
                    activeOpacity={0.7}
                    onPress={() => toggleMemberSelection(id)}
                    style={[
                      styles.memberRowCard,
                      isSelected && styles.memberRowCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.memberAvatarBox,
                        { backgroundColor: member.avatarColor || '#7C3AED' },
                      ]}
                    >
                      <Text style={styles.memberAvatarText}>{initial}</Text>
                    </View>

                    <View style={styles.memberInfoCol}>
                      <Text style={styles.memberNameText}>
                        {member.fullName || member.name || 'Member'}
                      </Text>
                      <Text style={styles.memberRoleText}>
                        {member.familyRole || member.role || 'Family Member'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.checkboxSquare,
                        isSelected && styles.checkboxSquareSelected,
                      ]}
                    >
                      {isSelected && (
                        <Feather name="check" size={14} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <CommonBtn
              title={`Done (${selectedMemberIds.length} Selected)`}
              onPress={handleApplyMembers}
              backgroundColor={Colors.primary || '#F0913A'}
              textColor="#FFFFFF"
              height={50}
              borderRadius={25}
              marginTop={16}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Linked Passport Selector Modal */}
      <Modal
        visible={showPassportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPassportModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowPassportModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>On passport</Text>
            <Text style={styles.modalSubtitle}>
              Select the passport this visa is stamped on
            </Text>

            {uploadedPassports.length === 0 ? (
              <View style={styles.emptyPassportContainer}>
                <View style={styles.emptyPassportIconBox}>
                  <Feather name="book-open" size={24} color="#64748B" />
                </View>
                <Text style={styles.emptyPassportTitle}>No passports found</Text>
                <Text style={styles.emptyPassportSubtitle}>
                  You haven't uploaded any passport yet. You can save this visa without linking a passport, or upload a passport first.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={{ maxHeight: 300 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Option to clear / No passport */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setFormData((prev) => ({
                      ...prev,
                      linkedPassport: '',
                      linkedPassportId: '',
                    }));
                    setShowPassportModal(false);
                  }}
                  style={[
                    styles.passportOptionCard,
                    !formData.linkedPassportId && styles.passportOptionCardSelected,
                  ]}
                >
                  <View style={styles.passportOptionIconBox}>
                    <Feather name="slash" size={16} color="#94A3B8" />
                  </View>
                  <View style={styles.passportOptionDetails}>
                    <Text style={styles.passportOptionTitle}>None / Not linked</Text>
                    <Text style={styles.passportOptionSubtitle}>
                      Save visa without linking a passport
                    </Text>
                  </View>
                  {!formData.linkedPassportId && (
                    <View style={styles.checkCircleSelected}>
                      <Feather name="check" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* List of uploaded passports */}
                {uploadedPassports.map((passport: any) => {
                  const id = passport.id;
                  const isSelected = formData.linkedPassportId === id;
                  const label = formatPassportLabel(passport);
                  const expiryStr = passport.expiresOn
                    ? `Expires ${passport.expiresOn.split('T')[0]}`
                    : '';
                  const countryStr = passport.country || '';

                  return (
                    <TouchableOpacity
                      key={id}
                      activeOpacity={0.7}
                      onPress={() => {
                        setFormData((prev) => ({
                          ...prev,
                          linkedPassport: label,
                          linkedPassportId: id,
                        }));
                        setShowPassportModal(false);
                      }}
                      style={[
                        styles.passportOptionCard,
                        isSelected && styles.passportOptionCardSelected,
                      ]}
                    >
                      <View style={styles.passportOptionIconBox}>
                        <Feather name="book-open" size={16} color="#38BDF8" />
                      </View>
                      <View style={styles.passportOptionDetails}>
                        <Text style={styles.passportOptionTitle}>{label}</Text>
                        <Text style={styles.passportOptionSubtitle}>
                          {[countryStr, expiryStr].filter(Boolean).join(' · ') || 'Uploaded Passport'}
                        </Text>
                      </View>
                      {isSelected ? (
                        <View style={styles.checkCircleSelected}>
                          <Feather name="check" size={14} color="#FFFFFF" />
                        </View>
                      ) : (
                        <View style={styles.checkCircleUnselected} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <CommonBtn
              title="Close"
              onPress={() => setShowPassportModal(false)}
              backgroundColor="transparent"
              borderColor="rgba(255, 255, 255, 0.15)"
              borderWidth={1}
              textColor="#CAD4DF"
              height={48}
              borderRadius={24}
              marginTop={16}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default AddVisaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#0A111F',
  },
  flexOne: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  photoCard: {
    width: 140,
    height: 94,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
  },
  photoCardSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  photoCardEmpty: {
    backgroundColor: '#131F35',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  photoTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(12.5),
    fontFamily: 'Roboto-SemiBold',
  },
  photoSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(10.5),
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#94A3B8',
    fontSize: RFValue(12),
    fontFamily: 'Roboto-Medium',
    marginBottom: 6,
  },
  sectionHeader: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  inputBox: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#121C2F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
  },
  selectorBox: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#121C2F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-Medium',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillButton: {
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 16,
    backgroundColor: '#121C2F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillButtonSelected: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: RFValue(12),
    fontFamily: 'Roboto-Medium',
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Roboto-Bold',
  },
  linkedPassportCard: {
    height: 58,
    borderRadius: 14,
    backgroundColor: '#121C2F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passportIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  passportTextContainer: {
    flex: 1,
  },
  passportLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(10.5),
  },
  passportValue: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
    marginTop: 2,
  },
  sideBySideRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sideColumn: {
    flex: 1,
  },
  entriesContainer: {
    flexDirection: 'row',
    backgroundColor: '#121C2F',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  entrySegment: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entrySegmentSelected: {
    backgroundColor: '#F0913A',
  },
  entryText: {
    color: '#94A3B8',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
  },
  entryTextSelected: {
    color: '#0A111F',
    fontFamily: 'Roboto-Bold',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background || '#0A111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardContainer: {
    backgroundColor: '#121C2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  remindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  remindLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(13),
    marginLeft: 10,
    marginRight: 10,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#121C2F',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: RFValue(10.5),
    fontFamily: 'Roboto-Bold',
  },
  remindAssigneeText: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
    flex: 1,
    marginRight: 6,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
  },
  switchSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0D1726',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontFamily: 'Roboto-Bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(12.5),
    marginBottom: 16,
  },
  membersListContainer: {
    marginVertical: 8,
  },
  memberRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#131F35',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 8,
  },
  memberRowCardSelected: {
    borderColor: '#F0913A',
    backgroundColor: '#1E2D4A',
  },
  memberAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontFamily: 'Roboto-Bold',
  },
  memberInfoCol: {
    flex: 1,
  },
  memberNameText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-SemiBold',
  },
  memberRoleText: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    marginTop: 2,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSquareSelected: {
    borderColor: '#F0913A',
    backgroundColor: '#F0913A',
  },
  passportPlaceholder: {
    color: '#64748B',
  },
  emptyPassportContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyPassportIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyPassportTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(14.5),
    fontFamily: 'Roboto-SemiBold',
    marginBottom: 6,
  },
  emptyPassportSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    textAlign: 'center',
    lineHeight: 18,
  },
  passportOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#131F35',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 8,
  },
  passportOptionCardSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#132845',
  },
  passportOptionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  passportOptionDetails: {
    flex: 1,
  },
  passportOptionTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-SemiBold',
  },
  passportOptionSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    marginTop: 2,
  },
  checkCircleSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#64748B',
  },
  modalCloseBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    color: '#CAD4DF',
    fontSize: RFValue(14),
    fontFamily: 'Roboto-SemiBold',
  },
});

