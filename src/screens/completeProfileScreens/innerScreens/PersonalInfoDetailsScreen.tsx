import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { useAppDispatch, useAppSelector, fetchLifeProfileSectionThunk } from '../../../redux';
import { PersonalInfoHeader, PersonalInfoGroupCard } from '../components';
import {
  PersonalInfoInputFormData,
  DEFAULT_PERSONAL_INPUT_DATA,
} from './PersonalInfoInputScreen';

export interface PersonalInfoDetailsScreenProps {
  memberId?: string;
  data?: Partial<PersonalInfoInputFormData>;
  userName?: string;
  onBack?: () => void;
  onEditPress?: () => void;
  onSave?: (data: PersonalInfoInputFormData) => void;
}

const PersonalInfoDetailsScreen: React.FC<PersonalInfoDetailsScreenProps> = ({
  memberId,
  data,
  userName = 'Priya',
  onBack,
  onEditPress,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth?.user || state.emailAuth?.user);
  const lifeProfilePersonal = useAppSelector((state) => state.lifeProfile?.personal);

  const resolvedMemberId =
    memberId ||
    authUser?.memberId ||
    authUser?.id ||
    authUser?._id ||
    'me';

  // API Call Structure: GET {{BaseURL}}/api/v1/family/members/{{memberId}}/life-profile?section=personal
  useEffect(() => {
    if (resolvedMemberId) {
      dispatch(
        fetchLifeProfileSectionThunk({
          memberId: resolvedMemberId,
          section: 'personal',
        })
      );
    }
  }, [dispatch, resolvedMemberId]);

  /*
   * DATA MAPPING (Ready to connect when backend personal section response is wired):
   * const personalSectionData = lifeProfilePersonal?.data || lifeProfilePersonal;
   * // e.g. fullName = personalSectionData?.fullName ?? finalData.fullName
   * // nickname = personalSectionData?.nickname ?? finalData.nickname
   * // email = personalSectionData?.email ?? finalData.email
   * // familyRole = personalSectionData?.familyRole ?? finalData.familyRole
   * // gender = personalSectionData?.gender ?? finalData.gender
   * // birthDate = personalSectionData?.birthDate ?? finalData.birthDate
   * // bloodGroup = personalSectionData?.bloodGroup ?? finalData.bloodGroup
   * // height = personalSectionData?.height ?? finalData.height
   * // weight = personalSectionData?.weight ?? finalData.weight
   * // career = personalSectionData?.career ?? finalData.career
   */

  const finalData: PersonalInfoInputFormData = {
    ...DEFAULT_PERSONAL_INPUT_DATA,
    ...data,
  };

  const firstName =
    finalData.fullName.trim().split(' ')[0] || userName || 'Priya';

  // Group card data
  const groupCardData = {
    fullName: finalData.fullName,
    nickname: finalData.nickname,
    email: finalData.email,
    familyRole: finalData.familyRole,
    gender: finalData.gender,
    birthDate: `${finalData.birthDate} · ${finalData.age.replace('old', '').trim()}`,
    bloodGroup: finalData.bloodGroup,
    heightWeight: `${finalData.height} cm · ${finalData.weight} kg`,
  };

  const careerSubtitle = [finalData.designation, finalData.companyName]
    .filter(Boolean)
    .join(' · ');

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Header with Back Chevron < */}
      <PersonalInfoHeader
        title="Personal information"
        subtitle={`${firstName} · Section 1 of 5`}
        onBack={onBack || onEditPress}
        icon="back"
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Personal Info Summary Card */}
        <PersonalInfoGroupCard
          data={groupCardData}
          onRowPress={() => {
            if (onEditPress) {
              onEditPress();
            }
          }}
        />

        {/* Section 2: EDUCATION / CAREER */}
        <Text style={styles.educationHeader}>EDUCATION / CAREER</Text>

        {/* Career Summary Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onEditPress}
          style={styles.careerCard}
        >
          {/* Left Briefcase Icon */}
          <View style={styles.briefcaseContainer}>
            <Feather name="briefcase" size={19} color="#F43F5E" />
          </View>

          {/* Title and Subtitle */}
          <View style={styles.careerTextContainer}>
            <Text style={styles.careerTitle}>{finalData.status}</Text>
            {careerSubtitle ? (
              <Text style={styles.careerSubtitle} numberOfLines={1}>
                {careerSubtitle}
              </Text>
            ) : null}
          </View>

          {/* Right Chevron */}
          <Feather name="chevron-right" size={18} color="#64748B" />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Edit Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title="Edit"
          onPress={() => {
            if (onEditPress) {
              onEditPress();
            } else if (onSave) {
              onSave(finalData);
            }
          }}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={52}
          borderRadius={26}
        />
      </View>
    </View>
  );
};

export default PersonalInfoDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#0A111F',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  educationHeader: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  careerCard: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  briefcaseContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(244, 63, 94, 0.45)',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  careerTextContainer: {
    flex: 1,
  },
  careerTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '700',
  },
  careerSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(12.5),
    marginTop: 3,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background || '#0A111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});

