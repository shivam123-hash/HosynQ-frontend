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
  parseDateTimeString,
} from '../../../components';
import { PersonalInfoHeader } from '../components';

export interface PassportFormData {
  fullName: string;
  passportNumber: string;
  issueDate: string;
  expiryDate: string;
  placeOfIssue: string;
  reminders: string[];
  assignees: string;
  autoRenewal: boolean;
  frontImageAdded: boolean;
  backImageAdded: boolean;
}

export interface AddPassportScreenProps {
  initialData?: Partial<PassportFormData>;
  userName?: string;
  onClose?: () => void;
  onSaveSuccess?: (data: PassportFormData) => void;
}

export const DEFAULT_PASSPORT_DATA: PassportFormData = {
  fullName: 'PRIYA SHARMA',
  passportNumber: 'K1234567',
  issueDate: '22 Aug 2017',
  expiryDate: '21 Aug 2027',
  placeOfIssue: 'Delhi',
  reminders: ['6 months', '1 month'],
  assignees: 'Priya, Rohan',
  autoRenewal: true,
  frontImageAdded: true,
  backImageAdded: false,
};

const REMINDER_OPTIONS = ['6 months', '3 months', '1 month', '1 week'];

const AddPassportScreen: React.FC<AddPassportScreenProps> = ({
  initialData,
  userName = 'Priya',
  onClose,
  onSaveSuccess,
}) => {
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<PassportFormData>({
    ...DEFAULT_PASSPORT_DATA,
    ...initialData,
  });

  const [showPassportNumber, setShowPassportNumber] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [frontImage, setFrontImage] = useState(formData.frontImageAdded);
  const [backImage, setBackImage] = useState(formData.backImageAdded);

  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    target: 'issueDate' | 'expiryDate' | null;
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

  const handleSavePassport = () => {
    // Open the upload modal prompting for front/back photos
    setShowUploadModal(true);
  };

  const handleConfirmUpload = () => {
    setShowUploadModal(false);
    const finalData: PassportFormData = {
      ...formData,
      frontImageAdded: frontImage,
      backImageAdded: backImage,
    };
    if (onSaveSuccess) {
      onSaveSuccess(finalData);
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
        title="Add passport"
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
          {/* Note: Front/Back photo upload is omitted from this screen per user requirement */}

          {/* Name as on passport */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Name as on passport</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.fullName}
              onChangeText={(t) =>
                setFormData((prev) => ({ ...prev, fullName: t.toUpperCase() }))
              }
              placeholder="Full name as printed"
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
            />
          </View>

          {/* Passport number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Passport number</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.inputBox, styles.inputFlex]}
                value={formData.passportNumber}
                onChangeText={(t) =>
                  setFormData((prev) => ({ ...prev, passportNumber: t }))
                }
                secureTextEntry={!showPassportNumber}
                placeholder="Passport number"
                placeholderTextColor="#64748B"
                autoCapitalize="characters"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowPassportNumber(!showPassportNumber)}
                style={styles.rightIconButton}
              >
                <Feather
                  name={showPassportNumber ? 'eye' : 'eye-off'}
                  size={18}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>1 letter and 7 numbers</Text>
          </View>

          {/* Date of issue & Date of expiry (Side-by-side) */}
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

            {/* Date of expiry (Orange highlighted border) */}
            <View style={styles.sideColumn}>
              <Text style={styles.fieldLabel}>Date of expiry</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.selectorBox, styles.expiryHighlightedBox]}
                onPress={() => {
                  setPickerConfig({
                    visible: true,
                    target: 'expiryDate',
                    title: 'Date of Expiry',
                  });
                }}
              >
                <Text style={styles.selectorText}>{formData.expiryDate}</Text>
                <Feather name="calendar" size={17} color="#F0913A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Place of issue */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Place of issue</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.placeOfIssue}
              onChangeText={(t) =>
                setFormData((prev) => ({ ...prev, placeOfIssue: t }))
              }
              placeholder="e.g. Delhi"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* REMIND ME BEFORE IT EXPIRES */}
          <Text style={styles.sectionHeader}>REMIND ME BEFORE IT EXPIRES</Text>

          {/* Reminders Pills */}
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
            <TouchableOpacity activeOpacity={0.7} style={styles.remindRow}>
              <Feather name="bell" size={17} color="#8E9BAE" />
              <Text style={styles.remindLabel}>Remind</Text>
              <View style={styles.avatarGroup}>
                <View style={[styles.avatarCircle, { backgroundColor: '#7C3AED' }]}>
                  <Text style={styles.avatarText}>P</Text>
                </View>
                <View
                  style={[
                    styles.avatarCircle,
                    { backgroundColor: '#2563EB', marginLeft: -6 },
                  ]}
                >
                  <Text style={styles.avatarText}>R</Text>
                </View>
              </View>
              <Text style={styles.remindAssigneeText}>
                {formData.assignees}
              </Text>
              <Feather name="chevron-right" size={17} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            {/* Auto Renewal Task Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>
                  Add a renewal task automatically
                </Text>
                <Text style={styles.switchSubtitle}>
                  Assigned to {userName}, 6 months before
                </Text>
              </View>
              <Switch
                value={formData.autoRenewal}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, autoRenewal: v }))
                }
                trackColor={{ false: '#334155', true: '#F0913A' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Save Passport Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title="Save passport"
            onPress={handleSavePassport}
            backgroundColor={Colors.primary || '#F0913A'}
            textColor="#FFFFFF"
            height={52}
            borderRadius={26}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Save & Upload Photos Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowUploadModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Upload Passport Photos</Text>
            <Text style={styles.modalSubtitle}>
              Please add photos of your passport pages before finalizing.
            </Text>

            {/* Front and Back photo upload row */}
            <View style={styles.photoUploadRow}>
              {/* Front Page Card */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setFrontImage(!frontImage)}
                style={[
                  styles.uploadPhotoBox,
                  frontImage
                    ? styles.uploadPhotoBoxSuccess
                    : styles.uploadPhotoBoxEmpty,
                ]}
              >
                {frontImage ? (
                  <>
                    <View style={styles.checkCircle}>
                      <Feather name="check" size={14} color="#10B981" />
                    </View>
                    <Text style={styles.uploadPhotoTitle}>Front added</Text>
                    <Text style={styles.uploadPhotoSub}>Tap to replace</Text>
                  </>
                ) : (
                  <>
                    <Feather name="camera" size={20} color="#F0913A" />
                    <Text style={styles.uploadPhotoTitle}>Add front page</Text>
                    <Text style={styles.uploadPhotoSub}>Required</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Back Page Card */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setBackImage(!backImage)}
                style={[
                  styles.uploadPhotoBox,
                  backImage
                    ? styles.uploadPhotoBoxSuccess
                    : styles.uploadPhotoBoxEmpty,
                ]}
              >
                {backImage ? (
                  <>
                    <View style={styles.checkCircle}>
                      <Feather name="check" size={14} color="#10B981" />
                    </View>
                    <Text style={styles.uploadPhotoTitle}>Back added</Text>
                    <Text style={styles.uploadPhotoSub}>Tap to replace</Text>
                  </>
                ) : (
                  <>
                    <Feather name="camera" size={20} color="#F0913A" />
                    <Text style={styles.uploadPhotoTitle}>Add back page</Text>
                    <Text style={styles.uploadPhotoSub}>Optional</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <CommonBtn
              title="Confirm & Save"
              onPress={handleConfirmUpload}
              backgroundColor={Colors.primary || '#F0913A'}
              textColor="#FFFFFF"
              height={50}
              borderRadius={25}
              marginTop={16}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleConfirmUpload}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker */}
      <AppDateTimePicker
        visible={pickerConfig.visible}
        mode="date"
        title={pickerConfig.title}
        date={parseDateTimeString(
          pickerConfig.target === 'issueDate'
            ? formData.issueDate
            : formData.expiryDate,
        )}
        onConfirm={(date) => {
          if (pickerConfig.target === 'issueDate') {
            setFormData((prev) => ({ ...prev, issueDate: formatDate(date) }));
          } else if (pickerConfig.target === 'expiryDate') {
            setFormData((prev) => ({ ...prev, expiryDate: formatDate(date) }));
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

export default AddPassportScreen;

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
  helperText: {
    color: '#64748B',
    fontSize: RFValue(10.5),
    marginTop: 4,
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
  expiryHighlightedBox: {
    borderColor: '#F0913A',
    borderWidth: 1.5,
  },
  selectorText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '500',
  },
  sectionHeader: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillButton: {
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 18,
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
    fontWeight: '600',
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardContainer: {
    backgroundColor: '#121C2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 18,
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
  },
  avatarGroup: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginRight: 6,
  },
  avatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#121C2F',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: RFValue(9.5),
    fontWeight: '700',
  },
  remindAssigneeText: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
    marginRight: 6,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  switchTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  switchSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 3,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background || '#0A111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
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
    marginBottom: 16,
  },
  photoUploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  uploadPhotoBox: {
    flex: 1,
    height: 100,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  uploadPhotoBoxSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  uploadPhotoBoxEmpty: {
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
    marginBottom: 6,
  },
  uploadPhotoTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(12.5),
    fontWeight: '600',
  },
  uploadPhotoSub: {
    color: '#8E9BAE',
    fontSize: RFValue(10.5),
    marginTop: 2,
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: 14,
    padding: 6,
  },
  skipText: {
    color: '#8E9BAE',
    fontSize: RFValue(12.5),
  },
});

