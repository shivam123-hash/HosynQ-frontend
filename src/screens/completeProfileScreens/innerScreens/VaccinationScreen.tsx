import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { useAppDispatch, useAppSelector, fetchLifeProfileSectionThunk } from '../../../redux';
import {
  deriveVaccineStatus,
  normalizeVaccineStatus,
  formatDisplayDate,
  mapEnumToDoseLabel,
} from './vaccinationPayloadUtils';
import {
  PersonalInfoHeader,
  VaccinationSegmentedTabs,
  VaccinationTab,
  VaccineItemRow,
  VaccineStatus,
  GrowthLineChart,
  TabTransitionView,
} from '../components';

export interface VaccineRecord {
  id: string;
  name: string;
  details: string;
  status: VaccineStatus;
  hasCertificate?: boolean;
}

export interface MilestoneItem {
  id: string;
  title: string;
  date: string;
  iconName: string;
  iconColor: string;
  iconBgColor: string;
}

export interface VaccinationScreenProps {
  memberId?: string;
  initialTab?: VaccinationTab;
  childName?: string;
  onBack?: () => void;
  onAddVaccineRecord?: () => void;
  onAddMeasurement?: () => void;
  onAddMilestone?: () => void;
  onVaccinePress?: (vaccine: VaccineRecord) => void;
  onMilestonePress?: (milestone: MilestoneItem) => void;
}

const DEFAULT_VACCINES: VaccineRecord[] = [
  {
    id: '1',
    name: 'Influenza',
    details: 'Last dose 14 Nov 2025\nNext due 15 Nov 2026',
    status: 'due',
    hasCertificate: true,
  },
  {
    id: '2',
    name: 'Typhoid conjugate',
    details: 'Last dose 12 Sep 2023\nNext due Sep 2026',
    status: 'done',
    hasCertificate: true,
  },
  {
    id: '3',
    name: 'Tdap',
    details: 'Last dose Jun 2018\nNext due Jun 2027',
    status: 'upcoming',
    hasCertificate: false,
  },
  {
    id: '4',
    name: 'MMR',
    details: 'Dose 2 · Mar 2019\nComplete',
    status: 'done',
    hasCertificate: true,
  },
  {
    id: '5',
    name: 'Hepatitis A',
    details: 'Dose 2 · Jan 2019\nComplete',
    status: 'done',
    hasCertificate: true,
  },
];

