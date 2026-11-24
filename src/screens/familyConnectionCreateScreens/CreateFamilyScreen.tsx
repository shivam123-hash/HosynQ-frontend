import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import CommonBtn from '../../components/CommonBtn';
import CommonInput from '../../components/CommonInput';
import CommonDropdown from '../../components/CommonDropdown';
import KeyboardAvoidingWrapper from '../../components/KeyboardAvoidingWrapper';
import { useAppDispatch, useAppSelector } from '../../redux';
import {
  createFamilyThunk,
  clearFamilyError,
} from '../../redux/features/family/familySlice';
import { mapFamilyTypeToBackend } from '../../services/familyServices';
import { FamilyHeader } from './components';

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  initial: string;
  badge?: string;
  avatarColor?: string;
}

export interface CreateFamilyData {
  familyName: string;
  familyType: string;
  expectedMemberCount?: number;
  members: FamilyMember[];
  familyCode?: string;
  family?: any;
  memberId?: string;
}

export interface CreateFamilyScreenProps {
  initialData?: Partial<CreateFamilyData>;
  onBack?: () => void;
  onCreateFamily?: (data: CreateFamilyData) => void;
}

const FAMILY_TYPE_OPTIONS = [
  'Nuclear Family',
  'Joint Family',
  'Single Parent',
  'Extended Family',
  'Couple',
  'Other',
];

const MEMBER_COUNT_PRESETS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15];

