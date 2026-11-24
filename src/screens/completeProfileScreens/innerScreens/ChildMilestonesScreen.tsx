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
import { useAppSelector } from '../../../redux';
import { formatDisplayDate } from './vaccinationPayloadUtils';
import {
  PersonalInfoHeader,
  VaccinationSegmentedTabs,
  VaccinationTab,
} from '../components';

export interface MilestoneRecord {
  id: string;
  title: string;
  date: string;
  iconName: string;
  iconColor: string;
  iconBgColor: string;
}

export interface ChildMilestonesScreenProps {
  memberId?: string;
  childName?: string;
  milestones?: MilestoneRecord[];
  onBack?: () => void;
  onTabChange?: (tab: VaccinationTab) => void;
  onAddMilestone?: () => void;
  onMilestonePress?: (item: MilestoneRecord) => void;
}

const DEFAULT_MILESTONES: MilestoneRecord[] = [
  {
    id: '1',
    title: 'Read his first chapter book',
    date: '12 Oct 2025',
    iconName: 'book',
    iconColor: '#38BDF8',
    iconBgColor: 'rgba(56, 189, 248, 0.12)',
  },
  {
    id: '2',
    title: 'Rode a bicycle without help',
    date: 'May 2025',
    iconName: 'award',
    iconColor: '#F59E0B',
    iconBgColor: 'rgba(245, 158, 11, 0.12)',
  },
];

const ChildMilestonesScreen: React.FC<ChildMilestonesScreenProps> = ({
  memberId,
  childName = 'Aarav',
  milestones,
  onBack,
  onTabChange,
  onAddMilestone,
  onMilestonePress,
}) => {
  const insets = useSafeAreaInsets();

  const lifeProfileVaccination = useAppSelector(
    (state) => state.lifeProfile?.vaccination,
  );
  const fullVaccination = useAppSelector(
    (state) => state.lifeProfile?.full?.data?.vaccination,
  );
  const vaccinationData =
    (lifeProfileVaccination as any)?.data?.vaccination ||
    (lifeProfileVaccination as any)?.vaccination ||
    (lifeProfileVaccination as any)?.data ||
    lifeProfileVaccination ||
    fullVaccination;

  const rawMilestones = vaccinationData?.milestones;
  const dynamicMilestones: MilestoneRecord[] = milestones
    ? milestones
    : Array.isArray(rawMilestones)
    ? rawMilestones.map((m: any, index: number) => {
        const type = (m.type || 'PHYSICAL').toUpperCase();
        let iconName = 'award';
        let iconColor = '#F59E0B';
        let iconBgColor = 'rgba(245, 158, 11, 0.12)';
        if (type.includes('LEARN')) {
          iconName = 'book';
          iconColor = '#38BDF8';
          iconBgColor = 'rgba(56, 189, 248, 0.12)';
        } else if (type.includes('SOCIAL')) {
          iconName = 'users';
          iconColor = '#A78BFA';
          iconBgColor = 'rgba(167, 139, 250, 0.12)';
        } else if (type.includes('FIRST')) {
          iconName = 'star';
          iconColor = '#F59E0B';
          iconBgColor = 'rgba(245, 158, 11, 0.12)';
        } else if (type.includes('OTHER')) {
          iconName = 'smile';
          iconColor = '#34D399';
          iconBgColor = 'rgba(52, 211, 153, 0.12)';
        }

        return {
          id: m.id || m._id || `m-${index}`,
          title: m.title || 'Milestone',
          date: formatDisplayDate(m.achievedOn) || 'Recent',
          iconName,
          iconColor,
          iconBgColor,
        };
      })
    : [];

  const listToRender = dynamicMilestones;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <PersonalInfoHeader
        title="Vaccination"
        subtitle={`${childName} · Section 4 of 5`}
        onBack={onBack}
      />

      {/* Segmented Tabs */}
      <VaccinationSegmentedTabs
        activeTab="milestones"
        onTabChange={(tab) => onTabChange?.(tab)}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.milestonesSubheader}>
          <Text style={styles.milestonesHeaderTitle}>MILESTONES</Text>
          <Text style={styles.milestonesSubheaderRight}>
            All (shared in Pulse)
          </Text>
        </View>

        {listToRender.length > 0 ? (
          <View style={styles.cardContainer}>
            {listToRender.map((item, index) => {
              const isLast = index === listToRender.length - 1;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => onMilestonePress?.(item)}
                  style={[styles.milestoneRow, !isLast && styles.divider]}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}, ${item.date}`}
                >
                  <View
                    style={[
                      styles.milestoneIconBox,
                      { backgroundColor: item.iconBgColor },
                    ]}
                  >
                    <Feather
                      name={item.iconName as any}
                      size={17}
                      color={item.iconColor}
                    />
                  </View>

                  <View style={styles.milestoneTextContainer}>
                    <Text style={styles.milestoneTitleText}>{item.title}</Text>
                    <Text style={styles.milestoneDateText}>{item.date}</Text>
                  </View>

                  <Feather name="chevron-right" size={18} color="#64748B" />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="award" size={28} color="#A78BFA" />
            </View>
            <Text style={styles.emptyTitle}>No milestones recorded yet</Text>
            <Text style={styles.emptySubtitle}>
              Celebrate memorable childhood moments like learning to cycle, swimming, or reading.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.emptyActionBtn}
              onPress={onAddMilestone}
            >
              <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyActionBtnText}>Add milestone</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title="+ Add milestone"
          onPress={onAddMilestone}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={54}
          borderRadius={27}
        />
      </View>
    </View>
  );
};

export default ChildMilestonesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  milestonesSubheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 22,
    marginTop: 18,
    marginBottom: 8,
  },
  milestonesHeaderTitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.2,
  },
  milestonesSubheaderRight: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
  },
  cardContainer: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  milestoneIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneTextContainer: {
    flex: 1,
  },
  milestoneTitleText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-SemiBold',
  },
  milestoneDateText: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 2,
  },
  emptyContainer: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 18,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(15),
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary || '#F0913A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: RFValue(12.5),
    fontFamily: 'Roboto-SemiBold',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});

