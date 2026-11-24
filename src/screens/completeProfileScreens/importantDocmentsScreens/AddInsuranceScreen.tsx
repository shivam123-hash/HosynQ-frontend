import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Switch,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Keyboard,
  findNodeHandle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { useAppDispatch, useAppSelector, getMyFamilyThunk } from '../../../redux';
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

export interface InsuranceFormData {
  type: string;
  insurer: string;
  planName: string;
  policyNumber: string;
  sumInsured: string;
  premiumPerYear: string;
  renewalDate: string;
  saveInFamilyVault: boolean;
  remindRenewal: boolean;
  coveredMemberIds: string[];
  coveredNames?: string;
  reminders: string[];
  remindMemberIds?: string[];
  assignees?: string;
  autoRenewal?: boolean;
  frontImageAdded?: boolean;
  scanId?: string;
}

export interface AddInsuranceScreenProps {
  initialData?: Partial<InsuranceFormData>;
  userName?: string;
  memberId?: string;
  documentId?: string;
  isSaving?: boolean;
  onClose?: () => void;
  onSave?: (data: InsuranceFormData, documentId?: string) => void;
}

export const DEFAULT_INSURANCE_DATA: InsuranceFormData = {
  type: 'Health',
  insurer: '',
  planName: '',
  policyNumber: '',
  sumInsured: '',
  premiumPerYear: '',
  renewalDate: '',
  saveInFamilyVault: true,
  remindRenewal: true,
  coveredMemberIds: [],
  coveredNames: '',
  reminders: ['1 month', '1 week'],
  remindMemberIds: [],
  assignees: '',
  autoRenewal: true,
  frontImageAdded: false,
  scanId: '',
};

const INSURANCE_TYPES = ['Health', 'Life', 'Motor', 'Home', 'Travel'];
const REMINDER_OPTIONS = ['6 months', '3 months', '1 month', '1 week'];

