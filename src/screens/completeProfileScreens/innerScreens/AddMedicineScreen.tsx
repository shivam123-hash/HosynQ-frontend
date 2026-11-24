import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  findNodeHandle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { useAppDispatch } from '../../../redux';
import { createMedicineThunk } from '../../../redux/features/medicine/medicineSlice';
import { getMyMemberId } from '../../../units/AsyncStorageManager';

export interface AddMedicineFormData {
  name: string;
  purpose?: string;
  type: string;
  doseCount: number;
  strength?: string;
  timing: string;
  medicineId?: string;
}

export interface AddMedicineScreenProps {
  memberId?: string;
  initialData?: Partial<AddMedicineFormData>;
  onClose?: () => void;
  onScanPrescription?: () => void;
  onNext?: (data: AddMedicineFormData) => void;
}

const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Drops', 'Other'];
const TIMING_OPTIONS = ['Before food', 'After food', 'With food', 'Any time'];

const AddMedicineScreen: React.FC<AddMedicineScreenProps> = ({
  memberId,
  initialData,
  onClose,
  onScanPrescription,
  onNext,
}) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState<string>(initialData?.name || '');
  const [purpose, setPurpose] = useState<string>(initialData?.purpose || '');
  const [selectedType, setSelectedType] = useState<string>(
    initialData?.type || 'Tablet',
  );
  const [doseCount, setDoseCount] = useState<number>(
    initialData?.doseCount || 1,
  );
  const [strength, setStrength] = useState<string>(initialData?.strength || '');
  const [selectedTiming, setSelectedTiming] = useState<string>(
    initialData?.timing || 'After food',
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const handleIncrement = () => {
    setDoseCount((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (doseCount > 1) {
      setDoseCount((prev) => prev - 1);
    }
  };

  const handleNext = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a medicine name.');
      return;
    }

    let targetMemberId = memberId;
    if (!targetMemberId || targetMemberId === 'me') {
      const stored = await getMyMemberId();
      if (stored) {
        targetMemberId = stored;
      }
    }

    const payload = {
      name: name.trim(),
      purpose: purpose?.trim() || undefined,
      type: selectedType.toUpperCase(),
      doseAmount: doseCount,
      doseUnit: selectedType.toLowerCase(),
      strength: strength?.trim() || undefined,
      foodTiming: selectedTiming.toUpperCase().replace(/\s+/g, '_'),
    };

    setIsSubmitting(true);
    let createdMedicineId: string | undefined;

    try {
      if (targetMemberId) {
        console.log('====================================');
        console.log('[AddMedicine] Submitting POST /medicines:');
        console.log(`[AddMedicine] Target MemberId: ${targetMemberId}`);
        console.log(JSON.stringify(payload, null, 2));
        console.log('====================================');

        const response: any = await dispatch(
          createMedicineThunk({ memberId: targetMemberId, payload }),
        ).unwrap();

        console.log('====================================');
        console.log('[AddMedicine] Medicine Created Successfully:');
        console.log(JSON.stringify(response, null, 2));
        console.log('====================================');

        createdMedicineId =
          response?.medicine?.id ||
          response?.data?.medicine?.id ||
          response?.data?.id ||
          response?.id;
      }

      onNext?.({
        name,
        purpose,
        type: selectedType,
        doseCount,
        strength,
        timing: selectedTiming,
        medicineId: createdMedicineId,
      });
    } catch (err: any) {
      console.warn('[AddMedicine] Error creating medicine:', err);
      const errMsg =
        err?.message ||
        (Array.isArray(err?.message) ? err.message.join(', ') : null) ||
        'Failed to add medicine. Proceeding to set times.';
      Alert.alert('Notice', errMsg, [
        {
          text: 'Continue',
          onPress: () => {
            onNext?.({
              name,
              purpose,
              type: selectedType,
              doseCount,
              strength,
              timing: selectedTiming,
              medicineId: createdMedicineId,
            });
          },
        },
      ]);
    } finally {
      setIsSubmitting(false);
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

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>Add medicine</Text>
          <Text style={styles.headerSubtitleText}>
            Step 1 of 2 · For Dadi
          </Text>
        </View>

        <View style={styles.spacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
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
          {/* Scan Prescription Banner */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onScanPrescription}
            style={styles.scanBanner}
            accessibilityRole="button"
            accessibilityLabel="Scan the prescription instead"
          >
            <Feather
              name="camera"
              size={18}
              color="#F0913A"
              style={styles.scanIcon}
            />
            <Text style={styles.scanText}>Scan the prescription instead</Text>
            <Feather name="chevron-right" size={18} color="#F0913A" />
          </TouchableOpacity>

          {/* Medicine Name Field (Orange highlighted active state) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Medicine name</Text>
            <View style={[styles.inputBox, styles.inputBoxActive]}>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter medicine name"
                placeholderTextColor="#64748B"
                selectionColor="#F0913A"
              />
            </View>
          </View>

          {/* What it's for Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>What it's for (optional)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                value={purpose}
                onChangeText={setPurpose}
                placeholder="e.g. Blood pressure"
                placeholderTextColor="#64748B"
              />
            </View>
          </View>

          {/* TYPE Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>TYPE</Text>
            <View style={styles.chipsRow}>
              {MEDICINE_TYPES.map((type) => {
                const isSelected = type === selectedType;
                return (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.7}
                    onPress={() => setSelectedType(type)}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected
                          ? styles.chipTextSelected
                          : styles.chipTextUnselected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Dosage Card */}
          <View style={styles.dosageCard}>
            {/* Stepper Row: Each dose */}
            <View style={styles.doseRow}>
              <Text style={styles.doseLabel}>Each dose</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleDecrement}
                  style={styles.stepperMinusButton}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease dose"
                >
                  <Text style={styles.minusText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.doseValueText}>
                  {doseCount} {selectedType.toLowerCase()}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleIncrement}
                  style={styles.stepperPlusButton}
                  accessibilityRole="button"
                  accessibilityLabel="Increase dose"
                >
                  <Feather name="plus" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Strength Input */}
            <View style={styles.strengthGroup}>
              <Text style={styles.fieldLabel}>Strength (optional)</Text>
              <View style={styles.strengthInputBox}>
                <TextInput
                  style={styles.textInput}
                  value={strength}
                  onChangeText={setStrength}
                  placeholder="e.g. 5 mg"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>
          </View>

          {/* TAKE IT Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>TAKE IT</Text>
            <View style={styles.chipsRow}>
              {TIMING_OPTIONS.map((timing) => {
                const isSelected = timing === selectedTiming;
                return (
                  <TouchableOpacity
                    key={timing}
                    activeOpacity={0.7}
                    onPress={() => setSelectedTiming(timing)}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected
                          ? styles.chipTextSelected
                          : styles.chipTextUnselected,
                      ]}
                    >
                      {timing}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title={isSubmitting ? 'Saving...' : 'Next: set times'}
            disabled={isSubmitting}
            onPress={handleNext}
            backgroundColor={Colors.primary || '#F0913A'}
            textColor="#FFFFFF"
            height={54}
            borderRadius={27}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddMedicineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
  },
  headerSubtitleText: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    marginTop: 2,
    textAlign: 'center',
  },
  spacer: {
    width: 40,
    height: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(240, 145, 58, 0.04)',
  },
  scanIcon: {
    marginRight: 10,
  },
  scanText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-Medium',
  },
  fieldGroup: {
    marginHorizontal: 20,
    marginBottom: 14,
  },
  fieldLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    fontFamily: 'Roboto-Regular',
    marginBottom: 6,
  },
  inputBox: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0B1E36',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputBoxActive: {
    borderColor: '#F0913A',
    borderWidth: 1.5,
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-Medium',
    padding: 0,
    margin: 0,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 14,
  },
  sectionHeader: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: '#0C1E34',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipSelected: {
    backgroundColor: Colors.primary || '#F0913A',
    borderColor: Colors.primary || '#F0913A',
  },
  chipText: {
    fontSize: RFValue(12.5),
  },
  chipTextUnselected: {
    color: '#CBD5E1',
    fontFamily: 'Roboto-Medium',
  },
  chipTextSelected: {
    color: '#071526',
    fontFamily: 'Roboto-Bold',
  },
  dosageCard: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 10,
    padding: 16,
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  doseLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071526',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  stepperMinusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F2238',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minusText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontFamily: 'Roboto-SemiBold',
    lineHeight: 18,
  },
  doseValueText: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
    marginHorizontal: 12,
  },
  stepperPlusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  strengthGroup: {
    marginTop: 4,
  },
  strengthInputBox: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#071526',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});

