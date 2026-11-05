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
import CommonBtn from '../../components/CommonBtn';
import CommonInput from '../../components/CommonInput';
import CommonDropdown from '../../components/CommonDropdown';
import KeyboardAvoidingWrapper from '../../components/KeyboardAvoidingWrapper';
import { ChooseAvatarBottomSheet, AvatarSelection, AVATAR_COLORS } from './components';

export interface BasicProfileData {
  fullName: string;
  gender: string;
  familyRole: string;
  avatar: AvatarSelection | null;
  familyType?: string;
  familyMembers?: string;
}

export interface BasicProfileScreenProps {
  initialData?: Partial<BasicProfileData>;
  onBack?: () => void;
  onContinue?: (data: BasicProfileData) => void;
}

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const FAMILY_ROLE_OPTIONS = [
  'Head of Family',
  'Parent',
  'Child',
  'Spouse',
  'Sibling',
  'Grandparent',
  'Other',
];

const BasicProfileScreen: React.FC<BasicProfileScreenProps> = ({
  initialData,
  onBack,
  onContinue,
}) => {
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState(initialData?.fullName || 'Rupesh Sharma');
  const [gender, setGender] = useState(initialData?.gender || '');
  const [familyRole, setFamilyRole] = useState(initialData?.familyRole || '');

  // Default avatar initial setup
  const [avatar, setAvatar] = useState<AvatarSelection | null>(
    initialData?.avatar || {
      type: 'color',
      color: AVATAR_COLORS[0],
      initial: 'R',
    }
  );

  const [isAvatarSheetVisible, setIsAvatarSheetVisible] = useState(false);

  // Sync avatar initial if user hasn't chosen an image
  const displayInitial = fullName.trim().length > 0
    ? fullName.trim().charAt(0).toUpperCase()
    : 'U';

  const handleContinue = () => {
    onContinue?.({
      fullName,
      gender,
      familyRole,
      avatar,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header Row */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.stepIndicatorText}>Step 1 of 4</Text>
      </View>

      {/* Progress Bar with 25% Label */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, styles.progressFill25]} />
        </View>
        <Text style={styles.progressText}>25%</Text>
      </View>

      <KeyboardAvoidingWrapper
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topContent}>
          {/* Title and Subtitle */}
          <View style={styles.headingSection}>
            <Text style={styles.title}>Tell us about you</Text>
            <Text style={styles.subtitle}>
              Your family sees this on their screens.
            </Text>
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAvatarSheetVisible(true)}
              style={styles.avatarTouchable}
            >
              {avatar?.type === 'image' ? (
                <Image source={{ uri: avatar.uri }} style={styles.avatarImage} />
              ) : (
                <View
                  style={[
                    styles.avatarColorCircle,
                    { backgroundColor: avatar?.color || AVATAR_COLORS[0] },
                  ]}
                >
                  <Text style={styles.avatarInitialText}>
                    {avatar?.initial || displayInitial}
                  </Text>
                </View>
              )}

              {/* Plus (+) Badge Overlay */}
              <View style={styles.plusBadge}>
                <Feather name="plus" size={13} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Change Avatar Link */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsAvatarSheetVisible(true)}
              style={styles.changeAvatarButton}
            >
              <Text style={styles.changeAvatarText}>Change avatar</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Form Fields */}
          <View style={styles.formSection}>
            {/* 1. Full Name Input with Floating Label */}
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

            {/* 2. Gender Dropdown */}
            <CommonDropdown
              label="Gender"
              value={gender}
              options={GENDER_OPTIONS}
              onSelect={setGender}
            />

            {/* 3. Your role in the family Dropdown */}
            <CommonDropdown
              label="Your role in the family"
              value={familyRole}
              options={FAMILY_ROLE_OPTIONS}
              onSelect={setFamilyRole}
            />
          </View>
        </View>

        {/* Continue Button pinned to bottom */}
        <View style={styles.buttonSection}>
          <CommonBtn
            title="Continue"
            onPress={handleContinue}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />
        </View>
      </KeyboardAvoidingWrapper>

      {/* Choose Avatar BottomSheet Component */}
      <ChooseAvatarBottomSheet
        visible={isAvatarSheetVisible}
        fullName={fullName}
        currentAvatar={avatar}
        onClose={() => setIsAvatarSheetVisible(false)}
        onSaveAvatar={(newAvatar) => {
          setAvatar(newAvatar);
        }}
      />
    </View>
  );
};

export default BasicProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorText: {
    color: Colors.textSecondary,
    fontSize: RFValue(12.5),
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 6,
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
  progressFill25: {
    width: '25%',
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
  headingSection: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
  },
  title: {
    fontSize: RFValue(21),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarTouchable: {
    width: 88,
    height: 88,
    borderRadius: 44,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarColorCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialText: {
    color: '#FFFFFF',
    fontSize: RFValue(30),
    fontWeight: '700',
  },
  plusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  changeAvatarButton: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeAvatarText: {
    color: Colors.primary,
    fontSize: RFValue(12.5),
    fontWeight: '600',
  },
  formSection: {
    width: '100%',
  },
  buttonSection: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 32,
    marginBottom: 34,
  },
});
