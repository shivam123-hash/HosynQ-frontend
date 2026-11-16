import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import {
  AppDateTimePicker,
  formatDate,
  formatTime,
  parseDateTimeString,
} from '../../../components';
import { PersonalInfoHeader } from '../components';

export interface PersonalInfoInputFormData {
  fullName: string;
  nickname: string;
  email: string;
  familyRole: string;
  gender: string;
  birthDate: string;
  age: string;
  bloodGroup: string;
  height: string;
  weight: string;
  status: string;
  companyName: string;
  designation: string;
  workMode: string;
  officeLocation: string;
  workDays: string[];
  startTime: string;
  endTime: string;
}

export interface PersonalInfoInputScreenProps {
  initialData?: Partial<PersonalInfoInputFormData>;
  userName?: string;
  onClose?: () => void;
  onSave?: (data: PersonalInfoInputFormData) => void;
  onSelectOfficeLocation?: () => void;
}

export const DEFAULT_PERSONAL_INPUT_DATA: PersonalInfoInputFormData = {
  fullName: 'Priya Sharma',
  nickname: 'Pri',
  email: 'priya.sharma@example.com',
  familyRole: 'Mother',
  gender: 'Female',
  birthDate: '8 Aug 1988',
  age: '38 years old',
  bloodGroup: 'O+',
  height: '162',
  weight: '58',
  status: 'Working',
  companyName: 'Kaveri Design Studio',
  designation: 'Interior designer',
  workMode: 'Hybrid',
  officeLocation: 'Udyog Vihar Phase 4, Gurugram',
  workDays: ['M', 'T', 'W', 'Th', 'F', 'Sa'], // 6 active days
  startTime: '10:00 AM',
  endTime: '6:30 PM',
};

const FAMILY_ROLES = [
  'Mother',
  'Father',
  'Daughter',
  'Son',
  'Grandmother',
  'Grandfather',
  'Spouse',
  'Other',
];

const GENDER_OPTIONS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const HEIGHT_OPTIONS = ['150', '155', '158', '160', '162', '165', '168', '170', '175', '180'];

const WEIGHT_OPTIONS = ['45', '50', '55', '58', '60', '65', '70', '75', '80', '85'];

const STATUS_OPTIONS = [
  'Student',
  'College',
  'Working',
  'Business owner',
  'Homemaker',
  'Retired',
];

const WORK_MODE_OPTIONS = ['Office', 'Hybrid', 'Work from home'];

const DAYS_OF_WEEK = [
  { id: 'M', label: 'M' },
  { id: 'T', label: 'T' },
  { id: 'W', label: 'W' },
  { id: 'Th', label: 'T' },
  { id: 'F', label: 'F' },
  { id: 'Sa', label: 'S' },
  { id: 'Su', label: 'S' },
];

