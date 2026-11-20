import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import {
  AppDateTimePicker,
  AppImagePickerBottomSheet,
  formatDate,
  parseDateTimeString,
} from '../../../components';
import { PersonalInfoHeader } from '../components';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { getMyFamilyThunk } from '../../../redux/features/family/familySlice';
import {
  updateLifeProfileSectionThunk,
  fetchLifeProfileSectionThunk,
  fetchLifeProfileFullThunk,
} from '../../../redux/features/lifeProfile/lifeProfileSlice';
import { getMyMemberId } from '../../../units/asyncStorageManager';
import { buildVaccineItemPayload } from './vaccinationPayloadUtils';

export interface AddVaccineFormData {
  id?: string;
  vaccineName: string;
  dose: string;
  dateGiven: string;
  givenAt?: string;
  batchNumber?: string;
  certificateName?: string | null;
  certificateUri?: string | null;
  certificateScanId?: string | null;
  nextDue: string;
  remindMe: boolean;
  remindTiming: string;
  whoGetsReminder: string;
  remindMemberIds?: string[];
}

export const DEFAULT_VACCINE_FORM_DATA: AddVaccineFormData = {
  vaccineName: '',
  dose: 'Dose 1',
  dateGiven: '',
  givenAt: '',
  batchNumber: '',
  certificateName: null,
  nextDue: '',
  remindMe: true,
  remindTiming: '2 weeks before',
  whoGetsReminder: '',
};

export interface AddVaccineScreenProps {
  memberId?: string;
  initialData?: Partial<AddVaccineFormData>;
  childName?: string;
  onClose?: () => void;
  onSave?: (data: AddVaccineFormData) => void;
  onUploadCertificate?: () => void;
}

