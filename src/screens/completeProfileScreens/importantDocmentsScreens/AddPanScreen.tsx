import React, { useState, useEffect, useRef } from 'react';
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
  Keyboard,
  findNodeHandle,
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

export interface PanFormData {
  panNumber: string;
  fullName: string;
  dob: string;
  frontImageAdded: boolean;
  scanId?: string;
}

export interface AddPanScreenProps {
  initialData?: Partial<PanFormData>;
  userName?: string;
  memberId?: string;
  documentId?: string;
  isSaving?: boolean;
  onClose?: () => void;
  onSave?: (data: PanFormData, documentId?: string) => void;
}

export const DEFAULT_PAN_DATA: PanFormData = {
  panNumber: '',
  fullName: '',
  dob: '',
  frontImageAdded: false,
  scanId: '',
};

const AddPanScreen: React.FC<AddPanScreenProps> = ({
  initialData,
  userName = 'Priya',
  memberId,
  documentId,
  isSaving = false,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<PanFormData>({
    ...DEFAULT_PAN_DATA,
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

  const scrollViewRef = useRef<any>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates ? e.endCoordinates.height : 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleInputFocus = (event: any) => {
    if (scrollViewRef.current) {
      const nodeHandle = findNodeHandle(event.target);
      if (nodeHandle) {
        setTimeout(() => {
          (scrollViewRef.current as any)
            ?.getScrollResponder?.()
            ?.scrollResponderScrollNativeHandleToKeyboard(nodeHandle, 120, true);
        }, 120);
      }
    }
  };

  const cleanPan = (val?: string): string => {
    if (!val) return '';
    return val.replace(/[^A-Za-z0-9]/g, '').trim().toUpperCase();
  };

  // Validation: Indian PAN is 10 chars, where 4th char is holder type:
  // P (Person), C (Company), H (HUF), F (Firm), A (AOP), T (Trust), B (BOI), L (Local Auth), J (Juridical), G (Govt)
  const PAN_PATTERN = /^[A-Z]{3}[PCHFATBLJG][A-Z][0-9]{4}[A-Z]$/;
  const sanitizedPan = cleanPan(formData.panNumber);
  const isPanValid = PAN_PATTERN.test(sanitizedPan);

  const getPanValidationError = (): string | null => {
    if (!sanitizedPan) return null;
    if (sanitizedPan.length < 10) {
      return `PAN has 10 characters, like ABCPE1234F (${sanitizedPan.length}/10 entered).`;
    }
    if (sanitizedPan.length === 10) {
      const fourthChar = sanitizedPan.charAt(3);
      if (!/[PCHFATBLJG]/.test(fourthChar)) {
        return `4th character '${fourthChar}' is invalid. For individuals it must be 'P' (like ABCPE1234F).`;
      }
      return 'PAN format is invalid. Must be 5 letters, 4 digits, 1 letter.';
    }
    return 'PAN must be exactly 10 characters.';
  };

  const handleSave = () => {
    const finalPan = cleanPan(formData.panNumber);
    console.log('[AddPanScreen] handleSave pressed:', {
      rawPan: formData.panNumber,
      sanitizedPan: finalPan,
      isPanValid,
      documentId,
    });
    if (isPanValid) {
      onSave?.(
        {
          ...formData,
          panNumber: finalPan,
        },
        documentId
      );
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
        title={documentId ? 'Edit PAN' : 'Add PAN'}
        subtitle={`For ${userName} · Optional`}
        onBack={onClose}
        icon="close"
      />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardHeight > 0
              ? { paddingBottom: keyboardHeight + 80 }
              : null,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onFocus={handleInputFocus}
        >
          {/* Top Field: Upload & Scan Document Photo */}
          <DocumentPhotoUploadField
            documentType="PAN"
            documentTitle="PAN Card"
            memberId={memberId}
            scanId={formData.scanId}
            hasFrontImage={formData.frontImageAdded}
            onScanSuccess={(scanned, newScanId) => {
              const rawNumber = scanned.number || scanned.panNumber;
              const extractedPan = cleanPan(rawNumber);
              console.log('[AddPanScreen] onScanSuccess received:', {
                rawNumber,
                extractedPan,
                newScanId,
                scannedName: scanned.nameOnDocument || scanned.fullName,
                scannedDob: scanned.dateOfBirth,
              });
              setFormData((prev) => ({
                ...prev,
                scanId: newScanId || scanned.scanId || prev.scanId,
                panNumber: extractedPan || prev.panNumber,
                fullName: scanned.nameOnDocument || scanned.fullName || prev.fullName,
                dob: scanned.dateOfBirth
                  ? formatIsoToDisplayDate(scanned.dateOfBirth)
                  : prev.dob,
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

          {/* PAN */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PAN</Text>
            <TextInput
              style={[
                styles.inputBox,
                !isPanValid && sanitizedPan.length > 0
                  ? styles.inputError
                  : null,
              ]}
              value={formData.panNumber}
              onChangeText={(t) =>
                setFormData((prev) => ({
                  ...prev,
                  panNumber: cleanPan(t).slice(0, 10),
                }))
              }
              placeholder="e.g. ABCPE1234F"
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
              maxLength={10}
            />
            {!isPanValid && sanitizedPan.length > 0 ? (
              <Text style={styles.errorText}>
                {getPanValidationError()}
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
            title={documentId ? 'Update PAN' : 'Save PAN'}
            onPress={handleSave}
            loading={isSaving}
            disabled={!isPanValid || isSaving}
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
    fontFamily: 'Roboto-SemiBold',
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
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Medium',
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

