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
  CompleteProfileStep1Screen,
  CompleteProfileStep2Screen,
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

const Stack = createNativeStackNavigator<ProfileStackParamList>();

// --- Screen Wrappers connecting Navigation & Props ---

const Step1Wrapper: React.FC<ProfileScreenProps<'Step1'>> = ({
  navigation,
  route,
}) => (
  <CompleteProfileStep1Screen
    initialData={route.params?.initialData}
    onBack={() => navigation.goBack()}
    onContinue={(data) => {
      console.log('Step 1 data:', data);
      navigation.navigate('Step2');
    }}
  />
);

const Step2Wrapper: React.FC<ProfileScreenProps<'Step2'>> = ({
  navigation,
  route,
}) => (
  <CompleteProfileStep2Screen
    initialData={route.params?.initialData}
    onBack={() => navigation.goBack()}
    onContinue={(data) => {
      console.log('Step 2 data:', data);
      navigation.navigate('Step3');
    }}
    onDocumentPress={(documentId) => {
      navigation.navigate('DocumentDetailReminders', { documentId });
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
}) => (
  <VaccinationScreen
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
    initialData={route.params?.initialData}
    onBack={() => navigation.goBack()}
    onContinue={(data) => {
      console.log('Step 3 data:', data);
      navigation.navigate('Step4');
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
    initialData={route.params?.initialData}
    onBack={() => navigation.goBack()}
    onContinue={(data) => {
      console.log('Step 4 data:', data);
      navigation.navigate('Step5');
    }}
    onCheckupItemPress={(id) => {
      console.log('Checkup item pressed:', id);
    }}
  />
);

const Step5Wrapper: React.FC<ProfileScreenProps<'Step5'>> = ({
  navigation,
}) => {
  const rootNav = useNavigation<RootNavigationProp>();

  return (
    <CompleteProfileStep5Screen
      onBack={() => navigation.goBack()}
      onEnterHosynQ={(selectedInterests) => {
        console.log('Profile completed! Selected interests:', selectedInterests);
        // Navigates back to Auth or Home
        rootNav.navigate('Auth', { screen: 'AuthMain' });
      }}
    />
  );
};

const InterestsAndActivitiesWrapper: React.FC<
  ProfileScreenProps<'InterestsAndActivities'>
> = ({ navigation }) => {
  const rootNav = useNavigation<RootNavigationProp>();

  return (
    <CompleteProfileStep5Screen
      onBack={() => navigation.goBack()}
      onEnterHosynQ={(selectedInterests) => {
        console.log('Profile completed! Selected interests:', selectedInterests);
        rootNav.navigate('Auth', { screen: 'AuthMain' });
      }}
    />
  );
};

// --- Profile Navigator ---

const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Step1"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Step1" component={Step1Wrapper} />
      <Stack.Screen name="Step2" component={Step2Wrapper} />
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

