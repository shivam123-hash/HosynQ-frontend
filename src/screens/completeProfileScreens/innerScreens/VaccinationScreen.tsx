import React, { useState } from 'react';
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
import {
  PersonalInfoHeader,
  VaccinationSegmentedTabs,
  VaccinationTab,
  VaccineItemRow,
  VaccineStatus,
  GrowthLineChart,
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
  const [activeTab, setActiveTab] = useState<VaccinationTab>(initialTab);

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
        {/* --- TAB 1: VACCINES --- */}
        {activeTab === 'vaccines' && (
          <View>
            <View style={styles.cardContainer}>
              {DEFAULT_VACCINES.map((item, index) => (
                <VaccineItemRow
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  details={item.details}
                  status={item.status}
                  hasCertificate={item.hasCertificate}
                  onPress={() => onVaccinePress?.(item)}
                  showDivider={index < DEFAULT_VACCINES.length - 1}
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
          </View>
        )}

        {/* --- TAB 2: GROWTH --- */}
        {activeTab === 'growth' && (
          <View>
            <GrowthLineChart
              currentHeight="132 cm"
              measuredDate="Measured 12 Oct 2026"
              weight="28 kg"
              grewThisYear="+5 cm"
              nextMeasureDate="Jun 2027"
            />
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

            <View style={styles.cardContainer}>
              {DEFAULT_MILESTONES.map((item, index) => {
                const isLast = index === DEFAULT_MILESTONES.length - 1;
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
          </View>
        )}
      </ScrollView>

      {/* Bottom Button Depending on Active Tab */}
      <View style={styles.bottomBar}>
        {activeTab === 'vaccines' && (
          <CommonBtn
            title="+ Add vaccine record"
            onPress={onAddVaccineRecord}
            backgroundColor={Colors.primary || '#F0913A'}
            textColor="#FFFFFF"
            height={54}
            borderRadius={27}
          />
        )}
        {activeTab === 'growth' && (
          <CommonBtn
            title="✎ Add measurement"
            onPress={onAddMeasurement}
            backgroundColor={Colors.primary || '#F0913A'}
            textColor="#FFFFFF"
            height={54}
            borderRadius={27}
          />
        )}
        {activeTab === 'milestones' && (
          <CommonBtn
            title="✎ Add milestone"
            onPress={onAddMilestone}
            backgroundColor={Colors.primary || '#F0913A'}
            textColor="#FFFFFF"
            height={54}
            borderRadius={27}
          />
        )}
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
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});

