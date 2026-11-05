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
import { HealthCheckupsCard, CertificateUploadField } from './components';

export interface Step4FormData {
  vaccineName: string;
  lastDose: string;
  nextDue: string;
  certificateUpload: string;
  childHeight: string;
  heightGoal: string;
  childAllergies: string;
  childEyesight: string;
  seniorVaccineName: string;
  seniorLastDose: string;
  seniorNextDue: string;
  seniorCertificateUpload: string;
}

export interface CompleteProfileStep4ScreenProps {
  initialData?: Partial<Step4FormData>;
  onBack?: () => void;
  onContinue?: (data: Step4FormData) => void;
  onCheckupItemPress?: (id: string) => void;
}

const CompleteProfileStep4Screen: React.FC<CompleteProfileStep4ScreenProps> = ({
  initialData,
  onBack,
  onContinue,
  onCheckupItemPress,
}) => {
  const insets = useSafeAreaInsets();

  // Vaccine 1
  const [vaccineName, setVaccineName] = useState(
    initialData?.vaccineName || 'Hepatitis B'
  );
  const [lastDose, setLastDose] = useState(initialData?.lastDose || '');
  const [nextDue, setNextDue] = useState(initialData?.nextDue || '');
  const [certificateUpload, setCertificateUpload] = useState(
    initialData?.certificateUpload || ''
  );

  // Child growth
  const [childHeight, setChildHeight] = useState(
    initialData?.childHeight || "3'5 Feet"
  );
  const [heightGoal, setHeightGoal] = useState(
    initialData?.heightGoal || ''
  );
  const [childAllergies, setChildAllergies] = useState(
    initialData?.childAllergies || ''
  );
  const [childEyesight, setChildEyesight] = useState(
    initialData?.childEyesight || ''
  );

  // Senior medicine schedule
  const [seniorVaccineName, setSeniorVaccineName] = useState(
    initialData?.seniorVaccineName || 'Hepatitis B'
  );
  const [seniorLastDose, setSeniorLastDose] = useState(
    initialData?.seniorLastDose || ''
  );
  const [seniorNextDue, setSeniorNextDue] = useState(
    initialData?.seniorNextDue || ''
  );
  const [seniorCertificateUpload, setSeniorCertificateUpload] = useState(
    initialData?.seniorCertificateUpload || ''
  );

  const handleContinue = () => {
    onContinue?.({
      vaccineName,
      lastDose,
      nextDue,
      certificateUpload,
      childHeight,
      heightGoal,
      childAllergies,
      childEyesight,
      seniorVaccineName,
      seniorLastDose,
      seniorNextDue,
      seniorCertificateUpload,
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

      {/* Progress Bar (80%) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, styles.progressFill80]} />
        </View>
        <Text style={styles.progressText}>80%</Text>
      </View>

      <KeyboardAvoidingWrapper
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topContent}>
          {/* Section 1: Vaccine Information */}
          <View style={styles.formSection}>
            <CommonInput
              label="Vaccine name"
              value={vaccineName}
              onChangeText={setVaccineName}
              placeholder="Vaccine name"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            <CommonInput
              label="last dose"
              value={lastDose}
              onChangeText={setLastDose}
              placeholder="last dose"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            <CommonInput
              label="Next due"
              value={nextDue}
              onChangeText={setNextDue}
              placeholder="Next due"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            <CertificateUploadField
              label="Certificate upload"
              placeholder="Certificate upload"
              imageUri={certificateUpload}
              onImageChange={setCertificateUpload}
            />
          </View>

          {/* Section 2: Child growth */}
          <Text style={styles.sectionHeader}>Child growth</Text>
          <View style={styles.formSection}>
            <CommonInput
              label="Child Height"
              value={childHeight}
              onChangeText={setChildHeight}
              placeholder="Child Height"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            <CommonInput
              label="Height Goal"
              value={heightGoal}
              onChangeText={setHeightGoal}
              placeholder="Height Goal"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            <CommonInput
              label="Allergies"
              value={childAllergies}
              onChangeText={setChildAllergies}
              placeholder="Allergies"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            <CommonInput
              label="Eyesight"
              value={childEyesight}
              onChangeText={setChildEyesight}
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

          {/* Section 3: Senior medicine schedule */}
          <Text style={styles.sectionHeader}>Senior medicine schedule</Text>
          <View style={styles.formSection}>
            <CommonInput
              label="Vaccine name"
              value={seniorVaccineName}
              onChangeText={setSeniorVaccineName}
              placeholder="Vaccine name"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            <CommonInput
              label="last dose"
              value={seniorLastDose}
              onChangeText={setSeniorLastDose}
              placeholder="last dose"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            <CommonInput
              label="Next due"
              value={seniorNextDue}
              onChangeText={setSeniorNextDue}
              placeholder="Next due"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            <CertificateUploadField
              label="Certificate upload"
              placeholder="Certificate upload"
              imageUri={seniorCertificateUpload}
              onImageChange={setSeniorCertificateUpload}
            />
          </View>

          {/* Section 4: Health Checkups */}
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

export default CompleteProfileStep4Screen;

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
  progressFill80: {
    width: '80%',
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
  sectionHeader: {
    fontSize: RFValue(13.5),
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 18,
    marginBottom: 6,
    marginLeft: 4,
  },
  formSection: {
    width: '100%',
    marginTop: 4,
  },
  buttonSection: {
    width: '100%',
    marginTop: 28,
    marginBottom: 10,
  },
});

