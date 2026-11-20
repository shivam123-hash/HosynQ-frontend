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
  Switch,
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
import {
  PersonalInfoInputFormData,
  DEFAULT_PERSONAL_INPUT_DATA,
} from './personalInfoUtils';

export type { PersonalInfoInputFormData };
export { DEFAULT_PERSONAL_INPUT_DATA };

export interface PersonalInfoInputScreenProps {
  initialData?: Partial<PersonalInfoInputFormData>;
  userName?: string;
  isLoading?: boolean;
  onClose?: () => void;
  onSave?: (data: PersonalInfoInputFormData) => void;
  onSelectOfficeLocation?: () => void;
}

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
const HEIGHT_OPTIONS = ['145', '150', '155', '158', '160', '162', '165', '168', '170', '175', '180', '185', '190'];
const WEIGHT_OPTIONS = ['40', '45', '50', '55', '58', '60', '65', '70', '75', '80', '85', '90', '95', '100'];

const STATUS_OPTIONS = [
  'Student',
  'College',
  'Working',
  'Business owner',
  'Homemaker',
  'Retired',
];

const WORK_MODE_OPTIONS = ['Office', 'Hybrid', 'Work from home'];

const SCHOOL_BOARDS = ['CBSE', 'ICSE', 'State board', 'IB', 'IGCSE', 'Other'];

const COMMUTE_OPTIONS = [
  'School bus',
  'Parent drop',
  'Auto or cab',
  'Walks',
  'Cycles',
  'Metro or city bus',
];

const COLLEGE_YEARS = ['1st year', '2nd year', '3rd year', '4th year', '5th year'];
const COLLEGE_SEMESTERS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];

const BUSINESS_TYPES = [
  'Services',
  'Shop / Retail',
  'Manufacturing',
  'Online',
  'Professional practice',
  'Other',
];

const RETIRED_WORKED_IN = [
  'Government',
  'Private company',
  'Own business',
  'Armed forces',
  'Teaching',
  'Other',
];

const RETIRED_YEARS = Array.from({ length: 45 }, (_, i) => String(2026 - i));

const DAYS_OF_WEEK = [
  { id: 'M', label: 'M', full: 'Mon' },
  { id: 'T', label: 'T', full: 'Tue' },
  { id: 'W', label: 'W', full: 'Wed' },
  { id: 'Th', label: 'T', full: 'Thu' },
  { id: 'F', label: 'F', full: 'Fri' },
  { id: 'Sa', label: 'S', full: 'Sat' },
  { id: 'Su', label: 'S', full: 'Sun' },
];