const AddVaccineScreen: React.FC<AddVaccineScreenProps> = ({
  memberId,
  initialData,
  childName = 'Aarav',
  onClose,
  onSave,
  onUploadCertificate,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const familyState = useAppSelector((state: any) => state.family);
  const rawMembers: any[] =
    familyState?.myFamilyData?.family?.members ||
    familyState?.family?.members ||
    familyState?.familyData?.family?.members ||
    [];
  const familyMembers = rawMembers;

  const [formData, setFormData] = useState<AddVaccineFormData>({
    ...DEFAULT_VACCINE_FORM_DATA,
    ...(initialData || {}),
  });

  const [showMembersModal, setShowMembersModal] = useState<boolean>(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    formData.remindMemberIds || []
  );

  React.useEffect(() => {
    dispatch(getMyFamilyThunk());
  }, [dispatch]);

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
          whoGetsReminder: prev.whoGetsReminder || validName,
        }));
        setSelectedMemberIds([validId]);
      }
    }
  }, [familyMembers, memberId]);

  const toggleMemberSelection = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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
      whoGetsReminder: names || 'Select members',
    }));
    setShowMembersModal(false);
  };

  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    target: 'dateGiven' | 'nextDue' | null;
    title: string;
    format: 'DD MMM YYYY' | 'MMM YYYY';
  }>({
    visible: false,
    target: null,
    title: '',
    format: 'DD MMM YYYY',
  });

  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (!formData.vaccineName?.trim()) {
      Alert.alert('Required', 'Please enter a vaccine name.');
      return;
    }

    setIsSaving(true);
    let targetMemberId = memberId;
    if (!targetMemberId || targetMemberId === 'me') {
      const stored = await getMyMemberId();
      if (stored) targetMemberId = stored;
    }

    const familyMembers =
      familyState?.myFamilyData?.family?.members ||
      familyState?.familyData?.family?.members ||
      [];
    const validRemindMemberIds =
      formData.remindMemberIds && formData.remindMemberIds.length > 0
        ? formData.remindMemberIds
        : selectedMemberIds.length > 0
        ? selectedMemberIds
        : familyMembers.map((m: any) => m.memberId || m.id).filter(Boolean);

    const vaccinePayload = buildVaccineItemPayload(formData, {
      id: (initialData as any)?.id || formData.id,
      certificateScanId: formData.certificateScanId || undefined,
      remindMemberIds:
        validRemindMemberIds.length > 0 ? validRemindMemberIds : undefined,
    });

    console.log('====================================');
    console.log('[AddVaccine] Submitting PATCH /life-profile with vaccine:');
    console.log(`[AddVaccine] Target MemberId: ${targetMemberId}`);
    console.log(
      JSON.stringify({ vaccination: { vaccines: [vaccinePayload] } }, null, 2),
    );
    console.log('====================================');

    try {
      if (targetMemberId) {
        await dispatch(
          updateLifeProfileSectionThunk({
            memberId: targetMemberId,
            payload: {
              vaccination: {
                vaccines: [vaccinePayload],
              },
            },
          }),
        ).unwrap();

        // Refresh vaccination section and full profile
        try {
          await Promise.all([
            dispatch(
              fetchLifeProfileSectionThunk({
                memberId: targetMemberId,
                section: 'vaccination',
              }),
            ),
            dispatch(fetchLifeProfileFullThunk({ memberId: targetMemberId })),
          ]);
        } catch (err) {
          console.log('[AddVaccine] Error refreshing profile:', err);
        }
      }

      if (onSave) {
        onSave(formData);
      } else if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.warn('[AddVaccine] Failed to save vaccine:', err);
      const msg = err?.message || err?.error || 'Failed to save vaccine record';
      Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectDose = () => {
    Alert.alert('Select Dose', 'Choose dose type', [
      { text: 'Dose 1', onPress: () => setFormData((p) => ({ ...p, dose: 'Dose 1' })) },
      { text: 'Dose 2', onPress: () => setFormData((p) => ({ ...p, dose: 'Dose 2' })) },
      { text: 'Dose 3', onPress: () => setFormData((p) => ({ ...p, dose: 'Dose 3' })) },
      { text: 'Booster', onPress: () => setFormData((p) => ({ ...p, dose: 'Booster' })) },
      { text: 'Yearly dose', onPress: () => setFormData((p) => ({ ...p, dose: 'Yearly dose' })) },
      { text: 'Not sure', onPress: () => setFormData((p) => ({ ...p, dose: 'Not sure' })) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSelectRemindTiming = () => {
    Alert.alert('Remind me', 'Select reminder time', [
      { text: '1 day before', onPress: () => setFormData((p) => ({ ...p, remindTiming: '1 day before' })) },
      { text: '1 week before', onPress: () => setFormData((p) => ({ ...p, remindTiming: '1 week before' })) },
      { text: '2 weeks before', onPress: () => setFormData((p) => ({ ...p, remindTiming: '2 weeks before' })) },
      { text: '1 month before', onPress: () => setFormData((p) => ({ ...p, remindTiming: '1 month before' })) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSelectWhoGetsReminder = () => {
    setShowMembersModal(true);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <PersonalInfoHeader
        title="Add vaccine record"
        subtitle={`${childName} · Section 4 of 5`}
        onBack={onClose}
        icon="close"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* SECTION 1: VACCINE */}
          <Text style={styles.sectionHeader}>VACCINE</Text>

          {/* Vaccine name * */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Vaccine name *</Text>
            <View style={styles.searchPickerField}>
              <View style={styles.searchPickerLeft}>
                <Feather
                  name="search"
                  size={16}
                  color="#8E9BAE"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchPickerInput}
                  value={formData.vaccineName}
                  placeholder="Type to search, or pick from the list"
                  placeholderTextColor="#60728B"
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, vaccineName: text }))
                  }
                />
              </View>
              <Feather name="chevron-down" size={18} color="#8E9BAE" />
            </View>
            <Text style={styles.helperText}>
              Type to search, or pick from the list
            </Text>
          </View>

          {/* Dose * */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Dose *</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.pickerField}
              onPress={handleSelectDose}
            >
              <Text style={styles.pickerValueText}>{formData.dose}</Text>
              <Feather name="chevron-down" size={18} color="#8E9BAE" />
            </TouchableOpacity>
            <Text style={styles.helperText}>
              Dose 1, Dose 2, Dose 3, Booster, Yearly, Not sure
            </Text>
          </View>

          {/* SECTION 2: GIVEN */}
          <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
            GIVEN
          </Text>

          {/* Date given * */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Date given *</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.datePickerCard}
              onPress={() =>
                setPickerConfig({
                  visible: true,
                  target: 'dateGiven',
                  title: 'Date Given',
                  format: 'DD MMM YYYY',
                })
              }
            >
              <Text
                style={[
                  styles.datePickerValueText,
                  !formData.dateGiven && { color: '#60728B' },
                ]}
              >
                {formData.dateGiven || 'Select date'}
              </Text>
              <Feather name="calendar" size={17} color="#8E9BAE" />
            </TouchableOpacity>
          </View>

          {/* Given at (optional) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Given at (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.givenAt}
              placeholder="Clinic or hospital name"
              placeholderTextColor="#60728B"
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, givenAt: text }))
              }
            />
          </View>

          {/* Batch number (optional) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Batch number (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.batchNumber}
              placeholder="e.g. FLU26-0931"
              placeholderTextColor="#60728B"
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, batchNumber: text }))
              }
            />
          </View>

          {/* Upload certificate button or Attached certificate preview */}
          {formData.certificateName ? (
            <View style={styles.uploadedCertCard}>
              <View style={styles.uploadedCertLeft}>
                <View style={styles.uploadedCertIconBox}>
                  <Feather name="file-text" size={17} color="#10B981" />
                </View>
                <View style={styles.uploadedCertInfo}>
                  <Text style={styles.uploadedCertName} numberOfLines={1}>
                    {formData.certificateName}
                  </Text>
                  <Text style={styles.uploadedCertStatus}>
                    Certificate attached ✓
                  </Text>
                </View>
              </View>

              <View style={styles.uploadedCertActions}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (onUploadCertificate) {
                      onUploadCertificate();
                    } else {
                      setShowImagePicker(true);
                    }
                  }}
                  style={styles.certActionBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Change certificate"
                >
                  <Feather name="edit-2" size={15} color="#8E9BAE" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      certificateName: null,
                      certificateUri: null,
                    }))
                  }
                  style={styles.certActionBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Remove certificate"
                >
                  <Feather name="trash-2" size={15} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.attachBtn}
              onPress={() => {
                if (onUploadCertificate) {
                  onUploadCertificate();
                } else {
                  setShowImagePicker(true);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Upload certificate"
            >
              <Feather name="paperclip" size={17} color="#F0913A" />
              <Text style={styles.attachBtnText}>Upload certificate</Text>
            </TouchableOpacity>
          )}

          {/* SECTION 3: NEXT DOSE */}
          <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
            NEXT DOSE
          </Text>

          {/* Next due */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Next due</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.datePickerCard}
              onPress={() =>
                setPickerConfig({
                  visible: true,
                  target: 'nextDue',
                  title: 'Next Due Date',
                  format: 'MMM YYYY',
                })
              }
            >
              <Text
                style={[
                  styles.datePickerValueText,
                  !formData.nextDue && { color: '#60728B' },
                ]}
              >
                {formData.nextDue || 'Select date'}
              </Text>
              <Feather name="calendar" size={17} color="#8E9BAE" />
            </TouchableOpacity>
            <Text style={styles.helperText}>
              Suggested from the vaccine schedule. You can change it.
            </Text>
          </View>

          {/* Remind me Switch Card */}
          <View style={styles.switchCard}>
            <View style={styles.switchCardContent}>
              <Text style={styles.switchCardTitle}>Remind me</Text>
              <Text style={styles.switchCardSubtitle}>
                Before the next dose
              </Text>
            </View>
            <Switch
              value={formData.remindMe}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, remindMe: val }))
              }
              trackColor={{ false: '#223554', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Remind me lead time */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Remind me</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.pickerField}
              onPress={handleSelectRemindTiming}
            >
              <Text style={styles.pickerValueText}>
                {formData.remindTiming}
              </Text>
              <Feather name="chevron-down" size={18} color="#8E9BAE" />
            </TouchableOpacity>
            <Text style={styles.helperText}>
              1 day, 1 week, 2 weeks, 1 month before
            </Text>
          </View>

          {/* Who gets the reminder */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Who gets the reminder</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.pickerField}
              onPress={handleSelectWhoGetsReminder}
            >
              <Text style={styles.pickerValueText}>
                {formData.whoGetsReminder}
              </Text>
              <Feather name="chevron-down" size={18} color="#8E9BAE" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title={isSaving ? 'Saving...' : 'Save'}
            disabled={isSaving}
            onPress={handleSave}
            backgroundColor={Colors.primary || '#F0913A'}
            textColor="#FFFFFF"
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
          pickerConfig.target === 'dateGiven'
            ? formData.dateGiven
            : formData.nextDue,
          'date',
        )}
        onConfirm={(selectedDate) => {
          if (pickerConfig.target === 'dateGiven') {
            setFormData((prev) => ({
              ...prev,
              dateGiven: formatDate(selectedDate, pickerConfig.format),
            }));
          } else if (pickerConfig.target === 'nextDue') {
            setFormData((prev) => ({
              ...prev,
              nextDue: formatDate(selectedDate, pickerConfig.format),
            }));
          }
          setPickerConfig((prev) => ({ ...prev, visible: false }));
        }}
        onCancel={() =>
          setPickerConfig((prev) => ({ ...prev, visible: false }))
        }
      />

      {/* Reusable Image/Certificate Picker Bottom Sheet */}
      <AppImagePickerBottomSheet
        visible={showImagePicker}
        title="Upload Vaccine Certificate"
        subtitle="Take a photo or choose an image from your gallery"
        onSelectImage={(image) => {
          setFormData((prev) => ({
            ...prev,
            certificateName: image.fileName || 'Vaccine_Certificate.jpg',
            certificateUri: image.path,
          }));
        }}
        onClose={() => setShowImagePicker(false)}
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
            <Text style={styles.modalTitle}>Who gets the reminder</Text>
            <Text style={styles.modalSubtitle}>
              Select family members who should receive this vaccine reminder
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
                        {member.fullName || member.name}
                      </Text>
                      <Text style={styles.memberRoleText}>
                        {member.familyRole || member.role || 'Family Member'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.memberCheckCircle,
                        isSelected && styles.memberCheckCircleSelected,
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
              title="Apply Selection"
              onPress={handleApplyMembers}
              backgroundColor={Colors.primary || '#F0913A'}
              textColor="#FFFFFF"
              height={50}
              borderRadius={25}
              marginTop={14}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default AddVaccineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#0A111F',
  },
  keyboardView: {
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
  sectionHeader: {
    color: '#F0913A',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  sectionHeaderSpaced: {
    marginTop: 22,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#12243F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
  },
  searchPickerField: {
    backgroundColor: '#12243F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchPickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPickerInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    paddingVertical: 0,
  },
  pickerField: {
    backgroundColor: '#12243F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValueText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '500',
  },
  helperText: {
    color: '#60728B',
    fontSize: RFValue(11),
    marginTop: 6,
    marginLeft: 2,
  },
  datePickerCard: {
    backgroundColor: '#12243F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerValueText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#F0913A',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(240, 145, 58, 0.05)',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  attachBtnText: {
    color: '#F0913A',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  uploadedCertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#12243F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  uploadedCertLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  uploadedCertIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  uploadedCertInfo: {
    flex: 1,
  },
  uploadedCertName: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
    marginBottom: 2,
  },
  uploadedCertStatus: {
    color: '#10B981',
    fontSize: RFValue(11),
    fontWeight: '500',
  },
  uploadedCertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  certActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchCard: {
    backgroundColor: '#12243F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchCardContent: {
    flex: 1,
    marginRight: 12,
  },
  switchCardTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  switchCardSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    marginTop: 3,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.background || '#0A111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F1D30',
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
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(12.5),
    lineHeight: 18,
    marginBottom: 16,
  },
  membersListContainer: {
    gap: 10,
    marginBottom: 10,
  },
  memberRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12243F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E324A',
    padding: 12,
  },
  memberRowCardSelected: {
    borderColor: '#F0913A',
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
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
    fontWeight: '700',
  },
  memberInfoCol: {
    flex: 1,
  },
  memberNameText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
    marginBottom: 2,
  },
  memberRoleText: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
  },
  memberCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberCheckCircleSelected: {
    borderColor: '#F0913A',
    backgroundColor: '#F0913A',
  },
});