const DEFAULT_MILESTONES: MilestoneItem[] = [
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

const VaccinationScreen: React.FC<VaccinationScreenProps> = ({
  memberId,
  initialTab = 'vaccines',
  childName = 'Aarav',
  onBack,
  onAddVaccineRecord,
  onAddMeasurement,
  onAddMilestone,
  onVaccinePress,
  onMilestonePress,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  let navigation: any = null;
  try {
    navigation = useNavigation<any>();
  } catch {
    navigation = null;
  }
  const [activeTab, setActiveTab] = useState<VaccinationTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const authUser = useAppSelector((state) => state.auth?.user || state.emailAuth?.user);
  const familyState = useAppSelector((state) => (state as any).family);
  const lifeProfileVaccination = useAppSelector((state) => state.lifeProfile?.vaccination);

  const resolvedMemberId =
    memberId ||
    familyState?.myMemberId ||
    familyState?.family?.myMemberId ||
    authUser?.memberId ||
    authUser?.myMemberId ||
    authUser?.id ||
    authUser?._id ||
    'me';

  // API Call: GET {{BaseURL}}/api/v1/family/members/{{memberId}}/life-profile?section=vaccination&tab={{activeTab}}
  useEffect(() => {
    const fetchVaccination = () => {
      if (resolvedMemberId) {
        dispatch(
          fetchLifeProfileSectionThunk({
            memberId: resolvedMemberId,
            section: 'vaccination',
            tab: activeTab,
          })
        );
      }
    };

    fetchVaccination();

    const unsubscribe = navigation?.addListener
      ? navigation.addListener('focus', fetchVaccination)
      : undefined;

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [dispatch, resolvedMemberId, activeTab, navigation]);

  const fullVaccination = useAppSelector(
    (state) => state.lifeProfile?.full?.data?.vaccination,
  );
  const vaccinationData =
    (lifeProfileVaccination as any)?.data?.vaccination ||
    (lifeProfileVaccination as any)?.vaccination ||
    (lifeProfileVaccination as any)?.data ||
    lifeProfileVaccination ||
    fullVaccination;

  const rawVaccines = vaccinationData?.vaccines;
  const dynamicVaccines: VaccineRecord[] =
    Array.isArray(rawVaccines)
      ? rawVaccines.map((v: any, index: number) => {
          const lastDoseText = v.lastDoseOn
            ? `Last dose ${formatDisplayDate(v.lastDoseOn)}`
            : Array.isArray(v.doses) && v.doses.length > 0 && v.doses[v.doses.length - 1]?.givenOn
            ? `Last dose ${formatDisplayDate(v.doses[v.doses.length - 1].givenOn)}`
            : v.dose
            ? mapEnumToDoseLabel(v.dose)
            : 'No doses recorded';
          const nextDueText = v.nextDueOn
            ? `Next due ${formatDisplayDate(v.nextDueOn)}`
            : 'Complete';
          return {
            id: v.id || v._id || `v-${index}`,
            name: v.name || 'Vaccine',
            details: `${lastDoseText}\n${nextDueText}`,
            status: normalizeVaccineStatus(v.status, v.nextDueOn),
            hasCertificate: Boolean(
              v.hasCertificate ||
              (Array.isArray(v.doses) && v.doses.some((d: any) => Boolean(d.fileId || d.certificateScanId))),
            ),
            raw: v,
          };
        })
      : [];

  const rawGrowth = vaccinationData?.growth;
  const growthSummaryData = vaccinationData?.summary;
  const latestGrowth =
    Array.isArray(rawGrowth) && rawGrowth.length > 0
      ? rawGrowth[rawGrowth.length - 1]
      : null;

  const hasGrowthData = Boolean(
    (Array.isArray(rawGrowth) && rawGrowth.length > 0) ||
    growthSummaryData?.heightCm != null ||
    growthSummaryData?.weightKg != null
  );

  const currentHeight = growthSummaryData?.heightCm
    ? `${growthSummaryData.heightCm} cm`
    : latestGrowth?.heightCm
    ? `${latestGrowth.heightCm} cm`
    : '—';
  const measuredDate = growthSummaryData?.heightMeasuredOn
    ? `Measured ${formatDisplayDate(growthSummaryData.heightMeasuredOn)}`
    : latestGrowth?.measuredOn
    ? `Measured ${formatDisplayDate(latestGrowth.measuredOn)}`
    : '';
  const weight = growthSummaryData?.weightKg
    ? `${growthSummaryData.weightKg} kg`
    : latestGrowth?.weightKg
    ? `${latestGrowth.weightKg} kg`
    : '—';
  const grewThisYear =
    growthSummaryData?.grewThisYearCm != null
      ? `${growthSummaryData.grewThisYearCm > 0 ? '+' : ''}${growthSummaryData.grewThisYearCm} cm`
      : '—';
  const nextMeasureDate = growthSummaryData?.nextMeasureOn
    ? formatDisplayDate(growthSummaryData.nextMeasureOn)
    : latestGrowth?.nextMeasureOn
    ? formatDisplayDate(latestGrowth.nextMeasureOn)
    : '—';

  const rawMilestones = vaccinationData?.milestones;
  const dynamicMilestones: MilestoneItem[] =
    Array.isArray(rawMilestones)
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

      {/* Segmented Tabs (Vaccines | Growth | Milestones) */}
      <VaccinationSegmentedTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TabTransitionView
          activeKey={activeTab}
          tabOrder={['vaccines', 'growth', 'milestones']}
        >
          {/* --- TAB 1: VACCINES --- */}
          {activeTab === 'vaccines' && (
            <View>
              {dynamicVaccines.length > 0 ? (
                <>
                  <View style={styles.cardContainer}>
                    {dynamicVaccines.map((item, index) => (
                      <VaccineItemRow
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        details={item.details}
                        status={item.status}
                        hasCertificate={item.hasCertificate}
                        onPress={() => onVaccinePress?.((item as any).raw || item)}
                        showDivider={index < dynamicVaccines.length - 1}
                      />
                    ))}
                  </View>

                  {/* Certificate Added Legend */}
                  <View style={styles.legendRow}>
                    <Feather
                      name="paperclip"
                      size={14}
                      color="#F59E0B"
                      style={styles.legendIcon}
                    />
                    <Text style={styles.legendText}>Certificate added</Text>
                  </View>

                  {/* Helper Advice Note */}
                  <Text style={styles.helperNote}>
                    Based on a standard schedule. Your doctor's advice comes first.
                  </Text>
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Feather name="shield" size={28} color="#F59E0B" />
                  </View>
                  <Text style={styles.emptyTitle}>No vaccine records yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Add vaccine doses, batch numbers, and certificates to keep track of upcoming schedules.
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.emptyActionBtn}
                    onPress={onAddVaccineRecord}
                  >
                    <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.emptyActionBtnText}>Add vaccine record</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* --- TAB 2: GROWTH --- */}
          {activeTab === 'growth' && (
            <View>
              {hasGrowthData ? (
                <GrowthLineChart
                  currentHeight={currentHeight}
                  measuredDate={measuredDate}
                  weight={weight}
                  grewThisYear={grewThisYear}
                  nextMeasureDate={nextMeasureDate}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Feather name="trending-up" size={28} color="#38BDF8" />
                  </View>
                  <Text style={styles.emptyTitle}>No growth measurements yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Track your child's height, weight, and annual development over time.
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.emptyActionBtn}
                    onPress={onAddMeasurement}
                  >
                    <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.emptyActionBtnText}>Add measurement</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* --- TAB 3: MILESTONES --- */}
          {activeTab === 'milestones' && (
            <View style={styles.milestonesSection}>
              <View style={styles.milestonesSubheader}>
                <Text style={styles.milestonesHeaderTitle}>MILESTONES</Text>
                <Text style={styles.milestonesSubheaderRight}>
                  All (shared in Pulse)
                </Text>
              </View>

              {dynamicMilestones.length > 0 ? (
                <View style={styles.cardContainer}>
                  {dynamicMilestones.map((item, index) => {
                    const isLast = index === dynamicMilestones.length - 1;
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
                          <Text style={styles.milestoneTitleText}>
                            {item.title}
                          </Text>
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
            </View>
          )}
        </TabTransitionView>
      </ScrollView>

      {/* Bottom Button Depending on Active Tab */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title={
            activeTab === 'vaccines'
              ? '+ Add vaccine record'
              : activeTab === 'growth'
              ? '+ Add measurement'
              : '+ Add milestone'
          }
          onPress={
            activeTab === 'vaccines'
              ? onAddVaccineRecord
              : activeTab === 'growth'
              ? onAddMeasurement
              : onAddMilestone
          }
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={54}
          borderRadius={27}
        />
      </View>
    </View>
  );
};

export default VaccinationScreen;

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
  cardContainer: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 14,
    overflow: 'hidden',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    marginTop: 12,
  },
  legendIcon: {
    marginRight: 6,
  },
  legendText: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
  },
  helperNote: {
    color: '#64748B',
    fontSize: RFValue(11),
    lineHeight: 16,
    marginHorizontal: 22,
    marginTop: 8,
  },
  milestonesSection: {
    marginTop: 4,
  },
  milestonesSubheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 22,
    marginTop: 14,
    marginBottom: 4,
  },
  milestonesHeaderTitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  milestonesSubheaderRight: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '600',
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

