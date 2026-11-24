import React from 'react';
import { Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type {
  AuthStackParamList,
  AuthScreenProps,
  RootNavigationProp,
} from './types';
import { useAppDispatch, useAppSelector } from '../redux';
import {
  sendOtp,
  verifyOtp,
  googleLogin,
  appleLogin,
  clearAuthError,
} from '../redux/features/mobileFlow/authSlice';
import {
  attachPhone,
  verifyAttachedPhone,
  clearPhoneError,
} from '../redux/features/emailFlow/authSlice';
import { fetchLifeProfileFullThunk } from '../redux/features/lifeProfile/lifeProfileSlice';
import { getDeviceInfo } from '../units/DeviceInfo';
import { signInWithGoogle, signInWithApple, authServices } from '../services';
import { saveMyMemberId } from '../units/AsyncStorageManager';
// Onboarding Screens
import OnboardingScreen from '../screens/onBordingScreens/OnboardingScreen';
// Auth Screens
import {
  AuthCreateAccountScreen,
  MobileNumberScreen,
  BeforeAccountSetupScreen,
  OtpScreen,
  TooManyAttemptsScreen,
  EmailScreen,
  CheckEmailScreen,
  AddMobileNumberScreen,
} from '../screens/authScreens';
// Basic Profile Screens
import {
  BasicProfileScreen,
  DeviceSecurityScreen,
  NotificationPermissionScreen,
} from '../screens/BasicProfileScreens';
// Family Connection Create Screens
import {
  SetUpFamilyScreen,
  CreateFamilyScreen,
  FamilyCreatedScreen,
  JoinFamilyIdScreen,
  FamilyInviteFoundScreen,
  WaitingForApprovalScreen,
  RequestRejectedScreen,
  WelcomeFamilyScreen,
  LifeProfileIntroScreen,
} from '../screens/familyConnectionCreateScreens';

const Stack = createNativeStackNavigator<AuthStackParamList>();


const OnboardingWrapper: React.FC<AuthScreenProps<'Onboarding'>> = ({
  navigation,
}) => (
  <OnboardingScreen
    onFinish={() => navigation.replace('AuthMain')}
    onSkip={() => navigation.replace('AuthMain')}
  />
);

const AuthMainWrapper: React.FC<AuthScreenProps<'AuthMain'>> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const rootNav = useNavigation<RootNavigationProp>();
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [appleLoading, setAppleLoading] = React.useState(false);

  const handlePostAuthNavigation = async (
    res: any,
    fallbackName?: string
  ) => {
    if (res?.nextStep === 'HOME') {
      try {
        const meData = await authServices.getProfile();
        const resolvedMemberId =
          meData?.lifeProfile?.memberId ||
          meData?.memberId ||
          res?.user?.memberId ||
          null;
        if (resolvedMemberId) {
          await saveMyMemberId(resolvedMemberId);
          try {
            await dispatch(
              fetchLifeProfileFullThunk({ memberId: resolvedMemberId })
            ).unwrap();
          } catch (fetchErr) {
            console.log('[AuthMain] Error prefetching profile:', fetchErr);
          }
        }
        rootNav.navigate('Profile', {
          screen: 'MyLifeProfile',
          params: { memberId: resolvedMemberId || undefined },
        });
      } catch {
        rootNav.navigate('Home');
      }
    } else if (
      res?.nextStep === 'CREATE_OR_JOIN_FAMILY' ||
      res?.nextStep === 'FAMILY_SETUP'
    ) {
      navigation.replace('SetUpFamily');
    } else if (
      res?.nextStep === 'WAITING_FOR_APPROVAL' ||
      res?.nextStep === 'FAMILY_PENDING'
    ) {
      navigation.replace('WaitingForApproval');
    } else {
      navigation.replace('BasicProfile', {
        initialData: {
          fullName:
            res?.user?.fullName ||
            res?.user?.name ||
            fallbackName ||
            undefined,
        },
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const res = await signInWithGoogle();
      if (res.success && res.idToken) {
        const deviceInfo = await getDeviceInfo();
        const authRes = await dispatch(
          googleLogin({
            idToken: res.idToken,
            consentAccepted: true,
            deviceInfo,
          })
        ).unwrap();

        await handlePostAuthNavigation(authRes, res.user?.name || undefined);
      } else if (!res.cancelled) {
        Alert.alert(
          'Google Sign-In Error',
          res.error || 'Failed to sign in with Google'
        );
      }
    } catch (err: any) {
      console.log('googleLogin error:', err);
      Alert.alert(
        'Google Sign-In Error',
        err?.message || (typeof err === 'string' ? err : 'Something went wrong')
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setAppleLoading(true);
      const res = await signInWithApple();
      if (res.success && res.identityToken) {
        const deviceInfo = await getDeviceInfo();
        const authRes = await dispatch(
          appleLogin({
            identityToken: res.identityToken,
            fullName: res.user?.name || undefined,
            consentAccepted: true,
            deviceInfo,
          })
        ).unwrap();

        await handlePostAuthNavigation(authRes, res.user?.name || undefined);
      } else if (!res.cancelled) {
        Alert.alert(
          'Apple Sign-In Error',
          res.error || 'Failed to sign in with Apple'
        );
      }
    } catch (err: any) {
      console.log('appleLogin error:', err);
      Alert.alert(
        'Apple Sign-In Error',
        err?.message || (typeof err === 'string' ? err : 'Something went wrong')
      );
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <AuthCreateAccountScreen
      onBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }}
      onContinueMobile={() => navigation.navigate('MobileNumber')}
      onUseEmail={() => navigation.navigate('Email')}
      onContinueGoogle={handleGoogleSignIn}
      onContinueApple={handleAppleSignIn}
      isGoogleLoading={googleLoading}
      isAppleLoading={appleLoading}
    />
  );
};

const MobileNumberWrapper: React.FC<AuthScreenProps<'MobileNumber'>> = ({
  navigation,
}) => (
  <MobileNumberScreen
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('AuthMain');
      }
    }}
    onGetOtp={(res) => {
      navigation.navigate('BeforeAccountSetup', {
        mobileNumber: res.phoneNumber || res.mobileNumber,
        verificationId: res.verificationId,
        devOtp: res.otp,
        resendCooldownSeconds: res.resendCooldownSeconds || 60,
      });
    }}
  />
);

