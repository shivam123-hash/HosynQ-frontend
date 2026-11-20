import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  useAppDispatch,
  useAppSelector,
  fetchLifeProfileSectionThunk,
  updateLifeProfileSectionThunk,
  fetchLifeProfileFullThunk,
  fetchMedicinesThunk,
} from '../../../redux';
import { getMyMemberId } from '../../../units/asyncStorageManager';
import HealthProfileInputScreen, {
  HealthProfileFormValues,
  DEFAULT_HEALTH_FORM_VALUES,
} from './HealthProfileInputScreen';
import HealthProfileDetailsScreen from './HealthProfileDetailsScreen';
import {
  buildHealthPayload,
  mapBackendToHealthForm,
} from './healthPayloadUtils';

export type HealthProfileMode = 'input' | 'details';

export interface HealthProfileData {
  doctor: string;
  clinicLocation: string;
  hospital: string;
  allergies: string[];
  conditions: string;
  medications: string;
  checkups: string;
  eyesight: string;
}

export const DEFAULT_HEALTH_DATA: HealthProfileData = {
  doctor: '',
  clinicLocation: '',
  hospital: '',
  allergies: [],
  conditions: '',
  medications: '',
  checkups: '',
  eyesight: '',
};

export interface HealthProfileScreenProps {
  memberId?: string;
  initialData?: Partial<HealthProfileFormValues | HealthProfileData>;
  initialMode?: HealthProfileMode;
  userName?: string;
  onBack?: () => void;
  onSave?: (data: HealthProfileFormValues) => void;
  onAddMedicine?: () => void;
  onMedicinePress?: (medicineId: string) => void;
  onDoctorPress?: () => void;
  onClinicPress?: () => void;
  onHospitalPress?: () => void;
  onAddAllergy?: () => void;
  onCheckupsPress?: () => void;
  onEyesightPress?: () => void;
}

const HealthProfileScreen: React.FC<HealthProfileScreenProps> = ({
  memberId,
  initialData,
  initialMode = 'input',
  userName = 'Priya',
  onBack,
  onSave,
  onAddMedicine,
  onMedicinePress,
  onDoctorPress,
  onClinicPress,
  onHospitalPress,
  onAddAllergy,
  onCheckupsPress,
  onEyesightPress,
}) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth?.user || state.emailAuth?.user);
  const familyState = useAppSelector((state) => (state as any).family);
  const lifeProfileHealth = useAppSelector((state) => state.lifeProfile?.health);

  const resolvedMemberId =
    memberId ||
    familyState?.myMemberId ||
    familyState?.family?.myMemberId ||
    authUser?.memberId ||
    authUser?.myMemberId ||
    authUser?.id ||
    authUser?._id ||
    'me';

  // Fetch health section and medicines list
  useEffect(() => {
    if (resolvedMemberId && resolvedMemberId !== 'me') {
      dispatch(
        fetchLifeProfileSectionThunk({
          memberId: resolvedMemberId,
          section: 'health',
        })
      );
      dispatch(fetchMedicinesThunk({ memberId: resolvedMemberId }));
    }
  }, [dispatch, resolvedMemberId]);

  const [currentMode, setCurrentMode] = useState<HealthProfileMode>(initialMode);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<HealthProfileFormValues>(() => {
    if (initialData && 'doctor' in initialData && typeof initialData.doctor === 'object') {
      return {
        ...DEFAULT_HEALTH_FORM_VALUES,
        ...(initialData as HealthProfileFormValues),
      };
    }
    return DEFAULT_HEALTH_FORM_VALUES;
  });

  // Sync incoming backend health data into formData
  useEffect(() => {
    const rawHealth =
      lifeProfileHealth?.data?.health ||
      lifeProfileHealth?.health ||
      lifeProfileHealth?.data ||
      lifeProfileHealth;

    if (rawHealth && (rawHealth.primaryDoctor || rawHealth.doctorPhone || rawHealth.clinicName || rawHealth.allergies?.length)) {
      const mapped = mapBackendToHealthForm(rawHealth);
      setFormData(mapped);
    }
  }, [lifeProfileHealth]);

  const handleInputSave = async (savedValues: HealthProfileFormValues) => {
    setIsSaving(true);
    setFormData(savedValues);

    let targetMemberId = resolvedMemberId;
    if (!targetMemberId || targetMemberId === 'me') {
      const storedMemberId = await getMyMemberId();
      if (storedMemberId) {
        targetMemberId = storedMemberId;
      }
    }

    const payload = buildHealthPayload(savedValues);
    console.log('====================================');
    console.log('[HealthProfile] Submitting PATCH /life-profile with health payload:');
    console.log(`[HealthProfile] Target MemberId: ${targetMemberId}`);
    console.log(JSON.stringify({ health: payload }, null, 2));
    console.log('====================================');

    try {
      const response = await dispatch(
        updateLifeProfileSectionThunk({
          memberId: targetMemberId,
          payload: { health: payload },
        })
      ).unwrap();

      console.log('====================================');
      console.log('[HealthProfile] Health Section Saved Successfully:');
      console.log(JSON.stringify(response, null, 2));
      console.log('====================================');

      // Refresh full profile & health section
      try {
        await Promise.all([
          dispatch(fetchLifeProfileFullThunk({ memberId: targetMemberId })),
          dispatch(fetchLifeProfileSectionThunk({ memberId: targetMemberId, section: 'health' })),
          dispatch(fetchMedicinesThunk({ memberId: targetMemberId })),
        ]);
      } catch (err) {
        console.log('[HealthProfile] Error refreshing health profile:', err);
      }

      // Transition to details screen so user sees saved data & can add medicines
      setCurrentMode('details');
    } catch (error: any) {
      console.log('[HealthProfile] Save Error:', error);
      Alert.alert(
        'Save Failed',
        Array.isArray(error)
          ? error.join('\n')
          : error?.message || error || 'Failed to save health profile.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (currentMode === 'details') {
    return (
      <HealthProfileDetailsScreen
        data={formData}
        userName={userName}
        memberId={resolvedMemberId}
        onBack={() => {
          if (onBack) {
            onBack();
          } else {
            setCurrentMode('input');
          }
        }}
        onEditPress={() => setCurrentMode('input')}
        onAddMedicine={onAddMedicine}
        onMedicinePress={onMedicinePress}
        onDoctorPress={onDoctorPress}
        onClinicPress={onClinicPress}
        onHospitalPress={onHospitalPress}
        onCheckupsPress={onCheckupsPress}
        onEyesightPress={onEyesightPress}
      />
    );
  }

  return (
    <HealthProfileInputScreen
      initialValues={formData}
      userName={userName}
      onClose={() => {
        // If details exist (e.g. user entered edit mode from details), return to details
        const rawHealth =
          lifeProfileHealth?.data?.health ||
          lifeProfileHealth?.health ||
          lifeProfileHealth?.data ||
          lifeProfileHealth;
        const hasSavedHealth = !!(
          rawHealth?.primaryDoctor ||
          rawHealth?.doctorPhone ||
          rawHealth?.clinicName ||
          rawHealth?.allergies?.length
        );
        if (hasSavedHealth) {
          setCurrentMode('details');
        } else if (onBack) {
          onBack();
        }
      }}
      onSave={handleInputSave}
    />
  );
};

export default HealthProfileScreen;
