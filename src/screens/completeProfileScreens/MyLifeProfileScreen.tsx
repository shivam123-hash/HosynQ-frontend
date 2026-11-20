import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import {
  useAppDispatch,
  useAppSelector,
  fetchLifeProfileFullThunk,
  fetchLifeProfileSummaryThunk,
  loadCachedLifeProfileThunk,
  logout,
  resetFamilyState,
  resetLifeProfileState,
} from '../../redux';
import { getMyMemberId, clearUserData } from '../../units/asyncStorageManager';
import {
  LifeProfileHeader,
  LifeProfileUserCard,
  LifeProfileProgressCard,
  LifeProfileSectionItem,
  LifeProfilePrivacyCard,
  SectionBadgeType,
} from './components';

export interface LifeProfileSectionConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconBorderColor: string;
  badgeText?: string | null;
  badgeType?: SectionBadgeType;
}

export interface MyLifeProfileScreenProps {
  memberId?: string;
  name?: string;
  role?: string;
  age?: string;
  occupation?: string;
  avatarUrl?: string | null;
  avatarColor?: string;
  completionPercentage?: number;
  completedSectionsCount?: number;
  totalSectionsCount?: number;
  nextStepHint?: string;
  onBack?: () => void;
  onEdit?: () => void;
  onSectionPress?: (sectionId: string) => void;
  onGoToDashboard?: () => void;
}

const DEFAULT_SECTIONS: LifeProfileSectionConfig[] = [
  {
    id: 'personal',
    title: 'Personal information\n& Education / Career',
    subtitle: 'Name, birthday, contact, education or work',
    icon: <Feather name="user" size={18} color="#38BDF8" />,
    iconBgColor: 'rgba(56, 189, 248, 0.1)',
    iconBorderColor: 'rgba(56, 189, 248, 0.3)',
    badgeText: 'Pending',
    badgeType: 'pending',
  },
  {
    id: 'documents',
    title: 'Important documents',
    subtitle: 'Passport, driving licence, insurance expiry',
    icon: <Ionicons name="card-outline" size={18} color="#F43F5E" />,
    iconBgColor: 'rgba(244, 63, 94, 0.1)',
    iconBorderColor: 'rgba(244, 63, 94, 0.3)',
    badgeText: null,
    badgeType: 'none',
  },
  {
    id: 'health',
    title: 'Health profile',
    subtitle: 'Doctor, allergies, checkups',
    icon: <Feather name="activity" size={18} color="#A855F7" />,
    iconBgColor: 'rgba(168, 85, 247, 0.1)',
    iconBorderColor: 'rgba(168, 85, 247, 0.3)',
    badgeText: null,
    badgeType: 'none',
  },
  {
    id: 'vaccination',
    title: 'Vaccination',
    subtitle: 'Flu shot, vaccine records & child growth',
    icon: <Ionicons name="eyedrop-outline" size={18} color="#14B8A6" />,
    iconBgColor: 'rgba(20, 184, 166, 0.1)',
    iconBorderColor: 'rgba(20, 184, 166, 0.3)',
    badgeText: null,
    badgeType: 'none',
  },
  {
    id: 'interests',
    title: 'Interests and activities',
    subtitle: 'Not started',
    icon: <Feather name="star" size={18} color="#F59E0B" />,
    iconBgColor: 'rgba(245, 158, 11, 0.1)',
    iconBorderColor: 'rgba(245, 158, 11, 0.3)',
    badgeText: null,
    badgeType: 'none',
  },
];