const PersonalInfoInputScreen: React.FC<PersonalInfoInputScreenProps> = ({
  initialData,
  userName = 'Priya',
  onClose,
  onSave,
  onSelectOfficeLocation,
}) => {
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<PersonalInfoInputFormData>({
    ...DEFAULT_PERSONAL_INPUT_DATA,
    ...initialData,
  });

  // Modal selector state
  const [modalType, setModalType] = useState<
    'role' | 'blood' | 'height' | 'weight' | null
  >(null);

  // Date and Time picker state
  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    mode: 'date' | 'time';
    target: 'birthDate' | 'startTime' | 'endTime' | null;
    title: string;
  }>({
    visible: false,
    mode: 'date',
    target: null,
    title: '',
  });

  const updateField = <K extends keyof PersonalInfoInputFormData>(
    key: K,
    val: PersonalInfoInputFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const toggleDay = (dayId: string) => {
    setFormData((prev) => {
      const exists = prev.workDays.includes(dayId);
      const updated = exists
        ? prev.workDays.filter((d) => d !== dayId)
        : [...prev.workDays, dayId];
      return { ...prev, workDays: updated };
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const firstName = formData.fullName.trim().split(' ')[0] || userName;

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
        title="Personal information"
        subtitle={`${firstName} · Section 1 of 5 · Edit`}
        onBack={onClose}
        icon="close"
      />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* SECTION 1: ABOUT YOU */}
          <Text style={styles.sectionHeader}>ABOUT YOU</Text>

          {/* Full name * */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full name *</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.fullName}
              onChangeText={(t) => updateField('fullName', t)}
              placeholder="Enter full name"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Nickname (optional) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nickname (optional)</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.nickname}
              onChangeText={(t) => updateField('nickname', t)}
              placeholder="Enter nickname"
              placeholderTextColor="#64748B"
              maxLength={20}
            />
            <Text style={styles.helperText}>Max 20 characters</Text>
          </View>

          {/* Email * */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email *</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.inputBox, styles.inputFlex]}
                value={formData.email}
                onChangeText={(t) => updateField('email', t)}
                placeholder="Enter email"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Feather
                name="mail"
                size={18}
                color="#64748B"
                style={styles.rightIcon}
              />
            </View>
          </View>

          {/* Family role * */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Family role *</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.selectorBox}
              onPress={() => setModalType('role')}
            >
              <Text style={styles.selectorText}>{formData.familyRole}</Text>
              <Feather name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Gender (optional, pick one) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Gender (optional, pick one)</Text>
            <View style={styles.pillsRow}>
              {GENDER_OPTIONS.slice(0, 3).map((g) => {
                const isSelected = formData.gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    activeOpacity={0.7}
                    onPress={() => updateField('gender', g)}
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
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={[styles.pillsRow, { marginTop: 8 }]}>
              {GENDER_OPTIONS.slice(3).map((g) => {
                const isSelected = formData.gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    activeOpacity={0.7}
                    onPress={() => updateField('gender', g)}
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
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Birth date * */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Birth date *</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.selectorBox}
              onPress={() => {
                setPickerConfig({
                  visible: true,
                  mode: 'date',
                  target: 'birthDate',
                  title: 'Select Birth Date',
                });
              }}
            >
              <Text style={styles.selectorText}>{formData.birthDate}</Text>
              <Feather name="calendar" size={18} color="#94A3B8" />
            </TouchableOpacity>
            <Text style={styles.helperText}>{formData.age}</Text>
          </View>

          {/* SECTION 2: BODY */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>BODY</Text>

          {/* Blood group */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Blood group</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.selectorBox}
              onPress={() => setModalType('blood')}
            >
              <Text style={styles.selectorText}>{formData.bloodGroup}</Text>
              <Feather name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Height and Weight side-by-side */}
          <View style={styles.sideBySideRow}>
            {/* Height */}
            <View style={styles.sideColumn}>
              <Text style={styles.fieldLabel}>Height</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.selectorBox}
                onPress={() => setModalType('height')}
              >
                <Text style={styles.selectorText}>{formData.height}</Text>
                <Feather name="chevron-down" size={18} color="#94A3B8" />
              </TouchableOpacity>
              <Text style={styles.helperText}>cm</Text>
            </View>

            {/* Weight */}
            <View style={styles.sideColumn}>
              <Text style={styles.fieldLabel}>Weight</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.selectorBox}
                onPress={() => setModalType('weight')}
              >
                <Text style={styles.selectorText}>{formData.weight}</Text>
                <Feather name="chevron-down" size={18} color="#94A3B8" />
              </TouchableOpacity>
              <Text style={styles.helperText}>kg</Text>
            </View>
          </View>

          {/* SECTION 3: WHAT BEST DESCRIBES YOU */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>
            WHAT BEST DESCRIBES YOU
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Status (pick one)</Text>

            <View style={styles.statusGrid}>
              <View style={styles.pillsRow}>
                {STATUS_OPTIONS.slice(0, 3).map((st) => {
                  const isSelected = formData.status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      activeOpacity={0.7}
                      onPress={() => updateField('status', st)}
                      style={[
                        styles.statusPill,
                        isSelected && styles.pillButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          isSelected && styles.pillTextSelected,
                        ]}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.pillsRow, { marginTop: 8 }]}>
                {STATUS_OPTIONS.slice(3).map((st) => {
                  const isSelected = formData.status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      activeOpacity={0.7}
                      onPress={() => updateField('status', st)}
                      style={[
                        styles.statusPill,
                        isSelected && styles.pillButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          isSelected && styles.pillTextSelected,
                        ]}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Text style={styles.infoNoteText}>
              Each status shows its own fields below. Switching keeps what was
              typed until you save.
            </Text>
          </View>

          {/* SECTION 4: WORK */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>WORK</Text>

          {/* Company name * */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Company name *</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.companyName}
              onChangeText={(t) => updateField('companyName', t)}
              placeholder="Enter company name"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Designation * */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Designation *</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.designation}
              onChangeText={(t) => updateField('designation', t)}
              placeholder="Enter designation"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Work mode (pick one) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Work mode (pick one)</Text>
            <View style={styles.pillsRow}>
              {WORK_MODE_OPTIONS.map((wm) => {
                const isSelected = formData.workMode === wm;
                return (
                  <TouchableOpacity
                    key={wm}
                    activeOpacity={0.7}
                    onPress={() => updateField('workMode', wm)}
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
                      {wm}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Office location */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Office location</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.locationCard}
              onPress={onSelectOfficeLocation}
            >
              <Feather name="map-pin" size={17} color="#38BDF8" />
              <Text style={styles.locationText} numberOfLines={1}>
                {formData.officeLocation}
              </Text>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Work days */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Work days</Text>
            <View style={styles.daysRow}>
              {DAYS_OF_WEEK.map((d, index) => {
                const isSelected = formData.workDays.includes(d.id);
                return (
                  <TouchableOpacity
                    key={`${d.id}-${index}`}
                    activeOpacity={0.7}
                    onPress={() => toggleDay(d.id)}
                    style={[
                      styles.dayCircle,
                      isSelected
                        ? styles.dayCircleSelected
                        : styles.dayCircleUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected
                          ? styles.dayTextSelected
                          : styles.dayTextUnselected,
                      ]}
                    >
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Starts and Ends side-by-side */}
          <View style={styles.sideBySideRow}>
            {/* Starts */}
            <View style={styles.sideColumn}>
              <Text style={styles.fieldLabel}>Starts</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.selectorBox}
                onPress={() => {
                  setPickerConfig({
                    visible: true,
                    mode: 'time',
                    target: 'startTime',
                    title: 'Work Start Time',
                  });
                }}
              >
                <Text style={styles.selectorText}>{formData.startTime}</Text>
                <Feather name="clock" size={17} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Ends */}
            <View style={styles.sideColumn}>
              <Text style={styles.fieldLabel}>Ends</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.selectorBox}
                onPress={() => {
                  setPickerConfig({
                    visible: true,
                    mode: 'time',
                    target: 'endTime',
                    title: 'Work End Time',
                  });
                }}
              >
                <Text style={styles.selectorText}>{formData.endTime}</Text>
                <Feather name="clock" size={17} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Work info card note */}
          <View style={styles.workInfoCard}>
            <Feather
              name="info"
              size={15}
              color="#64748B"
              style={{ marginTop: 2 }}
            />
            <Text style={styles.workInfoText}>
              Fields under WORK change with Status. See LPF-02 to LPF-07 for
              every status.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title="Save"
            onPress={handleSave}
            backgroundColor={Colors.primary || '#F0913A'}
            textColor="#FFFFFF"
            height={52}
            borderRadius={26}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Selector Modal */}
      <Modal
        visible={modalType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModalType(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalType(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'role'
                ? 'Select Family Role'
                : modalType === 'blood'
                ? 'Select Blood Group'
                : modalType === 'height'
                ? 'Select Height (cm)'
                : 'Select Weight (kg)'}
            </Text>
            <ScrollView style={{ maxHeight: 280 }}>
              {(modalType === 'role'
                ? FAMILY_ROLES
                : modalType === 'blood'
                ? BLOOD_GROUPS
                : modalType === 'height'
                ? HEIGHT_OPTIONS
                : WEIGHT_OPTIONS
              ).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalOption}
                  onPress={() => {
                    if (modalType === 'role') updateField('familyRole', opt);
                    if (modalType === 'blood') updateField('bloodGroup', opt);
                    if (modalType === 'height') updateField('height', opt);
                    if (modalType === 'weight') updateField('weight', opt);
                    setModalType(null);
                  }}
                >
                  <Text style={styles.modalOptionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date & Time Picker */}
      <AppDateTimePicker
        visible={pickerConfig.visible}
        mode={pickerConfig.mode}
        title={pickerConfig.title}
        date={parseDateTimeString(
          pickerConfig.target === 'birthDate'
            ? formData.birthDate
            : pickerConfig.target === 'startTime'
            ? formData.startTime
            : formData.endTime,
          pickerConfig.mode,
        )}
        onConfirm={(date) => {
          if (pickerConfig.target === 'birthDate') {
            const formatted = formatDate(date);
            const now = new Date();
            let ageYears = now.getFullYear() - date.getFullYear();
            const m = now.getMonth() - date.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < date.getDate())) {
              ageYears--;
            }
            setFormData((prev) => ({
              ...prev,
              birthDate: formatted,
              age: `${ageYears} years old`,
            }));
          } else if (pickerConfig.target === 'startTime') {
            setFormData((prev) => ({ ...prev, startTime: formatTime(date) }));
          } else if (pickerConfig.target === 'endTime') {
            setFormData((prev) => ({ ...prev, endTime: formatTime(date) }));
          }
          setPickerConfig((prev) => ({ ...prev, visible: false }));
        }}
        onCancel={() =>
          setPickerConfig((prev) => ({ ...prev, visible: false }))
        }
      />
    </View>
  );
};

export default PersonalInfoInputScreen;

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
  sectionHeader: {
    color: '#F0913A',
    fontSize: RFValue(11.5),
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#94A3B8',
    fontSize: RFValue(12),
    fontWeight: '500',
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
    paddingRight: 42,
  },
  rightIcon: {
    position: 'absolute',
    right: 14,
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
    fontWeight: '500',
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
  statusPill: {
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 14,
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
    fontSize: RFValue(12.5),
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sideBySideRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sideColumn: {
    flex: 1,
  },
  statusGrid: {
    marginBottom: 8,
  },
  infoNoteText: {
    color: '#64748B',
    fontSize: RFValue(10.5),
    lineHeight: 16,
    marginTop: 6,
  },
  locationCard: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#121C2F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: RFValue(13),
    marginLeft: 10,
    marginRight: 6,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleSelected: {
    backgroundColor: '#F0913A',
  },
  dayCircleUnselected: {
    backgroundColor: '#121C2F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayText: {
    fontSize: RFValue(13),
  },
  dayTextSelected: {
    color: '#0A111F',
    fontWeight: '800',
  },
  dayTextUnselected: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  workInfoCard: {
    backgroundColor: 'rgba(18, 28, 47, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },
  workInfoText: {
    flex: 1,
    color: '#64748B',
    fontSize: RFValue(10.5),
    lineHeight: 15,
    marginLeft: 8,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background || '#0A111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#121C2F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(15),
    fontWeight: '700',
    marginBottom: 14,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalOptionText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
  },
});