const CreateFamilyScreen: React.FC<CreateFamilyScreenProps> = ({
  initialData,
  onBack,
  onCreateFamily,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const familyState = useAppSelector((state) => state.family);
  const { loading, error } = familyState;

  const [localError, setLocalError] = useState<string | null>(null);

  const [familyName, setFamilyName] = useState(
    initialData?.familyName || 'The Sharma Family'
  );
  const [familyType, setFamilyType] = useState(
    initialData?.familyType || ''
  );
  const [expectedMemberCount, setExpectedMemberCount] = useState<number>(
    initialData?.expectedMemberCount || 5
  );
  const [expectedMemberInput, setExpectedMemberInput] = useState<string>(
    String(initialData?.expectedMemberCount || 5)
  );
  const [isMemberInputFocused, setIsMemberInputFocused] = useState(false);

  const isCreateDisabled =
    loading ||
    familyName.trim().length < 2 ||
    !familyType.trim();

  const handleSubmit = async () => {
    const trimmedName = familyName.trim();
    if (trimmedName.length < 2) {
      setLocalError('Family name must be at least 2 characters');
      return;
    }

    if (!familyType || !familyType.trim()) {
      setLocalError('Please select a family type');
      return;
    }

    setLocalError(null);
    dispatch(clearFamilyError());

    try {
      const backendFamilyType = mapFamilyTypeToBackend(familyType);
      const parsedCount = parseInt(expectedMemberInput, 10);
      const finalCount =
        !isNaN(parsedCount) && parsedCount > 0
          ? parsedCount
          : expectedMemberCount > 0
          ? expectedMemberCount
          : 5;

      const res = await dispatch(
        createFamilyThunk({
          name: trimmedName,
          familyType: backendFamilyType,
          expectedMemberCount: finalCount,
        })
      ).unwrap();

      const myMemberId =
        (res as any)?.family?.myMemberId ||
        (res as any)?.myMemberId;

      onCreateFamily?.({
        familyName: res.family?.name || trimmedName,
        familyType: res.family?.familyType || familyType,
        expectedMemberCount: finalCount,
        members: [],
        familyCode: res.family?.familyCode,
        family: res.family,
        memberId: myMemberId,
      });
    } catch (err) {
      console.log('[CreateFamilyScreen] Failed to create family:', err);
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
      <FamilyHeader
        onBack={onBack}
        stepText="Step 4 of 4"
        progressPercent={90}
      />

      <KeyboardAvoidingWrapper
        style={styles.flexOne}
        contentContainerStyle={styles.scrollContent}
        extraHeight={20}
        autoScrollToEnd={false}
      >
        <View>
          {/* Title & Subtitle */}
          <View style={styles.headingSection}>
            <Text style={styles.title}>Create your family</Text>
            <Text style={styles.subtitle}>
              You can change these details later.
            </Text>
          </View>

          {/* Form Inputs */}
          <View style={styles.formSection}>
            {/* Family Name Input */}
            <CommonInput
              label="Family name"
              value={familyName}
              onChangeText={(text) => {
                setFamilyName(text);
                if (localError || error) {
                  setLocalError(null);
                  dispatch(clearFamilyError());
                }
              }}
              placeholder="The Sharma Family"
              containerStyle={styles.inputSpacing}
              activeBorderColor={Colors.primary}
            />

            {/* Family Type Dropdown */}
            <CommonDropdown
              label="Family type"
              value={familyType}
              options={FAMILY_TYPE_OPTIONS}
              onSelect={(val) => {
                setFamilyType(val);
                if (localError || error) {
                  setLocalError(null);
                  dispatch(clearFamilyError());
                }
              }}
              placeholder="Select family type"
              containerStyle={styles.inputSpacing}
            />

            {/* Expected Member Count: 2-in-1 Input & Horizontal Scroll Presets */}
            <View style={styles.inputSpacing}>
              <Text style={styles.fieldLabel}>Expected member count</Text>
              <View
                style={[
                  styles.memberCountInputContainer,
                  isMemberInputFocused && styles.memberCountInputContainerFocused,
                ]}
              >
                <Feather
                  name="users"
                  size={18}
                  color="#8E9BAE"
                  style={styles.usersIcon}
                />
                <TextInput
                  style={styles.memberCountTextInput}
                  value={expectedMemberInput}
                  onChangeText={(val) => {
                    const cleanVal = val.replace(/[^0-9]/g, '');
                    setExpectedMemberInput(cleanVal);
                    const parsed = parseInt(cleanVal, 10);
                    if (!isNaN(parsed)) {
                      setExpectedMemberCount(parsed);
                    }
                    if (localError || error) {
                      setLocalError(null);
                      dispatch(clearFamilyError());
                    }
                  }}
                  onFocus={() => setIsMemberInputFocused(true)}
                  onBlur={() => {
                    setIsMemberInputFocused(false);
                    if (!expectedMemberInput || parseInt(expectedMemberInput, 10) < 1) {
                      setExpectedMemberInput('1');
                      setExpectedMemberCount(1);
                    }
                  }}
                  keyboardType="number-pad"
                  placeholder="5"
                  placeholderTextColor={Colors.textSecondary}
                />
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.stepperBtn}
                    onPress={() => {
                      const current = parseInt(expectedMemberInput, 10) || expectedMemberCount || 5;
                      const next = Math.max(1, current - 1);
                      setExpectedMemberCount(next);
                      setExpectedMemberInput(String(next));
                      if (localError || error) {
                        setLocalError(null);
                        dispatch(clearFamilyError());
                      }
                    }}
                  >
                    <Feather name="minus" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.stepperBtn}
                    onPress={() => {
                      const current = parseInt(expectedMemberInput, 10) || expectedMemberCount || 5;
                      const next = current + 1;
                      setExpectedMemberCount(next);
                      setExpectedMemberInput(String(next));
                      if (localError || error) {
                        setLocalError(null);
                        dispatch(clearFamilyError());
                      }
                    }}
                  >
                    <Feather name="plus" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Horizontal Scrollable Presets */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.numbersScrollContent}
                style={styles.numbersScrollView}
              >
                {MEMBER_COUNT_PRESETS.map((num) => {
                  const isSelected = expectedMemberCount === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      activeOpacity={0.7}
                      onPress={() => {
                        setExpectedMemberCount(num);
                        setExpectedMemberInput(String(num));
                        if (localError || error) {
                          setLocalError(null);
                          dispatch(clearFamilyError());
                        }
                      }}
                      style={[
                        styles.numberChip,
                        isSelected && styles.numberChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.numberChipText,
                          isSelected && styles.numberChipTextSelected,
                        ]}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomSection}>
          {localError || error ? (
            <View style={styles.errorContainer}>
              <Feather
                name="alert-circle"
                size={14}
                color="#EF4444"
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{localError || error}</Text>
            </View>
          ) : null}

          <CommonBtn
            title="Create Family"
            onPress={handleSubmit}
            loading={loading}
            disabled={isCreateDisabled}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </View>
  );
};

export default CreateFamilyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: RFValue(22),
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: RFValue(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  formSection: {
    marginBottom: 8,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
    marginBottom: 8,
  },
  memberCountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
  },
  memberCountInputContainerFocused: {
    borderColor: Colors.primary,
  },
  usersIcon: {
    marginRight: 10,
  },
  memberCountTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: RFValue(14.5),
    fontFamily: 'Roboto-SemiBold',
    paddingVertical: 0,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numbersScrollView: {
    marginTop: 10,
  },
  numbersScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  numberChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  numberChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  numberChipText: {
    color: Colors.textSecondary,
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
  },
  numberChipTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Roboto-Bold',
  },
  bottomSection: {
    marginTop: 32,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: RFValue(12),
    fontFamily: 'Roboto-Medium',
    textAlign: 'center',
  },
});
