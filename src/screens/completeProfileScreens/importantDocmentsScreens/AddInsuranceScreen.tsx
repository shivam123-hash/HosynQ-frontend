import React, { useState } from 'react';
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
  frontImageAdded: false,
  scanId: '',
};

const INSURANCE_TYPES = ['Health', 'Life', 'Motor', 'Home', 'Travel'];

const FAMILY_MEMBERS = [
  { id: '1', label: 'P', color: '#B45309' },
  { id: '2', label: 'R', color: '#1D4ED8' },
  { id: '3', label: 'A', color: '#9333EA' },
  { id: '4', label: 'Aa', color: '#CA8A04' },
  { id: '5', label: 'D', color: '#15803D' },
];

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

  const [formData, setFormData] = useState<InsuranceFormData>({
    ...DEFAULT_INSURANCE_DATA,
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

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

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
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            <View style={styles.coversRow}>
              {FAMILY_MEMBERS.map((m) => (
                <View
                  key={m.id}
                  style={[styles.memberCircle, { backgroundColor: m.color }]}
                >
                  <Text style={styles.memberText}>{m.label}</Text>
                </View>
              ))}
              <Text style={styles.allCoveredBadge}>All 5</Text>
            </View>
          </View>

          {/* Toggle Cards */}
          <View style={styles.toggleCardContainer}>
            {/* Toggle 1: Save in Family Vault */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleTitle}>
                Also save in Family Vault › Insurance
              </Text>
              <Switch
                value={formData.saveInFamilyVault}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, saveInFamilyVault: v }))
                }
                trackColor={{ false: '#334155', true: '#F0913A' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Toggle 2: Remind renewal */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>
                  Remind me before renewal
                </Text>
                <Text style={styles.toggleSubtitle}>
                  1 month and 1 week before
                </Text>
              </View>
              <Switch
                value={formData.remindRenewal}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, remindRenewal: v }))
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
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
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
    fontWeight: '700',
  },
  allCoveredBadge: {
    color: '#F0913A',
    fontSize: RFValue(12.5),
    fontWeight: '700',
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
    fontWeight: '600',
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
});

