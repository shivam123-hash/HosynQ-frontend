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
  GrowthLineChart,
} from '../components';

export interface ChildGrowthScreenProps {
  memberId?: string;
  childName?: string;
  onBack?: () => void;
  onTabChange?: (tab: VaccinationTab) => void;
  onAddMeasurement?: () => void;
}

const ChildGrowthScreen: React.FC<ChildGrowthScreenProps> = ({
  memberId,
  childName = 'Aarav',
  onBack,
  onTabChange,
  onAddMeasurement,
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
        activeTab="growth"
        onTabChange={(tab) => onTabChange?.(tab)}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title="+ Add measurement"
          onPress={onAddMeasurement}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={54}
          borderRadius={27}
        />
      </View>
    </View>
  );
};

export default ChildGrowthScreen;

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

