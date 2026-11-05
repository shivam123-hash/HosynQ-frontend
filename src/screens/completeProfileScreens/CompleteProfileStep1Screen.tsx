import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import ImagePath from '../../units/ImagePath';
import CommonBtn from '../../components/CommonBtn';
import CommonInput from '../../components/CommonInput';
import CommonDropdown from '../../components/CommonDropdown';
import KeyboardAvoidingWrapper from '../../components/KeyboardAvoidingWrapper';
import { AvatarSelectorRow, PRESET_AVATARS } from './components';

export interface Step1FormData {
  selectedAvatar: string;
  fullName: string;
  nickname: string;
  email: string;
  familyRole: string;
  gender: string;
  birthDate: string;
  bloodGroup: string;
  height: string;
  weight: string;
  status: string;
  schoolLocation: string;
}

export interface CompleteProfileStep1ScreenProps {
  initialData?: Partial<Step1FormData>;
  onBack?: () => void;
  onContinue?: (data: Step1FormData) => void;
}

const FAMILY_ROLE_OPTIONS = [
  'Head of Family',
  'Parent',
  'Child',
  'Spouse',
  'Sibling',
  'Grandparent',
  'Other',
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const STATUS_OPTIONS = [
  'Student',
  'Employed',
  'Self-employed',
  'Homemaker',
  'Retired',
  'Other',
];

const CompleteProfileStep1Screen: React.FC<CompleteProfileStep1ScreenProps> = ({
  initialData,
  onBack,
  onContinue,
}) => {
  const insets = useSafeAreaInsets();

  const [selectedAvatar, setSelectedAvatar] = useState(
    initialData?.selectedAvatar || PRESET_AVATARS[0]
  );
  const [fullName, setFullName] = useState(initialData?.fullName || 'Rupesh Sharma');
  const [nickname, setNickname] = useState(initialData?.nickname || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [familyRole, setFamilyRole] = useState(initialData?.familyRole || '');
  const [gender, setGender] = useState(initialData?.gender || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [bloodGroup, setBloodGroup] = useState(initialData?.bloodGroup || '');
  const [height, setHeight] = useState(initialData?.height || '');
  const [weight, setWeight] = useState(initialData?.weight || '');
  const [status, setStatus] = useState(initialData?.status || '');
  const [schoolLocation, setSchoolLocation] = useState(initialData?.schoolLocation || '');

  const handleContinue = () => {
    onContinue?.({
      selectedAvatar,
      fullName,
      nickname,
      email,
      familyRole,
      gender,
      birthDate,
      bloodGroup,
      height,
      weight,
      status,
      schoolLocation,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Optional Top Back Button if provided */}
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
        <Text style={styles.subtitle}>Personal information & Education / Career</Text>
      </View>

      {/* Progress Bar (20%) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, styles.progressFill20]} />
        </View>
        <Text style={styles.progressText}>20%</Text>
      </View>

      <KeyboardAvoidingWrapper
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topContent}>
          {/* Main Avatar with Plus Badge */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={ImagePath.cuateSecand} style={styles.avatarImage} />
              <View style={styles.plusBadge}>
                <Feather name="plus" size={13} color="#FFFFFF" />
              </View>
            </View>
          </View>

          {/* Preset Avatar Selection Row */}
          <AvatarSelectorRow
            selectedAvatar={selectedAvatar}
            onSelectAvatar={setSelectedAvatar}
          />

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* 1. Full Name */}
            <CommonInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 2. Nickname */}
            <CommonInput
              label="Nickname"
              value={nickname}
              onChangeText={setNickname}
              placeholder="Nickname"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 3. Email Address */}
            <CommonInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 4. Family Role */}
            <CommonDropdown
              label="Family Role"
              value={familyRole}
              options={FAMILY_ROLE_OPTIONS}
              onSelect={setFamilyRole}
            />

            {/* 5. Gender */}
            <CommonDropdown
              label="Gender"
              value={gender}
              options={GENDER_OPTIONS}
              onSelect={setGender}
            />

            {/* 6. Birth date */}
            <CommonInput
              label="Birth date"
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="Birth date"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 7. Blood group */}
            <CommonDropdown
              label="Blood group"
              value={bloodGroup}
              options={BLOOD_GROUP_OPTIONS}
              onSelect={setBloodGroup}
            />

            {/* 8. Height */}
            <CommonInput
              label="Height"
              value={height}
              onChangeText={setHeight}
              placeholder="Height"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 9. Weight */}
            <CommonInput
              label="Weight"
              value={weight}
              onChangeText={setWeight}
              placeholder="Weight"
              activeBackgroundColor={Colors.cardBackground}
              inactiveBackgroundColor="transparent"
              activeBorderColor={Colors.primary}
              inactiveBorderColor={Colors.border}
              focusBorderColor={Colors.primary}
              textColor={Colors.text}
              placeholderTextColor={Colors.textSecondary}
            />

            {/* 10. Status */}
            <CommonDropdown
              label="Status"
              value={status}
              options={STATUS_OPTIONS}
              onSelect={setStatus}
            />

            {/* 11. School's Location */}
            <CommonInput
              label="School's Location"
              value={schoolLocation}
              onChangeText={setSchoolLocation}
              placeholder="School's Location"
              rightIcon="location-outline"
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

export default CompleteProfileStep1Screen;

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
  progressFill20: {
    width: '20%',
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
  avatarSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 6,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  plusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
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

