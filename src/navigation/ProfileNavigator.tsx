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
  MedicineDetailsScreen,
  VaccinationScreen,
  AddVaccineScreen,
  ChildGrowthScreen,
  AddMeasurementScreen,
  ChildMilestonesScreen,
  AddMilestoneScreen,
  VaccineDetailScreen,
  InterestsDetailsScreen,
} from '../screens/completeProfileScreens';
import { useAppSelector } from '../redux';
import { formatDisplayDateFromIso } from '../screens/completeProfileScreens/importantDocmentsScreens/documentPayloadUtils';
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
        navigation.navigate('Step1', { memberId, initialMode: 'input' });
      }}
      onDoThisLater={() => {
        navigation.navigate('MyLifeProfile', { memberId });
      }}
      onSectionPress={(sectionId) => {
        if (sectionId === 'personal') {
          navigation.navigate('Step1', { memberId, initialMode: 'input' });
        } else {
          navigation.navigate('MyLifeProfile', { memberId });
        }
      }}
    />
  );
};

const MyLifeProfileWrapper: React.FC<ProfileScreenProps<'MyLifeProfile'>> = ({
  navigation,
  route,
}) => {
  const familyState = useAppSelector((state) => (state as any).family);
  const authUser = useAppSelector((state) => (state as any).auth?.user);
  const lifeProfileFull = useAppSelector((state) => state.lifeProfile?.full);

  const memberId =
    route.params?.memberId ||
    lifeProfileFull?.member?.memberId ||
    lifeProfileFull?.data?.member?.memberId ||
    (authUser as any)?.lifeProfile?.memberId ||
    familyState?.myMemberId ||
    familyState?.family?.myMemberId ||
    authUser?.memberId;

  return (
    <MyLifeProfileScreen
      memberId={memberId}
      onBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
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
          if (target === 'Step1') {
            navigation.navigate('Step1', { memberId, initialMode: 'details' });
          } else if (target === 'Step3') {
            const healthData =
              (lifeProfileFull as any)?.health ||
              (lifeProfileFull as any)?.data?.health;
            const hasHealthData = !!(
              healthData?.primaryDoctor ||
              healthData?.doctorPhone ||
              healthData?.clinicName ||
              healthData?.allergies?.length ||
              healthData?.medicalConditions?.length
            );
            navigation.navigate('Step3', {
              memberId,
              initialMode: hasHealthData ? 'details' : 'input',
            });
          } else {
            navigation.navigate(target as any, { memberId });
          }
        }
      }}
    />
  );
};

const Step1Wrapper: React.FC<ProfileScreenProps<'Step1'>> = ({
  navigation,
  route,
}) => {
  const familyState = useAppSelector((state) => (state as any).family);
  const authUser = useAppSelector((state) => (state as any).auth?.user);
  const lifeProfileFull = useAppSelector((state) => state.lifeProfile?.full);

  const memberId =
    route.params?.memberId ||
    lifeProfileFull?.member?.memberId ||
    lifeProfileFull?.data?.member?.memberId ||
    (authUser as any)?.lifeProfile?.memberId ||
    familyState?.myMemberId ||
    familyState?.family?.myMemberId ||
    authUser?.memberId;

  return (
    <CompleteProfileStep1Screen
      memberId={memberId}
      initialData={route.params?.initialData}
      initialMode={route.params?.initialMode}
      onBack={() => {
        navigation.navigate('MyLifeProfile', { memberId });
      }}
      onContinue={(data) => {
        console.log('Step 1 data:', data);
        navigation.navigate('MyLifeProfile', { memberId });
      }}
    />
  );
};

const PersonalInfoDetailsWrapper: React.FC<
  ProfileScreenProps<'PersonalInfoDetails'>