const BeforeAccountSetupWrapper: React.FC<
  AuthScreenProps<'BeforeAccountSetup'>
> = ({ navigation, route }) => (
  <BeforeAccountSetupScreen
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MobileNumber');
      }
    }}
    onAgreeAndContinue={(consentAccepted) => {
      console.log('[BeforeAccountSetup] Consent Accepted:', consentAccepted);
      navigation.navigate('Otp', {
        mobileNumber: route.params?.mobileNumber || '',
        verificationId: route.params?.verificationId,
        devOtp: route.params?.devOtp,
        resendCooldownSeconds: route.params?.resendCooldownSeconds || 60,
        consentAccepted,
        deviceInfo: getDeviceInfo(),
      });
    }}
  />
);

const OtpWrapper: React.FC<AuthScreenProps<'Otp'>> = ({
  navigation,
  route,
}) => {
  const rootNav = useNavigation<RootNavigationProp>();
  const dispatch = useAppDispatch();
  const {
    loading,
    error,
    verificationId: reduxVerificationId,
    activePhoneNumber,
    devPlaintextOtp,
  } = useAppSelector((state) => state.auth);

  const verificationId = route.params?.verificationId || reduxVerificationId;
  const mobileNumber =
    route.params?.mobileNumber || activePhoneNumber || '458-465-6466';
  const devOtp = route.params?.devOtp || devPlaintextOtp;
  const cooldown = route.params?.resendCooldownSeconds || 60;
  const consentAccepted = route.params?.consentAccepted ?? true;
  const deviceInfo = route.params?.deviceInfo || getDeviceInfo();

  React.useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleVerify = async (code: string) => {
    if (!verificationId) {
      Alert.alert(
        'Session Expired',
        'Verification session expired. Please request a new OTP.'
      );
      navigation.navigate('MobileNumber');
      return;
    }

    try {
      const res = await dispatch(
        verifyOtp({
          verificationId,
          otp: code,
          deviceInfo,
          consentAccepted,
        })
      ).unwrap();

      // Navigate using replace so OTP screen is removed from backstack
      if (res.nextStep === 'HOME') {
        try {
          const meData = await authServices.getProfile();
          const resolvedMemberId =
            meData?.lifeProfile?.memberId ||
            meData?.memberId ||
            (res as any)?.user?.memberId ||
            null;
          if (resolvedMemberId) {
            await saveMyMemberId(resolvedMemberId);
            try {
              await dispatch(
                fetchLifeProfileFullThunk({ memberId: resolvedMemberId })
              ).unwrap();
            } catch (fetchErr) {
              console.log('[OtpScreen] Error prefetching profile:', fetchErr);
            }
          }
          rootNav.navigate('Profile', {
            screen: 'MyLifeProfile',
            params: { memberId: resolvedMemberId || undefined },
          });
        } catch {
          rootNav.navigate('Home');
        }
      } else if (res.nextStep === 'CREATE_OR_JOIN_FAMILY' || res.nextStep === 'FAMILY_SETUP') {
        navigation.replace('SetUpFamily');
      } else if (res.nextStep === 'WAITING_FOR_APPROVAL' || res.nextStep === 'FAMILY_PENDING') {
        navigation.replace('WaitingForApproval');
      } else {
        navigation.replace('BasicProfile');
      }
    } catch (err: any) {
      console.log('verifyOtp error:', err);
    }
  };

  const handleResendOtp = async () => {
    try {
      await dispatch(sendOtp({ phoneNumber: mobileNumber })).unwrap();
    } catch (err: any) {
      console.log('resendOtp error:', err);
    }
  };

  return (
    <OtpScreen
      mobileNumber={mobileNumber}
      devOtp={devOtp}
      resendCooldownSeconds={cooldown}
      loading={loading}
      errorMessage={error}
      onBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('MobileNumber');
        }
      }}
      onChangeNumber={() => {
        navigation.navigate('MobileNumber');
      }}
      onVerify={handleVerify}
      onResendOtp={handleResendOtp}
      onSendNewCode={handleResendOtp}
    />
  );
};

