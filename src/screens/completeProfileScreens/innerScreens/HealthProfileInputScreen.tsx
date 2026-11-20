import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import {
  AppDateTimePicker,
  formatDate,
  parseDateTimeString,
} from '../../../components';
import { PersonalInfoHeader } from '../components';

export interface HealthDoctorData {
  doctorName: string;
  speciality: string;
  phoneCode: string;
  phoneNumber: string;
  clinicName: string;
  clinicLocation: string;
}

export interface HealthHospitalData {
  preferredHospital: string;
}

export interface HealthItemChip {
  id: string;
  label: string;
}

export interface HealthCheckupData {
  lastCheckup: string;
  nextCheckup: string;
  repeatEvery: string;
}

export interface HealthEyesightData {
  wears: 'Glasses' | 'Contacts' | 'Neither';
  rightEyePower: string;
  leftEyePower: string;
  lastEyeTest: string;
  attachedReport?: string | null;
}

export interface HealthProfileFormValues {
  doctor: HealthDoctorData;
  hospital: HealthHospitalData;
  allergies: HealthItemChip[];
  conditions: HealthItemChip[];
  medications: HealthItemChip[];
  checkups: HealthCheckupData;
  eyesight: HealthEyesightData;
}

export const DEFAULT_HEALTH_FORM_VALUES: HealthProfileFormValues = {
  doctor: {
    doctorName: '',
    speciality: '',
    phoneCode: '+91',
    phoneNumber: '',
    clinicName: '',
    clinicLocation: '',
  },
  hospital: {
    preferredHospital: '',
  },
  allergies: [],
  conditions: [],
  medications: [],
  checkups: {
    lastCheckup: '',
    nextCheckup: '',
    repeatEvery: '1 year',
  },
  eyesight: {
    wears: 'Neither',
    rightEyePower: '',
    leftEyePower: '',
    lastEyeTest: '',
    attachedReport: null,
  },
};

export interface HealthProfileInputScreenProps {
  initialValues?: Partial<HealthProfileFormValues>;
  userName?: string;
  onClose?: () => void;
  onSave?: (values: HealthProfileFormValues) => void;
  onSelectClinicLocation?: () => void;
  onSelectHospital?: () => void;
}

