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
import { EncryptedNoticeCard } from './components';

export interface Step2FormData {
  passportNumber: string;
  visaExpiry: string;
  drivingLicenseExpiry: string;
  aadhaarNumber: string;
  pan: string;
  insuranceDetails: string;
}

export interface CompleteProfileStep2ScreenProps {
  initialData?: Partial<Step2FormData>;
  onBack?: () => void;
  onContinue?: (data: Step2FormData) => void;
}

const CompleteProfileStep2Screen: React.FC<CompleteProfileStep2ScreenProps> = ({
  initialData,
  onBack,
  onContinue,
}) => {
  const insets = useSafeAreaInsets();

  const [passportNumber, setPassportNumber] = useState(
    initialData?.passportNumber || 'A2096457'
  );
  const [visaExpiry, setVisaExpiry] = useState(initialData?.visaExpiry || '');
  const [drivingLicenseExpiry, setDrivingLicenseExpiry] = useState(
    initialData?.drivingLicenseExpiry || ''
  );
  const [aadhaarNumber, setAadhaarNumber] = useState(
    initialData?.aadhaarNumber || ''
  );
  const [pan, setPan] = useState(initialData?.pan || '');
  const [insuranceDetails, setInsuranceDetails] = useState(
    initialData?.insuranceDetails || ''
  );

  const handleContinue = () => {
    onContinue?.({
      passportNumber,
      visaExpiry,
      drivingLicenseExpiry,
      aadhaarNumber,
      pan,
      insuranceDetails,
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

      {/* Progress Bar (40%) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, styles.progressFill40]} />
        </View>
        <Text style={styles.progressText}>40%</Text>
      </View>

      <KeyboardAvoidingWrapper
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topContent}>
          {/* Encrypted Notice Banner Card */}
          <EncryptedNoticeCard />

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* 1. Passport Number */}
            <CommonInput
              label="Passport Number"
              value={passportNumber}
              onChangeText={setPassportNumber}
              placeholder="Passport Number"
              autoCapitalize="characters"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 2. Visa Expiry */}
            <CommonInput
              label="Visa Expiry"
              value={visaExpiry}
              onChangeText={setVisaExpiry}
              placeholder="Visa Expiry"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 3. Driving License Expiry */}
            <CommonInput
              label="Driving License Expiry"
              value={drivingLicenseExpiry}
              onChangeText={setDrivingLicenseExpiry}
              placeholder="Driving License Expiry"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 4. Aadhaar Number */}
            <CommonInput
              label="Aadhaar Number"
              value={aadhaarNumber}
              onChangeText={setAadhaarNumber}
              placeholder="Aadhaar Number"
              keyboardType="numeric"
              maxLength={12}
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 5. PAN */}
            <CommonInput
              label="PAN"
              value={pan}
              onChangeText={setPan}
              placeholder="PAN"
              autoCapitalize="characters"
              maxLength={10}
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 6. Insurance details */}
            <CommonInput
              label="Insurance details"
              value={insuranceDetails}
              onChangeText={setInsuranceDetails}
              placeholder="Insurance details"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
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

export default CompleteProfileStep2Screen;

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
  progressFill40: {
    width: '40%',
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
    marginTop: 4,
  },
  buttonSection: {
    width: '100%',
    marginTop: 28,
    marginBottom: 10,
  },
});