> = ({ navigation, route }) => {
  const familyState = useAppSelector((state) => (state as any).family);
  const authUser = useAppSelector((state) => (state as any).auth?.user);
  const lifeProfileFull = useAppSelector((state) => state.lifeProfile?.full);

  const memberId =
    route.params?.memberId ||
    lifeProfileFull?.member?.memberId ||
    lifeProfileFull?.data?.member?.memberId ||
    (authUser as any)?.lifeProfile?.memberId ||
    familyState?.myMemberId ||
    familyState?.family?.myMemberId ||
    authUser?.memberId;

  return (
    <PersonalInfoDetailsScreen
      memberId={memberId}
      data={route.params?.data}
      onBack={() => navigation.navigate('MyLifeProfile', { memberId })}
      onEditPress={() => navigation.navigate('Step1', { memberId, initialMode: 'input' })}
      onSave={() => navigation.navigate('MyLifeProfile', { memberId })}
    />
  );
};

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
> = ({ navigation, route }) => {
  const documentId = route.params?.documentId;
  const user = useAppSelector((state: any) => state.auth?.user || state.emailAuth?.user);
  const lifeProfileDocuments = useAppSelector((state: any) => state.lifeProfile?.documents);
  const lifeProfileFull = useAppSelector((state: any) => state.lifeProfile?.full);
  const documentsData = lifeProfileDocuments?.data || lifeProfileDocuments;
  const rawDocs: any[] =
    (Array.isArray(documentsData) ? documentsData : null) ||
    (Array.isArray(documentsData?.documents) ? documentsData.documents : null) ||
    (Array.isArray(lifeProfileFull?.data?.documents) ? lifeProfileFull.data.documents : null) ||
    [];
  const currentDoc =
    (documentId ? rawDocs.find((d: any) => d.id === documentId) : null) ||
    rawDocs.find((d: any) => d.type === 'PASSPORT');
  const userName = user?.name || user?.fullName || 'User';

  const docLast4 = currentDoc?.last4 || (currentDoc?.number ? currentDoc.number.slice(-4) : '');
  const maskedNumber = docLast4 ? `•••• •••• ${docLast4}` : '•••• •••• ----';
  const issuedStr = currentDoc?.issuedOn
    ? `${formatDisplayDateFromIso(currentDoc.issuedOn)}${currentDoc.issuedAt ? ` · ${currentDoc.issuedAt}` : ''}`
    : '—';
  const expiryStr = currentDoc?.expiresOn ? formatDisplayDateFromIso(currentDoc.expiresOn) : '—';
  const ownerName = currentDoc?.nameOnDocument || userName;
  const fileName = ownerName ? `Passport_${ownerName.replace(/\s+/g, '_')}.pdf` : `Passport_${userName}.pdf`;

  return (
    <DocumentDetailRemindersScreen
      documentTitle="Passport"
      userName={userName}
      fileName={fileName}
      fileDetails={currentDoc?.scanId ? '1 page · Added' : 'Added'}
      documentNumber={maskedNumber}
      issuedDate={issuedStr}
      expiryDate={expiryStr}
      remindAssignees={ownerName}
      buttonTitle="Edit"
      onBack={() => navigation.goBack()}
      onEditPress={() => navigation.goBack()}
      onSave={() => navigation.goBack()}
    />
  );
};

const SeniorMedicineScheduleWrapper: React.FC<
  ProfileScreenProps<'SeniorMedicineSchedule'>
> = ({ navigation, route }) => (
  <SeniorMedicineScheduleScreen
    onBack={() => navigation.goBack()}
    onAddMedicine={() =>
      navigation.navigate('AddMedicine', {
        memberId: route.params?.memberId,
      })
    }
  />
);

const AddMedicineWrapper: React.FC<ProfileScreenProps<'AddMedicine'>> = ({
  navigation,
  route,
}) => (
  <AddMedicineScreen
    memberId={route.params?.memberId}
    onClose={() => navigation.goBack()}
    onNext={(data) =>
      navigation.navigate('WhenToTakeMedicine', {
        medicineId: (data as any)?.medicineId,
        medicineName: data.name,
        memberId: route.params?.memberId,
      })
    }
  />
);

const WhenToTakeMedicineWrapper: React.FC<
  ProfileScreenProps<'WhenToTakeMedicine'>
> = ({ navigation, route }) => (
  <WhenToTakeMedicineScreen
    medicineId={route.params?.medicineId}
    medicineName={route.params?.medicineName}
    memberId={route.params?.memberId}
    onBack={() => navigation.goBack()}
    onSave={() => {
      // Return to HealthProfileDetailsScreen
      navigation.pop(2);
    }}
  />
);

