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
import { PersonalInfoHeader } from '../components';

export interface VisaFormData {
  country: string;
  visaType: string;
  visaNumber: string;
  linkedPassport: string;
  validFrom: string;
  validUntil: string;
  entries: 'Single' | 'Multiple';
  reminders: string[];
  frontImageAdded: boolean;
}

export interface AddVisaScreenProps {
  initialData?: Partial<VisaFormData>;
  userName?: string;
  onClose?: () => void;
  onSave?: (data: VisaFormData) => void;
  onSelectPassport?: () => void;
}

export const DEFAULT_VISA_DATA: VisaFormData = {
  country: 'United States',
  visaType: 'Tourist or business',
  visaNumber: 'H1234567',
  linkedPassport: 'Passport ending 4567',
  validFrom: '4 Mar 2017',
  validUntil: '3 Mar 2027',
  entries: 'Multiple',
  reminders: ['6 months', '1 month'],
  frontImageAdded: true,
};

const VISA_TYPES = ['Tourist or business', 'Student', 'Work', 'Other'];
const REMINDER_OPTIONS = ['6 months', '3 months', '1 month', '1 week'];

const AddVisaScreen: React.FC<AddVisaScreenProps> = ({
  initialData,
  userName = 'Priya',
  onClose,
  onSave,
  onSelectPassport,
}) => {
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<VisaFormData>({
    ...DEFAULT_VISA_DATA,
    ...initialData,
  });

  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    target: 'validFrom' | 'validUntil' | null;
    title: string;
  }>({
    visible: false,
    target: null,
    title: '',
  });

  const toggleReminder = (rem: string) => {
    setFormData((prev) => {
      const exists = prev.reminders.includes(rem);
      const updated = exists
        ? prev.reminders.filter((r) => r !== rem)
        : [...prev.reminders, rem];
      return { ...prev, reminders: updated };
    });
  };

  const handleSave = () => {
    onSave?.(formData);
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
        title="Add visa"
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
          {/* Top Front Photo Upload Card */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              setFormData((prev) => ({
                ...prev,
                frontImageAdded: !prev.frontImageAdded,
              }))
            }
            style={[
              styles.photoCard,
              formData.frontImageAdded
                ? styles.photoCardSuccess
                : styles.photoCardEmpty,
            ]}
          >
            {formData.frontImageAdded ? (
              <>
                <View style={styles.checkCircle}>
                  <Feather name="check" size={14} color="#10B981" />
                </View>
                <Text style={styles.photoTitle}>Front added</Text>
                <Text style={styles.photoSubtitle}>Tap to replace</Text>
              </>
            ) : (
              <>
                <Feather name="camera" size={20} color="#F0913A" />
                <Text style={styles.photoTitle}>Add front</Text>
                <Text style={styles.photoSubtitle}>Tap to upload</Text>
              </>
            )}
          </TouchableOpacity>

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
                const isSelected = formData.visaType === vt;
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
                const isSelected = formData.visaType === vt;
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
            onPress={onSelectPassport}
            style={styles.linkedPassportCard}
          >
            <View style={styles.passportIconBox}>
              <Feather name="book-open" size={17} color="#38BDF8" />
            </View>
            <View style={styles.passportTextContainer}>
              <Text style={styles.passportLabel}>On passport</Text>
              <Text style={styles.passportValue}>
                {formData.linkedPassport}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#64748B" />
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
                  formData.entries === 'Single' && styles.entrySegmentSelected,
                ]}
              >
                <Text
                  style={[
                    styles.entryText,
                    formData.entries === 'Single' && styles.entryTextSelected,
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
                  formData.entries === 'Multiple' &&
                    styles.entrySegmentSelected,
                ]}
              >
                <Text
                  style={[
                    styles.entryText,
                    formData.entries === 'Multiple' &&
                      styles.entryTextSelected,
                  ]}
                >
                  Multiple
                </Text>
              </TouchableOpacity>
            </View>
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

        {/* Bottom Save Visa Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title="Save visa"
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
    color: '#FFFFFF',
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '600',
  },
  entryTextSelected: {
    color: '#0A111F',
    fontWeight: '800',
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

