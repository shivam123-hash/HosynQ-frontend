import React, { useState } from 'react';
import { useAppSelector } from '../../../redux';
import PersonalInfoInputScreen, {
  PersonalInfoInputFormData,
  DEFAULT_PERSONAL_INPUT_DATA,
} from './PersonalInfoInputScreen';
import PersonalInfoDetailsScreen from './PersonalInfoDetailsScreen';
import { PersonalInfoData, WorkDetails } from '../components';

export type { PersonalInfoInputFormData };
export { DEFAULT_PERSONAL_INPUT_DATA };

export interface PersonalInfoScreenData {
  personalInfo: PersonalInfoData;
  occupation: string;
  workDetails: WorkDetails;
  formData?: PersonalInfoInputFormData;
}

export interface PersonalInfoScreenProps {
  memberId?: string;
  initialData?: Partial<PersonalInfoInputFormData> | Partial<PersonalInfoScreenData>;
  initialMode?: 'input' | 'details';
  onBack?: () => void;
  onSave?: (data: PersonalInfoInputFormData | PersonalInfoScreenData) => void;
  onContinue?: (data: PersonalInfoInputFormData) => void;
  onRowPress?: (fieldKey: string) => void;
  onWorkHoursPress?: () => void;
  onMapPress?: () => void;
}

const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({
  memberId,
  initialData,
  initialMode = 'input',
  onBack,
  onSave,
  onContinue,
  onMapPress,
}) => {
  const authUser = useAppSelector((state) => state.auth.user);
  const baseProfile = useAppSelector((state) => state.baseProfile);

  // Normalize initial data
  const normalizedData: PersonalInfoInputFormData = {
    ...DEFAULT_PERSONAL_INPUT_DATA,
    fullName:
      baseProfile?.fullName ||
      authUser?.name ||
      authUser?.fullName ||
      DEFAULT_PERSONAL_INPUT_DATA.fullName,
    familyRole:
      baseProfile?.familyRole ||
      authUser?.familyRole ||
      authUser?.role ||
      DEFAULT_PERSONAL_INPUT_DATA.familyRole,
    email: authUser?.email || DEFAULT_PERSONAL_INPUT_DATA.email,
    ...((initialData as any)?.personalInfo ? {
      fullName: (initialData as any).personalInfo.fullName || DEFAULT_PERSONAL_INPUT_DATA.fullName,
      nickname: (initialData as any).personalInfo.nickname || DEFAULT_PERSONAL_INPUT_DATA.nickname,
      email: (initialData as any).personalInfo.email || DEFAULT_PERSONAL_INPUT_DATA.email,
      familyRole: (initialData as any).personalInfo.familyRole || DEFAULT_PERSONAL_INPUT_DATA.familyRole,
      gender: (initialData as any).personalInfo.gender || DEFAULT_PERSONAL_INPUT_DATA.gender,
      bloodGroup: (initialData as any).personalInfo.bloodGroup || DEFAULT_PERSONAL_INPUT_DATA.bloodGroup,
    } : {}),
    ...((initialData as any)?.workDetails ? {
      companyName: (initialData as any).workDetails.company || DEFAULT_PERSONAL_INPUT_DATA.companyName,
      designation: (initialData as any).workDetails.role || DEFAULT_PERSONAL_INPUT_DATA.designation,
      officeLocation: (initialData as any).workDetails.officeLocation || DEFAULT_PERSONAL_INPUT_DATA.officeLocation,
    } : {}),
    ...((initialData as any)?.occupation ? {
      status: (initialData as any).occupation,
    } : {}),
    ...(initialData as any || {}),
  };

  const [currentMode, setCurrentMode] = useState<'input' | 'details'>(
    initialMode,
  );
  const [formData, setFormData] =
    useState<PersonalInfoInputFormData>(normalizedData);

  // When user presses "Save" on First Image (Input Fields screen) -> go to Second Image (Saved Details screen)
  const handleInputSave = (savedData: PersonalInfoInputFormData) => {
    setFormData(savedData);
    setCurrentMode('details');
  };

  // When user presses "Save" on Second Image (Saved Details screen) -> finalize / callback
  const handleDetailsSave = (finalData: PersonalInfoInputFormData) => {
    const legacyPayload: PersonalInfoScreenData = {
      personalInfo: {
        fullName: finalData.fullName,
        nickname: finalData.nickname,
        email: finalData.email,
        familyRole: finalData.familyRole,
        gender: finalData.gender,
        birthDate: `${finalData.birthDate} · ${finalData.age}`,
        bloodGroup: finalData.bloodGroup,
        heightWeight: `${finalData.height} cm · ${finalData.weight} kg`,
      },
      occupation: finalData.status,
      workDetails: {
        company: finalData.companyName,
        role: finalData.designation,
        officeLocation: finalData.officeLocation,
        workHours: `${finalData.startTime} to ${finalData.endTime}`,
      },
      formData: finalData,
    };

    if (onSave) {
      onSave(legacyPayload);
    }
    if (onContinue) {
      onContinue(finalData);
    }
  };

  const userName = formData.fullName.trim().split(' ')[0] || 'Priya';

  if (currentMode === 'details') {
    return (
      <PersonalInfoDetailsScreen
        memberId={memberId}
        data={formData}
        userName={userName}
        onBack={() => setCurrentMode('input')}
        onEditPress={() => setCurrentMode('input')}
        onSave={handleDetailsSave}
      />
    );
  }

  return (
    <PersonalInfoInputScreen
      initialData={formData}
      userName={userName}
      onClose={onBack}
      onSave={handleInputSave}
      onSelectOfficeLocation={onMapPress}
    />
  );
};

export default PersonalInfoScreen;
