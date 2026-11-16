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
import {
  sendEmailLink,
  clearEmailError,
} from '../../../redux/features/emailFlow/authSlice';
import { getDeviceInfo } from '../../../units/deviceInfo';
import type { AuthNavigationProp } from '../../../navigation/types';

interface EmailScreenProps {
  onBack?: () => void;
  onSendLink?: (response: any) => void;
  loading?: boolean;
  errorMessage?: string | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailScreen: React.FC<EmailScreenProps> = ({
  onBack,
  onSendLink,
  loading: externalLoading,
  errorMessage: externalErrorMessage,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthNavigationProp<'Email'>>();
  const dispatch = useAppDispatch();
  const { loading: reduxLoading, error: reduxError } = useAppSelector(
    (state) => state.emailAuth
  );

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const loading = externalLoading ?? reduxLoading;
  const errorMessage = externalErrorMessage ?? localError ?? reduxError;
  const trimmed = email.trim();
  const isEmailValid = EMAIL_REGEX.test(trimmed);
  const isButtonDisabled = loading || !isEmailValid || Boolean(errorMessage);

  useEffect(() => {
    dispatch(clearEmailError());
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

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (localError || reduxError) {
      setLocalError(null);
      dispatch(clearEmailError());
    }
  };

  const handleSendLink = async () => {
    if (!trimmed) {
      setLocalError('Please enter your email address');
      return;
    }

    if (!isEmailValid) {
      setLocalError('Please enter a valid email address');
      return;
    }

    setLocalError(null);
    dispatch(clearEmailError());

    const payload = {
      email: trimmed,
      consentAccepted: true,
      deviceInfo: getDeviceInfo(),
    };

    console.log('[EmailScreen] Submitting email for sign-in link:', payload);

    try {
      const res = await dispatch(sendEmailLink(payload)).unwrap();
      console.log('[EmailScreen] ✅ Send Email Link Success:', res);

      if (onSendLink) {
        onSendLink(res);
      } else if (navigation?.navigate) {
        navigation.navigate('CheckEmail', {
          email: res.email || trimmed,
          verificationId: res.verificationId,
          devVerifyUrl: res.verifyUrl,
          devToken: res.token,
          resendCooldownSeconds: res.resendCooldownSeconds || 60,
        });
      }
    } catch (err: any) {
      console.log('[EmailScreen] ❌ Send Email Link Error:', err);
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
          <Text style={styles.title}>Continue with email</Text>
          <Text style={styles.subtitle}>
            We'll email you a sign-in link. No password needed.
          </Text>
        </View>

        {/* Input & Action Button Section */}
        <View style={styles.formSection}>
          <CommonInput
            value={email}
            onChangeText={handleEmailChange}
            placeholder="priya.sharma@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
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

          {/* Send sign-in link Button */}
          <CommonBtn
            title="Send sign-in link"
            onPress={handleSendLink}
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

export default EmailScreen;

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
    lineHeight: RFValue(18),
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
