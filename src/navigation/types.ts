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
  FamilyCreated: { familyName?: string; familyId?: string; memberId?: string } | undefined;
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
  LifeProfileIntro: { memberId?: string } | undefined;
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
  Step5: { memberId?: string; initialMode?: 'details' | 'form' } | undefined;
  DocumentDetailReminders: { documentId?: string } | undefined;
  SeniorMedicineSchedule: { memberId?: string } | undefined;
  AddMedicine: { memberId?: string } | undefined;
  WhenToTakeMedicine:
    | { medicineId?: string; medicineName?: string; memberId?: string }
    | undefined;
  MedicineDetails:
    | { medicineId: string; medicineName?: string; memberId?: string }
    | undefined;
  Vaccination:
    | {
        memberId?: string;
        initialTab?: 'vaccines' | 'growth' | 'milestones';
      }
    | undefined;
  VaccineDetail:
    | {
        memberId?: string;
        childName?: string;
        vaccine?: any;
        vaccineId?: string;
        vaccineName?: string;
      }
    | undefined;
  AddVaccine: { memberId?: string; initialData?: any } | undefined;
  ChildGrowth: { memberId?: string } | undefined;
  AddMeasurement: { memberId?: string; childName?: string } | undefined;
  ChildMilestones: { memberId?: string } | undefined;
  AddMilestone: { memberId?: string; childName?: string } | undefined;
  InterestsAndActivities: { memberId?: string } | undefined;
  InterestsDetails: { memberId?: string } | undefined;
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
  AddStaff: undefined;
  MemberProfile: { memberId?: string; memberName?: string; isHealthConsentGranted?: boolean } | undefined;
  SensitiveDataConsent: { memberId?: string; memberName?: string } | undefined;
  MemberPersonalInfo: { memberId?: string; memberName?: string } | undefined;
  MemberEducation: { memberId?: string; memberName?: string; isAdult?: boolean } | undefined;
  MemberImportantDocuments: { memberId?: string; memberName?: string } | undefined;
  MemberHealthProfile: { memberId?: string; memberName?: string } | undefined;
  MemberVaccination: { memberId?: string; memberName?: string } | undefined;
  MemberInterestsActivities: { memberId?: string; memberName?: string } | undefined;
  MemberProfileComplete: { memberId?: string; memberName?: string } | undefined;
  FamilyVault: undefined;
  VaultDocuments: undefined;
  VaultInsurance: undefined;
  VaultWarranties: undefined;
  VaultHomeAssets: undefined;
  VaultImportantContacts: undefined;
  VaultItemDetail: { item?: any } | undefined;
  MyProfile: undefined;
  NotificationPreferences: undefined;
  PrivacyConsent: undefined;
  ConsentLedger: undefined;
  PrivacyNotice: undefined;
  DataRequests: undefined;
  RequestStatus: { requestId?: string } | undefined;
  Security: undefined;
  DevicesSessions: undefined;
  UnlockMethod: undefined;
  Subscription: undefined;
  PlansTrial: undefined;
  StartFreeTrial: undefined;
  TrialNotAvailable: undefined;
  PaymentGateway: { planId?: string } | undefined;
  PaymentSuccess: { planName?: string } | undefined;
  PaymentFailed: { reason?: string } | undefined;
  UpgradeDowngrade: undefined;
  CancelSubscription: undefined;
  CancellationConfirmed: undefined;
  RenewalGracePeriod: undefined;
  BackOnFree: undefined;
  ReactivatePlan: undefined;
  InvoicesHistory: undefined;
  InvoiceDetail: { invoiceId?: string } | undefined;
  Account: undefined;
  DeleteAccount: undefined;
  ConfirmDeletion: undefined;
  AccountDeleted: undefined;
  HelpSupport: undefined;
  ContactSupport: undefined;
  Policies: undefined;
  AboutUs: undefined;
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

