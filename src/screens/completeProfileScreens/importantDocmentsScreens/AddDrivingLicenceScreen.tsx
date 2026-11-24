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

export interface DrivingLicenceFormData {
  licenceNumber: string;
  vehiclesAllowed: string[];
  issueDate: string;
  validTill: string;
  issuingRTO: string;
  reminders: string[];
  assignees?: string;
  remindMemberIds?: string[];
  autoRenewal?: boolean;
  frontImageAdded: boolean;
  backImageAdded: boolean;
  scanId?: string;
  fileUrl?: string;
  fileUri?: string;
  frontImageUri?: string;
}

export interface AddDrivingLicenceScreenProps {
  initialData?: Partial<DrivingLicenceFormData>;
  userName?: string;
  memberId?: string;
  documentId?: string;
  isSaving?: boolean;
  onClose?: () => void;
  onSave?: (data: DrivingLicenceFormData, documentId?: string) => void;
}

export const DEFAULT_DL_DATA: DrivingLicenceFormData = {
  licenceNumber: '',
  vehiclesAllowed: [],
  issueDate: '',
  validTill: '',
  issuingRTO: '',
  reminders: ['6 months', '1 month'],
  assignees: '',
  remindMemberIds: [],
  autoRenewal: true,
  frontImageAdded: false,
  backImageAdded: false,
  scanId: '',
};

const VEHICLE_OPTIONS = ['Car (LMV)', 'Two-wheeler (MCWG)', 'Commercial'];
const REMINDER_OPTIONS = ['6 months', '3 months', '1 month', '1 week'];

