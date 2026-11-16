import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SecurityOptionType, BasicProfileData } from '../screens/BasicProfileScreens';
import type {
  Step1FormData,
  Step2FormData,
  Step3FormData,
  Step4FormData,
} from '../screens/completeProfileScreens';

import type { BriefTimeframe, NavigationTab } from '../screens/mainScreens/homeScreen/types';
import type { AttentionFilterType } from '../screens/mainScreens/needsAttentionScreen';
import type { NotificationFilterType } from '../screens/mainScreens/notificationsScreen';
import type { TasksMainTab, TasksStatusTab } from '../screens/mainScreens/tasksScreen';

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
  LifeProfileIntro: { memberId?: string } | undefined;
  MyLifeProfile: { memberId?: string } | undefined;
  Step1: { initialData?: Partial<Step1FormData>; initialMode?: 'input' | 'details'; memberId?: string } | undefined;
  PersonalInfoDetails: { data?: any; memberId?: string } | undefined;
  Step2: { initialData?: Partial<Step2FormData>; memberId?: string } | undefined;
  AddPassport: undefined;
  Step3: { initialData?: Partial<Step3FormData>; initialMode?: 'input' | 'details'; memberId?: string } | undefined;
  Step4: { initialData?: Partial<Step4FormData>; initialMode?: 'form' | 'details'; memberId?: string } | undefined;
  Step5: { memberId?: string } | undefined;
  DocumentDetailReminders: { documentId?: string } | undefined;
  SeniorMedicineSchedule: undefined;
  AddMedicine: undefined;
  WhenToTakeMedicine: undefined;
  Vaccination: { memberId?: string } | undefined;
  AddVaccine: undefined;
  ChildGrowth: undefined;
  ChildMilestones: undefined;
  InterestsAndActivities: { memberId?: string } | undefined;
};

// Root Stack Param List
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Home: { initialTab?: NavigationTab } | undefined;
  YourBrief:
    | {
        initialTimeframe?: BriefTimeframe;
        forceLoading?: boolean;
        isEmpty?: boolean;
      }
    | undefined;
  NeedsAttention:
    | {
        initialFilter?: AttentionFilterType;
      }
    | undefined;
  Notifications:
    | {
        isEmpty?: boolean;
        initialFilter?: NotificationFilterType;
      }
    | undefined;
  Tasks:
    | {
        initialTab?: NavigationTab;
        initialMainTab?: TasksMainTab;
        initialStatus?: TasksStatusTab;
        forceEmpty?: boolean;
      }
    | undefined;
  Members: undefined;
  JoinRequests: undefined;
  InviteAdult: undefined;
  InvitationSent: undefined;
  AddChild: undefined;
  ChangeRole: { member?: any } | undefined;
  FamilyActionConfirmation: { type?: any; memberName?: string } | undefined;
  TransferOwnership: undefined;
  DeleteFamily: undefined;
  Staff: undefined;
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