const TooManyAttemptsWrapper: React.FC<AuthScreenProps<'TooManyAttempts'>> = ({
  navigation,
  route,
}) => (
  <TooManyAttemptsScreen
    mobileNumber={`+91\n${route.params?.mobileNumber || '458-465-6466'}`}
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MobileNumber');
      }
    }}
    onSignInAnotherWay={() => navigation.replace('AuthMain')}
    onContactSupport={() => console.log('Contact support')}
  />
);

const EmailWrapper: React.FC<AuthScreenProps<'Email'>> = ({ navigation }) => (
  <EmailScreen
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('AuthMain');
      }
    }}
    onSendLink={(res) => {
      navigation.navigate('CheckEmail', {
        email: typeof res === 'string' ? res : res.email,
        verificationId: res?.verificationId,
        devVerifyUrl: res?.verifyUrl,
        devToken: res?.token,
        resendCooldownSeconds: res?.resendCooldownSeconds || 60,
      });
    }}
  />
);

const CheckEmailWrapper: React.FC<AuthScreenProps<'CheckEmail'>> = ({
  navigation,
  route,
}) => (
  <CheckEmailScreen
    email={route.params?.email || 'priya.sharma@gmail.com'}
    verificationId={route.params?.verificationId}
    devVerifyUrl={route.params?.devVerifyUrl}
    devToken={route.params?.devToken}
    resendCooldownSeconds={route.params?.resendCooldownSeconds || 60}
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Email');
      }
    }}
    onUseDifferentEmail={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Email');
      }
    }}
    onResendLink={() => {
      console.log('Resend triggered in CheckEmailWrapper');
    }}
  />
);