const AddInsuranceScreen: React.FC<AddInsuranceScreenProps> = ({
  initialData,
  userName = 'Priya',
  memberId,
  documentId,
  isSaving = false,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const familyState = useAppSelector((state: any) => state.family);
  const familyMembers: any[] =
    familyState?.myFamilyData?.family?.members ||
    familyState?.family?.members ||
    [];

  const [formData, setFormData] = useState<InsuranceFormData>({
    ...DEFAULT_INSURANCE_DATA,
    ...initialData,
  });

  const [showCoveredModal, setShowCoveredModal] = useState(false);
  const [showRemindModal, setShowRemindModal] = useState(false);

  const [selectedCoveredIds, setSelectedCoveredIds] = useState<string[]>(() =>
    formData.coveredMemberIds && Array.isArray(formData.coveredMemberIds)
      ? formData.coveredMemberIds
      : []
  );

  const [selectedRemindIds, setSelectedRemindIds] = useState<string[]>(() =>
    formData.remindMemberIds && Array.isArray(formData.remindMemberIds)
      ? formData.remindMemberIds
      : []
  );

  React.useEffect(() => {
    dispatch(getMyFamilyThunk());
  }, [dispatch]);

  React.useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  React.useEffect(() => {
    if (formData.coveredMemberIds && Array.isArray(formData.coveredMemberIds)) {
      setSelectedCoveredIds(formData.coveredMemberIds);
    }
  }, [formData.coveredMemberIds]);

  React.useEffect(() => {
    if (formData.remindMemberIds && Array.isArray(formData.remindMemberIds)) {
      setSelectedRemindIds(formData.remindMemberIds);
    }
  }, [formData.remindMemberIds]);

  React.useEffect(() => {
    if (familyMembers.length > 0) {
      // Default coveredMemberIds to all members if empty
      if (!formData.coveredMemberIds || formData.coveredMemberIds.length === 0) {
        const allIds = familyMembers.map((m: any) => m.memberId || m.id).filter(Boolean);
        const allNames = familyMembers.map((m: any) => m.fullName || m.name).join(', ');
        setFormData((prev) => ({
          ...prev,
          coveredMemberIds: allIds,
          coveredNames: allNames,
        }));
        setSelectedCoveredIds(allIds);
      }

      // Default remindMemberIds to current user if empty
      if (!formData.remindMemberIds || formData.remindMemberIds.length === 0) {
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
          setSelectedRemindIds([validId]);
        }
      }
    }
  }, [familyMembers, memberId]);

  const toggleCoveredSelection = (id: string) => {
    setSelectedCoveredIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleApplyCovered = () => {
    const selected = familyMembers.filter((m: any) =>
      selectedCoveredIds.includes(m.memberId || m.id)
    );
    const names = selected.map((m: any) => m.fullName || m.name).join(', ');
    setFormData((prev) => ({
      ...prev,
      coveredMemberIds: selectedCoveredIds,
      coveredNames: names,
    }));
    setShowCoveredModal(false);
  };

  const toggleRemindSelection = (id: string) => {
    setSelectedRemindIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleApplyRemind = () => {
    const selected = familyMembers.filter((m: any) =>
      selectedRemindIds.includes(m.memberId || m.id)
    );
    const names = selected.map((m: any) => m.fullName || m.name).join(', ');
    setFormData((prev) => ({
      ...prev,
      remindMemberIds: selectedRemindIds,
      assignees: names,
    }));
    setShowRemindModal(false);
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

  const coveredMembersList = familyMembers.filter((m: any) =>
    (formData.coveredMemberIds || []).includes(m.memberId || m.id)
  );

  const remindMembersList = familyMembers.filter((m: any) =>
    (formData.remindMemberIds || []).includes(m.memberId || m.id)
  );

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

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

  const [showPolicy, setShowPolicy] = useState(false);

  const isFormValid = Boolean(
    formData.insurer?.trim() &&
    formData.planName?.trim() &&
    formData.policyNumber?.trim() &&
    formData.sumInsured?.trim() &&
    formData.renewalDate?.trim()
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
        title={documentId ? 'Edit insurance' : 'Add insurance'}
        subtitle="For the family"
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
            documentType="INSURANCE"
            documentTitle="Insurance"
            memberId={memberId}
            scanId={formData.scanId}
            hasFrontImage={formData.frontImageAdded}
            onScanSuccess={(scanned, newScanId) => {
              setFormData((prev) => ({
                ...prev,
                scanId: newScanId || scanned.scanId || prev.scanId,
                policyNumber: scanned.number
                  ? scanned.number.toUpperCase()
                  : prev.policyNumber,
                insurer: scanned.insurer || prev.insurer,
                planName: scanned.planName || prev.planName,
                renewalDate: scanned.expiresOn
                  ? formatIsoToDisplayDate(scanned.expiresOn)
                  : prev.renewalDate,
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

          {/* TYPE */}
          <View style={styles.fieldGroup}>
            <Text style={styles.sectionHeader}>TYPE</Text>
            <View style={styles.pillsRow}>
              {INSURANCE_TYPES.slice(0, 4).map((t) => {
                const isSelected = formData.type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    activeOpacity={0.7}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, type: t }))
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
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={[styles.pillsRow, { marginTop: 8 }]}>
              {INSURANCE_TYPES.slice(4).map((t) => {
                const isSelected = formData.type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    activeOpacity={0.7}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, type: t }))
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
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Insurer */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Insurer</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.insurer}
              onChangeText={(t) =>
                setFormData((prev) => ({ ...prev, insurer: t }))
              }
              placeholder="e.g. Star Health"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Plan name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Plan name</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.planName}
              onChangeText={(t) =>
                setFormData((prev) => ({ ...prev, planName: t }))
              }
              placeholder="e.g. Family Floater"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Policy number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Policy number</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.inputBox, styles.inputFlex]}
                value={
                  showPolicy
                    ? formData.policyNumber.replace(/•/g, '8')
                    : formData.policyNumber
                }
                onChangeText={(t) =>
                  setFormData((prev) => ({ ...prev, policyNumber: t }))
                }
                placeholder="Policy number"
                placeholderTextColor="#64748B"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowPolicy(!showPolicy)}
                style={styles.rightIconButton}
              >
                <Feather
                  name={showPolicy ? 'eye' : 'eye-off'}
                  size={18}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sum insured & Premium a year (Side-by-side) */}
          <View style={styles.sideBySideRow}>
            {/* Sum insured */}
            <View style={styles.sideColumn}>
              <Text style={styles.fieldLabel}>Sum insured</Text>
              <TextInput
                style={styles.inputBox}
                value={formData.sumInsured}
                onChangeText={(t) =>
                  setFormData((prev) => ({ ...prev, sumInsured: t }))
                }
                placeholder="₹0"
                placeholderTextColor="#64748B"
              />
            </View>

            {/* Premium a year */}
            <View style={styles.sideColumn}>
              <Text style={styles.fieldLabel}>Premium a year</Text>
              <TextInput
                style={styles.inputBox}
                value={formData.premiumPerYear}
                onChangeText={(t) =>
                  setFormData((prev) => ({ ...prev, premiumPerYear: t }))
                }
                placeholder="₹0"
                placeholderTextColor="#64748B"
              />
            </View>
          </View>

          {/* Renews on */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Renews on</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.selectorBox}
              onPress={() => setIsDatePickerVisible(true)}
            >
              <Text style={styles.selectorText}>{formData.renewalDate}</Text>
              <Feather name="calendar" size={17} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* WHO IT COVERS */}
          <View style={styles.fieldGroup}>
            <Text style={styles.sectionHeader}>WHO IT COVERS</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowCoveredModal(true)}
              style={styles.coveredSelectorCard}
            >
              <View style={styles.avatarGroup}>
                {coveredMembersList.slice(0, 5).map((m: any, idx: number) => (
                  <View
                    key={m.memberId || idx}
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor:
                          m.avatarColor ||
                          ['#B45309', '#1D4ED8', '#9333EA', '#CA8A04', '#15803D'][idx % 5],
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
              <View style={styles.coveredTextContainer}>
                <Text style={styles.coveredNamesText} numberOfLines={1}>
                  {formData.coveredNames || `${coveredMembersList.length} members covered`}
                </Text>
                <Text style={styles.coveredSubText}>
                  {coveredMembersList.length === familyMembers.length
                    ? `All ${familyMembers.length} family members covered`
                    : `${coveredMembersList.length} selected · Tap to edit`}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>
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

          {/* Remind & Vault Settings Card */}
          <View style={styles.cardContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.remindRow}
              onPress={() => setShowRemindModal(true)}
            >
              <Feather name="bell" size={17} color="#8E9BAE" />
              <Text style={styles.remindLabel}>Remind</Text>
              <View style={styles.avatarGroup}>
                {remindMembersList.slice(0, 2).map((m: any, idx: number) => (
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
                {formData.assignees || userName || 'Priya'}
              </Text>
              <Feather name="chevron-right" size={17} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            {/* Toggle: Also save in Family Vault */}
            <View style={styles.autoRenewalRow}>
              <View style={styles.autoRenewalTextContainer}>
                <Text style={styles.autoRenewalTitle}>
                  Also save in Family Vault › Insurance
                </Text>
                <Text style={styles.autoRenewalSubtitle}>
                  Encrypted & accessible to family
                </Text>
              </View>
              <Switch
                value={formData.saveInFamilyVault}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, saveInFamilyVault: v }))
                }
                trackColor={{ false: '#334155', true: '#F0913A' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Save Insurance Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title={documentId ? 'Update insurance' : 'Save insurance'}
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
        visible={isDatePickerVisible}
        mode="date"
        title="Renewal Date"
        date={parseDateTimeString(formData.renewalDate)}
        onConfirm={(selectedDate) => {
          setFormData((prev) => ({
            ...prev,
            renewalDate: formatDate(selectedDate),
          }));
          setIsDatePickerVisible(false);
        }}
        onCancel={() => setIsDatePickerVisible(false)}
      />

      {/* Covered Members Selection Modal */}
      <Modal
        visible={showCoveredModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCoveredModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCoveredModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Who it covers</Text>
            <Text style={styles.modalSubtitle}>
              Select all family members covered under this insurance policy
            </Text>

            <View style={styles.membersListContainer}>
              {familyMembers.map((member: any) => {
                const id = member.memberId || member.id;
                const isSelected = selectedCoveredIds.includes(id);
                const initial = (member.fullName || member.name || 'U')
                  .charAt(0)
                  .toUpperCase();

                return (
                  <TouchableOpacity
                    key={id}
                    activeOpacity={0.7}
                    onPress={() => toggleCoveredSelection(id)}
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
              title={`Done (${selectedCoveredIds.length} Selected)`}
              onPress={handleApplyCovered}
              backgroundColor={Colors.primary || '#F0913A'}
              textColor="#FFFFFF"
              height={50}
              borderRadius={25}
              marginTop={16}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Remind Members Selection Modal */}
      <Modal
        visible={showRemindModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRemindModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowRemindModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Remind family members</Text>
            <Text style={styles.modalSubtitle}>
              Select members who should be reminded before policy renewal
            </Text>

            <View style={styles.membersListContainer}>
              {familyMembers.map((member: any) => {
                const id = member.memberId || member.id;
                const isSelected = selectedRemindIds.includes(id);
                const initial = (member.fullName || member.name || 'U')
                  .charAt(0)
                  .toUpperCase();

                return (
                  <TouchableOpacity
                    key={id}
                    activeOpacity={0.7}
                    onPress={() => toggleRemindSelection(id)}
                    style={[
                      styles.memberRowCard,
                      isSelected && styles.memberRowCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.memberAvatarBox,
                        { backgroundColor: member.avatarColor || '#2563EB' },
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
              title={`Done (${selectedRemindIds.length} Selected)`}
              onPress={handleApplyRemind}
              backgroundColor={Colors.primary || '#F0913A'}
              textColor="#FFFFFF"
              height={50}
              borderRadius={25}
              marginTop={16}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default AddInsuranceScreen;

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
  fieldGroup: {
    marginBottom: 16,
  },
  sectionHeader: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  fieldLabel: {
    color: '#94A3B8',
    fontSize: RFValue(12),
    fontFamily: 'Roboto-Medium',
    marginBottom: 6,
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputFlex: {
    flex: 1,
    paddingRight: 44,
  },
  rightIconButton: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#0A111F',
    fontFamily: 'Roboto-Bold',
  },
  sideBySideRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sideColumn: {
    flex: 1,
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
  coversRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberText: {
    color: '#FFFFFF',
    fontSize: RFValue(11),
    fontFamily: 'Roboto-Bold',
  },
  allCoveredBadge: {
    color: '#F0913A',
    fontSize: RFValue(12.5),
    fontFamily: 'Roboto-Bold',
    marginLeft: 6,
  },
  toggleCardContainer: {
    backgroundColor: '#121C2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 8,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  toggleTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
  },
  toggleSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background || '#0A111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  coveredSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121C2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  coveredTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  coveredNamesText: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
  },
  coveredSubText: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    marginTop: 2,
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
  autoRenewalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  autoRenewalTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  autoRenewalTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
  },
  autoRenewalSubtitle: {
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
});

