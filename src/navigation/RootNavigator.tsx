import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList, AuthStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import ProfileNavigator from './ProfileNavigator';
import YourBriefScreen from '../screens/mainScreens/yourBriefScreen/YourBriefScreen';
import NeedsAttentionScreen from '../screens/mainScreens/needsAttentionScreen/NeedsAttentionScreen';
import NotificationsScreen from '../screens/mainScreens/notificationsScreen/NotificationsScreen';
import MainTabScreen from '../screens/mainScreens/mainTabScreen/MainTabScreen';
import MembersScreen from '../screens/mainScreens/familyPulse/MembersScreen';
import JoinRequestsScreen from '../screens/mainScreens/familyPulse/JoinRequestsScreen';
import InviteAdultScreen from '../screens/mainScreens/familyPulse/InviteAdultScreen';
import InvitationSentScreen from '../screens/mainScreens/familyPulse/InvitationSentScreen';
import AddChildScreen from '../screens/mainScreens/familyPulse/AddChildScreen';
import ChangeRoleScreen from '../screens/mainScreens/familyPulse/ChangeRoleScreen';
import FamilyActionConfirmationScreen from '../screens/mainScreens/familyPulse/FamilyActionConfirmationScreen';
import TransferOwnershipScreen from '../screens/mainScreens/familyPulse/TransferOwnershipScreen';
import DeleteFamilyScreen from '../screens/mainScreens/familyPulse/DeleteFamilyScreen';
import StaffScreen from '../screens/mainScreens/familyPulse/StaffScreen';
import {
  MemberProfileScreen,
  SensitiveDataConsentScreen,
  PersonalInfoSectionScreen,
  EducationSectionScreen,
  ImportantDocumentsSectionScreen,
  HealthProfileSectionScreen,
  VaccinationSectionScreen,
  InterestsActivitiesSectionScreen,
  ProfileCompleteScreen,
} from '../screens/mainScreens/memberProfile';
import {
  FamilyVaultScreen,
  DocumentsRenewalsScreen,
  InsuranceVaultScreen,
  WarrantiesBillsScreen,
  HomeAssetsScreen,
  ImportantContactsScreen,
  VaultItemDetailScreen,
} from '../screens/mainScreens/familyVault';
import {
  MyProfileScreen,
  NotificationPreferencesScreen,
  PrivacyConsentScreen,
  ConsentLedgerScreen,
  PrivacyNoticeScreen,
  DataRequestsScreen,
  RequestStatusScreen,
  SecurityScreen,
  DevicesSessionsScreen,
  UnlockMethodScreen,
  SubscriptionScreen,
  PlansTrialScreen,
  StartFreeTrialScreen,
  TrialNotAvailableModal,
  PaymentGatewayModal,
  UpgradeDowngradeScreen,
  CancelSubscriptionScreen,
  CancellationConfirmedScreen,
  RenewalGracePeriodScreen,
  BackOnFreeScreen,
  ReactivatePlanScreen,
  InvoicesHistoryScreen,
  InvoiceDetailScreen,
  PaymentSuccessScreen,
  PaymentFailedScreen,
  AccountScreen,
  DeleteAccountScreen,
  ConfirmDeletionScreen,
  AccountDeletedScreen,
  HelpSupportScreen,
  ContactSupportScreen,
  PoliciesScreen,
  AboutUsScreen,
} from '../screens/mainScreens/menuScreens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export interface RootNavigatorProps {
  initialRouteName?: keyof RootStackParamList;
  authInitialRouteName?: keyof AuthStackParamList;
  initialMemberId?: string;
}

