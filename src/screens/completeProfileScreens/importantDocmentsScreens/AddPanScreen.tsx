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

export interface PanFormData {
  panNumber: string;
  fullName: string;
  dob: string;
  frontImageAdded: boolean;
}

export interface AddPanScreenProps {
  initialData?: Partial<PanFormData>;
  userName?: string;
  onClose?: () => void;
  onSave?: (data: PanFormData) => void;
}

export const DEFAULT_PAN_DATA: PanFormData = {
  panNumber: 'ABCDE123F',
  fullName: 'Priya Sharma',
  dob: '8 Aug 1988',
  frontImageAdded: false,
};

const AddPanScreen: React.FC<AddPanScreenProps> = ({
  initialData,
  userName = 'Priya',
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<PanFormData>({
    ...DEFAULT_PAN_DATA,
    ...initialData,
  });

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Validation: Indian PAN is 10 chars (5 letters, 4 digits, 1 letter)
  const isPanValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
    formData.panNumber.trim().toUpperCase(),
  );

  const handleSave = () => {
    if (isPanValid) {
      onSave?.(formData);
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
        title="Add PAN"
        subtitle={`For ${userName} · Optional`}
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
          {/* Top Add Front Photo Card */}
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
              </>
            )}
          </TouchableOpacity>

          {/* PAN */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PAN</Text>
            <TextInput
              style={[
                styles.inputBox,
                !isPanValid && formData.panNumber.length > 0
                  ? styles.inputError
                  : null,
              ]}
              value={formData.panNumber}
              onChangeText={(t) =>
                setFormData((prev) => ({ ...prev, panNumber: t.toUpperCase() }))
              }
              placeholder="e.g. ABCDE1234F"
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
              maxLength={10}
            />
            {!isPanValid && formData.panNumber.length > 0 ? (
              <Text style={styles.errorText}>
                PAN has 10 characters, like ABCDE1234F.
              </Text>
            ) : null}
          </View>

          {/* Name as on PAN */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Name as on PAN</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.fullName}
              onChangeText={(t) =>
                setFormData((prev) => ({ ...prev, fullName: t }))
              }
              placeholder="Name as on PAN card"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Date of birth */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Date of birth</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.selectorBox}
              onPress={() => setIsDatePickerVisible(true)}
            >
              <Text style={styles.selectorText}>{formData.dob}</Text>
              <Feather name="calendar" size={17} color="#94A3B8" />
            </TouchableOpacity>
            <Text style={styles.helperText}>Filled from your profile</Text>
          </View>
        </ScrollView>

        {/* Bottom Save PAN Button */}
        <View style={styles.bottomBar}>
          {!isPanValid ? (
            <Text style={styles.fixPanNote}>Fix the PAN to save.</Text>
          ) : null}
          <CommonBtn
            title="Save PAN"
            onPress={handleSave}
            disabled={!isPanValid}
            backgroundColor={
              isPanValid ? Colors.primary || '#F0913A' : '#5C381E'
            }
            textColor={isPanValid ? '#FFFFFF' : '#8E9BAE'}
            height={52}
            borderRadius={26}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      <AppDateTimePicker
        visible={isDatePickerVisible}
        mode="date"
        title="Date of Birth"
        date={parseDateTimeString(formData.dob)}
        onConfirm={(date) => {
          setFormData((prev) => ({ ...prev, dob: formatDate(date) }));
          setIsDatePickerVisible(false);
        }}
        onCancel={() => setIsDatePickerVisible(false)}
      />
    </View>
  );
};

export default AddPanScreen;

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
    marginTop: 4,
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
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#F87171',
    fontSize: RFValue(11),
    marginTop: 5,
  },
  helperText: {
    color: '#64748B',
    fontSize: RFValue(10.5),
    marginTop: 4,
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
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: Colors.background || '#0A111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  fixPanNote: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    textAlign: 'center',
    marginBottom: 10,
  },
});

