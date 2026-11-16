import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector, fetchLifeProfileSectionThunk } from '../../../redux';
import HealthProfileInputScreen, {
  HealthProfileFormValues,
  DEFAULT_HEALTH_FORM_VALUES,
} from './HealthProfileInputScreen';
import HealthProfileDetailsScreen from './HealthProfileDetailsScreen';

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
  doctor: 'Dr. Anjali Rao · General physician',
  clinicLocation: 'Rao Clinic, Sector 47',
  hospital: 'CityCare Hospital, Sector 38',
  allergies: ['Penicillin', 'Dust'],
  conditions: 'Migraine',
  medications: 'Vitamin D · once a week',
  checkups: 'Last 12 Mar 2026 · Next Mar 2027',
  eyesight: 'Right -1.25, Left -1.00 · Glasses',
};

export interface HealthProfileScreenProps {
  memberId?: string;
  initialData?: Partial<HealthProfileFormValues | HealthProfileData>;
  initialMode?: HealthProfileMode;
  userName?: string;
  onBack?: () => void;
  onSave?: (data: HealthProfileFormValues) => void;
  onAddMedicine?: () => void;
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
  onDoctorPress,
  onClinicPress,
  onHospitalPress,
  onAddAllergy,
  onCheckupsPress,
  onEyesightPress,
}) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth?.user || state.emailAuth?.user);
  const lifeProfileHealth = useAppSelector((state) => state.lifeProfile?.health);

  const resolvedMemberId =
    memberId ||
    authUser?.memberId ||
    authUser?.id ||
    authUser?._id ||
    'me';

  // API Call Structure: GET {{BaseURL}}/api/v1/family/members/{{memberId}}/life-profile?section=health
  useEffect(() => {
    if (resolvedMemberId) {
      dispatch(
        fetchLifeProfileSectionThunk({
          memberId: resolvedMemberId,
          section: 'health',
        })
      );
    }
  }, [dispatch, resolvedMemberId]);

  /*
   * DATA MAPPING (Ready to connect when backend health data is ready):
   * const healthData = lifeProfileHealth?.data || lifeProfileHealth;
   * // doctor = healthData?.doctor
   * // clinicLocation = healthData?.clinicLocation
   * // allergies = healthData?.allergies
   * // conditions = healthData?.conditions
   * // medications = healthData?.medications
   */
  const [currentMode, setCurrentMode] = useState<HealthProfileMode>(initialMode);
  const [formData, setFormData] = useState<HealthProfileFormValues>(() => {
    // If incoming data matches form values directly
    if (initialData && 'doctor' in initialData && typeof initialData.doctor === 'object') {
      return {
        ...DEFAULT_HEALTH_FORM_VALUES,
        ...(initialData as HealthProfileFormValues),
      };
    }
    return DEFAULT_HEALTH_FORM_VALUES;
  });

  const handleInputSave = (savedValues: HealthProfileFormValues) => {
    setFormData(savedValues);
    setCurrentMode('details');
  };

  if (currentMode === 'details') {
    return (
      <HealthProfileDetailsScreen
        data={formData}
        userName={userName}
        onBack={() => {
          if (onBack) {
            onBack();
          } else {
            setCurrentMode('input');
          }
        }}
        onEditPress={() => setCurrentMode('input')}
        onAddMedicine={onAddMedicine}
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
      onClose={onBack}
      onSave={handleInputSave}
    />
  );
};

export default HealthProfileScreen;