const AddMobileNumberWrapper: React.FC<AuthScreenProps<'AddMobileNumber'>> = ({
  navigation,
  route,
}) => {
  const rootNav = useNavigation<RootNavigationProp>();
  const dispatch = useAppDispatch();

  return (
    <AddMobileNumberScreen
      email={route.params?.email}
      defaultPhoneNumber={route.params?.defaultPhoneNumber}
      onBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('CheckEmail', {
            email: route.params?.email || 'team@gmail.com',
          });
        }
      }}
      onSendCode={(res) => {
        console.log('[AddMobileNumberWrapper] Code sent, navigating to AttachPhoneOtp:', res);
        navigation.navigate('AttachPhoneOtp', {
          phoneNumber: res?.phoneNumber || '',
          verificationId: res?.verificationId || '',
          devOtp: res?.otp,
          resendCooldownSeconds: res?.resendCooldownSeconds || 60,
          email: route.params?.email,
        });
      }}
      onSkip={async () => {
        try {
          const meData = await authServices.getProfile();
          if (
            meData?.inFamily ||
            meData?.nextStep === 'HOME' ||
            Boolean(meData?.lifeProfile?.memberId)
          ) {
            const resolvedMemberId =
              meData?.lifeProfile?.memberId || meData?.memberId || null;
            if (resolvedMemberId) {
              await saveMyMemberId(resolvedMemberId);
              try {
                await dispatch(
                  fetchLifeProfileFullThunk({ memberId: resolvedMemberId })
                ).unwrap();
              } catch (e) {}
            }
            rootNav.navigate('Profile', {
              screen: 'MyLifeProfile',
              params: { memberId: resolvedMemberId || undefined },
            });
            return;
          }
        } catch (e) {
          console.log('[AddMobileNumberWrapper] Skip check error:', e);
        }
        console.log('[AddMobileNumberWrapper] Skipping phone attach, going to BasicProfile');
        navigation.replace('BasicProfile');
      }}
      onContinueWithGoogle={() => navigation.replace('AuthMain')}
    />
  );
};

const AttachPhoneOtpWrapper: React.FC<AuthScreenProps<'AttachPhoneOtp'>> = ({
  navigation,
  route,
}) => {
  const rootNav = useNavigation<RootNavigationProp>();
  const dispatch = useAppDispatch();
  const {
    phoneLoading,
    phoneError,
    phoneVerificationId,
    attachedPhoneNumber,
    devPhoneOtp,
  } = useAppSelector((state) => state.emailAuth);

  const verificationId = route.params?.verificationId || phoneVerificationId;
  const phoneNumber = route.params?.phoneNumber || attachedPhoneNumber || '';
  const devOtp = route.params?.devOtp || devPhoneOtp;
  const cooldown = route.params?.resendCooldownSeconds || 60;
  const email = route.params?.email;

  React.useEffect(() => {
    dispatch(clearPhoneError());
  }, [dispatch]);

  const handleVerify = async (code: string) => {
    if (!verificationId) {
      Alert.alert(
        'Session Expired',
        'Verification session expired. Please request a new OTP.'
      );
      navigation.navigate('AddMobileNumber', { email });
      return;
    }

    try {
      const res = await dispatch(
        verifyAttachedPhone({
          verificationId,
          otp: code,
          deviceInfo: getDeviceInfo(),
        })
      ).unwrap();

      console.log('[AttachPhoneOtp] Phone attached verified:', res);
      try {
        const meData = await authServices.getProfile();
        if (
          meData?.inFamily ||
          meData?.nextStep === 'HOME' ||
          Boolean(meData?.lifeProfile?.memberId)
        ) {
          const resolvedMemberId =
            meData?.lifeProfile?.memberId || meData?.memberId || null;
          if (resolvedMemberId) {
            await saveMyMemberId(resolvedMemberId);
            try {
              await dispatch(
                fetchLifeProfileFullThunk({ memberId: resolvedMemberId })
              ).unwrap();
            } catch (e) {}
          }
          rootNav.navigate('Profile', {
            screen: 'MyLifeProfile',
            params: { memberId: resolvedMemberId || undefined },
          });
          return;
        }
      } catch (e) {
        console.log('[AttachPhoneOtp] Profile fetch error:', e);
      }

      // Navigate to BasicProfile for new users
      navigation.replace('BasicProfile');
    } catch (err: any) {
      console.log('[AttachPhoneOtp] verify error:', err);
    }
  };

  const handleResendOtp = async () => {
    if (!phoneNumber) return;
    try {
      await dispatch(attachPhone({ phoneNumber })).unwrap();
    } catch (err: any) {
      console.log('[AttachPhoneOtp] resend error:', err);
    }
  };

  return (
    <OtpScreen
      mobileNumber={phoneNumber}
      devOtp={devOtp}
      resendCooldownSeconds={cooldown}
      loading={phoneLoading}
      errorMessage={phoneError}
      onBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('AddMobileNumber', { email });
        }
      }}
      onChangeNumber={() => {
        navigation.navigate('AddMobileNumber', { email });
      }}
      onVerify={handleVerify}
      onResendOtp={handleResendOtp}
      onSendNewCode={handleResendOtp}
    />
  );
};

