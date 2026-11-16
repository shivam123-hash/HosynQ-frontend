import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type {
  ProfileStackParamList,
  ProfileScreenProps,
  RootNavigationProp,
} from './types';

// Complete Profile Screens
import {
  MyLifeProfileScreen,
  CompleteProfileStep1Screen,
  PersonalInfoDetailsScreen,
  CompleteProfileStep2Screen,
  AddPassportScreen,
  CompleteProfileStep3Screen,
  CompleteProfileStep4Screen,
  CompleteProfileStep5Screen,
  DocumentDetailRemindersScreen,
  SeniorMedicineScheduleScreen,
  AddMedicineScreen,
  WhenToTakeMedicineScreen,
  VaccinationScreen,
  AddVaccineScreen,
  ChildGrowthScreen,
  ChildMilestonesScreen,
} from '../screens/completeProfileScreens';
import LifeProfileIntroScreen from '../screens/familyConnectionCreateScreens/joinFamilayScreens/LifeProfileIntroScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

// --- Screen Wrappers connecting Navigation & Props ---

const LifeProfileIntroWrapper: React.FC<
  ProfileScreenProps<'LifeProfileIntro'>
> = ({ navigation, route }) => {
  const memberId = route.params?.memberId;
  return (
    <LifeProfileIntroScreen
      completedSections={0}
      totalSections={6}
      onStartPersonalInformation={() => {
        navigation.navigate('MyLifeProfile', { memberId });
      }}
      onDoThisLater={() => {
        navigation.navigate('MyLifeProfile', { memberId });
      }}
      onSectionPress={(sectionId) => {
        navigation.navigate('MyLifeProfile', { memberId });
      }}
    />
  );
};

const MyLifeProfileWrapper: React.FC<ProfileScreenProps<'MyLifeProfile'>> = ({
  navigation,
  route,
}) => {
  const memberId = route.params?.memberId;
  return (
    <MyLifeProfileScreen
      memberId={memberId}
      onBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('LifeProfileIntro', { memberId });
        }
      }}
      onSectionPress={(sectionId) => {
        const stepMap: Record<string, keyof ProfileStackParamList> = {
          personal: 'Step1',
          documents: 'Step2',
          health: 'Step3',
          vaccination: 'Step4',
          interests: 'Step5',
        };
        const target = stepMap[sectionId];
        if (target) {
          navigation.navigate(target as any, { memberId });
        }
      }}
    />
  );
};

const Step1Wrapper: React.FC<ProfileScreenProps<'Step1'>> = ({
  navigation,
  route,
}) => (
  <CompleteProfileStep1Screen
    memberId={route.params?.memberId}
    initialData={route.params?.initialData}
    initialMode={route.params?.initialMode}
    onBack={() => navigation.goBack()}
    onContinue={(data) => {
      console.log('Step 1 data:', data);
      navigation.navigate('MyLifeProfile', { memberId: route.params?.memberId });
    }}
  />
);

const PersonalInfoDetailsWrapper: React.FC<
  ProfileScreenProps<'PersonalInfoDetails'>
> = ({ navigation, route }) => (
  <PersonalInfoDetailsScreen
    memberId={route.params?.memberId}
    data={route.params?.data}
    onBack={() => navigation.goBack()}
    onEditPress={() => navigation.navigate('Step1', { memberId: route.params?.memberId })}
    onSave={() => navigation.navigate('MyLifeProfile', { memberId: route.params?.memberId })}
  />
);

const Step2Wrapper: React.FC<ProfileScreenProps<'Step2'>> = ({
  navigation,
  route,
}) => (
  <CompleteProfileStep2Screen
    memberId={route.params?.memberId}
    initialData={route.params?.initialData}
    onBack={() => navigation.goBack()}
    onContinue={(data) => {
      console.log('Step 2 data:', data);
      navigation.navigate('MyLifeProfile', { memberId: route.params?.memberId });
    }}
    onDocumentPress={(documentId) => {
      navigation.navigate('DocumentDetailReminders', { documentId });
    }}
  />
);

const AddPassportWrapper: React.FC<ProfileScreenProps<'AddPassport'>> = ({
  navigation,
}) => (
  <AddPassportScreen
    onClose={() => navigation.goBack()}
    onSaveSuccess={(data) => {
      navigation.navigate('DocumentDetailReminders', { documentId: 'passport' });
    }}
  />
);

const DocumentDetailRemindersWrapper: React.FC<
  ProfileScreenProps<'DocumentDetailReminders'>
> = ({ navigation }) => (
  <DocumentDetailRemindersScreen
    onBack={() => navigation.goBack()}
    onSave={() => navigation.goBack()}
  />
);

const SeniorMedicineScheduleWrapper: React.FC<
  ProfileScreenProps<'SeniorMedicineSchedule'>
> = ({ navigation }) => (
  <SeniorMedicineScheduleScreen
    onBack={() => navigation.goBack()}
    onAddMedicine={() => navigation.navigate('AddMedicine')}
  />
);

const AddMedicineWrapper: React.FC<ProfileScreenProps<'AddMedicine'>> = ({
  navigation,
}) => (
  <AddMedicineScreen
    onClose={() => navigation.goBack()}
    onNext={() => navigation.navigate('WhenToTakeMedicine')}
  />
);

