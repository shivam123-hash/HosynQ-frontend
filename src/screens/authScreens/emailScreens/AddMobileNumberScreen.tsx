import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import CommonInput from '../../../components/CommonInput';
import KeyboardAvoidingWrapper from '../../../components/KeyboardAvoidingWrapper';
import { AccountAlreadyExistsModal } from './components';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  attachPhone,
  clearPhoneError,
} from '../../../redux/features/emailFlow/authSlice';

export interface AddMobileNumberScreenProps {
  email?: string;
  defaultPhoneNumber?: string;
  onBack?: () => void;
  onSendCode?: (response: any) => void;
  onSkip?: () => void;
  onContinueWithGoogle?: () => void;
  loading?: boolean;
  errorMessage?: string | null;
}

const AddMobileNumberScreen: React.FC<AddMobileNumberScreenProps> = ({
  email: propEmail,
  defaultPhoneNumber = '',
  onBack,
  onSendCode,
  onSkip,
  onContinueWithGoogle,
  loading: externalLoading,
  errorMessage: externalErrorMessage,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {
    email: reduxEmail,
    phoneLoading,
    phoneError,
  } = useAppSelector((state) => state.emailAuth);

  const activeEmail = propEmail || reduxEmail || 'team@gmail.com';
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const cleanDigits = phoneNumber.replace(/\D/g, '');
  const loading = externalLoading ?? phoneLoading;
  const rawError = externalErrorMessage ?? localError ?? phoneError;
  const isConflict =
    typeof rawError === 'string' &&
    (rawError.toLowerCase().includes('already in use') ||
      rawError.toLowerCase().includes('conflict'));

  const errorMessage = isConflict ? null : rawError;
  const isButtonDisabled = loading || cleanDigits.length !== 10 || Boolean(errorMessage);

  useEffect(() => {
    dispatch(clearPhoneError());
    setLocalError(null);
  }, [dispatch]);

  // Show modal if phone number is already attached to another account
  useEffect(() => {
    if (isConflict) {
      setIsModalVisible(true);
    }
  }, [isConflict]);

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 10) {
      setPhoneNumber(digits);
      setLocalError(null);
      if (phoneError) {
        dispatch(clearPhoneError());
      }
    } else {
      setLocalError('Please enter a valid 10-digit mobile number');
    }
  };

  const handleSendCode = async () => {
    if (cleanDigits.length !== 10) {
      setLocalError('Please enter a valid 10-digit mobile number');
      return;
    }

    const formattedWithPrefix = `+91${cleanDigits}`;
    console.log('[AddMobileNumberScreen] Submitting phone number:', formattedWithPrefix);

    try {
      const res = await dispatch(
        attachPhone({ phoneNumber: formattedWithPrefix })
      ).unwrap();

      console.log('[AddMobileNumberScreen] attachPhone response:', res);
      onSendCode?.(res);
    } catch (err) {
      console.log('[AddMobileNumberScreen] attachPhone failed:', err);
    }
  };

  const handleSkip = () => {
    console.log('[AddMobileNumberScreen] User skipped adding mobile number');
    onSkip?.();
  };

  const initialLetter = activeEmail ? activeEmail.charAt(0).toUpperCase() : 'T';

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header with Orange Round Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingWrapper
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          {/* User Email Pill Badge */}
          <View style={styles.signedInBadge}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{initialLetter}</Text>
            </View>
            <Text style={styles.signedInText} numberOfLines={1}>
              Signed in as {activeEmail}
            </Text>
          </View>

          {/* Main Title & Subtitle */}
          <Text style={styles.title}>Add your mobile number</Text>
          <Text style={styles.subtitle}>
            Your family admin approves new members by SMS, and your number helps you get back in if you lose access.
          </Text>

          {/* Mobile Number Input with Orange Border */}
          <CommonInput
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            placeholder="98765 43210"
            keyboardType="phone-pad"
            maxLength={10}
            activeBackgroundColor={Colors.cardBackground}
            inactiveBackgroundColor="transparent"
            activeBorderColor={Colors.primary}
            inactiveBorderColor={Colors.primary}
            focusBorderColor={Colors.primary}
            textColor={Colors.text}
            placeholderTextColor="#5C6F84"
            leftOffset={100}
            leftComponent={
              <View style={styles.countryCodeRow}>
                <Text style={styles.countryCodeText}>+91</Text>
                <Feather
                  name="chevron-down"
                  size={14}
                  color={Colors.textSecondary}
                  style={styles.chevronIcon}
                />
                <View style={styles.verticalDivider} />
              </View>
            }
            inputContainerStyle={styles.phoneInputContainer}
          />

          {/* Inline Validation / Error Message */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={14} color="#EF4444" style={styles.errorIcon} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
        </View>

        {/* Bottom Actions Section */}
        <View style={styles.bottomSection}>
          <CommonBtn
            title="Send Code"
            onPress={handleSendCode}
            disabled={isButtonDisabled}
            loading={loading}
            backgroundColor={isButtonDisabled ? '#3A4452' : Colors.primary}
            textColor={isButtonDisabled ? '#8E9AA8' : '#FFFFFF'}
            height={56}
            borderRadius={28}
            fontSize={RFValue(14.5)}
          />

          {/* Skip link button: User proceeds directly without adding phone */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingWrapper>

      {/* Account Already Exists Modal (for 409 Conflict) */}
      <AccountAlreadyExistsModal
        visible={isModalVisible}
        phoneNumber={`+91 ${cleanDigits || '98765 43210'}`}
        onClose={() => {
          setIsModalVisible(false);
          dispatch(clearPhoneError());
        }}
        onContinueWithGoogle={() => {
          setIsModalVisible(false);
          onContinueWithGoogle?.();
        }}
        onUseDifferentNumber={() => {
          setIsModalVisible(false);
          dispatch(clearPhoneError());
          setPhoneNumber('');
        }}
      />
    </View>
  );
};

export default AddMobileNumberScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 8,
  },
  signedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: '#193049',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 32,
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#382619',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarLetter: {
    color: '#F0913A',
    fontSize: RFValue(11),
    fontWeight: '700',
  },
  signedInText: {
    color: '#8E9AA8',
    fontSize: RFValue(12),
    fontWeight: '500',
  },
  title: {
    fontSize: RFValue(21),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(18.5),
    paddingHorizontal: 12,
    marginBottom: 32,
  },
  phoneInputContainer: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    height: 58,
    borderRadius: 29,
  },
  countryCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  countryCodeText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '500',
  },
  chevronIcon: {
    marginLeft: 4,
    marginRight: 10,
  },
  verticalDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#1F3249',
    marginRight: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: RFValue(11.5),
    fontWeight: '500',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  skipButton: {
    paddingVertical: 14,
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '600',
    textAlign: 'center',
  },
});