const HYBRID_OFFICE_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const PersonalInfoInputScreen: React.FC<PersonalInfoInputScreenProps> = ({
  initialData,
  userName = 'Priya',
  isLoading = false,
  onClose,
  onSave,
  onSelectOfficeLocation,
}) => {
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<PersonalInfoInputFormData>({
    ...DEFAULT_PERSONAL_INPUT_DATA,
    ...initialData,
  });

  const [securePension, setSecurePension] = useState(true);

  // Modal selector state
  const [modalType, setModalType] = useState<
    | 'role'
    | 'blood'
    | 'height'
    | 'weight'
    | 'board'
    | 'commute'
    | 'studyYear'
    | 'semester'
    | 'businessType'
    | 'retiredYear'
    | null
  >(null);

  // Date and Time picker state
  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    mode: 'date' | 'time';
    target: keyof PersonalInfoInputFormData | null;
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

  const toggleDayInList = (listKey: 'workDays' | 'schoolDays' | 'collegeDays' | 'businessDays' | 'marketDays' | 'officeDays', dayId: string) => {
    setFormData((prev) => {
      const currentList: string[] = (prev[listKey] as string[]) || [];
      const exists = currentList.includes(dayId);
      const updated = exists
        ? currentList.filter((d) => d !== dayId)
        : [...currentList, dayId];
      return { ...prev, [listKey]: updated };
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const firstName = formData.fullName.trim().split(' ')[0] || userName;

  const renderDaysSelector = (
    label: string,
    listKey: 'workDays' | 'schoolDays' | 'collegeDays' | 'businessDays' | 'marketDays',
  ) => {
    const currentList: string[] = (formData[listKey] as string[]) || [];
    return (
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.daysRow}>
          {DAYS_OF_WEEK.map((d, index) => {
            const isSelected = currentList.includes(d.id);
            return (
              <TouchableOpacity
                key={`${d.id}-${index}`}
                activeOpacity={0.7}
                onPress={() => toggleDayInList(listKey, d.id)}
                style={[
                  styles.dayCircle,
                  isSelected ? styles.dayCircleSelected : styles.dayCircleUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected ? styles.dayTextSelected : styles.dayTextUnselected,
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderTimePair = (
    startKey: keyof PersonalInfoInputFormData,
    endKey: keyof PersonalInfoInputFormData,
    startLabel: string = 'Starts',
    endLabel: string = 'Ends',
  ) => {
    return (
      <View style={styles.sideBySideRow}>
        <View style={styles.sideColumn}>
          <Text style={styles.fieldLabel}>{startLabel}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.selectorBox}
            onPress={() => {
              setPickerConfig({
                visible: true,
                mode: 'time',
                target: startKey,
                title: startLabel,
              });
            }}
          >
            <Text style={styles.selectorText}>{String(formData[startKey] || '')}</Text>
            <Feather name="clock" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.sideColumn}>
          <Text style={styles.fieldLabel}>{endLabel}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.selectorBox}
            onPress={() => {
              setPickerConfig({
                visible: true,
                mode: 'time',
                target: endKey,
                title: endLabel,
              });
            }}
          >
            <Text style={styles.selectorText}>{String(formData[endKey] || '')}</Text>
            <Feather name="clock" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
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
          {/* ==================================================== */}
          {/* SECTION 1: ABOUT YOU */}
          {/* ==================================================== */}
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

          {/* Gender */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Gender (optional, pick one)</Text>
            <View style={styles.pillsRow}>
              {GENDER_OPTIONS.map((g) => {
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
              <Feather name="calendar" size={17} color="#94A3B8" />
            </TouchableOpacity>
            {formData.age ? (
              <Text style={styles.helperText}>{formData.age}</Text>
            ) : null}
          </View>

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

          {/* ==================================================== */}
          {/* SECTION 2: WHAT BEST DESCRIBES YOU */}
          {/* ==================================================== */}
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

          {/* ==================================================== */}
          {/* STATUS 1: STUDENT */}
          {/* ==================================================== */}
          {formData.status === 'Student' && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>SCHOOL</Text>

              {/* School name * */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>School name *</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.schoolName}
                  onChangeText={(t) => updateField('schoolName', t)}
                  placeholder="Enter school name"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Board */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Board</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.selectorBox}
                  onPress={() => setModalType('board')}
                >
                  <Text style={styles.selectorText}>{formData.schoolBoard || 'Select board'}</Text>
                  <Feather name="chevron-down" size={18} color="#94A3B8" />
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  CBSE, ICSE, State board, IB, IGCSE, Other
                </Text>
              </View>

              {/* Class and Section side by side */}
              <View style={styles.sideBySideRow}>
                <View style={styles.sideColumn}>
                  <Text style={styles.fieldLabel}>Class *</Text>
                  <TextInput
                    style={styles.inputBox}
                    value={formData.classGrade}
                    onChangeText={(t) => updateField('classGrade', t)}
                    placeholder="e.g. Class 4"
                    placeholderTextColor="#64748B"
                  />
                </View>
                <View style={styles.sideColumn}>
                  <Text style={styles.fieldLabel}>Section</Text>
                  <TextInput
                    style={styles.inputBox}
                    value={formData.classSection}
                    onChangeText={(t) => updateField('classSection', t)}
                    placeholder="e.g. B"
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>

              {/* Roll number (optional) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Roll number (optional)</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.rollNumber}
                  onChangeText={(t) => updateField('rollNumber', t)}
                  placeholder="Enter roll number"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* School location * */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>School location *</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={[styles.inputBox, styles.inputFlex]}
                    value={formData.schoolLocation}
                    onChangeText={(t) => updateField('schoolLocation', t)}
                    placeholder="Enter school address or location"
                    placeholderTextColor="#64748B"
                  />
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.rightIcon}
                    onPress={onSelectOfficeLocation}
                    accessibilityLabel="Select on map"
                  >
                    <Feather name="map-pin" size={18} color="#38BDF8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* TIMINGS */}
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>TIMINGS</Text>
              {renderDaysSelector('School days', 'schoolDays')}
              {renderTimePair('schoolStartTime', 'schoolEndTime')}

              {/* GETTING THERE */}
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>GETTING THERE</Text>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>How they get there</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.selectorBox}
                  onPress={() => setModalType('commute')}
                >
                  <Text style={styles.selectorText}>{formData.commuteMode}</Text>
                  <Feather name="chevron-down" size={18} color="#94A3B8" />
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  School bus, Parent drops, Auto or cab, Walks, Cycles, Metro or city bus
                </Text>
              </View>

              {formData.commuteMode === 'School bus' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Bus route number</Text>
                  <TextInput
                    style={styles.inputBox}
                    value={formData.busRouteNumber}
                    onChangeText={(t) => updateField('busRouteNumber', t)}
                    placeholder="e.g. 7"
                    placeholderTextColor="#64748B"
                  />
                  <Text style={styles.helperText}>
                    This route number shows only when 'School bus' is chosen.
                  </Text>
                </View>
              )}
            </>
          )}

          {/* ==================================================== */}
          {/* STATUS 2: COLLEGE */}
          {/* ==================================================== */}
          {formData.status === 'College' && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>COLLEGE</Text>

              {/* College name * */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>College name *</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.collegeName}
                  onChangeText={(t) => updateField('collegeName', t)}
                  placeholder="e.g. Hindu College"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* University */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>University</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.university}
                  onChangeText={(t) => updateField('university', t)}
                  placeholder="e.g. University of Delhi"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Course * */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Course *</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.course}
                  onChangeText={(t) => updateField('course', t)}
                  placeholder="e.g. B.Com (Honours)"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Specialisation (optional) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Specialisation (optional)</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.specialisation}
                  onChangeText={(t) => updateField('specialisation', t)}
                  placeholder="e.g. Finance"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Year and Semester side by side */}
              <View style={styles.sideBySideRow}>
                <View style={styles.sideColumn}>
                  <Text style={styles.fieldLabel}>Year *</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.selectorBox}
                    onPress={() => setModalType('studyYear')}
                  >
                    <Text style={styles.selectorText}>{formData.studyYear}</Text>
                    <Feather name="chevron-down" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <View style={styles.sideColumn}>
                  <Text style={styles.fieldLabel}>Semester</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.selectorBox}
                    onPress={() => setModalType('semester')}
                  >
                    <Text style={styles.selectorText}>{formData.semester}</Text>
                    <Feather name="chevron-down" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Enrolment number (optional) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Enrolment number (optional)</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.enrolmentNumber}
                  onChangeText={(t) => updateField('enrolmentNumber', t)}
                  placeholder="e.g. DU-24-HC-0412"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Campus location * */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Campus location *</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={[styles.inputBox, styles.inputFlex]}
                    value={formData.campusLocation}
                    onChangeText={(t) => updateField('campusLocation', t)}
                    placeholder="Enter campus address or location"
                    placeholderTextColor="#64748B"
                  />
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.rightIcon}
                    onPress={onSelectOfficeLocation}
                    accessibilityLabel="Select on map"
                  >
                    <Feather name="map-pin" size={18} color="#38BDF8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* TIMINGS */}
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>TIMINGS</Text>
              {renderDaysSelector('Class days', 'collegeDays')}
              {renderTimePair('collegeStartTime', 'collegeEndTime')}

              {/* STAYING */}
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>STAYING</Text>
              <View style={styles.toggleRowCard}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleRowTitle}>Stays in a hostel or PG</Text>
                  <Text style={styles.helperText}>
                    Company won't expect them home on weekdays
                  </Text>
                </View>
                <Switch
                  value={formData.staysInHostel}
                  onValueChange={(v) => updateField('staysInHostel', v)}
                  trackColor={{ false: '#334155', true: '#F0913A' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {formData.staysInHostel && (
                <View style={[styles.fieldGroup, { marginTop: 12 }]}>
                  <Text style={styles.fieldLabel}>Hostel or PG address</Text>
                  <View style={styles.inputWithIcon}>
                    <TextInput
                      style={[styles.inputBox, styles.inputFlex]}
                      value={formData.hostelAddress}
                      onChangeText={(t) => updateField('hostelAddress', t)}
                      placeholder="e.g. Kamla Nagar, Delhi"
                      placeholderTextColor="#64748B"
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.rightIcon}
                      onPress={onSelectOfficeLocation}
                      accessibilityLabel="Select on map"
                    >
                      <Feather name="map-pin" size={18} color="#38BDF8" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helperText}>
                    Hostel address shows only when the toggle is on
                  </Text>
                </View>
              )}
            </>
          )}

          {/* ==================================================== */}
          {/* STATUS 3: WORKING */}
          {/* ==================================================== */}
          {formData.status === 'Working' && (
            <>
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

              {/* Department (optional) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Department (optional)</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.department}
                  onChangeText={(t) => updateField('department', t)}
                  placeholder="e.g. Residential projects"
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
              {formData.workMode !== 'Work from home' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Office location *</Text>
                  <View style={styles.inputWithIcon}>
                    <TextInput
                      style={[styles.inputBox, styles.inputFlex]}
                      value={formData.officeLocation}
                      onChangeText={(t) => updateField('officeLocation', t)}
                      placeholder="Enter office address or location"
                      placeholderTextColor="#64748B"
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.rightIcon}
                      onPress={onSelectOfficeLocation}
                      accessibilityLabel="Select on map"
                    >
                      <Feather name="map-pin" size={18} color="#38BDF8" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helperText}>
                    Type your office address (or tap pin for map)
                  </Text>
                </View>
              )}

              {/* TIMINGS */}
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>TIMINGS</Text>
              {renderDaysSelector('Work days', 'workDays')}
              {renderTimePair('startTime', 'endTime')}

              {/* Hybrid Office Days */}
              {formData.workMode === 'Hybrid' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Office days (Hybrid only, multi choice)
                  </Text>
                  <View style={styles.pillsRow}>
                    {HYBRID_OFFICE_DAYS.map((od) => {
                      const isSelected = formData.officeDays?.includes(od);
                      return (
                        <TouchableOpacity
                          key={od}
                          activeOpacity={0.7}
                          onPress={() => toggleDayInList('officeDays', od)}
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
                            {od}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* CONTACT (OPTIONAL) */}
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>
                CONTACT (OPTIONAL)
              </Text>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Office phone</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.workPhone}
                  onChangeText={(t) => updateField('workPhone', t)}
                  placeholder="+91 124 455 7788"
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Work email</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.workEmail}
                  onChangeText={(t) => updateField('workEmail', t)}
                  placeholder="priya@kaveridesign.example"
                  placeholderTextColor="#64748B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </>
          )}

          {/* ==================================================== */}
          {/* STATUS 4: BUSINESS OWNER */}
          {/* ==================================================== */}
          {formData.status === 'Business owner' && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>BUSINESS</Text>

              {/* Business name * */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Business name *</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.businessName}
                  onChangeText={(t) => updateField('businessName', t)}
                  placeholder="e.g. Kaveri Interiors"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Type of business * */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Type of business *</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.selectorBox}
                  onPress={() => setModalType('businessType')}
                >
                  <Text style={styles.selectorText}>{formData.businessType}</Text>
                  <Feather name="chevron-down" size={18} color="#94A3B8" />
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Shop, Services, Manufacturing, Online, Professional practice, Other
                </Text>
              </View>

              {/* What it does (optional) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>What it does (optional)</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.businessDescription}
                  onChangeText={(t) => updateField('businessDescription', t)}
                  placeholder="Interior design for homes and offices"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Your role (optional) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Your role (optional)</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.businessRole}
                  onChangeText={(t) => updateField('businessRole', t)}
                  placeholder="Founder"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* GSTIN (optional) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>GSTIN (optional)</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.gstin}
                  onChangeText={(t) => updateField('gstin', t)}
                  placeholder="06ABCDE1234F1Z5"
                  placeholderTextColor="#64748B"
                  autoCapitalize="characters"
                  maxLength={15}
                />
                <Text style={styles.helperText}>15 characters</Text>
              </View>

              {/* Business location * */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Business location *</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={[styles.inputBox, styles.inputFlex]}
                    value={formData.businessLocation}
                    onChangeText={(t) => updateField('businessLocation', t)}
                    placeholder="Enter business address or location"
                    placeholderTextColor="#64748B"
                  />
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.rightIcon}
                    onPress={onSelectOfficeLocation}
                    accessibilityLabel="Select on map"
                  >
                    <Feather name="map-pin" size={18} color="#38BDF8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* TIMINGS */}
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>TIMINGS</Text>
              {renderDaysSelector('Working days', 'businessDays')}
              {renderTimePair('businessStartTime', 'businessEndTime', 'Opens', 'Closes')}

              {/* CONTACT (OPTIONAL) */}
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>
                CONTACT (OPTIONAL)
              </Text>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Business phone</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.businessPhone}
                  onChangeText={(t) => updateField('businessPhone', t)}
                  placeholder="+91 98990 44556"
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                />
              </View>
            </>
          )}

          {/* ==================================================== */}
          {/* STATUS 5: HOMEMAKER */}
          {/* ==================================================== */}
          {formData.status === 'Homemaker' && (
            <>
              {/* Info Note Callout */}
              <View style={styles.calloutCard}>
                <Feather name="info" size={17} color="#F0913A" />
                <Text style={styles.calloutText}>
                  No required fields for Homemaker. Everything below is optional and helps
                  HosynQ plan around your day.
                </Text>
              </View>

              {/* USUAL ROUTINE */}
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>
                USUAL ROUTINE (OPTIONAL)
              </Text>
              {renderTimePair(
                'homemakerStartTime',
                'homemakerEndTime',
                'Busiest from',
                'Until',
              )}
              {renderDaysSelector('Market or errand days', 'marketDays')}

              {/* Regular commitments */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Regular commitments</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.regularCommitments}
                  onChangeText={(t) => updateField('regularCommitments', t)}
                  placeholder="Yoga class, Tue and Thu, 6:00 PM"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Handles school runs */}
              <View style={styles.toggleRowCard}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleRowTitle}>Handles school runs</Text>
                  <Text style={styles.helperText}>
                    Shows school pick/drop in your day
                  </Text>
                </View>
                <Switch
                  value={formData.handlesSchoolRuns}
                  onValueChange={(v) => updateField('handlesSchoolRuns', v)}
                  trackColor={{ false: '#334155', true: '#F0913A' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </>
          )}

          {/* ==================================================== */}
          {/* STATUS 6: RETIRED */}
          {/* ==================================================== */}
          {formData.status === 'Retired' && (
            <>
              {/* Info Note Callout */}
              <View style={styles.calloutCard}>
                <Feather name="info" size={17} color="#38BDF8" />
                <Text style={styles.calloutText}>
                  Everything below is optional.
                </Text>
              </View>

              {/* EARLIER WORK */}
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>
                EARLIER WORK (OPTIONAL)
              </Text>

              {/* Worked in (pick one) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Worked in (pick one)</Text>
                <View style={styles.pillsRow}>
                  {RETIRED_WORKED_IN.map((w) => {
                    const isSelected = formData.workedIn === w;
                    return (
                      <TouchableOpacity
                        key={w}
                        activeOpacity={0.7}
                        onPress={() => updateField('workedIn', w)}
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
                          {w}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Last role */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Last role</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.lastRole}
                  onChangeText={(t) => updateField('lastRole', t)}
                  placeholder="e.g. Hindi teacher"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Organisation */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Organisation</Text>
                <TextInput
                  style={styles.inputBox}
                  value={formData.organisation}
                  onChangeText={(t) => updateField('organisation', t)}
                  placeholder="e.g. Govt. Girls Senior Secondary School"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Retired in (year) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Retired in (year)</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.selectorBox}
                  onPress={() => setModalType('retiredYear')}
                >
                  <Text style={styles.selectorText}>{formData.retiredYear || 'Select year'}</Text>
                  <Feather name="chevron-down" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Pension or PPO number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Pension or PPO number</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={[styles.inputBox, styles.inputFlex]}
                    value={formData.pensionNumber}
                    onChangeText={(t) => updateField('pensionNumber', t)}
                    placeholder="Enter pension number"
                    placeholderTextColor="#64748B"
                    secureTextEntry={securePension}
                  />
                  <TouchableOpacity
                    style={styles.rightIcon}
                    onPress={() => setSecurePension(!securePension)}
                  >
                    <Feather
                      name={securePension ? 'eye-off' : 'eye'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>
                  Saved privately. Only adults can see it.
                </Text>
              </View>

              {/* DAILY ROUTINE (OPTIONAL) */}
              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>
                DAILY ROUTINE (OPTIONAL)
              </Text>
              {renderTimePair('wakeUpTime', 'sleepTime', 'Wakes up', 'Sleeps')}
            </>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title="Save"
            onPress={handleSave}
            loading={isLoading}
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
                : modalType === 'weight'
                ? 'Select Weight (kg)'
                : modalType === 'board'
                ? 'Select School Board'
                : modalType === 'commute'
                ? 'Select Commute Mode'
                : modalType === 'studyYear'
                ? 'Select Study Year'
                : modalType === 'semester'
                ? 'Select Semester'
                : modalType === 'businessType'
                ? 'Select Business Type'
                : 'Select Retired Year'}
            </Text>
            <ScrollView style={{ maxHeight: 280 }}>
              {(modalType === 'role'
                ? FAMILY_ROLES
                : modalType === 'blood'
                ? BLOOD_GROUPS
                : modalType === 'height'
                ? HEIGHT_OPTIONS
                : modalType === 'weight'
                ? WEIGHT_OPTIONS
                : modalType === 'board'
                ? SCHOOL_BOARDS
                : modalType === 'commute'
                ? COMMUTE_OPTIONS
                : modalType === 'studyYear'
                ? COLLEGE_YEARS
                : modalType === 'semester'
                ? COLLEGE_SEMESTERS
                : modalType === 'businessType'
                ? BUSINESS_TYPES
                : RETIRED_YEARS
              ).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalOption}
                  onPress={() => {
                    if (modalType === 'role') updateField('familyRole', opt);
                    if (modalType === 'blood') updateField('bloodGroup', opt);
                    if (modalType === 'height') updateField('height', opt);
                    if (modalType === 'weight') updateField('weight', opt);
                    if (modalType === 'board') updateField('schoolBoard', opt);
                    if (modalType === 'commute') updateField('commuteMode', opt);
                    if (modalType === 'studyYear') updateField('studyYear', opt);
                    if (modalType === 'semester') updateField('semester', opt);
                    if (modalType === 'businessType') updateField('businessType', opt);
                    if (modalType === 'retiredYear') updateField('retiredYear', opt);
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
          pickerConfig.target
            ? String(formData[pickerConfig.target] || '')
            : '',
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
          } else if (pickerConfig.target) {
            updateField(pickerConfig.target, formatTime(date));
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
    lineHeight: 15,
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
  toggleRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121C2F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginTop: 6,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 12,
  },
  toggleRowTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  calloutCard: {
    backgroundColor: 'rgba(18, 28, 47, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 8,
    gap: 10,
  },
  calloutText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: RFValue(11.5),
    lineHeight: 17,
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