const MedicineDetailsWrapper: React.FC<
  ProfileScreenProps<'MedicineDetails'>
> = ({ navigation, route }) => (
  <MedicineDetailsScreen
    medicineId={route.params?.medicineId || ''}
    medicineName={route.params?.medicineName}
    memberId={route.params?.memberId}
    onBack={() => navigation.goBack()}
    onDeleteSuccess={() => navigation.goBack()}
  />
);

const VaccinationWrapper: React.FC<ProfileScreenProps<'Vaccination'>> = ({
  navigation,
  route,
}) => (
  <VaccinationScreen
    memberId={route.params?.memberId}
    initialTab={route.params?.initialTab}
    onBack={() => navigation.goBack()}
    onAddVaccineRecord={() =>
      navigation.navigate('AddVaccine', {
        memberId: route.params?.memberId,
      })
    }
    onAddMeasurement={() =>
      navigation.navigate('AddMeasurement', {
        memberId: route.params?.memberId,
      })
    }
    onAddMilestone={() =>
      navigation.navigate('AddMilestone', {
        memberId: route.params?.memberId,
      })
    }
    onVaccinePress={(vaccine) =>
      navigation.navigate('VaccineDetail', {
        memberId: route.params?.memberId,
        vaccine: (vaccine as any)?.raw || vaccine,
        vaccineId: (vaccine as any)?.id || (vaccine as any)?._id || (vaccine as any)?.raw?.id,
        childName: 'Aarav',
      })
    }
  />
);

const VaccineDetailWrapper: React.FC<
  ProfileScreenProps<'VaccineDetail'>
> = ({ navigation, route }) => (
  <VaccineDetailScreen
    memberId={route.params?.memberId}
    vaccine={route.params?.vaccine}
    vaccineId={route.params?.vaccineId || (route.params?.vaccine as any)?.id || (route.params?.vaccine as any)?._id}
    childName={route.params?.childName || 'Aarav'}
    onBack={() => navigation.goBack()}
    onEditVaccine={() =>
      navigation.navigate('AddVaccine', {
        memberId: route.params?.memberId,
        initialData: route.params?.vaccine,
      })
    }
  />
);

const AddVaccineWrapper: React.FC<ProfileScreenProps<'AddVaccine'>> = ({
  navigation,
  route,
}) => (
  <AddVaccineScreen
    memberId={route.params?.memberId}
    initialData={route.params?.initialData}
    onClose={() => navigation.goBack()}
    onSave={() => navigation.goBack()}
  />
);

const ChildGrowthWrapper: React.FC<ProfileScreenProps<'ChildGrowth'>> = ({
  navigation,
  route,
}) => (
  <ChildGrowthScreen
    memberId={route.params?.memberId}
    onBack={() => navigation.goBack()}
    onAddMeasurement={() =>
      navigation.navigate('AddMeasurement', {
        memberId: route.params?.memberId,
      })
    }
  />
);

const AddMeasurementWrapper: React.FC<
  ProfileScreenProps<'AddMeasurement'>
> = ({ navigation, route }) => (
  <AddMeasurementScreen
    memberId={route.params?.memberId}
    childName={route.params?.childName || 'Aarav'}
    onClose={() => navigation.goBack()}
    onSave={(data) => {
      console.log('Measurement saved:', data);
      navigation.navigate('Vaccination', {
        memberId: route.params?.memberId,
        initialTab: 'growth',
      });
    }}
  />
);

const ChildMilestonesWrapper: React.FC<
  ProfileScreenProps<'ChildMilestones'>
> = ({ navigation, route }) => (
  <ChildMilestonesScreen
    memberId={route.params?.memberId}
    onBack={() => navigation.goBack()}
    onAddMilestone={() =>
      navigation.navigate('AddMilestone', {
        memberId: route.params?.memberId,
      })
    }
  />
);