const BasicProfileWrapper: React.FC<AuthScreenProps<'BasicProfile'>> = ({
  navigation,
  route,
}) => (
  <BasicProfileScreen
    initialData={route.params?.initialData}
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('AuthMain');
      }
    }}
    onContinue={(profileData) => {
      console.log('Basic Profile Data saved:', profileData);
      navigation.navigate('DeviceSecurity');
    }}
  />
);

const DeviceSecurityWrapper: React.FC<AuthScreenProps<'DeviceSecurity'>> = ({
  navigation,
  route,
}) => (
  <DeviceSecurityScreen
    initialOption={route.params?.initialOption || 'fingerprint'}
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('BasicProfile');
      }
    }}
    onContinue={(selectedSecurity) => {
      console.log('Device security selected:', selectedSecurity);
      navigation.navigate('NotificationPermission');
    }}
  />
);

const NotificationPermissionWrapper: React.FC<
  AuthScreenProps<'NotificationPermission'>
> = ({ navigation }) => (
  <NotificationPermissionScreen
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('DeviceSecurity');
      }
    }}
    onTurnOnNotifications={() => {
      console.log('Notifications enabled');
      navigation.navigate('SetUpFamily');
    }}
    onNotNow={() => {
      console.log('Notifications skipped');
      navigation.navigate('SetUpFamily');
    }}
  />
);

const SetUpFamilyWrapper: React.FC<AuthScreenProps<'SetUpFamily'>> = ({
  navigation,
}) => (
  <SetUpFamilyScreen
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('NotificationPermission');
      }
    }}
    onContinue={(selectedType) => {
      console.log('Setup family option:', selectedType);
      if (selectedType === 'join') {
        navigation.navigate('JoinFamilyId');
      } else {
        navigation.navigate('CreateFamily');
      }
    }}
    onJoinFamily={() => {
      console.log('Join family chosen');
      navigation.navigate('JoinFamilyId');
    }}
  />
);

const JoinFamilyIdWrapper: React.FC<AuthScreenProps<'JoinFamilyId'>> = ({
  navigation,
  route,
}) => (
  <JoinFamilyIdScreen
    initialFamilyId={route.params?.familyId || 'HSQ- 4821'}
    initialShowError={route.params?.showError || false}
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('SetUpFamily');
      }
    }}
    onSendJoinRequest={(data) => {
      console.log('Join request sent successfully:', data);
      const targetFamilyId =
        typeof data === 'string' ? data : data.familyCode || data.familyId;
      const targetFamilyName =
        typeof data === 'string' ? 'The Sharma Family' : data.familyName;

      navigation.navigate('WaitingForApproval', {
        familyId: targetFamilyId,
        familyName: targetFamilyName,
        requestedTime: 'Just now',
      });
    }}
  />
);

const FamilyInviteFoundWrapper: React.FC<AuthScreenProps<'FamilyInviteFound'>> = ({
  navigation,
  route,
}) => {
  return (
    <FamilyInviteFoundScreen
      familyId={route.params?.familyId || 'HSQ-4821'}
      familyName={route.params?.familyName || 'The Sharma Family'}
      inviterName={route.params?.inviterName || 'Priya'}
      memberCount={route.params?.memberCount || '5 people'}
      sentTime={route.params?.sentTime || 'Today, 10:48 AM'}
      inviteToken={route.params?.inviteToken}
      onBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('JoinFamilyId');
        }
      }}
      onAskToJoin={(res) => {
        console.log('Ask to join succeeded:', res);
        navigation.navigate('WaitingForApproval', {
          familyId:
            res?.familyCode ||
            res?.familyId ||
            route.params?.familyId ||
            'HSQ-4821',
          familyName:
            res?.familyName ||
            route.params?.familyName ||
            'The Sharma Family',
          requestedTime: 'Just now',
        });
      }}
      onNotMyFamily={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('JoinFamilyId');
        }
      }}
    />
  );
};