const AddDrivingLicenceScreen: React.FC<AddDrivingLicenceScreenProps> = ({
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
  const [showMembersModal, setShowMembersModal] = useState(false);

  const familyMembers: any[] =
    familyState?.myFamilyData?.family?.members ||
    familyState?.family?.members ||
    [];

  const [formData, setFormData] = useState<DrivingLicenceFormData>({
    ...DEFAULT_DL_DATA,
    ...initialData,
  });

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(() =>
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
    target: 'issueDate' | 'validTill' | null;
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

  const toggleVehicle = (veh: string) => {
    setFormData((prev) => {
      const exists = prev.vehiclesAllowed.includes(veh);
      const updated = exists
        ? prev.vehiclesAllowed.filter((v) => v !== veh)
        : [...prev.vehiclesAllowed, veh];
      return { ...prev, vehiclesAllowed: updated };
    });
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
    formData.licenceNumber?.trim() &&
    formData.vehiclesAllowed?.length > 0 &&
    formData.issueDate?.trim() &&
    formData.validTill?.trim() &&
    formData.issuingRTO?.trim()
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
        title={documentId ? 'Edit driving licence' : 'Add driving licence'}
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
            documentType="DRIVING_LICENCE"
            documentTitle="Driving Licence"
            memberId={memberId}
            scanId={formData.scanId}
            hasFrontImage={formData.frontImageAdded}
            hasBackImage={formData.backImageAdded}
            onScanSuccess={(scanned, newScanId) => {
              const rawIssued =
                scanned.issuedOn ||
                scanned.issueDate ||
                scanned.dateOfIssue;
              const rawExpiry =
                scanned.expiresOn ||
                scanned.validTill ||
                scanned.expiryDate ||
                scanned.dateOfExpiry;

              setFormData((prev) => ({
                ...prev,
                scanId: newScanId || scanned.scanId || prev.scanId,
                licenceNumber: (
                  scanned.number ||
                  scanned.licenceNumber ||
                  prev.licenceNumber
                ).toUpperCase(),
                issueDate: rawIssued
                  ? formatIsoToDisplayDate(rawIssued)
                  : prev.issueDate,
                validTill: rawExpiry
                  ? formatIsoToDisplayDate(rawExpiry)
                  : prev.validTill,
                issuingRTO:
                  scanned.issuedAt ||
                  scanned.issuingRTO ||
                  prev.issuingRTO,
                frontImageAdded: true,
              }));
            }}
            onPhotosChange={(front, back) => {
              setFormData((prev) => ({
                ...prev,
                frontImageAdded: Boolean(front),
                backImageAdded: Boolean(back),
              }));
            }}
          />

          {/* Licence number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Licence number</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.licenceNumber}
              onChangeText={(t) =>
                setFormData((prev) => ({
                  ...prev,
                  licenceNumber: t.toUpperCase(),
                }))
              }
              placeholder="e.g. HR26 20080012345"
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
            />
            <Text style={styles.helperText}>
              State code, RTO code, year and number
            </Text>
          </View>

          {/* VEHICLES ALLOWED */}
          <View style={styles.fieldGroup}>
            <Text style={styles.sectionHeader}>VEHICLES ALLOWED</Text>
            <View style={styles.pillsRow}>
              {VEHICLE_OPTIONS.slice(0, 2).map((v) => {
                const isSelected = formData.vehiclesAllowed.includes(v);
                return (
                  <TouchableOpacity
                    key={v}
                    activeOpacity={0.7}
                    onPress={() => toggleVehicle(v)}
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
                      {v}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={[styles.pillsRow, { marginTop: 8 }]}>
              {VEHICLE_OPTIONS.slice(2).map((v) => {
                const isSelected = formData.vehiclesAllowed.includes(v);
                return (
                  <TouchableOpacity
                    key={v}
                    activeOpacity={0.7}
                    onPress={() => toggleVehicle(v)}
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
                      {v}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date of issue & Valid till (Side-by-side) */}
          <View style={styles.sideBySideRow}>
            {/* Date of issue */}
            <View style={styles.sideColumn}>
              <Text style={styles.fieldLabel}>Date of issue</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.selectorBox}
                onPress={() => {
                  setPickerConfig({
                    visible: true,
                    target: 'issueDate',
                    title: 'Date of Issue',
                  });
                }}
              >
                <Text style={styles.selectorText}>{formData.issueDate}</Text>
                <Feather name="calendar" size={17} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Valid till */}
            <View style={styles.sideColumn}>
              <Text style={styles.fieldLabel}>Valid till</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.selectorBox}
                onPress={() => {
                  setPickerConfig({
                    visible: true,
                    target: 'validTill',
                    title: 'Valid Till',
                  });
                }}
              >
                <Text style={styles.selectorText}>{formData.validTill}</Text>
                <Feather name="calendar" size={17} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Issuing RTO */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Issuing RTO</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.issuingRTO}
              onChangeText={(t) =>
                setFormData((prev) => ({ ...prev, issuingRTO: t }))
              }
              placeholder="e.g. Gurugram"
              placeholderTextColor="#64748B"
            />
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
                {formData.assignees || userName || 'Priya'}
              </Text>
              <Feather name="chevron-right" size={17} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            {/* Auto Renewal Task Switch */}
            <View style={styles.autoRenewalRow}>
              <View style={styles.autoRenewalTextContainer}>
                <Text style={styles.autoRenewalTitle}>
                  Add a renewal reminder automatically
                </Text>
                <Text style={styles.autoRenewalSubtitle}>
                  {`Assigned to ${firstMemberName || userName}, 6 months before`}
                </Text>
              </View>
              <Switch
                value={formData.autoRenewal ?? true}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, autoRenewal: val }))
                }
                trackColor={{ false: '#334155', true: '#F0913A' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Save Licence Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title={documentId ? 'Update licence' : 'Save licence'}
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
          pickerConfig.target === 'issueDate'
            ? formData.issueDate
            : formData.validTill,
        )}
        onConfirm={(date) => {
          if (pickerConfig.target === 'issueDate') {
            setFormData((prev) => ({ ...prev, issueDate: formatDate(date) }));
          } else if (pickerConfig.target === 'validTill') {
            setFormData((prev) => ({ ...prev, validTill: formatDate(date) }));
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
    </View>
  );
};

export default AddDrivingLicenceScreen;

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
  photoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  photoCard: {
    flex: 1,
    height: 94,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
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
  helperText: {
    color: '#64748B',
    fontSize: RFValue(10.5),
    marginTop: 4,
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

