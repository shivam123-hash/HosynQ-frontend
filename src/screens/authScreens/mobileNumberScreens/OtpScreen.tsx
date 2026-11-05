import React, { useState } from 'react';
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
import Colors from '../../../units/Colors';
import ImagePath from '../../../units/ImagePath';
import CommonBtn from '../../../components/CommonBtn';
import KeyboardAvoidingWrapper from '../../../components/KeyboardAvoidingWrapper';
import { OtpInput } from './components';

export type OtpScreenStatus = 'normal' | 'error' | 'expired';

interface OtpScreenProps {
  mobileNumber?: string;
  onBack?: () => void;
  onChangeNumber?: () => void;
  onVerify?: (otp: string) => void;
  onResendOtp?: () => void;
  onSendNewCode?: () => void;
  initialStatus?: OtpScreenStatus;
  loading?: boolean;
  errorMessage?: string | null;
  devOtp?: string | null;
  resendCooldownSeconds?: number;
}

const OtpScreen: React.FC<OtpScreenProps> = ({
  mobileNumber = '0000000000',
  onBack,
  onChangeNumber,
  onVerify,
  onResendOtp,
  onSendNewCode,
  initialStatus = 'normal',
  loading = false,
  errorMessage = null,
  devOtp = null,
  resendCooldownSeconds = 60,
}) => {
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<OtpScreenStatus>(initialStatus);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [timer, setTimer] = useState(resendCooldownSeconds);

  React.useEffect(() => {
    setTimer(resendCooldownSeconds);
  }, [resendCooldownSeconds]);

  React.useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  React.useEffect(() => {
    if (errorMessage) {
      setStatus('error');
    }
  }, [errorMessage]);

  const isExpired = status === 'expired';
  const hasError = status === 'error' || Boolean(errorMessage);
  const isOtpComplete = otp.length === 6;

  const handleOtpChange = (newOtp: string) => {
    setOtp(newOtp);
    if (status === 'error') {
      setStatus('normal');
    }
  };

  const handleVerify = () => {
    if (!isOtpComplete || loading) return;
    onVerify?.(otp);
  };

  const handleResend = () => {
    if (timer > 0) return;
    setOtp('');
    setStatus('normal');
    setTimer(resendCooldownSeconds);
    onResendOtp?.();
  };

  const handleSendNewCode = () => {
    setOtp('');
    setStatus('normal');
    setTimer(resendCooldownSeconds);
    onSendNewCode?.();
  };

  const handleAutofillDevOtp = () => {
    if (devOtp) {
      setOtp(devOtp);
      setStatus('normal');
    }
  };

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

      <KeyboardAvoidingWrapper contentContainerStyle={styles.scrollContent}>
        {/* Top Verification Illustration (cuateSecand.png) */}
          <View style={styles.illustrationWrapper}>
            <Image
              source={ImagePath.cuateSecand}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Heading and Sent Details */}
          <View style={styles.textSection}>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>
              An 6 digit OTP has been sent to{' '}
              <Text style={styles.mobileHighlight}>{mobileNumber}</Text>
            </Text>

            <TouchableOpacity
              onPress={onChangeNumber}
              activeOpacity={0.7}
              style={styles.changeNumberLink}
            >
              <Text style={styles.changeNumberText}>Change number</Text>
            </TouchableOpacity>
          </View>

          {/* 6 Digit OTP Input Boxes */}
          <View style={styles.otpSection}>
            <OtpInput
              length={6}
              value={otp}
              onChange={handleOtpChange}
              hasError={hasError}
              isExpired={isExpired}
            />

            {/* Dev OTP Helper */}
            {devOtp ? (
              <TouchableOpacity
                onPress={handleAutofillDevOtp}
                activeOpacity={0.7}
                style={styles.devOtpContainer}
              >
                <Feather
                  name="terminal"
                  size={14}
                  color={Colors.primary}
                  style={styles.devOtpIcon}
                />
                <Text style={styles.devOtpText}>
                  Dev OTP: <Text style={styles.devOtpCode}>{devOtp}</Text> (Tap to fill)
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Error Message */}
            {hasError ? (
              <View style={styles.statusMessageRow}>
                <Feather
                  name="alert-circle"
                  size={16}
                  color="#E03137"
                  style={styles.statusIcon}
                />
                <Text style={styles.errorText}>
                  {errorMessage ||
                    `That code didn't match. Check the SMS and try again.\n${attemptsLeft} attempts left.`}
                </Text>
              </View>
            ) : null}

            {/* Code Expired Message: "This code has expired. Codes work for 10 minutes. Ask for a new one to continue." */}
            {isExpired ? (
              <View style={styles.statusMessageRow}>
                <Feather
                  name="clock"
                  size={16}
                  color={Colors.textSecondary}
                  style={styles.statusIcon}
                />
                <Text style={styles.expiredText}>
                  This code has expired. Codes work for 10 minutes.{'\n'}
                  Ask for a new one to continue.
                </Text>
              </View>
            ) : null}
          </View>

          {/* Action Button & Resend Option */}
          <View style={styles.actionSection}>
            {isExpired ? (
              /* When expired: "Send a new code" button */
              <CommonBtn
                title="Send a new code"
                onPress={handleSendNewCode}
                loading={loading}
                backgroundColor={Colors.primary}
                textColor="#FFFFFF"
                height={56}
                borderRadius={28}
                fontSize={RFValue(14)}
              />
            ) : (
              /* Normal / Error State: "Verify" button */
              <CommonBtn
                title="Verify"
                onPress={handleVerify}
                disabled={!isOtpComplete || loading}
                loading={loading}
                backgroundColor={isOtpComplete ? Colors.primary : '#4D3622'}
                textColor={isOtpComplete ? '#FFFFFF' : '#8A7665'}
                height={56}
                borderRadius={28}
                fontSize={RFValue(14)}
              />
            )}

            {/* Resend OTP Link */}
            {!isExpired ? (
              <TouchableOpacity
                onPress={handleResend}
                activeOpacity={timer > 0 ? 1 : 0.7}
                disabled={timer > 0}
                style={styles.resendLinkContainer}
              >
                <Text
                  style={[
                    styles.resendLinkText,
                    timer > 0 && styles.resendDisabledText,
                  ]}
                >
                  {timer > 0
                    ? `Resend OTP in ${timer < 10 ? `0${timer}` : timer}s`
                    : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
      </KeyboardAvoidingWrapper>
    </View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flexOne: {
    flex: 1,
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
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  illustrationWrapper: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: RFValue(21),
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(18),
  },
  mobileHighlight: {
    color: Colors.text,
    fontWeight: '600',
  },
  changeNumberLink: {
    marginTop: 6,
    paddingVertical: 4,
  },
  changeNumberText: {
    color: Colors.primary,
    fontSize: RFValue(12.5),
    fontWeight: '600',
  },
  otpSection: {
    width: '100%',
    alignItems: 'center',
  },
  statusMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 6,
  },
  statusIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    color: '#E03137',
    fontSize: RFValue(11.5),
    lineHeight: RFValue(16),
    flex: 1,
  },
  expiredText: {
    color: Colors.textSecondary,
    fontSize: RFValue(11.5),
    lineHeight: RFValue(16),
    flex: 1,
  },
  actionSection: {
    width: '100%',
    marginTop: 28,
  },
  resendLinkContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 6,
  },
  resendLinkText: {
    color: Colors.textSecondary,
    fontSize: RFValue(13),
    fontWeight: '500',
  },
  resendDisabledText: {
    color: '#666666',
  },
  devOtpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#261C14',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
    marginBottom: 4,
  },
  devOtpIcon: {
    marginRight: 6,
  },
  devOtpText: {
    color: Colors.textSecondary,
    fontSize: RFValue(11.5),
  },
  devOtpCode: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