const WaitingForApprovalWrapper: React.FC<AuthScreenProps<'WaitingForApproval'>> = ({
  navigation,
  route,
}) => (
  <WaitingForApprovalScreen
    familyId={route.params?.familyId || 'HSQ-4821'}
    familyName={route.params?.familyName || 'The Sharma Family'}
    requestedTime={route.params?.requestedTime || 'Today, 11:02 AM'}
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('SetUpFamily');
      }
    }}
    onRemindAdmin={() => {
      navigation.navigate('WelcomeFamily', {
        familyName: route.params?.familyName || 'The Sharma Family',
      });
    }}
    onCancelRequest={() => {
      navigation.navigate('RequestRejected', {
        familyName: route.params?.familyName || 'The Sharma Family',
      });
    }}
    onApproved={(familyData) => {
      navigation.navigate('WelcomeFamily', {
        familyName:
          familyData?.name ||
          route.params?.familyName ||
          'The Sharma Family',
      });
    }}
    onRejected={() => {
      navigation.navigate('RequestRejected', {
        familyName: route.params?.familyName || 'The Sharma Family',
      });
    }}
  />
);

const RequestRejectedWrapper: React.FC<AuthScreenProps<'RequestRejected'>> = ({
  navigation,
  route,
}) => (
  <RequestRejectedScreen
    familyName={route.params?.familyName || 'The Sharma Family'}
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('SetUpFamily');
      }
    }}
    onJoinDifferentFamily={() => {
      navigation.navigate('JoinFamilyId');
    }}
    onCreateOwnFamily={() => {
      navigation.navigate('CreateFamily');
    }}
  />
);

const WelcomeFamilyWrapper: React.FC<AuthScreenProps<'WelcomeFamily'>> = ({
  navigation,
  route,
}) => {
  const familyState = useAppSelector((state) => state.family);
  const authUser = useAppSelector((state) => state.auth?.user);
  const memberId =
    familyState.myMemberId ||
    familyState.family?.myMemberId ||
    authUser?.memberId;

  return (
    <WelcomeFamilyScreen
      familyName={route.params?.familyName || 'The Sharma Family'}
      approverName={route.params?.approverName || 'Priya'}
      userInitial={route.params?.userInitial || 'R'}
      roleTitle={route.params?.roleTitle || 'Adult member'}
      buttonText="Next"
      onBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('SetUpFamily');
        }
      }}
      onContinue={() => {
        navigation.navigate('LifeProfileIntro', { memberId });
      }}
    />
  );
};

const LifeProfileIntroWrapper: React.FC<AuthScreenProps<'LifeProfileIntro'>> = ({
  navigation: _navigation,
  route,
}) => {
  const rootNav = useNavigation<RootNavigationProp>();
  const familyState = useAppSelector((state) => state.family);
  const authUser = useAppSelector((state) => state.auth?.user);
  const memberId =
    route.params?.memberId ||
    familyState.myMemberId ||
    familyState.family?.myMemberId ||
    authUser?.memberId;

  return (
    <LifeProfileIntroScreen
      completedSections={0}
      totalSections={6}
      onStartPersonalInformation={() => {
        rootNav.navigate('Profile', {
          screen: 'Step1',
          params: { memberId, initialMode: 'input' },
        });
      }}
      onDoThisLater={() => {
        rootNav.navigate('Profile', {
          screen: 'MyLifeProfile',
          params: { memberId },
        });
      }}
      onSectionPress={(sectionId) => {
        if (sectionId === 'personal') {
          rootNav.navigate('Profile', {
            screen: 'Step1',
            params: { memberId, initialMode: 'input' },
          });
        } else {
          rootNav.navigate('Profile', {
            screen: 'MyLifeProfile',
            params: { memberId },
          });
        }
      }}
    />
  );
};

