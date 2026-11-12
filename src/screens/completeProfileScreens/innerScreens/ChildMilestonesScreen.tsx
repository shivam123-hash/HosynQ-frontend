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
  childName = 'Aarav',
  milestones = DEFAULT_MILESTONES,
  onBack,
  onTabChange,
  onAddMilestone,
  onMilestonePress,
}) => {
  const insets = useSafeAreaInsets();

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

        <View style={styles.cardContainer}>
          {milestones.map((item, index) => {
            const isLast = index === milestones.length - 1;
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
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title="✎ Add milestone"
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
    fontWeight: '700',
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

