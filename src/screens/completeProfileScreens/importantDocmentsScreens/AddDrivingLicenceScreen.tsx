import React, { useState } from 'react';
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
  frontImageAdded: boolean;
  backImageAdded: boolean;
  scanId?: string;
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

  const [formData, setFormData] = useState<DrivingLicenceFormData>({
    ...DEFAULT_DL_DATA,
    ...initialData,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    target: 'issueDate' | 'validTill' | null;
    title: string;
  }>({
    visible: false,
    target: null,
    title: '',
  });

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
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

          {/* REMIND ME BEFORE IT EXPIRES */}
          <Text style={styles.sectionHeader}>REMIND ME BEFORE IT EXPIRES</Text>
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
    fontWeight: '600',
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
    fontWeight: '500',
    marginBottom: 6,
  },
  sectionHeader: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '700',
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
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#0A111F',
    fontWeight: '800',
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
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background || '#0A111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});

