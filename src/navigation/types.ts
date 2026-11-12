import type { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SecurityOptionType, BasicProfileData } from '../screens/BasicProfileScreens';
import type { CreateFamilyData } from '../screens/familyConnectionCreateScreens';
import type {
  Step1FormData,
  Step2FormData,
  Step3FormData,
  Step4FormData,
} from '../screens/completeProfileScreens';

// Auth Stack Param List
export type AuthStackParamList = {
  Onboarding: undefined;
  AuthMain: undefined;
  MobileNumber: undefined;
  BeforeAccountSetup: {
    mobileNumber: string;
    verificationId?: string;
    devOtp?: string;
    resendCooldownSeconds?: number;
  };
  Otp: {
    mobileNumber: string;
    verificationId?: string;
    devOtp?: string;
    resendCooldownSeconds?: number;
    consentAccepted?: boolean;
    deviceInfo?: string;
  };
  TooManyAttempts: { mobileNumber: string };
  Email: undefined;
  CheckEmail: {
    email: string;
    verificationId?: string;
    devVerifyUrl?: string;
    devToken?: string;
    resendCooldownSeconds?: number;
  };
  AddMobileNumber: { email?: string; defaultPhoneNumber?: string } | undefined;
  AttachPhoneOtp: {
    phoneNumber: string;
    verificationId: string;
    devOtp?: string;
    resendCooldownSeconds?: number;
    email?: string;
  };
  BasicProfile: { initialData?: Partial<BasicProfileData> } | undefined;
  DeviceSecurity: { initialOption?: SecurityOptionType } | undefined;
  NotificationPermission: undefined;
  SetUpFamily: undefined;
  CreateFamily: { familyName?: string } | undefined;
  FamilyCreated: { familyName?: string; familyId?: string } | undefined;
  JoinFamilyId: { familyId?: string; showError?: boolean } | undefined;
  FamilyInviteFound: {
    familyId?: string;
    familyName?: string;
    inviterName?: string;
    memberCount?: string;
    sentTime?: string;
    inviteToken?: string;
  } | undefined;
  WaitingForApproval: {
    familyId?: string;
    familyName?: string;
    requestedTime?: string;
  } | undefined;
  RequestRejected: {
    familyId?: string;
    familyName?: string;
  } | undefined;
  WelcomeFamily: {
    familyId?: string;
    familyName?: string;
    approverName?: string;
    userInitial?: string;
    roleTitle?: string;
  } | undefined;
  LifeProfileIntro: undefined;
};

// Profile Stack Param List (CompleteProfileScreens)
export type ProfileStackParamList = {
  Step1: { initialData?: Partial<Step1FormData> } | undefined;
  Step2: { initialData?: Partial<Step2FormData> } | undefined;
  Step3: { initialData?: Partial<Step3FormData> } | undefined;
  Step4: { initialData?: Partial<Step4FormData> } | undefined;
  Step5: undefined;
  DocumentDetailReminders: { documentId?: string } | undefined;
  SeniorMedicineSchedule: undefined;
  AddMedicine: undefined;
  WhenToTakeMedicine: undefined;
  Vaccination: undefined;
  AddVaccine: undefined;
  ChildGrowth: undefined;
  ChildMilestones: undefined;
  InterestsAndActivities: undefined;
};

// Root Stack Param List
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Navigation Prop Types
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type AuthNavigationProp<T extends keyof AuthStackParamList> =
  NativeStackNavigationProp<AuthStackParamList, T>;

export type ProfileNavigationProp<T extends keyof ProfileStackParamList> =
  NativeStackNavigationProp<ProfileStackParamList, T>;

// Screen Props Types
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, T>;