const HealthProfileInputScreen: React.FC<HealthProfileInputScreenProps> = ({
  initialValues,
  userName = 'Priya',
  onClose,
  onSave,
  onSelectClinicLocation,
  onSelectHospital,
}) => {
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<HealthProfileFormValues>({
    ...DEFAULT_HEALTH_FORM_VALUES,
    ...(initialValues || {}),
    doctor: {
      ...DEFAULT_HEALTH_FORM_VALUES.doctor,
      ...(initialValues?.doctor || {}),
    },
    hospital: {
      ...DEFAULT_HEALTH_FORM_VALUES.hospital,
      ...(initialValues?.hospital || {}),
    },
    checkups: {
      ...DEFAULT_HEALTH_FORM_VALUES.checkups,
      ...(initialValues?.checkups || {}),
    },
    eyesight: {
      ...DEFAULT_HEALTH_FORM_VALUES.eyesight,
      ...(initialValues?.eyesight || {}),
    },
    allergies: initialValues?.allergies || DEFAULT_HEALTH_FORM_VALUES.allergies,
    conditions:
      initialValues?.conditions || DEFAULT_HEALTH_FORM_VALUES.conditions,
    medications:
      initialValues?.medications || DEFAULT_HEALTH_FORM_VALUES.medications,
  });

  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    target: 'lastCheckup' | 'nextCheckup' | 'lastEyeTest' | null;
    title: string;
    format: 'DD MMM YYYY' | 'MMM YYYY';
  }>({
    visible: false,
    target: null,
    title: '',
    format: 'DD MMM YYYY',
  });

  // Adding chip state
  const [newAllergyText, setNewAllergyText] = useState('');
  const [isAddingAllergy, setIsAddingAllergy] = useState(false);

  const [newConditionText, setNewConditionText] = useState('');
  const [isAddingCondition, setIsAddingCondition] = useState(false);

  const [newMedicationText, setNewMedicationText] = useState('');
  const [isAddingMedication, setIsAddingMedication] = useState(false);

  const handleRemoveAllergy = (id: string) => {
    setForm((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a.id !== id),
    }));
  };

  const handleAddAllergy = () => {
    if (!newAllergyText.trim()) {
      setIsAddingAllergy(false);
      return;
    }
    const newChip: HealthItemChip = {
      id: Date.now().toString(),
      label: newAllergyText.trim(),
    };
    setForm((prev) => ({
      ...prev,
      allergies: [...prev.allergies, newChip],
    }));
    setNewAllergyText('');
    setIsAddingAllergy(false);
  };

  const handleRemoveCondition = (id: string) => {
    setForm((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== id),
    }));
  };

  const handleAddCondition = () => {
    if (!newConditionText.trim()) {
      setIsAddingCondition(false);
      return;
    }
    const newChip: HealthItemChip = {
      id: Date.now().toString(),
      label: newConditionText.trim(),
    };
    setForm((prev) => ({
      ...prev,
      conditions: [...prev.conditions, newChip],
    }));
    setNewConditionText('');
    setIsAddingCondition(false);
  };

  const handleRemoveMedication = (id: string) => {
    setForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== id),
    }));
  };

  const handleAddMedication = () => {
    if (!newMedicationText.trim()) {
      setIsAddingMedication(false);
      return;
    }
    const newChip: HealthItemChip = {
      id: Date.now().toString(),
      label: newMedicationText.trim(),
    };
    setForm((prev) => ({
      ...prev,
      medications: [...prev.medications, newChip],
    }));
    setNewMedicationText('');
    setIsAddingMedication(false);
  };

  const handleSave = () => {
    onSave?.(form);
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
        title="Health profile"
        subtitle={`${userName} · Section 3 of 5 · Edit`}
        onBack={onClose}
        icon="close"
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* SECTION 1: DOCTOR */}
          <Text style={styles.sectionHeader}>DOCTOR</Text>

          {/* Doctor's name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Doctor's name</Text>
            <TextInput
              style={styles.textInput}
              value={form.doctor.doctorName}
              placeholder="Dr. Anjali Rao"
              placeholderTextColor="#60728B"
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  doctor: { ...prev.doctor, doctorName: text },
                }))
              }
            />
          </View>

          {/* Speciality */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Speciality</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.pickerField}
              onPress={() => {
                Alert.alert(
                  'Speciality',
                  'Select doctor speciality',
                  [
                    {
                      text: 'General physician',
                      onPress: () =>
                        setForm((prev) => ({
                          ...prev,
                          doctor: {
                            ...prev.doctor,
                            speciality: 'General physician',
                          },
                        })),
                    },
                    {
                      text: 'Pediatrician',
                      onPress: () =>
                        setForm((prev) => ({
                          ...prev,
                          doctor: { ...prev.doctor, speciality: 'Pediatrician' },
                        })),
                    },
                    {
                      text: 'Cardiologist',
                      onPress: () =>
                        setForm((prev) => ({
                          ...prev,
                          doctor: { ...prev.doctor, speciality: 'Cardiologist' },
                        })),
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ],
                );
              }}
            >
              <Text style={styles.pickerValueText}>
                {form.doctor.speciality || 'General physician'}
              </Text>
              <Feather name="chevron-down" size={18} color="#8E9BAE" />
            </TouchableOpacity>
          </View>

          {/* Doctor's phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Doctor's phone</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.phoneCodeBox}>
                <Text style={styles.phoneCodeText}>
                  {form.doctor.phoneCode}
                </Text>
              </View>
              <TextInput
                style={styles.phoneTextInput}
                value={form.doctor.phoneNumber}
                placeholder="98765 01234"
                placeholderTextColor="#60728B"
                keyboardType="phone-pad"
                onChangeText={(text) =>
                  setForm((prev) => ({
                    ...prev,
                    doctor: { ...prev.doctor, phoneNumber: text },
                  }))
                }
              />
            </View>
          </View>

          {/* Clinic name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Clinic name</Text>
            <TextInput
              style={styles.textInput}
              value={form.doctor.clinicName}
              placeholder="Rao Clinic"
              placeholderTextColor="#60728B"
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  doctor: { ...prev.doctor, clinicName: text },
                }))
              }
            />
          </View>

          {/* Clinic location */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Clinic location</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.locationCard}
              onPress={onSelectClinicLocation}
            >
              <View style={styles.locationLeftRow}>
                <Feather
                  name="map-pin"
                  size={16}
                  color="#8E9BAE"
                  style={styles.locationPinIcon}
                />
                <Text style={styles.locationText}>
                  {form.doctor.clinicLocation || 'Sector 47, Gurugram'}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#8E9BAE" />
            </TouchableOpacity>
          </View>

          {/* SECTION 2: HOSPITAL */}
          <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
            HOSPITAL
          </Text>

          {/* Preferred hospital */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Preferred hospital</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.searchPickerField}
              onPress={onSelectHospital}
            >
              <View style={styles.searchPickerLeft}>
                <Feather
                  name="search"
                  size={16}
                  color="#8E9BAE"
                  style={styles.searchIcon}
                />
                <Text style={styles.searchPickerText}>
                  {form.hospital.preferredHospital ||
                    'CityCare Hospital, Sector 38'}
                </Text>
              </View>
              <Feather name="chevron-down" size={18} color="#8E9BAE" />
            </TouchableOpacity>
            <Text style={styles.helperText}>
              Opens Choose hospital (LPS-47)
            </Text>
          </View>

          {/* SECTION 3: ALLERGIES AND CONDITIONS */}
          <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
            ALLERGIES AND CONDITIONS
          </Text>

          {/* Allergies */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Allergies</Text>
            <View style={styles.chipsContainer}>
              <View style={styles.chipsRow}>
                {form.allergies.map((allergy) => (
                  <View key={allergy.id} style={styles.chip}>
                    <Text style={styles.chipText}>{allergy.label}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveAllergy(allergy.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.chipCloseBtn}
                    >
                      <Text style={styles.chipCloseText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {isAddingAllergy ? (
                <View style={styles.inlineAddContainer}>
                  <TextInput
                    style={styles.inlineAddInput}
                    value={newAllergyText}
                    placeholder="e.g. Peanuts · Severe"
                    placeholderTextColor="#60728B"
                    autoFocus
                    onChangeText={setNewAllergyText}
                    onSubmitEditing={handleAddAllergy}
                  />
                  <TouchableOpacity
                    onPress={handleAddAllergy}
                    style={styles.inlineAddDoneBtn}
                  >
                    <Text style={styles.inlineAddDoneText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.addChipBtn}
                  onPress={() => setIsAddingAllergy(true)}
                >
                  <Text style={styles.addChipBtnText}>Add allergy</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Conditions */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Conditions</Text>
            <View style={styles.chipsContainer}>
              <View style={styles.chipsRow}>
                {form.conditions.map((condition) => (
                  <View key={condition.id} style={styles.chip}>
                    <Text style={styles.chipText}>{condition.label}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveCondition(condition.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.chipCloseBtn}
                    >
                      <Text style={styles.chipCloseText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {isAddingCondition ? (
                <View style={styles.inlineAddContainer}>
                  <TextInput
                    style={styles.inlineAddInput}
                    value={newConditionText}
                    placeholder="e.g. Asthma · since 2018"
                    placeholderTextColor="#60728B"
                    autoFocus
                    onChangeText={setNewConditionText}
                    onSubmitEditing={handleAddCondition}
                  />
                  <TouchableOpacity
                    onPress={handleAddCondition}
                    style={styles.inlineAddDoneBtn}
                  >
                    <Text style={styles.inlineAddDoneText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.addChipBtn}
                  onPress={() => setIsAddingCondition(true)}
                >
                  <Text style={styles.addChipBtnText}>Add condition</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* SECTION 4: MEDICATIONS */}
          <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
            MEDICATIONS
          </Text>

          {/* Regular medicines */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Regular medicines</Text>
            <View style={styles.chipsContainer}>
              <View style={styles.chipsRow}>
                {form.medications.map((med) => (
                  <View key={med.id} style={styles.chip}>
                    <Text style={styles.chipText}>{med.label}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveMedication(med.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.chipCloseBtn}
                    >
                      <Text style={styles.chipCloseText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {isAddingMedication ? (
                <View style={styles.inlineAddContainer}>
                  <TextInput
                    style={styles.inlineAddInput}
                    value={newMedicationText}
                    placeholder="e.g. Omega 3 · daily"
                    placeholderTextColor="#60728B"
                    autoFocus
                    onChangeText={setNewMedicationText}
                    onSubmitEditing={handleAddMedication}
                  />
                  <TouchableOpacity
                    onPress={handleAddMedication}
                    style={styles.inlineAddDoneBtn}
                  >
                    <Text style={styles.inlineAddDoneText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.addChipBtn}
                  onPress={() => setIsAddingMedication(true)}
                >
                  <Text style={styles.addChipBtnText}>Add medicine</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* SECTION 5: CHECKUPS */}
          <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
            CHECKUPS
          </Text>

          <View style={styles.sideBySideRow}>
            {/* Last checkup */}
            <View style={styles.sideCol}>
              <Text style={styles.fieldLabel}>Last checkup</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.datePickerCard}
                onPress={() =>
                  setPickerConfig({
                    visible: true,
                    target: 'lastCheckup',
                    title: 'Last Checkup',
                    format: 'DD MMM YYYY',
                  })
                }
              >
                <Text style={styles.datePickerValueText}>
                  {form.checkups.lastCheckup}
                </Text>
                <Feather name="calendar" size={17} color="#8E9BAE" />
              </TouchableOpacity>
            </View>

            {/* Next checkup */}
            <View style={styles.sideCol}>
              <Text style={styles.fieldLabel}>Next checkup</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.datePickerCard}
                onPress={() =>
                  setPickerConfig({
                    visible: true,
                    target: 'nextCheckup',
                    title: 'Next Checkup',
                    format: 'MMM YYYY',
                  })
                }
              >
                <Text style={styles.datePickerValueText}>
                  {form.checkups.nextCheckup}
                </Text>
                <Feather name="calendar" size={17} color="#8E9BAE" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Repeat every */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Repeat every</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.pickerField}
              onPress={() => {
                Alert.alert('Repeat every', 'Select frequency', [
                  {
                    text: '6 months',
                    onPress: () =>
                      setForm((prev) => ({
                        ...prev,
                        checkups: { ...prev.checkups, repeatEvery: '6 months' },
                      })),
                  },
                  {
                    text: '1 year',
                    onPress: () =>
                      setForm((prev) => ({
                        ...prev,
                        checkups: { ...prev.checkups, repeatEvery: '1 year' },
                      })),
                  },
                  {
                    text: '2 years',
                    onPress: () =>
                      setForm((prev) => ({
                        ...prev,
                        checkups: { ...prev.checkups, repeatEvery: '2 years' },
                      })),
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              <Text style={styles.pickerValueText}>
                {form.checkups.repeatEvery}
              </Text>
              <Feather name="chevron-down" size={18} color="#8E9BAE" />
            </TouchableOpacity>
          </View>

          {/* SECTION 6: EYESIGHT */}
          <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
            EYESIGHT
          </Text>

          {/* Wears (pick one) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Wears (pick one)</Text>
            <View style={styles.wearsPillsRow}>
              {(['Glasses', 'Contacts', 'Neither'] as const).map((option) => {
                const isSelected = form.eyesight.wears === option;
                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.7}
                    onPress={() =>
                      setForm((prev) => ({
                        ...prev,
                        eyesight: { ...prev.eyesight, wears: option },
                      }))
                    }
                    style={[
                      styles.wearsPill,
                      isSelected && styles.wearsPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.wearsPillText,
                        isSelected && styles.wearsPillTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Right & Left eye power */}
          <View style={styles.sideBySideRow}>
            <View style={styles.sideCol}>
              <Text style={styles.fieldLabel}>Right eye power</Text>
              <TextInput
                style={styles.textInput}
                value={form.eyesight.rightEyePower}
                placeholder="-1.25"
                placeholderTextColor="#60728B"
                keyboardType="numbers-and-punctuation"
                onChangeText={(text) =>
                  setForm((prev) => ({
                    ...prev,
                    eyesight: { ...prev.eyesight, rightEyePower: text },
                  }))
                }
              />
            </View>

            <View style={styles.sideCol}>
              <Text style={styles.fieldLabel}>Left eye power</Text>
              <TextInput
                style={styles.textInput}
                value={form.eyesight.leftEyePower}
                placeholder="-1.00"
                placeholderTextColor="#60728B"
                keyboardType="numbers-and-punctuation"
                onChangeText={(text) =>
                  setForm((prev) => ({
                    ...prev,
                    eyesight: { ...prev.eyesight, leftEyePower: text },
                  }))
                }
              />
            </View>
          </View>

          {/* Last eye test */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Last eye test</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.datePickerCard}
              onPress={() =>
                setPickerConfig({
                  visible: true,
                  target: 'lastEyeTest',
                  title: 'Last Eye Test',
                  format: 'DD MMM YYYY',
                })
              }
            >
              <Text style={styles.datePickerValueText}>
                {form.eyesight.lastEyeTest}
              </Text>
              <Feather name="calendar" size={17} color="#8E9BAE" />
            </TouchableOpacity>
          </View>

          {/* Attach prescription or reports */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.attachBtn}
            onPress={() => {
              Alert.alert(
                'Attach Report',
                'Select report or prescription file from device.',
              );
            }}
          >
            <Feather name="paperclip" size={17} color="#F0913A" />
            <Text style={styles.attachBtnText}>
              Attach prescription or reports
            </Text>
          </TouchableOpacity>
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

      {/* Date Picker */}
      <AppDateTimePicker
        visible={pickerConfig.visible}
        mode="date"
        title={pickerConfig.title}
        date={parseDateTimeString(
          pickerConfig.target === 'lastCheckup'
            ? form.checkups.lastCheckup
            : pickerConfig.target === 'nextCheckup'
            ? form.checkups.nextCheckup
            : form.eyesight.lastEyeTest,
          'date',
        )}
        onConfirm={(selectedDate) => {
          if (pickerConfig.target === 'lastCheckup') {
            setForm((prev) => ({
              ...prev,
              checkups: {
                ...prev.checkups,
                lastCheckup: formatDate(selectedDate, pickerConfig.format),
              },
            }));
          } else if (pickerConfig.target === 'nextCheckup') {
            setForm((prev) => ({
              ...prev,
              checkups: {
                ...prev.checkups,
                nextCheckup: formatDate(selectedDate, pickerConfig.format),
              },
            }));
          } else if (pickerConfig.target === 'lastEyeTest') {
            setForm((prev) => ({
              ...prev,
              eyesight: {
                ...prev.eyesight,
                lastEyeTest: formatDate(selectedDate, pickerConfig.format),
              },
            }));
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

export default HealthProfileInputScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#0A111F',
  },
  keyboardContainer: {
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
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#12243F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    height: 50,
    overflow: 'hidden',
  },
  phoneCodeBox: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
  },
  phoneCodeText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  phoneTextInput: {
    flex: 1,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
  },
  locationCard: {
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
  locationLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPinIcon: {
    marginRight: 10,
  },
  locationText: {
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
  searchPickerText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
  },
  helperText: {
    color: '#60728B',
    fontSize: RFValue(11),
    marginTop: 6,
    marginLeft: 2,
  },
  chipsContainer: {
    backgroundColor: '#12243F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 12,
    minHeight: 56,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F50',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: RFValue(12),
    fontWeight: '500',
  },
  chipCloseBtn: {
    marginLeft: 6,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipCloseText: {
    color: '#8E9BAE',
    fontSize: RFValue(14),
    fontWeight: '600',
    lineHeight: 16,
  },
  addChipBtn: {
    marginTop: 8,
    paddingVertical: 4,
  },
  addChipBtnText: {
    color: '#60728B',
    fontSize: RFValue(12),
  },
  inlineAddContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  inlineAddInput: {
    flex: 1,
    backgroundColor: '#0B1E36',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    height: 38,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: RFValue(12),
  },
  inlineAddDoneBtn: {
    marginLeft: 8,
    backgroundColor: '#F0913A',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineAddDoneText: {
    color: '#FFFFFF',
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  sideBySideRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sideCol: {
    flex: 1,
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
  wearsPillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  wearsPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#12243F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wearsPillActive: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  wearsPillText: {
    color: '#8E9BAE',
    fontSize: RFValue(13),
    fontWeight: '500',
  },
  wearsPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    marginTop: 8,
    marginBottom: 10,
  },
  attachBtnText: {
    color: '#F0913A',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.background || '#0A111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});

