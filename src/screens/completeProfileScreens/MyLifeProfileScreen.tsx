import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../../units/Colors';
import { useAppSelector } from '../../redux';
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
}

const DEFAULT_SECTIONS: LifeProfileSectionConfig[] = [
  {
    id: 'personal',
    title: 'Personal information &\nEducation / Career',
    subtitle: 'Complete · Working',
    icon: <Feather name="user" size={19} color="#38BDF8" />,
    iconBgColor: 'rgba(56, 189, 248, 0.1)',
    iconBorderColor: 'rgba(56, 189, 248, 0.3)',
    badgeText: 'Done',
    badgeType: 'done',
  },
  {
    id: 'documents',
    title: 'Important documents',
    subtitle: '5 added · US visa expires Mar 2027',
    icon: <Ionicons name="card-outline" size={19} color="#F43F5E" />,
    iconBgColor: 'rgba(244, 63, 94, 0.1)',
    iconBorderColor: 'rgba(244, 63, 94, 0.3)',
    badgeText: '1 soon',
    badgeType: 'soon',
  },
  {
    id: 'health',
    title: 'Health profile',
    subtitle: 'Doctor, allergies, checkups',
    icon: <Feather name="activity" size={19} color="#A855F7" />,
    iconBgColor: 'rgba(168, 85, 247, 0.1)',
    iconBorderColor: 'rgba(168, 85, 247, 0.3)',
    badgeText: 'Done',
    badgeType: 'done',
  },
  {
    id: 'vaccination',
    title: 'Vaccination',
    subtitle: 'Flu shot due 15 Nov',
    icon: <Ionicons name="eyedrop-outline" size={19} color="#14B8A6" />,
    iconBgColor: 'rgba(20, 184, 166, 0.1)',
    iconBorderColor: 'rgba(20, 184, 166, 0.3)',
    badgeText: '1 due',
    badgeType: 'due',
  },
  {
    id: 'interests',
    title: 'Interests and activities',
    subtitle: 'Not started',
    icon: <Feather name="star" size={19} color="#F59E0B" />,
    iconBgColor: 'rgba(245, 158, 11, 0.1)',
    iconBorderColor: 'rgba(245, 158, 11, 0.3)',
    badgeText: null,
    badgeType: 'none',
  },
];

const MyLifeProfileScreen: React.FC<MyLifeProfileScreenProps> = ({
  name,
  role,
  age = '38 years',
  occupation = 'Working',
  avatarUrl,
  avatarColor,
  completionPercentage = 70,
  completedSectionsCount = 3,
  totalSectionsCount = 5,
  nextStepHint = 'Add your interests next',
  onBack,
  onEdit,
  onSectionPress,
}) => {
  const insets = useSafeAreaInsets();
  let navigation: any = null;
  try {
    navigation = useNavigation();
  } catch {
    navigation = null;
  }

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
          navigation.navigate('Profile', { screen: targetStep });
        } catch {
          try {
            navigation.navigate(targetStep);
          } catch {
            // ignore
          }
        }
      }
    }
  };

  const authUser = useAppSelector((state) => state.auth.user);
  const baseProfile = useAppSelector((state) => state.baseProfile);

  const displayName =
    name ||
    baseProfile?.fullName ||
    authUser?.name ||
    authUser?.fullName ||
    'Priya Sharma';

  const displayRole =
    role ||
    baseProfile?.familyRole ||
    authUser?.familyRole ||
    authUser?.role ||
    'Mother';

  const displayAvatarUrl =
    avatarUrl !== undefined
      ? avatarUrl
      : baseProfile?.avatarUrl || authUser?.avatarUrl || null;

  const displayAvatarColor =
    avatarColor ||
    baseProfile?.avatarColor ||
    authUser?.avatarColor ||
    '#6E4327';

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
          role={displayRole}
          age={age}
          occupation={occupation}
          avatarUrl={displayAvatarUrl}
          avatarColor={displayAvatarColor}
        />

        {/* Progress Card */}
        <LifeProfileProgressCard
          completionPercentage={completionPercentage}
          completedSectionsCount={completedSectionsCount}
          totalSectionsCount={totalSectionsCount}
          nextStepHint={nextStepHint}
        />

        {/* 5-Section Group Card */}
        <View style={styles.sectionsGroupCard}>
          {DEFAULT_SECTIONS.map((section, index) => (
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
              showDivider={index < DEFAULT_SECTIONS.length - 1}
            />
          ))}
        </View>

        {/* Privacy Notice Card */}
        <LifeProfilePrivacyCard />
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
});

