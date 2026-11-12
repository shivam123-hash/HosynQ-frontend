import React, { useState, useEffect } from 'react';
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
import {
  ChooseAvatarBottomSheet,
  AvatarSelection,
  AVATAR_COLOR_OPTIONS,
  AVATAR_COLORS,
} from './components';
import { useAppDispatch, useAppSelector } from '../../redux';
import {
  uploadAvatar,
  updateBasicProfile,
  clearProfileError,
  clearAvatarError,
} from '../../redux/features/baseProfileSet/baseProfileSlice';

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
  'Father',
  'Mother',
  'Son',
  'Daughter',
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
  const dispatch = useAppDispatch();
  const {
    profileLoading,
    profileError,
    avatarLoading,
    avatarError,
    user,
  } = useAppSelector((state) => state.baseProfile);

  const [fullName, setFullName] = useState(
    initialData?.fullName || user?.fullName || 'Rupesh Sharma'
  );
  const [gender, setGender] = useState(
    initialData?.gender || user?.gender || 'Male'
  );
  const [familyRole, setFamilyRole] = useState(
    initialData?.familyRole || user?.familyRole || 'Father'
  );
  const [localError, setLocalError] = useState<string | null>(null);

  // Initial avatar setup
  const [avatar, setAvatar] = useState<AvatarSelection | null>(() => {
    if (initialData?.avatar) return initialData.avatar;
    if (user?.avatarUrl) {
      return { type: 'image', uri: user.avatarUrl };
    }
    const colorKey = user?.avatarColor || 'amber';
    const opt =
      AVATAR_COLOR_OPTIONS.find((c) => c.key === colorKey) ||
      AVATAR_COLOR_OPTIONS[0];
    return {
      type: 'color',
      color: opt.hex,
      colorKey: opt.key,
      initial: 'R',
    };
  });

  const [isAvatarSheetVisible, setIsAvatarSheetVisible] = useState(false);

  useEffect(() => {
    dispatch(clearProfileError());
    dispatch(clearAvatarError());
  }, [dispatch]);

  // Sync avatar initial if user hasn't chosen an image
  const displayInitial =
    fullName.trim().length > 0
      ? fullName.trim().charAt(0).toUpperCase()
      : 'R';

  // Handle Save Avatar from BottomSheet
  const handleSaveAvatar = async (newAvatar: AvatarSelection) => {
    try {
      const formData = new FormData();
      if (newAvatar.type === 'image') {
        formData.append('file', {
          uri: newAvatar.uri,
          type: newAvatar.mime || 'image/jpeg',
          name: newAvatar.fileName || 'avatar.jpg',
        } as any);
      } else {
        formData.append('avatarColor', newAvatar.colorKey || 'amber');
      }

      console.log('[BasicProfileScreen] Saving avatar:', newAvatar);
      const res = await dispatch(uploadAvatar(formData)).unwrap();
      console.log('[BasicProfileScreen] Avatar uploaded successfully:', res);

      setAvatar(newAvatar);
      setIsAvatarSheetVisible(false);
    } catch (err: any) {
      console.log('[BasicProfileScreen] Error uploading avatar:', err);
    }
  };

  // Handle Profile Details submission
  const handleContinue = async () => {
    if (!fullName.trim()) {
      setLocalError('Please enter your full name');
      return;
    }

    setLocalError(null);
    try {
      console.log('[BasicProfileScreen] Updating basic profile details...');
      const res = await dispatch(
        updateBasicProfile({
          fullName: fullName.trim(),
          gender: gender || 'Male',
          familyRole: familyRole || 'Father',
        })
      ).unwrap();

      console.log('[BasicProfileScreen] Profile updated successfully:', res);

      onContinue?.({
        fullName: fullName.trim(),
        gender: gender || 'Male',
        familyRole: familyRole || 'Father',
        avatar,
      });
    } catch (err: any) {
      console.log('[BasicProfileScreen] Error updating profile:', err);
    }
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
            {/* 1. Full Name Input */}
            <CommonInput
              label="Full Name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setLocalError(null);
                if (profileError) {
                  dispatch(clearProfileError());
                }
              }}
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
          {localError || profileError || avatarError ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={14} color="#EF4444" style={styles.errorIcon} />
              <Text style={styles.errorText}>
                {localError || profileError || avatarError}
              </Text>
            </View>
          ) : null}

          <CommonBtn
            title="Continue"
            onPress={handleContinue}
            loading={profileLoading}
            disabled={profileLoading || !fullName.trim()}
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
        loading={avatarLoading}
        onClose={() => setIsAvatarSheetVisible(false)}
        onSaveAvatar={handleSaveAvatar}
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 12,
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
    fontSize: RFValue(11.5),
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  topContent: {
    width: '100%',
  },
  headingSection: {
    marginTop: 18,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: RFValue(13),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarTouchable: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarColorCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarInitialText: {
    color: '#FFFFFF',
    fontSize: RFValue(34),
    fontWeight: '700',
  },
  plusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  changeAvatarButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeAvatarText: {
    color: Colors.primary,
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  formSection: {
    width: '100%',
    gap: 16,
  },
  buttonSection: {
    width: '100%',
    paddingTop: 24,
    marginTop: 'auto',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: RFValue(12),
    fontWeight: '500',
    textAlign: 'center',
  },
});