const CreateFamilyWrapper: React.FC<AuthScreenProps<'CreateFamily'>> = ({
  navigation,
  route,
}) => (
  <CreateFamilyScreen
    initialData={{
      familyName: route.params?.familyName || 'The Sharma Family',
    }}
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('SetUpFamily');
      }
    }}
    onCreateFamily={(data) => {
      console.log('Family created:', data);
      const memberId =
        data.memberId ||
        data.family?.myMemberId ||
        data.family?.members?.[0]?.id;
      navigation.navigate('FamilyCreated', {
        familyName: data.familyName,
        familyId: data.familyCode || 'HSQ-4821',
        memberId,
      });
    }}
  />
);

const FamilyCreatedWrapper: React.FC<AuthScreenProps<'FamilyCreated'>> = ({
  navigation,
  route,
}) => {
  const rootNav = useNavigation<RootNavigationProp>();
  const familyState = useAppSelector((state) => state.family);

  const displayFamilyName =
    route.params?.familyName ||
    familyState.family?.name ||
    'The Sharma Family';

  const displayFamilyId =
    route.params?.familyId ||
    familyState.familyCode ||
    familyState.family?.familyCode ||
    'HSQ-4821';

  const memberId =
    route.params?.memberId ||
    familyState.myMemberId ||
    familyState.family?.myMemberId;

  return (
    <FamilyCreatedScreen
      familyName={displayFamilyName}
      familyId={displayFamilyId}
      onBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('SetUpFamily');
        }
      }}
      onShareInvite={() => {
        console.log('Invite shared');
      }}
      onGoToProfileComplete={() => {
        navigation.navigate('LifeProfileIntro', { memberId });
      }}
      onGoHome={() => {
        navigation.navigate('LifeProfileIntro', { memberId });
      }}
    />
  );
};

// --- Auth Navigator ---

export interface AuthNavigatorProps {
  initialRouteName?: keyof AuthStackParamList;
}

const AuthNavigator: React.FC<AuthNavigatorProps> = ({
  initialRouteName = 'Onboarding',
}) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingWrapper} />
      <Stack.Screen name="AuthMain" component={AuthMainWrapper} />
      <Stack.Screen name="MobileNumber" component={MobileNumberWrapper} />
      <Stack.Screen
        name="BeforeAccountSetup"
        component={BeforeAccountSetupWrapper}
      />
      <Stack.Screen name="Otp" component={OtpWrapper} />
      <Stack.Screen name="TooManyAttempts" component={TooManyAttemptsWrapper} />
      <Stack.Screen name="Email" component={EmailWrapper} />
      <Stack.Screen name="CheckEmail" component={CheckEmailWrapper} />
      <Stack.Screen name="AddMobileNumber" component={AddMobileNumberWrapper} />
      <Stack.Screen name="AttachPhoneOtp" component={AttachPhoneOtpWrapper} />
      <Stack.Screen name="BasicProfile" component={BasicProfileWrapper} />
      <Stack.Screen name="DeviceSecurity" component={DeviceSecurityWrapper} />
      <Stack.Screen
        name="NotificationPermission"
        component={NotificationPermissionWrapper}
      />
      <Stack.Screen name="SetUpFamily" component={SetUpFamilyWrapper} />
      <Stack.Screen name="JoinFamilyId" component={JoinFamilyIdWrapper} />
      <Stack.Screen
        name="FamilyInviteFound"
        component={FamilyInviteFoundWrapper}
      />
      <Stack.Screen
        name="WaitingForApproval"
        component={WaitingForApprovalWrapper}
      />
      <Stack.Screen
        name="RequestRejected"
        component={RequestRejectedWrapper}
      />
      <Stack.Screen
        name="WelcomeFamily"
        component={WelcomeFamilyWrapper}
      />
      <Stack.Screen
        name="LifeProfileIntro"
        component={LifeProfileIntroWrapper}
      />
      <Stack.Screen name="CreateFamily" component={CreateFamilyWrapper} />
      <Stack.Screen name="FamilyCreated" component={FamilyCreatedWrapper} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
