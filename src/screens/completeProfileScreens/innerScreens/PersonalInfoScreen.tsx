import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { useAppSelector } from '../../../redux';
import {
  PersonalInfoHeader,
  PersonalInfoGroupCard,
  PersonalInfoData,
  OccupationSelector,
  WorkDetailsSection,
  WorkDetails,
} from '../components';

export interface PersonalInfoScreenData {
  personalInfo: PersonalInfoData;
  occupation: string;
  workDetails: WorkDetails;
}

export interface PersonalInfoScreenProps {
  initialData?: Partial<PersonalInfoScreenData>;
  onBack?: () => void;
  onSave?: (data: PersonalInfoScreenData) => void;
  onRowPress?: (fieldKey: keyof PersonalInfoData) => void;
  onWorkHoursPress?: () => void;
  onMapPress?: () => void;
}

const DEFAULT_PERSONAL_INFO: PersonalInfoData = {
  fullName: 'Priya Sharma',
  nickname: 'Pri',
  email: 'priya.sharma@example.com',
  familyRole: 'Mother',
  gender: 'Female',
  birthDate: '8 Aug 1988 · 38 years',
  bloodGroup: 'O+',
  heightWeight: '162 cm · 58 kg',
};

const DEFAULT_WORK_DETAILS: WorkDetails = {
  company: 'Kaveri Design Studio',
  role: 'Interior designer',
  officeLocation: 'Udyog Vihar Phase 4, Gurugram',
  workHours: 'Mon to Sat, 10:00 AM to 6:30 PM',
};

const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({
  initialData,
  onBack,
  onSave,
  onRowPress,
  onWorkHoursPress,
  onMapPress,
}) => {
  const insets = useSafeAreaInsets();
  const authUser = useAppSelector((state) => state.auth.user);
  const baseProfile = useAppSelector((state) => state.baseProfile);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    ...DEFAULT_PERSONAL_INFO,
    fullName:
      baseProfile?.fullName ||
      authUser?.name ||
      authUser?.fullName ||
      DEFAULT_PERSONAL_INFO.fullName,
    familyRole:
      baseProfile?.familyRole ||
      authUser?.familyRole ||
      authUser?.role ||
      DEFAULT_PERSONAL_INFO.familyRole,
    email: authUser?.email || DEFAULT_PERSONAL_INFO.email,
    ...(initialData?.personalInfo || {}),
  });

  const [occupation, setOccupation] = useState<string>(
    initialData?.occupation || 'Working',
  );

  const [workDetails, setWorkDetails] = useState<WorkDetails>({
    ...DEFAULT_WORK_DETAILS,
    ...(initialData?.workDetails || {}),
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    const payload: PersonalInfoScreenData = {
      personalInfo,
      occupation,
      workDetails,
    };
    if (onSave) {
      onSave(payload);
    }
    setIsSaving(false);
  };

  const userNameFirst = personalInfo.fullName.split(' ')[0] || 'Priya';

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <PersonalInfoHeader
        title="Personal information"
        subtitle={`${userNameFirst} · Section 1 of 5`}
        onBack={onBack}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section 1: Personal Info Group Card */}
          <PersonalInfoGroupCard
            data={personalInfo}
            onRowPress={(key) => {
              if (onRowPress) {
                onRowPress(key);
              }
            }}
          />

          {/* Section 2: Education / Career - What Best Describes You */}
          {/* Note: As per user instructions, the collapsed summary card from Image 2 is omitted */}
          <OccupationSelector
            sectionTitle="EDUCATION / CAREER"
            questionTitle="What Best Describes You"
            selectedOccupation={occupation}
            onSelectOccupation={setOccupation}
          />

          {/* Section 3: Work Details (Company, Role, Location, Map, Hours) */}
          <WorkDetailsSection
            sectionTitle="WORK"
            details={workDetails}
            onChangeCompany={(text) =>
              setWorkDetails((prev) => ({ ...prev, company: text }))
            }
            onChangeRole={(text) =>
              setWorkDetails((prev) => ({ ...prev, role: text }))
            }
            onChangeLocation={(text) =>
              setWorkDetails((prev) => ({ ...prev, officeLocation: text }))
            }
            onWorkHoursPress={onWorkHoursPress}
            onMapPress={onMapPress}
          />
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title="Save"
            onPress={handleSave}
            loading={isSaving}
            backgroundColor={Colors.primary || '#F0913A'}
            textColor="#FFFFFF"
            height={54}
            borderRadius={27}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PersonalInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});
