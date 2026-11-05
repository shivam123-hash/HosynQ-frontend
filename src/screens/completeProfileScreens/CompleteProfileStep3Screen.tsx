import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import CommonBtn from '../../components/CommonBtn';
import CommonInput from '../../components/CommonInput';
import KeyboardAvoidingWrapper from '../../components/KeyboardAvoidingWrapper';
import { HealthCheckupsCard } from './components';

export interface Step3FormData {
  doctorName: string;
  hospital: string;
  medicalConditions: string;
  currentMedications: string;
  allergies: string;
  secondaryAllergies: string;
  checkupDates: string;
  eyesight: string;
}

export interface CompleteProfileStep3ScreenProps {
  initialData?: Partial<Step3FormData>;
  onBack?: () => void;
  onContinue?: (data: Step3FormData) => void;
  onCheckupItemPress?: (id: string) => void;
}

const CompleteProfileStep3Screen: React.FC<CompleteProfileStep3ScreenProps> = ({
  initialData,
  onBack,
  onContinue,
  onCheckupItemPress,
}) => {
  const insets = useSafeAreaInsets();

  const [doctorName, setDoctorName] = useState(initialData?.doctorName || 'Naman');
  const [hospital, setHospital] = useState(initialData?.hospital || '');
  const [medicalConditions, setMedicalConditions] = useState(
    initialData?.medicalConditions || ''
  );
  const [currentMedications, setCurrentMedications] = useState(
    initialData?.currentMedications || ''
  );
  const [allergies, setAllergies] = useState(initialData?.allergies || '');
  const [secondaryAllergies, setSecondaryAllergies] = useState(
    initialData?.secondaryAllergies || ''
  );
  const [checkupDates, setCheckupDates] = useState(
    initialData?.checkupDates || ''
  );
  const [eyesight, setEyesight] = useState(initialData?.eyesight || '');

  const handleContinue = () => {
    onContinue?.({
      doctorName,
      hospital,
      medicalConditions,
      currentMedications,
      allergies,
      secondaryAllergies,
      checkupDates,
      eyesight,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header with Back Button */}
      {onBack && (
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Feather name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Screen Title & Subtitle */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Unlock personalized reminders & family insights</Text>
      </View>

      {/* Progress Bar (60%) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, styles.progressFill60]} />
        </View>
        <Text style={styles.progressText}>60%</Text>
      </View>

      <KeyboardAvoidingWrapper
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topContent}>
          {/* Medical Form Fields */}
          <View style={styles.formSection}>
            {/* 1. Doctor Name */}
            <CommonInput
              label="Doctor Name"
              value={doctorName}
              onChangeText={setDoctorName}
              placeholder="Doctor Name"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 2. Hospital with location icon */}
            <CommonInput
              label="hospital"
              value={hospital}
              onChangeText={setHospital}
              placeholder="hospital"
              rightIcon="location-outline"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 3. Medical Conditions */}
            <CommonInput
              label="Medical Conditions"
              value={medicalConditions}
              onChangeText={setMedicalConditions}
              placeholder="Medical Conditions"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 4. Current Medications */}
            <CommonInput
              label="Current Medications"
              value={currentMedications}
              onChangeText={setCurrentMedications}
              placeholder="Current Medications"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 5. Allergies */}
            <CommonInput
              label="Allergies"
              value={allergies}
              onChangeText={setAllergies}
              placeholder="Allergies"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 6. Allergies (Food / Secondary) */}
            <CommonInput
              label="Allergies"
              value={secondaryAllergies}
              onChangeText={setSecondaryAllergies}
              placeholder="Allergies"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 7. Checkup Dates */}
            <CommonInput
              label="Checkup Dates"
              value={checkupDates}
              onChangeText={setCheckupDates}
              placeholder="Checkup Dates"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 8. Eyesight */}
            <CommonInput
              label="Eyesight"
              value={eyesight}
              onChangeText={setEyesight}
              placeholder="Eyesight"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {/* Health Checkups Section */}
          <HealthCheckupsCard onItemPress={onCheckupItemPress} />
        </View>

        {/* Bottom Continue Button */}
        <View style={styles.buttonSection}>
          <CommonBtn
            title="Continue →"
            onPress={handleContinue}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </View>
  );
};

export default CompleteProfileStep3Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: RFValue(11.5),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 14,
    marginBottom: 10,
  },
  progressTrack: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#16283E',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressFill60: {
    width: '60%',
  },
  progressText: {
    color: Colors.textSecondary,
    fontSize: RFValue(11),
    fontWeight: '600',
    marginLeft: 14,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topContent: {
    width: '100%',
  },
  formSection: {
    width: '100%',
    marginTop: 6,
  },
  buttonSection: {
    width: '100%',
    marginTop: 28,
    marginBottom: 10,
  },
});
