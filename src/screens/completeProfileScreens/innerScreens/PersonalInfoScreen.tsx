import React, { useState, useEffect } from 'react';
import {
  useAppDispatch,
  useAppSelector,
  updateLifeProfileSectionThunk,
  fetchLifeProfileFullThunk,
} from '../../../redux';
import { getMyMemberId, saveMyMemberId } from '../../../units/AsyncStorageManager';
import PersonalInfoInputScreen from './PersonalInfoInputScreen';
import PersonalInfoDetailsScreen from './PersonalInfoDetailsScreen';
import { PersonalInfoData, WorkDetails } from '../components';
import { AppErrorModal } from '../../../components';
import {
  PersonalInfoInputFormData,
  DEFAULT_PERSONAL_INPUT_DATA,
  buildPersonalPayload,
  mapStatusToBackendEnum,
  mapBackendEnumToStatus,
  mapBackendToPersonalForm,
  isValidEmail,
} from './personalInfoUtils';

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
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth?.user || (state as any).emailAuth?.user);
  const baseProfile = useAppSelector((state) => state.baseProfile);
  const familyState = useAppSelector((state) => (state as any).family);
  const lifeProfileState = useAppSelector((state) => state.lifeProfile);

  const backendPersonal =
    lifeProfileState?.full?.data?.personal || lifeProfileState?.personal;

  // Base information entered by user in earlier steps (BasicProfile / Auth)
  const baseFullName =
    baseProfile?.fullName ||
    authUser?.name ||
    authUser?.fullName ||
    backendPersonal?.fullName ||
    '';
  const baseFamilyRole =
    baseProfile?.familyRole ||
    authUser?.familyRole ||
    authUser?.role ||
    backendPersonal?.familyRole ||
    '';
  const baseEmail =
    authUser?.email ||
    backendPersonal?.email ||
    '';

  // Normalize initial data: if backendPersonal has saved values, map ALL of them; otherwise start blank with base info
  const normalizedData: PersonalInfoInputFormData = React.useMemo(() => {
    if (backendPersonal && Object.keys(backendPersonal).length > 0) {
      return mapBackendToPersonalForm(backendPersonal, {
        fullName: baseFullName,
        email: baseEmail,
        familyRole: baseFamilyRole,
      });
    }

    if (initialData && Object.keys(initialData).length > 0) {
      return {
        ...DEFAULT_PERSONAL_INPUT_DATA,
        fullName: baseFullName,
        familyRole: baseFamilyRole,
        email: baseEmail,
        ...((initialData as any)?.personalInfo ? {
          fullName: (initialData as any).personalInfo.fullName || baseFullName,
          nickname: (initialData as any).personalInfo.nickname || '',
          email: (initialData as any).personalInfo.email || baseEmail,
          familyRole: (initialData as any).personalInfo.familyRole || baseFamilyRole,
          gender: (initialData as any).personalInfo.gender || '',
          bloodGroup: (initialData as any).personalInfo.bloodGroup || '',
        } : {}),
        ...((initialData as any)?.workDetails ? {
          companyName: (initialData as any).workDetails.company || '',
          designation: (initialData as any).workDetails.role || '',
          officeLocation: (initialData as any).workDetails.officeLocation || '',
        } : {}),
        ...((initialData as any)?.occupation ? {
          status: (initialData as any).occupation,
        } : {}),
        ...((initialData as any) || {}),
      };
    }

    return {
      ...DEFAULT_PERSONAL_INPUT_DATA,
      fullName: baseFullName,
      familyRole: baseFamilyRole,
      email: baseEmail,
    };
  }, [backendPersonal, initialData, baseFullName, baseEmail, baseFamilyRole]);

  const [currentMode, setCurrentMode] = useState<'input' | 'details'>(
    initialMode,
  );

  useEffect(() => {
    if (initialMode) {
      setCurrentMode(initialMode);
    }
  }, [initialMode]);

  const [formData, setFormData] =
    useState<PersonalInfoInputFormData>(normalizedData);

  // Sync formData whenever backendPersonal loads or changes (e.g. after save or navigating to edit)
  useEffect(() => {
    setFormData(normalizedData);
  }, [normalizedData]);

  const [isSaving, setIsSaving] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // When user presses "Save" on First Image (Input Fields screen) -> calls PATCH API -> go to Second Image (Saved Details screen)
  const handleInputSave = async (savedData: PersonalInfoInputFormData) => {
    // 1. Client-side email validation
    if (savedData.email?.trim() && !isValidEmail(savedData.email.trim())) {
      setErrorMessage(
        'Please enter a valid email address format (e.g. name@example.com).'
      );
      setErrorModalVisible(true);
      return;
    }

    if (savedData.workEmail?.trim() && !isValidEmail(savedData.workEmail.trim())) {
      setErrorMessage(
        'Please enter a valid work email address format (e.g. work@company.com).'
      );
      setErrorModalVisible(true);
      return;
    }

    // 2. Client-side location validation for Working
    const occStatus = mapStatusToBackendEnum(savedData.status);
    if (occStatus === 'WORKING') {
      const isWFH =
        savedData.workMode === 'Work from home' ||
        savedData.workMode === 'Remote';
      if (!isWFH && !savedData.officeLocation?.trim()) {
        setErrorMessage(
          'Office location is required for Office / Hybrid work mode. Please enter your office address.'
        );
        setErrorModalVisible(true);
        return;
      }
    }

    setIsSaving(true);
    setFormData(savedData);

    const storedMemberId = await getMyMemberId();
    let targetMemberId =
      memberId ||
      storedMemberId ||
      lifeProfileState?.full?.member?.memberId ||
      lifeProfileState?.full?.data?.member?.memberId ||
      familyState?.myMemberId ||
      familyState?.family?.myMemberId ||
      authUser?.memberId ||
      authUser?.myMemberId ||
      authUser?.id ||
      authUser?._id;

    if (targetMemberId) {
      await saveMyMemberId(targetMemberId);
    }

    const patchPayload = buildPersonalPayload(savedData);

    console.log('====================================');
    console.log('[PersonalInfo] SAVE BUTTON PRESSED!');
    console.log(`[PersonalInfo] Resolved Member ID: ${targetMemberId}`);
    console.log(`[PersonalInfo] Submitting PATCH api/v1/family/members/${targetMemberId}/life-profile`);
    console.log('[PersonalInfo] Request Payload:\n', JSON.stringify(patchPayload, null, 2));
    console.log('====================================');

    if (targetMemberId) {
      try {
        const responseAction = await dispatch(
          updateLifeProfileSectionThunk({
            memberId: targetMemberId,
            payload: patchPayload,
          })
        ).unwrap();

        console.log('====================================');
        console.log(`[PersonalInfo] PATCH SUCCESS RESPONSE for memberId ${targetMemberId}:`);
        console.log(JSON.stringify(responseAction, null, 2));
        console.log('====================================');

        // Immediately refetch the full life profile so Redux store has the updated progress & section data
        try {
          console.log(`[PersonalInfo] Refreshing Life Profile: GET api/v1/family/members/${targetMemberId}/life-profile?view=full`);
          await dispatch(fetchLifeProfileFullThunk({ memberId: targetMemberId }));
        } catch (fetchErr) {
          console.log('[PersonalInfo] Error refreshing full profile after patch:', fetchErr);
        }

        setIsSaving(false);
        setCurrentMode('details');
      } catch (error: any) {
        console.log('====================================');
        console.log('[PersonalInfo] PATCH API ERROR:');
        console.log(error);
        console.log('====================================');
        setIsSaving(false);

        const rawMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          error;
        let formattedMsg = 'Failed to save personal information.';
        if (Array.isArray(rawMsg)) {
          formattedMsg = rawMsg
            .map((m: string) =>
              typeof m === 'string' ? m.replace(/^personal\./, '') : String(m)
            )
            .join('\n');
        } else if (typeof rawMsg === 'string') {
          formattedMsg = rawMsg.replace(/^personal\./, '');
        }

        setErrorMessage(formattedMsg);
        setErrorModalVisible(true);
        return; // STOP! Never transition to details on failure
      }
    } else {
      console.warn(
        '[PersonalInfo] Warning: No memberId found to patch profile.'
      );
      setIsSaving(false);
      setErrorMessage('Unable to find member ID to update profile.');
      setErrorModalVisible(true);
      return;
    }
  };

  // When user presses "Save" or "Edit" on Second Image (Saved Details screen) -> finalize / callback
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

  return (
    <>
      {currentMode === 'details' ? (
        <PersonalInfoDetailsScreen
          memberId={memberId}
          data={formData}
          userName={userName}
          onBack={() => {
            if (onBack) {
              onBack();
            } else if (onContinue) {
              onContinue(formData);
            }
          }}
          onEditPress={() => setCurrentMode('input')}
          onSave={handleDetailsSave}
        />
      ) : (
        <PersonalInfoInputScreen
          initialData={formData}
          userName={userName}
          isLoading={isSaving}
          onClose={onBack}
          onSave={handleInputSave}
          onSelectOfficeLocation={onMapPress}
        />
      )}

      <AppErrorModal
        visible={errorModalVisible}
        title="Check Details"
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </>
  );
};

export default PersonalInfoScreen;
