import React from 'react';
import { View, Text } from 'react-native';
import PersonalInfoScreen, {
  PersonalInfoScreenData,
} from './innerScreens/PersonalInfoScreen';
import ImportantDocumentsScreen from './innerScreens/ImportantDocumentsScreen';
import DocumentDetailRemindersScreen from './innerScreens/DocumentDetailRemindersScreen';
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
  initialData?: Partial<Step1FormData>;
  onBack?: () => void;
  onContinue?: (data: Step1FormData) => void;
}

export interface CompleteProfileStep2ScreenProps {
  initialData?: Partial<Step2FormData>;
  onBack?: () => void;
  onContinue?: (data: Step2FormData) => void;
  onDocumentPress?: (documentId: string) => void;
  onAddDocument?: () => void;
}

export interface CompleteProfileStep3ScreenProps {
  initialData?: Partial<Step3FormData>;
  onBack?: () => void;
  onContinue?: (data: Step3FormData) => void;
  onCheckupItemPress?: (id: string) => void;
}

export interface CompleteProfileStep4ScreenProps {
  initialData?: Partial<Step4FormData>;
  onBack?: () => void;
  onContinue?: (data: Step4FormData) => void;
  onCheckupItemPress?: (id: string) => void;
}

export interface CompleteProfileStep5ScreenProps {
  onBack?: () => void;
  onEnterHosynQ?: (selectedInterests: string[]) => void;
  onSave?: (selectedInterests: string[]) => void;
}

export const CompleteProfileStep1Screen: React.FC<CompleteProfileStep1ScreenProps> = ({
  initialData,
  onBack,
  onContinue,
}) =>
  React.createElement(PersonalInfoScreen, {
    initialData: initialData as any,
    onBack,
    onSave: (data: PersonalInfoScreenData) => {
      if (onContinue) {
        onContinue(data);
      }
    },
  });

export const CompleteProfileStep2Screen: React.FC<CompleteProfileStep2ScreenProps> = ({
  onBack,
  onContinue,
  onDocumentPress,
  onAddDocument,
}) =>
  React.createElement(ImportantDocumentsScreen, {
    onBack,
    onDocumentPress,
    onAddDocument: () => {
      if (onAddDocument) {
        onAddDocument();
      } else if (onContinue) {
        onContinue({});
      }
    },
  });

export const CompleteProfileStep3Screen: React.FC<CompleteProfileStep3ScreenProps> = ({
  initialData,
  onBack,
  onContinue,
}) =>
  React.createElement(HealthProfileScreen, {
    initialData: initialData as any,
    onBack,
    onSave: (data: HealthProfileData) => {
      if (onContinue) {
        onContinue(data);
      }
    },
  });

export const CompleteProfileStep4Screen: React.FC<CompleteProfileStep4ScreenProps> = ({
  onBack,
  onContinue,
}) =>
  React.createElement(VaccinationScreen, {
    onBack,
    onAddVaccineRecord: () => {
      if (onContinue) {
        onContinue({});
      }
    },
  });

export const CompleteProfileStep5Screen: React.FC<CompleteProfileStep5ScreenProps> = ({
  onBack,
  onEnterHosynQ,
  onSave,
}) =>
  React.createElement(InterestsAndActivitiesScreen, {
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
