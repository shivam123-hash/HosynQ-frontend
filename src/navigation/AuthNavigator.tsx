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
  clearAuthError,
} from '../redux/features/mobileFlow/authSlice';
import { getDeviceInfo } from '../units/deviceInfo';
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
}) => (
  <AuthCreateAccountScreen
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }}
    onContinueMobile={() => navigation.navigate('MobileNumber')}
    onUseEmail={() => navigation.navigate('Email')}
  />
);

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
        rootNav.navigate('Home');
      } else if (res.nextStep === 'CREATE_OR_JOIN_FAMILY') {
        navigation.replace('SetUpFamily');
      } else if (res.nextStep === 'WAITING_FOR_APPROVAL') {
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
    onSendLink={(email) =>
      navigation.navigate('CheckEmail', {
        email: email && email.trim().length > 0 ? email : 'priya.sharma@gmail.com',
      })
    }
  />
);

const CheckEmailWrapper: React.FC<AuthScreenProps<'CheckEmail'>> = ({
  navigation,
  route,
}) => (
  <CheckEmailScreen
    email={route.params?.email || 'priya.sharma@gmail.com'}
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
    onResendLink={() =>
      navigation.navigate('AddMobileNumber', { email: route.params?.email })
    }
  />
);

const AddMobileNumberWrapper: React.FC<AuthScreenProps<'AddMobileNumber'>> = ({
  navigation,
  route,
}) => (
  <AddMobileNumberScreen
    email={route.params?.email || 'priya.sharma@gmail.com'}
    defaultPhoneNumber={route.params?.defaultPhoneNumber || '98765 43210'}
    onBack={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('CheckEmail', { email: route.params?.email || 'priya.sharma@gmail.com' });
      }
    }}
    onSendCode={(phone) => {
      console.log('Phone added:', phone);
      navigation.replace('BasicProfile');
    }}
    onContinueWithGoogle={() => navigation.replace('AuthMain')}
  />
);

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
    onSendJoinRequest={(familyId) => {
      console.log('Join request sent for ID:', familyId);
      navigation.navigate('FamilyInviteFound', { familyId });
    }}
    onScanQrCode={() => {
      console.log('Scan QR Code clicked');
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
      onBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('JoinFamilyId');
        }
      }}
      onAskToJoin={() => {
        console.log('Ask to join clicked');
        navigation.navigate('WaitingForApproval', {
          familyId: route.params?.familyId || 'HSQ-4821',
          familyName: route.params?.familyName || 'The Sharma Family',
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
    onApproved={() => {
      navigation.navigate('WelcomeFamily', {
        familyName: route.params?.familyName || 'The Sharma Family',
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
}) => (
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
      navigation.navigate('LifeProfileIntro');
    }}
  />
);

const LifeProfileIntroWrapper: React.FC<AuthScreenProps<'LifeProfileIntro'>> = ({
  navigation: _navigation,
}) => {
  const rootNav = useNavigation<RootNavigationProp>();

  return (
    <LifeProfileIntroScreen
      completedSections={0}
      totalSections={6}
      onStartPersonalInformation={() => {
        rootNav.navigate('Profile', { screen: 'Step1' });
      }}
      onDoThisLater={() => {
        rootNav.navigate('Auth', { screen: 'AuthMain' });
      }}
      onSectionPress={(sectionId) => {
        if (sectionId === 'interests') {
          rootNav.navigate('Profile', { screen: 'Step5' });
        } else if (sectionId === 'vaccination') {
          rootNav.navigate('Profile', { screen: 'Step4' });
        } else if (sectionId === 'health') {
          rootNav.navigate('Profile', { screen: 'Step3' });
        } else if (sectionId === 'documents') {
          rootNav.navigate('Profile', { screen: 'Step2' });
        } else {
          rootNav.navigate('Profile', { screen: 'Step1' });
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
      navigation.navigate('FamilyCreated', {
        familyName: data.familyName,
        familyId: 'HSQ-4821',
      });
    }}
  />
);

const FamilyCreatedWrapper: React.FC<AuthScreenProps<'FamilyCreated'>> = ({
  navigation,
  route,
}) => {
  const rootNav = useNavigation<RootNavigationProp>();

  return (
    <FamilyCreatedScreen
      familyName={route.params?.familyName || 'The Sharma Family'}
      familyId={route.params?.familyId || 'HSQ-4821'}
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
      onGoHome={() => {
        rootNav.navigate('Home');
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