const WhenToTakeMedicineWrapper: React.FC<
  ProfileScreenProps<'WhenToTakeMedicine'>
> = ({ navigation }) => (
  <WhenToTakeMedicineScreen
    onBack={() => navigation.goBack()}
    onSave={() => navigation.goBack()}
  />
);

const VaccinationWrapper: React.FC<ProfileScreenProps<'Vaccination'>> = ({
  navigation,
  route,
}) => (
  <VaccinationScreen
    memberId={route.params?.memberId}
    onBack={() => navigation.goBack()}
    onAddVaccineRecord={() => navigation.navigate('AddVaccine')}
    onAddMeasurement={() => navigation.navigate('ChildGrowth')}
    onAddMilestone={() => navigation.navigate('ChildMilestones')}
  />
);

const AddVaccineWrapper: React.FC<ProfileScreenProps<'AddVaccine'>> = ({
  navigation,
}) => (
  <AddVaccineScreen
    onClose={() => navigation.goBack()}
    onSave={() => navigation.goBack()}
  />
);

const ChildGrowthWrapper: React.FC<ProfileScreenProps<'ChildGrowth'>> = ({
  navigation,
}) => (
  <ChildGrowthScreen onBack={() => navigation.goBack()} />
);

const ChildMilestonesWrapper: React.FC<
  ProfileScreenProps<'ChildMilestones'>
> = ({ navigation }) => (
  <ChildMilestonesScreen onBack={() => navigation.goBack()} />
);

const Step3Wrapper: React.FC<ProfileScreenProps<'Step3'>> = ({
  navigation,
  route,
}) => (
  <CompleteProfileStep3Screen
    memberId={route.params?.memberId}
    initialData={route.params?.initialData}
    initialMode={route.params?.initialMode}
    onBack={() => navigation.goBack()}
    onAddMedicine={() => navigation.navigate('AddMedicine')}
    onContinue={(data) => {
      console.log('Step 3 data:', data);
      navigation.navigate('MyLifeProfile', { memberId: route.params?.memberId });
    }}
    onCheckupItemPress={(id) => {
      console.log('Checkup item pressed:', id);
    }}
  />
);

const Step4Wrapper: React.FC<ProfileScreenProps<'Step4'>> = ({
  navigation,
  route,
}) => (
  <CompleteProfileStep4Screen
    memberId={route.params?.memberId}
    initialData={route.params?.initialData}
    initialMode={route.params?.initialMode}
    onBack={() => navigation.goBack()}
    onContinue={(data) => {
      console.log('Step 4 data:', data);
    }}
    onCheckupItemPress={(id) => {
      console.log('Checkup item pressed:', id);
    }}
  />
);

const Step5Wrapper: React.FC<ProfileScreenProps<'Step5'>> = ({
  navigation,
  route,
}) => {
  return (
    <CompleteProfileStep5Screen
      memberId={route.params?.memberId}
      onBack={() => navigation.goBack()}
      onSave={() => navigation.navigate('MyLifeProfile', { memberId: route.params?.memberId })}
      onEnterHosynQ={() => navigation.navigate('MyLifeProfile', { memberId: route.params?.memberId })}
    />
  );
};

const InterestsAndActivitiesWrapper: React.FC<
  ProfileScreenProps<'InterestsAndActivities'>
> = ({ navigation, route }) => {
  return (
    <CompleteProfileStep5Screen
      memberId={route.params?.memberId}
      onBack={() => navigation.goBack()}
      onSave={() => navigation.navigate('MyLifeProfile', { memberId: route.params?.memberId })}
      onEnterHosynQ={() => navigation.navigate('MyLifeProfile', { memberId: route.params?.memberId })}
    />
  );
};

// --- Profile Navigator ---

const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MyLifeProfile"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="LifeProfileIntro"
        component={LifeProfileIntroWrapper}
      />
      <Stack.Screen name="MyLifeProfile" component={MyLifeProfileWrapper} />
      <Stack.Screen name="Step1" component={Step1Wrapper} />
      <Stack.Screen
        name="PersonalInfoDetails"
        component={PersonalInfoDetailsWrapper}
      />
      <Stack.Screen name="Step2" component={Step2Wrapper} />
      <Stack.Screen name="AddPassport" component={AddPassportWrapper} />
      <Stack.Screen
        name="DocumentDetailReminders"
        component={DocumentDetailRemindersWrapper}
      />
      <Stack.Screen name="Step3" component={Step3Wrapper} />
      <Stack.Screen
        name="SeniorMedicineSchedule"
        component={SeniorMedicineScheduleWrapper}
      />
      <Stack.Screen name="AddMedicine" component={AddMedicineWrapper} />
      <Stack.Screen
        name="WhenToTakeMedicine"
        component={WhenToTakeMedicineWrapper}
      />
      <Stack.Screen name="Step4" component={Step4Wrapper} />
      <Stack.Screen name="Vaccination" component={VaccinationWrapper} />
      <Stack.Screen name="AddVaccine" component={AddVaccineWrapper} />
      <Stack.Screen name="ChildGrowth" component={ChildGrowthWrapper} />
      <Stack.Screen
        name="ChildMilestones"
        component={ChildMilestonesWrapper}
      />
      <Stack.Screen name="Step5" component={Step5Wrapper} />
      <Stack.Screen
        name="InterestsAndActivities"
        component={InterestsAndActivitiesWrapper}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;