const AddMilestoneWrapper: React.FC<ProfileScreenProps<'AddMilestone'>> = ({
  navigation,
  route,
}) => (
  <AddMilestoneScreen
    memberId={route.params?.memberId}
    childName={route.params?.childName || 'Aarav'}
    onClose={() => navigation.goBack()}
    onSave={(data) => {
      console.log('Milestone saved:', data);
      navigation.navigate('Vaccination', {
        memberId: route.params?.memberId,
        initialTab: 'milestones',
      });
    }}
  />
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
    onAddMedicine={() =>
      navigation.navigate('AddMedicine', {
        memberId: route.params?.memberId,
      })
    }
    onMedicinePress={(medicineId: string) => {
      navigation.navigate('MedicineDetails', {
        medicineId,
        memberId: route.params?.memberId,
      });
    }}
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
    initialMode="details"
    onBack={() => navigation.goBack()}
    onAddVaccineRecord={() =>
      navigation.navigate('AddVaccine', {
        memberId: route.params?.memberId,
      })
    }
    onAddMeasurement={() =>
      navigation.navigate('AddMeasurement', {
        memberId: route.params?.memberId,
      })
    }
    onAddMilestone={() =>
      navigation.navigate('AddMilestone', {
        memberId: route.params?.memberId,
      })
    }
    onVaccinePress={(vaccine) =>
      navigation.navigate('VaccineDetail', {
        memberId: route.params?.memberId,
        vaccine: (vaccine as any)?.raw || vaccine,
        vaccineId: (vaccine as any)?.id || (vaccine as any)?._id || (vaccine as any)?.raw?.id,
        childName: 'Aarav',
      })
    }
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
      initialMode={route.params?.initialMode}
      onBack={() => navigation.goBack()}
      onEnterHosynQ={() => navigation.navigate('MyLifeProfile', { memberId: route.params?.memberId })}
    />
  );
};

const InterestsDetailsWrapper: React.FC<
  ProfileScreenProps<'InterestsDetails'>
> = ({ navigation, route }) => {
  return (
    <InterestsDetailsScreen
      memberId={route.params?.memberId}
      onBack={() => navigation.goBack()}
      onEditPress={() =>
        navigation.navigate('InterestsAndActivities', {
          memberId: route.params?.memberId,
        })
      }
    />
  );
};

const InterestsAndActivitiesWrapper: React.FC<
  ProfileScreenProps<'InterestsAndActivities'>
> = ({ navigation, route }) => {
  return (
    <CompleteProfileStep5Screen
      memberId={route.params?.memberId}
      initialMode="form"
      onBack={() => navigation.goBack()}
      onEnterHosynQ={() => navigation.navigate('MyLifeProfile', { memberId: route.params?.memberId })}
    />
  );
};

// --- Profile Navigator ---

export interface ProfileNavigatorProps {
  initialMemberId?: string;
}

const ProfileNavigator: React.FC<ProfileNavigatorProps> = ({
  initialMemberId,
}) => {
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
        initialParams={initialMemberId ? { memberId: initialMemberId } : undefined}
      />
      <Stack.Screen
        name="MyLifeProfile"
        component={MyLifeProfileWrapper}
        initialParams={initialMemberId ? { memberId: initialMemberId } : undefined}
      />
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
      <Stack.Screen
        name="MedicineDetails"
        component={MedicineDetailsWrapper}
      />
      <Stack.Screen name="Step4" component={Step4Wrapper} />
      <Stack.Screen name="Vaccination" component={VaccinationWrapper} />
      <Stack.Screen name="VaccineDetail" component={VaccineDetailWrapper} />
      <Stack.Screen name="AddVaccine" component={AddVaccineWrapper} />
      <Stack.Screen name="ChildGrowth" component={ChildGrowthWrapper} />
      <Stack.Screen name="AddMeasurement" component={AddMeasurementWrapper} />
      <Stack.Screen
        name="ChildMilestones"
        component={ChildMilestonesWrapper}
      />
      <Stack.Screen name="AddMilestone" component={AddMilestoneWrapper} />
      <Stack.Screen name="Step5" component={Step5Wrapper} />
      <Stack.Screen
        name="InterestsDetails"
        component={InterestsDetailsWrapper}
      />
      <Stack.Screen
        name="InterestsAndActivities"
        component={InterestsAndActivitiesWrapper}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;

