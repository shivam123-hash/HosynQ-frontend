import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  pollEmailStatus,
  sendEmailLink,
  simulateDevEmailClick,
} from '../../../redux/features/emailFlow/authSlice';
import { getDeviceInfo } from '../../../units/deviceInfo';
import type {
  AuthNavigationProp,
  RootNavigationProp,
} from '../../../navigation/types';

interface CheckEmailScreenProps {
  email?: string;
  verificationId?: string;
  devVerifyUrl?: string;
  devToken?: string;
  resendCooldownSeconds?: number;
  onBack?: () => void;
  onOpenEmailApp?: () => void;
  onResendLink?: () => void;
  onUseDifferentEmail?: () => void;
  onVerified?: (data: any) => void;
}

const CheckEmailScreen: React.FC<CheckEmailScreenProps> = ({
  email = 'priya.sharma@gmail.com',
  verificationId: propVerificationId,
  devVerifyUrl: propDevVerifyUrl,
  devToken: propDevToken,
  resendCooldownSeconds: propCooldown = 60,
  onBack,
  onOpenEmailApp,
  onResendLink,
  onUseDifferentEmail,
  onVerified,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthNavigationProp<'CheckEmail'>>();
  const rootNav = useNavigation<RootNavigationProp>();
  const dispatch = useAppDispatch();
  const {
    verificationId: reduxVerificationId,
    devToken: reduxDevToken,
    devVerifyUrl: reduxDevVerifyUrl,
    loading: resendLoading,
  } = useAppSelector((state) => state.emailAuth);

  const [activeVerificationId, setActiveVerificationId] = useState<string | null>(
    propVerificationId || reduxVerificationId || null
  );
  const [cooldown, setCooldown] = useState(propCooldown);
  const [isExpired, setIsExpired] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const devToken = propDevToken || reduxDevToken;
  const devVerifyUrl = propDevVerifyUrl || reduxDevVerifyUrl;

  // 1. Resend Cooldown Countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // 2. Poll Email Status every 2 seconds
  useEffect(() => {
    if (!activeVerificationId || isVerified || isExpired) return;

    console.log(
      '[CheckEmailScreen] 🔄 Starting 2-second polling for verificationId:',
      activeVerificationId
    );

    const poll = async () => {
      try {
        const res = await dispatch(
          pollEmailStatus(activeVerificationId)
        ).unwrap();

        console.log('[CheckEmailScreen] Poll tick response:', res);

        if (res.status === 'verified') {
          console.log('[CheckEmailScreen] ✅ Email Verified by User Click!', res);
          setIsVerified(true);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          if (onVerified) {
            onVerified(res);
          } else {
            // Automatic navigation to next screen:
            if (res.needsPhone) {
              console.log('[CheckEmailScreen] Navigating to AddMobileNumber');
              navigation.replace('AddMobileNumber', { email });
            } else if (res.nextStep === 'HOME') {
              console.log('[CheckEmailScreen] Navigating to Profile / Home');
              rootNav.navigate('Profile', { screen: 'Step1' });
            } else if (res.nextStep === 'CREATE_OR_JOIN_FAMILY') {
              console.log('[CheckEmailScreen] Navigating to SetUpFamily');
              navigation.replace('SetUpFamily');
            } else {
              console.log('[CheckEmailScreen] Navigating to BasicProfile');
              navigation.replace('BasicProfile');
            }
          }
        } else if (res.status === 'expired') {
          console.log('[CheckEmailScreen] ⚠️ Email link expired');
          setIsExpired(true);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.log('[CheckEmailScreen] Polling tick error:', err);
      }
    };

    // Immediate first tick
    poll();

    // Set 2000ms recurring interval
    pollIntervalRef.current = setInterval(poll, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [activeVerificationId, isVerified, isExpired, dispatch, email, navigation, rootNav, onVerified]);

  const handleBack = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('Email');
    }
  };

  const handleUseDifferentEmail = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    if (onUseDifferentEmail) {
      onUseDifferentEmail();
    } else if (navigation?.navigate) {
      navigation.navigate('Email');
    }
  };

  const handleOpenEmail = () => {
    if (onOpenEmailApp) {
      onOpenEmailApp();
    } else {
      const mailUrl = Platform.OS === 'ios' ? 'message:' : 'mailto:';
      Linking.canOpenURL(mailUrl).then((supported) => {
        if (supported) {
          Linking.openURL(mailUrl);
        }
      });
    }
  };

  const handleResendLink = async () => {
    if (cooldown > 0 || resendLoading) return;

    console.log('[CheckEmailScreen] Resending sign-in link to:', email);
    try {
      const res = await dispatch(
        sendEmailLink({
          email,
          consentAccepted: true,
          deviceInfo: getDeviceInfo(),
        })
      ).unwrap();

      console.log('[CheckEmailScreen] ✅ Resend Link Success:', res);
      setActiveVerificationId(res.verificationId);
      setIsExpired(false);
      setIsVerified(false);
      setCooldown(res.resendCooldownSeconds || 60);

      onResendLink?.();
    } catch (err) {
      console.log('[CheckEmailScreen] ❌ Resend Link Error:', err);
    }
  };

  const handleSimulateDevClick = async () => {
    if (!devToken) return;
    try {
      console.log('[CheckEmailScreen] Simulating link click with dev token:', devToken);
      await dispatch(simulateDevEmailClick(devToken)).unwrap();
      console.log('[CheckEmailScreen] ✅ Token consumed! Next poll tick will verify.');
    } catch (err) {
      console.log('[CheckEmailScreen] ❌ Simulate click error:', err);
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Central Graphic: Concentric circle badge with mail icon */}
        <View style={styles.centerSection}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Feather name="mail" size={32} color={Colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>Check you Email</Text>
          <Text style={styles.subtitle}>
            We sent a sign-in link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>. Open it on this{'\n'}
            phone. The link works for 15 minutes.
          </Text>

          {/* Real-time Polling Status Indicator */}
          {!isExpired && !isVerified ? (
            <View style={styles.pollingStatusRow}>
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.pollingText}>
                Checking email verification every 2s...
              </Text>
            </View>
          ) : isExpired ? (
            <View style={styles.expiredBanner}>
              <Feather name="alert-circle" size={16} color="#E03137" style={{ marginRight: 6 }} />
              <Text style={styles.expiredBannerText}>
                This link has expired. Tap 'Resend link' to get a new one.
              </Text>
            </View>
          ) : null}

          {/* Dev Mode Helper (only when token/verifyUrl is available in dev mode) */}
          {devToken ? (
            <TouchableOpacity
              onPress={handleSimulateDevClick}
              activeOpacity={0.7}
              style={styles.devSimulateButton}
            >
              <Feather name="terminal" size={14} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.devSimulateText}>
                [Dev Mode] Click Link to Verify
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Action Buttons Stack */}
        <View style={styles.actionSection}>
          {/* Open email app Button */}
          <CommonBtn
            title="Open email app"
            onPress={handleOpenEmail}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(14)}
          />

          {/* Resend link Button */}
          <CommonBtn
            title={
              resendLoading
                ? 'Sending...'
                : cooldown > 0
                ? `Resend link (${cooldown}s)`
                : 'Resend link'
            }
            onPress={handleResendLink}
            disabled={cooldown > 0 || resendLoading}
            backgroundColor={Colors.background}
            borderColor={cooldown > 0 ? '#3A4D66' : Colors.border}
            textColor={cooldown > 0 ? '#6E7D92' : '#FFFFFF'}
            height={56}
            borderRadius={28}
            marginTop={14}
            fontSize={RFValue(14)}
          />

          {/* Use a different email Link */}
          <TouchableOpacity
            onPress={handleUseDifferentEmail}
            activeOpacity={0.7}
            style={styles.differentEmailLink}
          >
            <Text style={styles.differentEmailText}>Use a different email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default CheckEmailScreen;

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
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  centerSection: {
    alignItems: 'center',
    marginTop: 50,
  },
  outerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: '#192C44',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#102237',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: RFValue(21),
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(18),
    paddingHorizontal: 16,
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
  },
  differentEmailLink: {
    paddingVertical: 18,
    marginTop: 4,
  },
  differentEmailText: {
    color: Colors.primary,
    fontSize: RFValue(13.5),
    fontWeight: '600',
    textAlign: 'center',
  },
  emailHighlight: {
    color: Colors.text,
    fontWeight: '600',
  },
  pollingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#0E1F35',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1C314E',
  },
  pollingText: {
    color: Colors.textSecondary,
    fontSize: RFValue(11.5),
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: 'rgba(224, 49, 55, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E03137',
  },
  expiredBannerText: {
    color: '#E03137',
    fontSize: RFValue(11.5),
    textAlign: 'center',
  },
  devSimulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#261C14',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 14,
  },
  devSimulateText: {
    color: Colors.primary,
    fontSize: RFValue(11.5),
    fontWeight: '600',
  },
});
