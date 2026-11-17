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
} from '../screens/mainScreens/menuScreens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export interface RootNavigatorProps {
  initialRouteName?: keyof RootStackParamList;
  authInitialRouteName?: keyof AuthStackParamList;
}

const RootNavigator: React.FC<RootNavigatorProps> = ({
  initialRouteName = 'Home',
  authInitialRouteName = 'Onboarding',
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
      <Stack.Screen name="Profile" component={ProfileNavigator} />
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
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Notifications">
        {(props) => (
          <NotificationsScreen
            isEmpty={props.route.params?.isEmpty}
            initialFilter={props.route.params?.initialFilter}
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Tasks">
        {(props) => (
          <MainTabScreen
            initialTab="tasks"
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
            onSelectItem={() => props.navigation.navigate('VaultItemDetail')}
            onAddToVault={() => props.navigation.navigate('VaultDocuments')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="VaultDocuments">
        {(props) => (
          <DocumentsRenewalsScreen
            onBack={() => props.navigation.goBack()}
            onRenew={() => props.navigation.navigate('VaultItemDetail')}
            onSelectDocument={() => props.navigation.navigate('VaultItemDetail')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="VaultInsurance">
        {(props) => (
          <InsuranceVaultScreen
            onBack={() => props.navigation.goBack()}
            onSelectPolicy={() => props.navigation.navigate('VaultItemDetail')}
            onRenewPolicy={() => props.navigation.navigate('VaultItemDetail')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="VaultWarranties">
        {(props) => (
          <WarrantiesBillsScreen
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="VaultHomeAssets">
        {(props) => (
          <HomeAssetsScreen
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="VaultImportantContacts">
        {(props) => (
          <ImportantContactsScreen
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="VaultItemDetail">
        {(props) => (
          <VaultItemDetailScreen
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
    </Stack.Navigator>
  );
};

export default RootNavigator;
