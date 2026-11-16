import React from 'react';
import { View, Text } from 'react-native';
import PersonalInfoScreen, {
  PersonalInfoScreenData,
} from './innerScreens/PersonalInfoScreen';
import ImportantDocumentsScreen from './importantDocmentsScreens/ImportantDocumentsScreen';
import DocumentDetailRemindersScreen from './importantDocmentsScreens/DocumentDetailRemindersScreen';
import HealthProfileScreen, {
  HealthProfileData,
} from './innerScreens/HealthProfileScreen';
import SeniorMedicineScheduleScreen from './innerScreens/SeniorMedicineScheduleScreen';
import AddMedicineScreen, {
  AddMedicineFormData,
} from './innerScreens/AddMedicineScreen';
import VaccinationScreen from './innerScreens/VaccinationScreen';
import AddVaccineScreen, {
  AddVaccineFormData,
} from './innerScreens/AddVaccineScreen';
import ChildGrowthScreen from './innerScreens/ChildGrowthScreen';
import ChildMilestonesScreen from './innerScreens/ChildMilestonesScreen';
import WhenToTakeMedicineScreen, {
  WhenToTakeMedicineData,
} from './innerScreens/WhenToTakeMedicineScreen';
import InterestsAndActivitiesScreen from './innerScreens/InterestsAndActivitiesScreen';

export { default as MyLifeProfileScreen } from './MyLifeProfileScreen';
export * from './MyLifeProfileScreen';

export { default as LifeProfileIntroScreen } from '../familyConnectionCreateScreens/joinFamilayScreens/LifeProfileIntroScreen';
export * from '../familyConnectionCreateScreens/joinFamilayScreens/LifeProfileIntroScreen';

// Export all inner screens
export * from './innerScreens';

export * from './components';

export interface Step1FormData extends Partial<PersonalInfoScreenData> {
  [key: string]: any;
}
export interface Step2FormData {
  [key: string]: any;
}
export interface Step3FormData extends Partial<HealthProfileData> {
  [key: string]: any;
}
export interface Step4FormData {
  [key: string]: any;
}

export interface CompleteProfileStep1ScreenProps {
  memberId?: string;
  initialData?: Partial<Step1FormData>;
  initialMode?: 'input' | 'details';
  onBack?: () => void;
  onContinue?: (data: Step1FormData) => void;
}

export interface CompleteProfileStep2ScreenProps {
  memberId?: string;
  initialData?: Partial<Step2FormData>;
  onBack?: () => void;
  onContinue?: (data: Step2FormData) => void;
  onDocumentPress?: (documentId: string) => void;
  onAddDocument?: () => void;
}

export interface CompleteProfileStep3ScreenProps {
  memberId?: string;
  initialData?: Partial<Step3FormData>;
  initialMode?: 'input' | 'details';
  onBack?: () => void;
  onContinue?: (data: Step3FormData) => void;
  onCheckupItemPress?: (id: string) => void;
  onAddMedicine?: () => void;
}

export interface CompleteProfileStep4ScreenProps {
  memberId?: string;
  initialData?: Partial<Step4FormData>;
  initialMode?: 'form' | 'details';
  childName?: string;
  onBack?: () => void;
  onContinue?: (data: Step4FormData) => void;
  onCheckupItemPress?: (id: string) => void;
}

export interface CompleteProfileStep5ScreenProps {
  memberId?: string;
  onBack?: () => void;
  onEnterHosynQ?: (selectedInterests: string[]) => void;
  onSave?: (selectedInterests: string[]) => void;
}

export const CompleteProfileStep1Screen: React.FC<CompleteProfileStep1ScreenProps> = ({
  memberId,
  initialData,
  initialMode = 'input',
  onBack,
  onContinue,
}) =>
  React.createElement(PersonalInfoScreen, {
    memberId,
    initialData: initialData as any,
    initialMode,
    onBack,
    onSave: (data: any) => {
      if (onContinue) {
        onContinue(data);
      }
    },
  });

export const CompleteProfileStep2Screen: React.FC<CompleteProfileStep2ScreenProps> = ({
  memberId,
  onBack,
  onContinue,
  onDocumentPress,
  onAddDocument,
}) =>
  React.createElement(ImportantDocumentsScreen, {
    memberId,
    onBack,
    onDocumentPress,
    onAddDocument,
    onContinue: (data: any) => {
      if (onContinue) {
        onContinue(data);
      }
    },
  });

export const CompleteProfileStep3Screen: React.FC<CompleteProfileStep3ScreenProps> = ({
  memberId,
  initialData,
  initialMode,
  onBack,
  onContinue,
  onAddMedicine,
}) =>
  React.createElement(HealthProfileScreen, {
    memberId,
    initialData: initialData as any,
    initialMode,
    onBack,
    onAddMedicine,
    onSave: (data: any) => {
      if (onContinue) {
        onContinue(data);
      }
    },
  });

export const CompleteProfileStep4Screen: React.FC<CompleteProfileStep4ScreenProps> = ({
  memberId,
  initialData,
  initialMode = 'form',
  childName = 'Aarav',
  onBack,
  onContinue,
}) => {
  const [currentMode, setCurrentMode] = React.useState<'form' | 'details'>(
    initialMode,
  );

  if (currentMode === 'details') {
    return React.createElement(VaccinationScreen, {
      memberId,
      childName,
      onBack,
      onAddVaccineRecord: () => {
        setCurrentMode('form');
      },
    });
  }

  return React.createElement(AddVaccineScreen, {
    initialData: initialData as any,
    childName,
    onClose: onBack,
    onSave: (data: AddVaccineFormData) => {
      setCurrentMode('details');
      if (onContinue) {
        onContinue(data as any);
      }
    },
  });
};

export const CompleteProfileStep5Screen: React.FC<CompleteProfileStep5ScreenProps> = ({
  memberId,
  onBack,
  onEnterHosynQ,
  onSave,
}) =>
  React.createElement(InterestsAndActivitiesScreen, {
    memberId,
    onBack,
    onEnterHosynQ,
    onSave: (interests: string[]) => {
      if (onSave) {
        onSave(interests);
      } else if (onEnterHosynQ) {
        onEnterHosynQ(interests);
      }
    },
  });
