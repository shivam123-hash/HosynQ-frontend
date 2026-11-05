import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { LifeProfileSectionCard } from '../components';

export interface LifeProfileIntroScreenProps {
  completedSections?: number;
  totalSections?: number;
  onStartPersonalInformation?: () => void;
  onDoThisLater?: () => void;
  onSectionPress?: (sectionId: string) => void;
}

const SECTIONS = [
  {
    id: 'personal',
    title: 'Personal information',
    subtitle: 'Name, birthday, blood group',
    iconName: 'user',
    iconColor: '#93C5FD',
  },
  {
    id: 'education',
    title: 'Education and career',
    subtitle: 'School, college or work',
    iconName: 'briefcase',
    iconColor: '#FDE047',
  },
  {
    id: 'documents',
    title: 'Important documents',
    subtitle: 'Passport, licence, insurance expiry',
    iconName: 'file-text',
    iconColor: '#F472B6',
  },
  {
    id: 'health',
    title: 'Health profile',
    subtitle: 'Doctor, allergies, medicines',
    iconName: 'heart',
    iconColor: '#FB7185',
  },
  {
    id: 'vaccination',
    title: 'Vaccination',
    subtitle: 'Doses and next due dates',
    iconName: 'shield',
    iconColor: '#34D399',
  },
  {
    id: 'interests',
    title: 'Interests',
    subtitle: 'Sports, music, hobbies',
    iconName: 'star',
    iconColor: '#FBBF24',
  },
];

const LifeProfileIntroScreen: React.FC<LifeProfileIntroScreenProps> = ({
  completedSections = 0,
  totalSections = 6,
  onStartPersonalInformation,
  onDoThisLater,
  onSectionPress,
}) => {
  const insets = useSafeAreaInsets();
  const progressPercent = Math.round((completedSections / totalSections) * 100);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          {/* Title & Subtitle */}
          <Text style={styles.title}>Complete your Life Profile</Text>
          <Text style={styles.subtitle}>
            Complete your profile to unlock personalised reminders and family
            insights.
          </Text>

          {/* Progress Bar & Counter */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressCountText}>
                {completedSections} of {totalSections} sections done
              </Text>
              <Text style={styles.progressPercentText}>{progressPercent}%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(progressPercent, 0)}%` },
                ]}
              />
            </View>
          </View>

          {/* 6 Sections List */}
          <View style={styles.sectionsList}>
            {SECTIONS.map((sec) => (
              <LifeProfileSectionCard
                key={sec.id}
                title={sec.title}
                subtitle={sec.subtitle}
                onPress={() => onSectionPress?.(sec.id)}
                icon={
                  <Feather
                    name={sec.iconName as any}
                    size={18}
                    color={sec.iconColor}
                  />
                }
              />
            ))}
          </View>

          {/* Helper Note */}
          <Text style={styles.helperNote}>
            No rush. We'll remind you over the next 3–4 weeks. Health, Aadhaar
            and PAN details are optional.
          </Text>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <CommonBtn
            title="Start with personal information"
            onPress={onStartPersonalInformation}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onDoThisLater}
            style={styles.laterButton}
          >
            <Text style={styles.laterText}>Do this later</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LifeProfileIntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: RFValue(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: RFValue(19),
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 18,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCountText: {
    color: Colors.textSecondary,
    fontSize: RFValue(12),
    fontWeight: '500',
  },
  progressPercentText: {
    color: Colors.textSecondary,
    fontSize: RFValue(12),
    fontWeight: '500',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#1E324A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  sectionsList: {
    width: '100%',
    marginTop: 4,
  },
  helperNote: {
    color: Colors.textSecondary,
    fontSize: RFValue(11.5),
    textAlign: 'center',
    lineHeight: RFValue(16.5),
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  bottomSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  laterButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  laterText: {
    color: Colors.textSecondary,
    fontSize: RFValue(14),
    fontWeight: '600',
    textAlign: 'center',
  },
});

