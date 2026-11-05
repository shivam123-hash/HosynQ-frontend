import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../../units/Colors';
import ImagePath from '../../../units/ImagePath';
import CommonBtn from '../../../components/CommonBtn';
import CommonInput from '../../../components/CommonInput';
import KeyboardAvoidingWrapper from '../../../components/KeyboardAvoidingWrapper';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { sendOtp, clearAuthError } from '../../../redux/features/mobileFlow/authSlice';
import type { AuthNavigationProp } from '../../../navigation/types';

interface MobileNumberScreenProps {
  onBack?: () => void;
  onGetOtp?: (response: any) => void;
  loading?: boolean;
  errorMessage?: string | null;
}

const MobileNumberScreen: React.FC<MobileNumberScreenProps> = ({
  onBack,
  onGetOtp,
  loading: externalLoading,
  errorMessage: externalErrorMessage,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthNavigationProp<'MobileNumber'>>();
  const dispatch = useAppDispatch();
  const { loading: reduxLoading, error: reduxError } = useAppSelector(
    (state) => state.auth
  );

  const [mobileNumber, setMobileNumber] = useState('+91 ');
  const [localError, setLocalError] = useState<string | null>(null);

  const getDigits = (text: string) => {
    const withoutPrefix = text.startsWith('+91')
      ? text.slice(3)
      : text.replace(/^\+?91/, '');
    return withoutPrefix.replace(/\D/g, '');
  };

  const digits = getDigits(mobileNumber);
  const loading = externalLoading ?? reduxLoading;
  const errorMessage = externalErrorMessage ?? localError ?? reduxError;
  const isButtonDisabled = loading || digits.length !== 10 || Boolean(errorMessage);

  useEffect(() => {
    dispatch(clearAuthError());
    setLocalError(null);
  }, [dispatch]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('AuthMain');
    }
  };

  const handlePhoneChange = (text: string) => {
    let cleanDigits = '';
    if (text.startsWith('+91')) {
      cleanDigits = text.slice(3).replace(/\D/g, '');
    } else {
      cleanDigits = text.replace(/^\+?91/, '').replace(/\D/g, '');
    }

    const formatted = '+91 ' + cleanDigits;
    setMobileNumber(formatted);

    // Instant validation: if user enters more than 10 digits
    if (cleanDigits.length > 10) {
      setLocalError('Please enter a valid 10-digit mobile number');
    } else {
      setLocalError(null);
      if (reduxError) {
        dispatch(clearAuthError());
      }
    }
  };

  const handleGetOtp = async () => {
    const cleanDigits = getDigits(mobileNumber);

    if (cleanDigits.length === 0) {
      setLocalError('Please enter your mobile number');
      return;
    }

    if (cleanDigits.length !== 10) {
      setLocalError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLocalError(null);
    dispatch(clearAuthError());

    const fullPhoneNumber = `+91${cleanDigits}`;
    console.log('[MobileNumberScreen] Submitting phone number for OTP:', fullPhoneNumber);

    try {
      const res = await dispatch(sendOtp({ phoneNumber: fullPhoneNumber })).unwrap();
      console.log('[MobileNumberScreen] ✅ Send OTP Success Response:', res);

      if (onGetOtp) {
        onGetOtp(res);
      } else if (navigation?.navigate) {
        navigation.navigate('BeforeAccountSetup', {
          mobileNumber: res.phoneNumber || fullPhoneNumber,
          verificationId: res.verificationId,
          devOtp: res.otp,
          resendCooldownSeconds: res.resendCooldownSeconds || 60,
        });
      }
    } catch (err: any) {
      console.log('[MobileNumberScreen] ❌ Send OTP Error Response:', err);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header with Orange Round Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingWrapper contentContainerStyle={styles.scrollContent}>
        {/* Illustration from ImagePath (cuate.png) */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={ImagePath.cuate}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Heading and Subtitle */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Welcome to HosynQ</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to get started
          </Text>
        </View>

        {/* Input & Action Button Section */}
        <View style={styles.formSection}>
          {/* Simple Clean Mobile Number Input */}
          <CommonInput
            value={mobileNumber}
            onChangeText={handlePhoneChange}
            placeholder="+91  0000000000"
            keyboardType="phone-pad"
            maxLength={18}
            activeBackgroundColor={Colors.cardBackground}
            inactiveBackgroundColor="transparent"
            activeBorderColor={errorMessage ? '#E03137' : Colors.inputActiveBorder}
            inactiveBorderColor={errorMessage ? '#E03137' : Colors.border}
            textColor={Colors.text}
            placeholderTextColor={Colors.textSecondary}
            inputContainerStyle={styles.inputContainerCustom}
          />

          {/* Error Message if any */}
          {errorMessage ? (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={16} color="#E03137" style={styles.errorIcon} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Get OTP Button */}
          <CommonBtn
            title="Get OTP"
            onPress={handleGetOtp}
            loading={loading}
            disabled={isButtonDisabled}
            backgroundColor={!isButtonDisabled ? Colors.primary : '#4D3622'}
            textColor={!isButtonDisabled ? '#FFFFFF' : '#8A7665'}
            height={56}
            borderRadius={28}
            marginTop={errorMessage ? 14 : 20}
            fontSize={RFValue(14)}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </View>
  );
};

export default MobileNumberScreen;

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
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  illustrationWrapper: {
    width: '100%',
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: RFValue(21),
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: RFValue(13),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
    marginTop: 'auto',
  },
  inputContainerCustom: {
    height: 56,
    borderRadius: 28,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 8,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    fontSize: RFValue(12),
    color: '#E03137',
    flex: 1,
  },
});