const MyLifeProfileScreen: React.FC<MyLifeProfileScreenProps> = ({
  memberId,
  name,
  role,
  age,
  occupation,
  avatarUrl,
  avatarColor,
  completionPercentage,
  completedSectionsCount,
  totalSectionsCount,
  nextStepHint,
  onBack,
  onEdit,
  onSectionPress,
  onGoToDashboard,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  let navigation: any = null;
  try {
    navigation = useNavigation();
  } catch {
    navigation = null;
  }

  const authUser = useAppSelector((state) => (state as any).auth?.user || (state as any).emailAuth?.user);
  const familyState = useAppSelector((state) => (state as any).family);
  const baseProfile = useAppSelector((state) => state.baseProfile);
  const lifeProfileFull = useAppSelector((state) => state.lifeProfile?.full);
  const lifeProfileSummary = useAppSelector((state) => state.lifeProfile?.summary);

  // Hydrate cached life profile from local storage immediately if Redux full is empty
  useEffect(() => {
    if (!lifeProfileFull) {
      dispatch(loadCachedLifeProfileThunk());
    }
  }, [dispatch, lifeProfileFull]);

  // API Call Structure: GET {{BaseURL}}/api/v1/family/members/{{memberId}}/life-profile?view=full
  // Runs on initial mount AND every time screen comes back into focus
  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      try {
        // Fetch saved myMemberId from AsyncStorage
        const storedMemberId = await getMyMemberId();
        console.log('[MyLifeProfile] AsyncStorage stored memberId:', storedMemberId);

        const targetMemberId =
          storedMemberId ||
          memberId ||
          lifeProfileFull?.member?.memberId ||
          lifeProfileFull?.data?.member?.memberId ||
          (authUser as any)?.lifeProfile?.memberId ||
          familyState?.myMemberId ||
          familyState?.family?.myMemberId ||
          authUser?.memberId ||
          authUser?.myMemberId;

        console.log('[MyLifeProfile] Resolved Member ID for API:', targetMemberId);

        if (targetMemberId) {
          console.log(`[MyLifeProfile] Requesting GET api/v1/family/members/${targetMemberId}/life-profile?view=full`);
          const resultAction = await dispatch(
            fetchLifeProfileFullThunk({ memberId: targetMemberId })
          ).unwrap();

          if (isMounted) {
            console.log('====================================');
            console.log(`[MyLifeProfile] API SUCCESS: api/v1/family/members/${targetMemberId}/life-profile?view=full`);
            console.log('[MyLifeProfile] Response Data:', JSON.stringify(resultAction, null, 2));
            console.log('====================================');
          }
        } else {
          console.warn('[MyLifeProfile] No memberId available to fetch life profile.');
        }
      } catch (err) {
        console.log('[MyLifeProfile] API Error fetching full life profile:', err);
      }
    };

    loadProfileData();

    // Subscribe to navigation focus event if inside NavigationContainer
    const unsubscribe = navigation?.addListener
      ? navigation.addListener('focus', loadProfileData)
      : undefined;

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [
    navigation,
    dispatch,
    memberId,
    familyState?.myMemberId,
    authUser?.memberId,
    (authUser as any)?.lifeProfile?.memberId,
    lifeProfileFull?.member?.memberId,
  ]);

  // Data mapping from API response (view=full or view=summary or authUser.lifeProfile)
  const fullProfileData = lifeProfileFull?.data || lifeProfileFull || lifeProfileSummary?.data || lifeProfileSummary;
  const memberObj = lifeProfileFull?.member || (authUser as any)?.lifeProfile;
  const personalData = lifeProfileFull?.data?.personal;
  const progressObj = lifeProfileFull?.progress || (authUser as any)?.lifeProfile;
  const stepsMap = progressObj?.steps || {};

  // 1. Dynamic User Card Info
  const displayName =
    memberObj?.fullName ||
    name ||
    baseProfile?.fullName ||
    authUser?.name ||
    authUser?.fullName ||
    'Rupesh Sharma';

  const resolveAvatarColor = (color?: string | null): string => {
    if (!color) return '#0D9488';
    const colorMap: Record<string, string> = {
      teal: '#0D9488',
      orange: '#F0913A',
      blue: '#2563EB',
      green: '#059669',
      purple: '#7C3AED',
      red: '#DC2626',
      pink: '#DB2777',
      amber: '#D97706',
      brown: '#6E4327',
    };
    return colorMap[color.toLowerCase()] || color;
  };

  const displayAvatarColor = resolveAvatarColor(
    memberObj?.avatarColor || avatarColor || baseProfile?.avatarColor || authUser?.avatarColor
  );

  const displayAvatarUrl =
    memberObj?.avatarUrl !== undefined
      ? memberObj?.avatarUrl
      : (avatarUrl !== undefined ? avatarUrl : baseProfile?.avatarUrl || authUser?.avatarUrl || null);

  // Dynamic Tagline: (familyRole, age, occupation from actual API data without hardcoded values)
  const displayFamilyRole =
    personalData?.familyRole ||
    (memberObj?.role === 'FAMILY_OWNER' ? 'Father' : memberObj?.role) ||
    role ||
    baseProfile?.familyRole ||
    authUser?.familyRole ||
    '';

  const displayOccupation =
    personalData?.occupationStatus ||
    occupation ||
    '';

  let calculatedAgeString: string | undefined = undefined;
  if (personalData?.birthDate) {
    try {
      const birth = new Date(personalData.birthDate);
      if (!isNaN(birth.getTime())) {
        const diff = Date.now() - birth.getTime();
        const ageYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        if (ageYears > 0) {
          calculatedAgeString = `${ageYears} years`;
        }
      }
    } catch {
      // ignore
    }
  }

  const dynamicTagline =
    [displayFamilyRole, calculatedAgeString, displayOccupation]
      .filter(Boolean)
      .join(' · ') || displayFamilyRole || 'Father';

  // 2. Dynamic Progress Bar & Next Step Hint
  const dynamicCompletionPercentage =
    progressObj?.completionPercentage ?? fullProfileData?.completionPercentage ?? completionPercentage ?? 0;

  const dynamicCompletedSectionsCount =
    progressObj?.completedStepsCount ?? fullProfileData?.completedSectionsCount ?? completedSectionsCount ?? 0;

  const dynamicTotalSections =
    progressObj?.totalSteps ?? fullProfileData?.totalSectionsCount ?? totalSectionsCount ?? 5;

  const formatNextStepHint = (stepKey?: string | null): string => {
    if (!stepKey) return 'Add your personal information next';
    const stepNameMap: Record<string, string> = {
      personal: 'personal information',
      documents: 'important documents',
      health: 'health profile',
      vaccination: 'vaccination details',
      interests: 'interests and activities',
    };
    const stepName = stepNameMap[stepKey] || stepKey;
    return `Add your ${stepName} next`;
  };

  const dynamicNextStepHint =
    formatNextStepHint(progressObj?.nextRecommendedStep) || nextStepHint;

  // 3. Dynamic Section Badges & Subtitles from progress.steps
  const getSectionBadge = (
    stepData?: {
      isComplete?: boolean;
      filledFields?: number;
      totalFields?: number;
    }
  ): { text: string | null; type: SectionBadgeType } => {
    if (!stepData) {
      return { text: null, type: 'none' };
    }

    const filled = stepData.filledFields ?? 0;
    const total = stepData.totalFields ?? 0;
    const isComplete = stepData.isComplete ?? (total > 0 && filled === total);

    // Rule 1: Done if complete or 100% filled
    if (isComplete || (total > 0 && filled === total)) {
      return { text: 'Done', type: 'done' };
    }

    // Rule 2: If no fields filled yet
    if (total === 0 || filled === 0) {
      return { text: 'Pending', type: 'pending' };
    }

    const half = total / 2;

    // Rule 3: If filled >= half -> X due
    if (filled >= half) {
      const remaining = total - filled;
      return {
        text: `${remaining} due`,
        type: 'due',
      };
    }

    // Rule 4: If filled < half -> Pending
    return {
      text: 'Pending',
      type: 'pending',
    };
  };

  const dynamicSections: LifeProfileSectionConfig[] = DEFAULT_SECTIONS.map((sec) => {
    const stepData = stepsMap[sec.id];
    if (!stepData) {
      return sec;
    }

    const badge = getSectionBadge(stepData);

    let dynamicSubtitle = sec.subtitle;
    const filled = stepData.filledFields ?? 0;
    const total = stepData.totalFields ?? 0;

    if (stepData.isComplete || (total > 0 && filled === total)) {
      if (sec.id === 'personal') {
        dynamicSubtitle = personalData?.occupationStatus
          ? `Complete · ${personalData.occupationStatus}`
          : 'Complete';
      } else {
        dynamicSubtitle = 'Complete';
      }
    } else if (filled > 0) {
      dynamicSubtitle = `${filled} out of ${total} fields filled`;
    } else {
      dynamicSubtitle = 'Not started';
    }

    return {
      ...sec,
      subtitle: dynamicSubtitle,
      badgeText: badge.text,
      badgeType: badge.type,
    };
  });

  const currentMemberId =
    memberId ||
    lifeProfileFull?.member?.memberId ||
    lifeProfileFull?.data?.member?.memberId ||
    (authUser as any)?.lifeProfile?.memberId ||
    familyState?.myMemberId ||
    familyState?.family?.myMemberId ||
    authUser?.memberId ||
    authUser?.myMemberId;

  const handleSectionPress = (sectionId: string) => {
    if (onSectionPress) {
      onSectionPress(sectionId);
      return;
    }
    if (navigation) {
      const stepMap: Record<string, string> = {
        personal: 'Step1',
        documents: 'Step2',
        health: 'Step3',
        vaccination: 'Step4',
        interests: 'Step5',
      };
      const targetStep = stepMap[sectionId];
      if (targetStep) {
        try {
          navigation.navigate('Profile', {
            screen: targetStep,
            params: { memberId: currentMemberId },
          });
        } catch {
          try {
            navigation.navigate(targetStep, { memberId: currentMemberId });
          } catch {
            // ignore
          }
        }
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[MyLifeProfile] Logging out user...');
              await dispatch(logout());
              dispatch(resetFamilyState());
              dispatch(resetLifeProfileState());
              await clearUserData();
              if (navigation) {
                try {
                  const rootNav = navigation.getParent() || navigation;
                  rootNav.reset({
                    index: 0,
                    routes: [{ name: 'Auth', params: { screen: 'Onboarding' } }],
                  });
                } catch {
                  navigation.navigate('Auth', { screen: 'Onboarding' });
                }
              }
            } catch (err) {
              console.log('[MyLifeProfile] Logout error:', err);
            }
          },
        },
      ]
    );
  };

  const handleGoToDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
    } else if (navigation) {
      try {
        navigation.navigate('Home');
      } catch {
        navigation.getParent?.()?.navigate('Home');
      }
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <LifeProfileHeader
        title="My Life Profile"
        onBack={onBack}
        onEdit={onEdit}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card: Avatar, Name & Tagline */}
        <LifeProfileUserCard
          name={displayName}
          tagline={dynamicTagline}
          avatarUrl={displayAvatarUrl}
          avatarColor={displayAvatarColor}
        />

        {/* Progress Card */}
        <LifeProfileProgressCard
          completionPercentage={dynamicCompletionPercentage}
          completedSectionsCount={dynamicCompletedSectionsCount}
          totalSectionsCount={dynamicTotalSections}
          nextStepHint={dynamicNextStepHint}
        />

        {/* 5-Section Group Card */}
        <View style={styles.sectionsGroupCard}>
          {dynamicSections.map((section, index) => (
            <LifeProfileSectionItem
              key={section.id}
              id={section.id}
              title={section.title}
              subtitle={section.subtitle}
              icon={section.icon}
              iconBgColor={section.iconBgColor}
              iconBorderColor={section.iconBorderColor}
              badgeText={section.badgeText}
              badgeType={section.badgeType}
              onPress={() => handleSectionPress(section.id)}
              showDivider={index < dynamicSections.length - 1}
            />
          ))}
        </View>

        {/* Privacy Notice Card */}
        <LifeProfilePrivacyCard />

        {/* Continue to Dashboard Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.dashboardButton}
          onPress={handleGoToDashboard}
        >
          <Text style={styles.dashboardButtonText}>Continue to Dashboard</Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={17} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MyLifeProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  sectionsGroupCard: {
    backgroundColor: '#0F2238',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 18,
    overflow: 'hidden',
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0913A',
    borderRadius: 16,
    height: 52,
    marginHorizontal: 20,
    marginTop: 20,
    gap: 8,
    shadowColor: '#F0913A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 16,
    height: 50,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    gap: 8,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
});