const RootNavigator: React.FC<RootNavigatorProps> = ({
  initialRouteName = 'Home',
  authInitialRouteName = 'Onboarding',
  initialMemberId,
}) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Auth">
        {(props) => (
          <AuthNavigator {...props} initialRouteName={authInitialRouteName} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Profile">
        {(props) => (
          <ProfileNavigator
            {...props}
            initialMemberId={initialMemberId}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Home">
        {(props) => (
          <MainTabScreen
            initialTab={props.route.params?.initialTab || 'home'}
            navigation={props.navigation}
            onProfilePress={() =>
              props.navigation.navigate('MyProfile')
            }
            onOpenBrief={(timeframe) =>
              props.navigation.navigate('YourBrief', {
                initialTimeframe: timeframe || 'today',
              })
            }
            onOpenNeedsAttention={() =>
              props.navigation.navigate('NeedsAttention')
            }
            onNotificationsPress={() =>
              props.navigation.navigate('Notifications')
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="YourBrief">
        {(props) => (
          <YourBriefScreen
            initialTimeframe={props.route.params?.initialTimeframe}
            forceLoading={props.route.params?.forceLoading}
            isEmpty={props.route.params?.isEmpty}
            onBack={() => props.navigation.goBack()}
            onOpenCalendar={() =>
              props.navigation.navigate('Home')
            }
            onOpenTasks={() =>
              props.navigation.navigate('Tasks')
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NeedsAttention">
        {(props) => (
          <NeedsAttentionScreen
            initialFilter={props.route.params?.initialFilter}
            onBack={() => props.navigation.goBack()}
            onItemPress={(item) => {
              if (item.category === 'renewals') {
                props.navigation.navigate('VaultDocuments');
              } else if (item.category === 'important_dates') {
                props.navigation.navigate('Home', { initialTab: 'calendar' });
              } else {
                props.navigation.navigate('Tasks');
              }
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Notifications">
        {(props) => (
          <NotificationsScreen
            isEmpty={props.route.params?.isEmpty}
            initialFilter={props.route.params?.initialFilter}
            onBack={() => props.navigation.goBack()}
            onItemPress={(item) => {
              if (item.category === 'tasks') {
                props.navigation.navigate('Tasks');
              } else if (item.category === 'renewals') {
                props.navigation.navigate('VaultDocuments');
              } else if (item.category === 'brief') {
                props.navigation.navigate('YourBrief');
              } else if (
                item.category === 'family' &&
                item.title.toLowerCase().includes('join')
              ) {
                props.navigation.navigate('JoinRequests');
              } else if (item.category === 'family') {
                props.navigation.navigate('Members');
              } else {
                props.navigation.navigate('Home');
              }
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Tasks">
        {(props) => (
          <MainTabScreen
            initialTab="tasks"
            navigation={props.navigation}
            onProfilePress={() =>
              props.navigation.navigate('MyProfile')
            }
            onOpenBrief={(timeframe) =>
              props.navigation.navigate('YourBrief', {
                initialTimeframe: timeframe || 'today',
              })
            }
            onOpenNeedsAttention={() =>
              props.navigation.navigate('NeedsAttention')
            }
            onNotificationsPress={() =>
              props.navigation.navigate('Notifications')
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Members">
        {(props) => (
          <MembersScreen
            {...props}
            onBack={() => props.navigation.navigate('Home')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="JoinRequests">
        {(props) => (
          <JoinRequestsScreen
            {...props}
            onBack={() => props.navigation.navigate('Members')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="InviteAdult">
        {(props) => (
          <InviteAdultScreen
            {...props}
            onBack={() => props.navigation.navigate('Members')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="InvitationSent">
        {(props) => (
          <InvitationSentScreen
            {...props}
            onBack={() => props.navigation.navigate('Members')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="AddChild">
        {(props) => (
          <AddChildScreen
            {...props}
            onBack={() => props.navigation.navigate('Members')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ChangeRole">
        {(props) => (
          <ChangeRoleScreen
            {...props}
            onBack={() => props.navigation.navigate('Members')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="FamilyActionConfirmation">
        {(props) => (
          <FamilyActionConfirmationScreen
            {...props}
            onBack={() => props.navigation.navigate('Members')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="TransferOwnership">
        {(props) => (
          <TransferOwnershipScreen
            {...props}
            onBack={() => props.navigation.navigate('Members')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="DeleteFamily">
        {(props) => (
          <DeleteFamilyScreen
            {...props}
            onBack={() => props.navigation.navigate('Members')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Staff">
        {(props) => (
          <StaffScreen
            {...props}
            onBack={() => props.navigation.navigate('Members')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MemberProfile">
        {(props) => {
          const memberName = props.route.params?.memberName || 'Aarav';
          const isHealthConsentGranted = props.route.params?.isHealthConsentGranted || false;
          return (
            <MemberProfileScreen
              isHealthConsentGranted={isHealthConsentGranted}
              onBack={() => {
                if (props.navigation.canGoBack()) {
                  props.navigation.goBack();
                } else {
                  props.navigation.navigate('Members');
                }
              }}
              onEditProfile={() => {
                props.navigation.navigate('MemberPersonalInfo', { memberName });
              }}
              onNavigateSection={(sectionKey) => {
                switch (sectionKey) {
                  case 'A':
                    props.navigation.navigate('MemberPersonalInfo', { memberName });
                    break;
                  case 'B':
                    props.navigation.navigate('MemberEducation', { memberName });
                    break;
                  case 'C':
                    props.navigation.navigate('MemberImportantDocuments', { memberName });
                    break;
                  case 'D':
                    if (isHealthConsentGranted) {
                      props.navigation.navigate('MemberHealthProfile', { memberName });
                    } else {
                      props.navigation.navigate('SensitiveDataConsent', { memberName });
                    }
                    break;
                  case 'E':
                    props.navigation.navigate('MemberVaccination', { memberName });
                    break;
                  case 'F':
                    props.navigation.navigate('MemberInterestsActivities', { memberName });
                    break;
                }
              }}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="SensitiveDataConsent">
        {(props) => {
          const memberName = props.route.params?.memberName || 'Aarav';
          return (
            <SensitiveDataConsentScreen
              {...props}
              memberName={memberName}
              onClose={() => {
                if (props.navigation.canGoBack()) {
                  props.navigation.goBack();
                } else {
                  props.navigation.navigate('MemberProfile', { memberName });
                }
              }}
              onAgree={() => {
                props.navigation.navigate('MemberHealthProfile', { memberName });
              }}
              onNotNow={() => {
                if (props.navigation.canGoBack()) {
                  props.navigation.goBack();
                } else {
                  props.navigation.navigate('MemberProfile', { memberName });
                }
              }}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="MemberPersonalInfo">
        {(props) => {
          const memberName = props.route.params?.memberName || 'Aarav';
          return (
            <PersonalInfoSectionScreen
              memberName={memberName}
              onBack={() => {
                if (props.navigation.canGoBack()) {
                  props.navigation.goBack();
                } else {
                  props.navigation.navigate('MemberProfile', { memberName });
                }
              }}
              onSave={() => props.navigation.navigate('MemberProfile', { memberName })}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="MemberEducation">
        {(props) => {
          const memberName = props.route.params?.memberName || 'Aarav';
          const isAdult = props.route.params?.isAdult || false;
          return (
            <EducationSectionScreen
              memberName={memberName}
              isAdult={isAdult}
              onBack={() => {
                if (props.navigation.canGoBack()) {
                  props.navigation.goBack();
                } else {
                  props.navigation.navigate('MemberProfile', { memberName });
                }
              }}
              onSave={() => props.navigation.navigate('MemberProfile', { memberName })}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="MemberImportantDocuments">
        {(props) => {
          const memberName = props.route.params?.memberName || 'Aarav';
          return (
            <ImportantDocumentsSectionScreen
              memberName={memberName}
              onBack={() => {
                if (props.navigation.canGoBack()) {
                  props.navigation.goBack();
                } else {
                  props.navigation.navigate('MemberProfile', { memberName });
                }
              }}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="MemberHealthProfile">
        {(props) => {
          const memberName = props.route.params?.memberName || 'Aarav';
          return (
            <HealthProfileSectionScreen
              memberName={memberName}
              onBack={() => {
                if (props.navigation.canGoBack()) {
                  props.navigation.goBack();
                } else {
                  props.navigation.navigate('MemberProfile', { memberName, isHealthConsentGranted: true });
                }
              }}
              onSave={() => props.navigation.navigate('MemberProfile', { memberName, isHealthConsentGranted: true })}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="MemberVaccination">
        {(props) => {
          const memberName = props.route.params?.memberName || 'Aarav';
          return (
            <VaccinationSectionScreen
              memberName={memberName}
              onBack={() => {
                if (props.navigation.canGoBack()) {
                  props.navigation.goBack();
                } else {
                  props.navigation.navigate('MemberProfile', { memberName });
                }
              }}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="MemberInterestsActivities">
        {(props) => {
          const memberName = props.route.params?.memberName || 'Aarav';
          return (
            <InterestsActivitiesSectionScreen
              memberName={memberName}
              onBack={() => {
                if (props.navigation.canGoBack()) {
                  props.navigation.goBack();
                } else {
                  props.navigation.navigate('MemberProfile', { memberName });
                }
              }}
              onSave={() =>
                props.navigation.navigate('MemberProfileComplete', { memberName })
              }
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="MemberProfileComplete">
        {(props) => {
          const memberName = props.route.params?.memberName || 'Aarav';
          return (
            <ProfileCompleteScreen
              memberName={memberName}
              nextMemberName="Anaya"
              onDone={() => props.navigation.navigate('Members')}
              onSetupNextMember={() =>
                props.navigation.navigate('MemberProfile', { memberName: 'Anaya' })
              }
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="FamilyVault">
        {(props) => (
          <FamilyVaultScreen
            onBack={() => {
              if (props.navigation.canGoBack()) {
                props.navigation.goBack();
              } else {
                props.navigation.navigate('Home');
              }
            }}
            onViewAlert={() => props.navigation.navigate('VaultItemDetail')}
            onNavigateToCategory={(cat) => {
              if (cat === 'documents') props.navigation.navigate('VaultDocuments');
              else if (cat === 'insurance') props.navigation.navigate('VaultInsurance');
              else if (cat === 'warranties') props.navigation.navigate('VaultWarranties');
              else if (cat === 'assets') props.navigation.navigate('VaultHomeAssets');
              else if (cat === 'contacts') props.navigation.navigate('VaultImportantContacts');
              else props.navigation.navigate('VaultDocuments');
            }}
            onSelectItem={(item) => props.navigation.navigate('VaultItemDetail', { item })}
            onAddToVault={() => props.navigation.navigate('VaultDocuments')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="VaultDocuments">
        {(props) => (
          <DocumentsRenewalsScreen
            onBack={() => props.navigation.goBack()}
            onRenew={(item) => props.navigation.navigate('VaultItemDetail', { item })}
            onSelectDocument={(item) => props.navigation.navigate('VaultItemDetail', { item })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="VaultInsurance">
        {(props) => (
          <InsuranceVaultScreen
            onBack={() => props.navigation.goBack()}
            onSelectPolicy={(item) => props.navigation.navigate('VaultItemDetail', { item })}
            onRenewPolicy={(item) => props.navigation.navigate('VaultItemDetail', { item })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="VaultWarranties">
        {(props) => (
          <WarrantiesBillsScreen
            onBack={() => props.navigation.goBack()}
            onSelectBill={(item) => props.navigation.navigate('VaultItemDetail', { item })}
            onSelectWarranty={(item) => props.navigation.navigate('VaultItemDetail', { item })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="VaultHomeAssets">
        {(props) => (
          <HomeAssetsScreen
            onBack={() => props.navigation.goBack()}
            onSelectAsset={(item) => props.navigation.navigate('VaultItemDetail', { item })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="VaultImportantContacts">
        {(props) => (
          <ImportantContactsScreen
            onBack={() => props.navigation.goBack()}
            onSelectContact={(item) => props.navigation.navigate('VaultItemDetail', { item })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="VaultItemDetail">
        {(props) => (
          <VaultItemDetailScreen
            {...props}
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MyProfile">
        {(props) => (
          <MyProfileScreen
            onBack={() => props.navigation.goBack()}
            onEdit={() => {}}
            onOpenLifeProfile={() =>
              props.navigation.navigate('Profile', { screen: 'Step1' })
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NotificationPreferences">
        {(props) => (
          <NotificationPreferencesScreen
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PrivacyConsent">
        {(props) => (
          <PrivacyConsentScreen
            onBack={() => props.navigation.goBack()}
            onConsentLedger={() => props.navigation.navigate('ConsentLedger')}
            onPrivacyNotice={() => props.navigation.navigate('PrivacyNotice')}
            onDataRequests={() => props.navigation.navigate('DataRequests')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ConsentLedger">
        {(props) => (
          <ConsentLedgerScreen
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PrivacyNotice">
        {(props) => (
          <PrivacyNoticeScreen
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="DataRequests">
        {(props) => (
          <DataRequestsScreen
            onBack={() => props.navigation.goBack()}
            onRequestDetail={(requestId) =>
              props.navigation.navigate('RequestStatus', { requestId })
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="RequestStatus">
        {(props) => (
          <RequestStatusScreen
            onBack={() => props.navigation.goBack()}
            requestId={props.route.params?.requestId}
            onCancelRequest={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Security">
        {(props) => (
          <SecurityScreen
            onBack={() => props.navigation.goBack()}
            onUnlockMethodPress={() => props.navigation.navigate('UnlockMethod')}
            onDevicesSessionsPress={() => props.navigation.navigate('DevicesSessions')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="DevicesSessions">
        {(props) => (
          <DevicesSessionsScreen
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="UnlockMethod">
        {(props) => (
          <UnlockMethodScreen
            onBack={() => props.navigation.goBack()}
            onSave={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Subscription">
        {(props) => (
          <SubscriptionScreen
            onBack={() => props.navigation.goBack()}
            onChangePlan={() => props.navigation.navigate('UpgradeDowngrade')}
            onPaymentMethod={() => props.navigation.navigate('PlansTrial')}
            onInvoicesHistory={() => props.navigation.navigate('InvoicesHistory')}
            onCancelSubscription={() => props.navigation.navigate('CancelSubscription')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PlansTrial">
        {(props) => (
          <PlansTrialScreen
            onBack={() => props.navigation.goBack()}
            onStartFreeTrial={() => props.navigation.navigate('StartFreeTrial')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="StartFreeTrial">
        {(props) => (
          <StartFreeTrialScreen
            onBack={() => props.navigation.goBack()}
            onStartTrial={() => props.navigation.navigate('PaymentSuccess')}
            onNotNow={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="TrialNotAvailable">
        {(props) => (
          <TrialNotAvailableModal
            onBack={() => props.navigation.goBack()}
            onSeePlans={() => props.navigation.navigate('PlansTrial')}
            onStayOnFree={() => props.navigation.navigate('Home')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PaymentGateway">
        {(props) => (
          <PaymentGatewayModal
            visible={true}
            onClose={() => props.navigation.goBack()}
            onSelectMethod={() => props.navigation.navigate('PaymentSuccess')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="UpgradeDowngrade">
        {(props) => (
          <UpgradeDowngradeScreen
            onBack={() => props.navigation.goBack()}
            onConfirmPlanChange={(plan) => {
              if (plan === 'free') {
                props.navigation.navigate('BackOnFree');
              } else {
                props.navigation.navigate('Subscription');
              }
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CancelSubscription">
        {(props) => (
          <CancelSubscriptionScreen
            onBack={() => props.navigation.goBack()}
            onConfirmCancel={() => props.navigation.navigate('CancellationConfirmed')}
            onKeepPremium={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CancellationConfirmed">
        {(props) => (
          <CancellationConfirmedScreen
            onDone={() => props.navigation.navigate('Home')}
            onReactivate={() => props.navigation.navigate('ReactivatePlan')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="RenewalGracePeriod">
        {(props) => (
          <RenewalGracePeriodScreen
            onBack={() => props.navigation.goBack()}
            onRetryPayment={() => props.navigation.navigate('PaymentSuccess')}
            onChangePaymentMethod={() => props.navigation.navigate('PlansTrial')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="BackOnFree">
        {(props) => (
          <BackOnFreeScreen
            onBack={() => props.navigation.goBack()}
            onReactivate={() => props.navigation.navigate('ReactivatePlan')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ReactivatePlan">
        {(props) => (
          <ReactivatePlanScreen
            onBack={() => props.navigation.goBack()}
            onReactivate={() => props.navigation.navigate('PaymentSuccess')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="InvoicesHistory">
        {(props) => (
          <InvoicesHistoryScreen
            onBack={() => props.navigation.goBack()}
            onSelectInvoice={(invoiceId) =>
              props.navigation.navigate('InvoiceDetail', { invoiceId })
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="InvoiceDetail">
        {(props) => (
          <InvoiceDetailScreen
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PaymentSuccess">
        {(props) => (
          <PaymentSuccessScreen
            onDone={() => props.navigation.navigate('Subscription')}
            onViewReceipt={() => props.navigation.navigate('InvoiceDetail')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PaymentFailed">
        {(props) => (
          <PaymentFailedScreen
            reason={props.route.params?.reason}
            onTryAgain={() => props.navigation.navigate('PaymentGateway')}
            onUseAnotherMethod={() => props.navigation.navigate('PaymentGateway')}
            onNotNow={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Account">
        {(props) => (
          <AccountScreen
            onBack={() => props.navigation.goBack()}
            onDeleteAccount={() => props.navigation.navigate('DeleteAccount')}
            onLogout={() => props.navigation.navigate('Auth')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="DeleteAccount">
        {(props) => (
          <DeleteAccountScreen
            onBack={() => props.navigation.goBack()}
            onContinue={() => props.navigation.navigate('ConfirmDeletion')}
            onKeepAccount={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ConfirmDeletion">
        {(props) => (
          <ConfirmDeletionScreen
            onBack={() => props.navigation.goBack()}
            onConfirmDelete={() => props.navigation.navigate('AccountDeleted')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="AccountDeleted">
        {(props) => (
          <AccountDeletedScreen
            onBackToWelcome={() => props.navigation.navigate('Auth')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="HelpSupport">
        {(props) => (
          <HelpSupportScreen
            onBack={() => props.navigation.goBack()}
            onContactSupport={() => props.navigation.navigate('ContactSupport')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ContactSupport">
        {(props) => (
          <ContactSupportScreen
            onClose={() => props.navigation.goBack()}
            onSubmit={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Policies">
        {(props) => (
          <PoliciesScreen
            onBack={() => props.navigation.goBack()}
            onContactSupport={() => props.navigation.navigate('ContactSupport')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="AboutUs">
        {(props) => (
          <AboutUsScreen
            onBack={() => props.navigation.goBack()}
            onWriteToUs={() => props.navigation.navigate('ContactSupport')}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default RootNavigator;
