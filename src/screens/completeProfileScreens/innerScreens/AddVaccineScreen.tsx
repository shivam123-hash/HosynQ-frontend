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

export interface AddVaccineFormData {
  vaccineName: string;
  dose: string;
  dateGiven: string;
  givenAt?: string;
  batchNumber?: string;
  certificateName?: string | null;
  nextDue: string;
  remindMe: boolean;
  remindTiming: string;
  whoGetsReminder: string;
}

export const DEFAULT_VACCINE_FORM_DATA: AddVaccineFormData = {
  vaccineName: 'Influenza',
  dose: 'Yearly dose',
  dateGiven: '30 Oct 2026',
  givenAt: 'Little Steps Clinic',
  batchNumber: 'FLU26-0931',
  certificateName: null,
  nextDue: 'Oct 2027',
  remindMe: true,
  remindTiming: '2 weeks before',
  whoGetsReminder: 'Priya, Rohan',
};

export interface AddVaccineScreenProps {
  initialData?: Partial<AddVaccineFormData>;
  childName?: string;
  onClose?: () => void;
  onSave?: (data: AddVaccineFormData) => void;
  onUploadCertificate?: () => void;
}

const AddVaccineScreen: React.FC<AddVaccineScreenProps> = ({
  initialData,
  childName = 'Aarav',
  onClose,
  onSave,
  onUploadCertificate,
}) => {
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<AddVaccineFormData>({
    ...DEFAULT_VACCINE_FORM_DATA,
    ...(initialData || {}),
  });

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

  const handleSave = () => {
    onSave?.(formData);
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
    Alert.alert('Who gets the reminder', 'Select family member', [
      { text: 'Priya, Rohan', onPress: () => setFormData((p) => ({ ...p, whoGetsReminder: 'Priya, Rohan' })) },
      { text: 'Priya only', onPress: () => setFormData((p) => ({ ...p, whoGetsReminder: 'Priya only' })) },
      { text: 'Rohan only', onPress: () => setFormData((p) => ({ ...p, whoGetsReminder: 'Rohan only' })) },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
              <Text style={styles.datePickerValueText}>
                {formData.dateGiven}
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

          {/* Upload certificate button */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.attachBtn}
            onPress={() => {
              if (onUploadCertificate) {
                onUploadCertificate();
              } else {
                Alert.alert(
                  'Upload Certificate',
                  'Select vaccine certificate PDF or image.',
                );
              }
            }}
          >
            <Feather name="paperclip" size={17} color="#F0913A" />
            <Text style={styles.attachBtnText}>Upload certificate</Text>
          </TouchableOpacity>

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
              <Text style={styles.datePickerValueText}>{formData.nextDue}</Text>
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
});
